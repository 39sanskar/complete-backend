import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";

// --- GET ALL VIDEOS WITH ADVANCED FILTERING, SORTING, AND PAGINATION ---
const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;

    // 1. Create the base aggregation pipeline
    const pipeline = [];

    // 2. Add a $match stage based on query parameters
    const matchStage = {};
    if (query) {
        // Search in title and description
        matchStage.$text = { $search: query };
    }
    if (userId) {
        if (!isValidObjectId(userId)) throw new ApiError(400, "Invalid userId");
        matchStage.owner = new mongoose.Types.ObjectId(userId);
    }
    // Only fetch published videos
    matchStage.isPublished = true;
    
    pipeline.push({ $match: matchStage });

    // 3. Add a $sort stage
    if (sortBy && sortType) {
        const sortStage = {};
        sortStage[sortBy] = sortType === 'asc' ? 1 : -1;
        pipeline.push({ $sort: sortStage });
    } else {
        // Default sort by createdAt descending
        pipeline.push({ $sort: { createdAt: -1 } });
    }

    // 4. Add a $lookup to get owner's avatar and username
    pipeline.push({
        $lookup: {
            from: "users",
            localField: "owner",
            foreignField: "_id",
            as: "ownerDetails",
            pipeline: [
                {
                    $project: {
                        username: 1,
                        avatar: 1
                    }
                }
            ]
        }
    }, {
        $unwind: "$ownerDetails"
    });

    // 5. Use the mongoose-aggregate-paginate-v2 plugin
    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
    };

    const videos = await Video.aggregatePaginate(Video.aggregate(pipeline), options);

    return res
        .status(200)
        .json(new ApiResponse(200, videos, "Videos fetched successfully"));
});

// --- PUBLISH A NEW VIDEO ---
const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body;
    const userId = req.user?._id;

    // 1. Validate title and description
    if (!title || title.trim() === "" || !description || description.trim() === "") {
        throw new ApiError(400, "Title and description are required");
    }

    // 2. Get file paths from multer
    const videoFileLocalPath = req.files?.videoFile?.[0]?.path;
    const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;

    if (!videoFileLocalPath) {
        throw new ApiError(400, "Video file is required");
    }
    if (!thumbnailLocalPath) {
        throw new ApiError(400, "Thumbnail is required");
    }

    // 3. Upload files to Cloudinary
    const videoFile = await uploadOnCloudinary(videoFileLocalPath, "video");
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath, "image");

    if (!videoFile?.url) {
        throw new ApiError(500, "Failed to upload video file");
    }
    if (!thumbnail?.url) {
        throw new ApiError(500, "Failed to upload thumbnail");
    }

    // 4. Create video document in the database
    const video = await Video.create({
        title,
        description,
        videoFile: videoFile.url,
        thumbnail: thumbnail.url,
        duration: videoFile.duration, // Cloudinary provides duration
        owner: userId,
        isPublished: true, // Default to published
    });

    if (!video) {
        throw new ApiError(500, "Failed to create video entry in database");
    }
    
    return res
        .status(201)
        .json(new ApiResponse(201, video, "Video published successfully"));
});

// --- GET A SINGLE VIDEO BY ITS ID ---
const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid Video ID");
    }

    // Using aggregation to enrich data with owner, likes, and subscription status
    const video = await Video.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(videoId)
            }
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
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "ownerDetails",
                pipeline: [
                    {
                        $lookup: {
                            from: "subscriptions",
                            localField: "_id",
                            foreignField: "channel",
                            as: "subscribers"
                        }
                    },
                    {
                        $addFields: {
                            subscribersCount: { $size: "$subscribers" },
                            isSubscribed: {
                                $cond: {
                                    if: { $in: [req.user?._id, "$subscribers.subscriber"] },
                                    then: true,
                                    else: false
                                }
                            }
                        }
                    },
                    {
                        $project: {
                            username: 1,
                            avatar: 1,
                            subscribersCount: 1,
                            isSubscribed: 1
                        }
                    }
                ]
            }
        },
        { $unwind: "$ownerDetails" },
        {
            $addFields: {
                likesCount: { $size: "$likes" },
                isLiked: {
                    $cond: {
                        if: { $in: [req.user?._id, "$likes.likedBy"] },
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                videoFile: 1,
                title: 1,
                description: 1,
                views: 1,
                createdAt: 1,
                duration: 1,
                owner: "$ownerDetails",
                likesCount: 1,
                isLiked: 1
            }
        }
    ]);

    if (!video || video.length === 0) {
        throw new ApiError(404, "Video not found");
    }
    
    // Increment views
    await Video.findByIdAndUpdate(videoId, { $inc: { views: 1 } });

    return res
        .status(200)
        .json(new ApiResponse(200, video[0], "Video details fetched successfully"));
});

// --- UPDATE VIDEO DETAILS (TITLE, DESCRIPTION, THUMBNAIL) ---
const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { title, description } = req.body;
    const thumbnailLocalPath = req.file?.path;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid Video ID");
    }
    
    // Find the video and check ownership
    const video = await Video.findById(videoId);
    if (!video) throw new ApiError(404, "Video not found");

    if (video.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "You are not authorized to update this video");
    }
    
    // Handle thumbnail update
    let newThumbnailUrl = video.thumbnail;
    if (thumbnailLocalPath) {
        const newThumbnail = await uploadOnCloudinary(thumbnailLocalPath);
        if (!newThumbnail?.url) throw new ApiError(500, "Failed to upload new thumbnail");
        newThumbnailUrl = newThumbnail.url;
        // Delete old thumbnail from Cloudinary
        await deleteFromCloudinary(video.thumbnail, "image");
        newThumbnailUrl = newThumbnail.Url;
    }
    
    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                title: title || video.title,
                description: description || video.description,
                thumbnail: newThumbnailUrl
            }
        },
        { new: true }
    );

    return res
        .status(200)
        .json(new ApiResponse(200, updatedVideo, "Video details updated successfully"));
});

// --- DELETE A VIDEO ---
const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid Video ID");
    }

    // Find video and check ownership
    const video = await Video.findById(videoId);
    if (!video) throw new ApiError(404, "Video not found");

    if (video.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "You are not authorized to delete this video");
    }
    
    // Delete video and thumbnail from Cloudinary
    await deleteFromCloudinary(video.videoFile, "video");
    await deleteFromCloudinary(video.thumbnail);

    // Delete the video document from the database
    await Video.findByIdAndDelete(videoId);

    // TODO: Advanced - Delete associated likes, comments, etc. (Cascading delete)

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Video deleted successfully"));
});

// --- TOGGLE THE PUBLISH STATUS OF A VIDEO ---
const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    if (!isValidObjectId(videoId)) throw new ApiError(400, "Invalid Video ID");
    
    const video = await Video.findById(videoId);
    if (!video) throw new ApiError(404, "Video not found");

    if (video.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "You are not authorized to change the publish status");
    }

    // Toggle the isPublished field
    video.isPublished = !video.isPublished;
    await video.save({ validateBeforeSave: false });

    return res
        .status(200)
        .json(new ApiResponse(200, { isPublished: video.isPublished }, "Publish status toggled successfully"));
});

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
};

/*
Concept:

1. Initially planned check but removed
-Maybe you thought of verifying the uploader with User.findById(req.user._id) but later realized req.user is already coming from your auth middleware.
-So importing User became redundant.

2. Aggregation already covers user info
-If you’re using MongoDB $lookup to join video with user details (owner info), then you don’t need a separate query with User.

3. Leftover import
- Sometimes we add imports during development, then refactor code, and the import becomes unused. ESLint usually warns about this ('User' is defined but never used).
*/