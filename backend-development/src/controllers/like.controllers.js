import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {Video} from "../models/video.model.js" // Needed for validation and aggregation
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

// --- TOGGLE LIKE ON A VIDEO ---
const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const userId = req.user?._id;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid Video ID");
    }

    // Check if the video exists
    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    // Check if the user has already liked this video
    const existingLike = await Like.findOne({
        video: videoId,
        likedBy: userId
    });

    if (existingLike) {
        // If like exists, remove it (unlike)
        await Like.findByIdAndDelete(existingLike._id);
        return res
            .status(200)
            .json(new ApiResponse(200, { isLiked: false }, "Video unliked successfully"));
    } else {
        // If like does not exist, create it (like)
        await Like.create({
            video: videoId,
            likedBy: userId
        });
        return res
            .status(201)
            .json(new ApiResponse(201, { isLiked: true }, "Video liked successfully"));
    }
});

// --- TOGGLE LIKE ON A COMMENT ---
const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const userId = req.user?._id;

    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid Comment ID");
    }

    // Optional: Check if the comment exists
    // import {Comment} from "../models/comment.model.js"
    // const comment = await Comment.findById(commentId);
    // if (!comment) { throw new ApiError(404, "Comment not found"); }

    const existingLike = await Like.findOne({
        comment: commentId,
        likedBy: userId
    });

    if (existingLike) {
        await Like.findByIdAndDelete(existingLike._id);
        return res
            .status(200)
            .json(new ApiResponse(200, { isLiked: false }, "Comment unliked successfully"));
    } else {
        await Like.create({
            comment: commentId,
            likedBy: userId
        });
        return res
            .status(201)
            .json(new ApiResponse(201, { isLiked: true }, "Comment liked successfully"));
    }
});

// --- TOGGLE LIKE ON A TWEET ---
const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    const userId = req.user?._id;

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid Tweet ID");
    }

    // Optional: Check if the tweet exists
    // import {Tweet} from "../models/tweet.model.js"
    // const tweet = await Tweet.findById(tweetId);
    // if (!tweet) { throw new ApiError(404, "Tweet not found"); }

    const existingLike = await Like.findOne({
        tweet: tweetId,
        likedBy: userId
    });

    if (existingLike) {
        await Like.findByIdAndDelete(existingLike._id);
        return res
            .status(200)
            .json(new ApiResponse(200, { isLiked: false }, "Tweet unliked successfully"));
    } else {
        await Like.create({
            tweet: tweetId,
            likedBy: userId
        });
        return res
            .status(201)
            .json(new ApiResponse(201, { isLiked: true }, "Tweet liked successfully"));
    }
});

// --- GET ALL VIDEOS LIKED BY A USER ---
const getLikedVideos = asyncHandler(async (req, res) => {
    const userId = req.user?._id;

    // We use an aggregation pipeline to find the likes and then join with the videos collection
    const likedVideos = await Like.aggregate([
        {
            // Stage 1: Filter for likes made by the current user and that are for videos
            $match: {
                likedBy: new mongoose.Types.ObjectId(userId),
                video: { $exists: true } // Ensure we only get video likes
            }
        },
        {
            // Stage 2: Join with the 'videos' collection to get video details
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "likedVideo",
                // You can add a pipeline here to shape the looked-up documents
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "ownerDetails",
                        }
                    },
                    {
                        $unwind: "$ownerDetails"
                    }
                ]
            }
        },
        {
            // Stage 3: Deconstruct the 'likedVideo' array created by $lookup
            $unwind: "$likedVideo"
        },
        {
            // Stage 4: Reshape the output to return the video details
            $project: {
                _id: "$likedVideo._id",
                title: "$likedVideo.title",
                thumbnail: "$likedVideo.thumbnail",
                duration: "$likedVideo.duration",
                views: "$likedVideo.views",
                owner: {
                    username: "$likedVideo.ownerDetails.username",
                    fullName: "$likedVideo.ownerDetails.fullName",
                    avatar: "$likedVideo.ownerDetails.avatar",
                }
            }
        }
    ]);

    return res
        .status(200)
        .json(new ApiResponse(200, likedVideos, "Liked videos fetched successfully"));
});

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
};