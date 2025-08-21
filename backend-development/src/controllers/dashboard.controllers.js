import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// --- GET CHANNEL STATS ---
const getChannelStats = asyncHandler(async (req, res) => {
    // The channel is the currently authenticated user
    const channelId = req.user?._id;
    if (!channelId) {
        throw new ApiError(401, "Unauthorized request. Channel ID missing.");
    }

    // 1. Get total subscribers for the channel
    const totalSubscribers = await Subscription.aggregate([
        {
            $match: {
                channel: new mongoose.Types.ObjectId(channelId),
            },
        },
        {
            $count: "subscriberCount",
        },
    ]);

    // 2. Get stats for all videos of the channel
    const videoStats = await Video.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(channelId),
            },
        },
        {
            // Join with the likes collection to get total likes for all videos
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "video",
                as: "likes",
            },

        },
        {
            // Group all videos to calculate total views, total videos, and total likes
            $group: {
                _id: null, // Group all documents into a single one
                totalVideos: { $sum: 1 },
                totalViews: { $sum: "$views" },
                totalLikes: { $sum: { $size: "$likes" } }
            },
        },
        {
            // Project to reshape the output
            $project: {
                _id: 0,
                totalVideos: 1,
                totalViews: 1,
                totalLikes: 1,
            },
        },
    ]);
    
    // 3. Consolidate the stats into a single object
    // Fallback to Like model if aggregation returned nothing
    let fallbackLikes = 0;
    if (!videoStats.length) {
        const channelVideos = await Video.find({ owner: channelId }).select("_id");
        const videoIds = channelVideos.map(v => v._id);
        fallbackLikes = await Like.countDocuments({ video: { $in: videoIds } });
    }

    const stats = {
        totalSubscribers: totalSubscribers[0]?.subscriberCount || 0,
        totalVideos: videoStats[0]?.totalVideos || 0,
        totalViews: videoStats[0]?.totalViews || 0,
        totalLikes: videoStats[0]?.totalLikes || 0,
    };

    return res
        .status(200)
        .json(new ApiResponse(200, stats, "Channel stats fetched successfully"));
});

// --- GET ALL VIDEOS UPLOADED BY THE CHANNEL ---

const getChannelVideos = asyncHandler(async (req, res) => {
    // The channel is the currently authenticated user
    const channelId = req.user?._id;
    const { page = 1, limit = 10, sortBy = 'createdAt', sortType = 'desc' } = req.query;

    if (!channelId) {
        throw new ApiError(401, "Unauthorized request. Channel ID missing.");
    }

    // Using an aggregation pipeline for flexibility and future enhancements
    const videoAggregate = Video.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(channelId),
            },
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "video",
                as: "likes"
            }
        },
        {
            $addFields: {
                likesCount: { $size: "$likes" }
            }
        },
        {
            $sort: {
                [sortBy]: sortType === 'asc' ? 1 : -1
            }
        },
        {
            $project: {
                _id: 1,
                title: 1,
                thumbnail: 1,
                duration: 1,
                views: 1,
                isPublished: 1,
                createdAt: 1,
                likesCount: 1,
            }
        }
    ]);
    
    // Using mongoose-aggregate-paginate-v2 for pagination
    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        customLabels: { docs: 'videos', totalDocs: 'totalVideos' }
    };

    const videos = await Video.aggregatePaginate(videoAggregate, options);

    if (!videos || !videos.videos.length) {
        throw new ApiError(404, "No videos found for this channel.");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, videos, "Channel videos fetched successfully"));
});

export {
    getChannelStats,
    getChannelVideos,
};