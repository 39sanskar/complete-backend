import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { User } from "../models/user.model.js";
import { Like } from "../models/like.model.js";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// --- CREATE A NEW TWEET ---
const createTweet = asyncHandler(async (req, res) => {
    const { content } = req.body;
    const ownerId = req.user?._id;

    // Validate content
    if (!content || content.trim() === "") {
        throw new ApiError(400, "Tweet content cannot be empty");
    }
    if (content.length > 500) {
        throw new ApiError(400, "Tweet cannot exceed 500 characters");
    }

    const tweet = await Tweet.create({
        content,
        owner: ownerId,
    });

    if (!tweet) {
        throw new ApiError(500, "Something went wrong while creating the tweet");
    }

    return res
        .status(201)
        .json(new ApiResponse(201, tweet, "Tweet created successfully"));
});

// --- GET ALL TWEETS FOR A SPECIFIC USER ---
const getUserTweets = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    // Validate userId
    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid User ID format");
    }

    const user = await User.findById(userId).lean();
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // Aggregation pipeline
    const pipeline = [
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId),
            },
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "ownerDetails",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            avatar: 1,
                        },
                    },
                ],
            },
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "tweet",
                as: "likes",
            },
        },
        {
            $lookup: {
                from: "comments",
                localField: "_id",
                foreignField: "tweet",
                as: "comments",
            },
        },
        { $unwind: "$ownerDetails" },
        {
            $addFields: {
                likesCount: { $size: "$likes" },
                commentsCount: { $size: "$comments" },
            },
        },
        {
            $sort: {
                createdAt: -1,
            },
        },
        {
            $project: {
                _id: 1,
                content: 1,
                createdAt: 1,
                owner: "$ownerDetails",
                likesCount: 1,
                commentsCount: 1,
            },
        },
        
    ];

    // Pagination (skip/limit)
    const tweets = await Tweet.aggregate([
        ...pipeline,
        { $skip: (Number(page) - 1) * Number(limit) },
        { $limit: Number(limit) },
    ]);

    return res
        .status(200)
        .json(new ApiResponse(200, tweets, "User tweets fetched successfully"));
});

// --- UPDATE AN EXISTING TWEET ---
const updateTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    const { content } = req.body;
    const userId = req.user?._id;

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid Tweet ID format");
    }
    if (!content || content.trim() === "") {
        throw new ApiError(400, "Content cannot be empty");
    }
    if (content.length > 500) {
        throw new ApiError(400, "Tweet cannot exceed 500 characters");
    }

    const tweet = await Tweet.findById(tweetId).lean();
    if (!tweet) {
        throw new ApiError(404, "Tweet not found");
    }

    if (tweet.owner.toString() !== userId.toString()) {
        throw new ApiError(403, "You are not authorized to update this tweet");
    }

    const updatedTweet = await Tweet.findByIdAndUpdate(
        tweetId,
        { $set: { content } },
        { new: true }
    );

    return res
        .status(200)
        .json(new ApiResponse(200, updatedTweet, "Tweet updated successfully"));
});

// --- DELETE A TWEET ---
const deleteTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    const userId = req.user?._id;

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid Tweet ID format");
    }

    const tweet = await Tweet.findById(tweetId).lean();
    if (!tweet) {
        throw new ApiError(404, "Tweet not found");
    }

    if (tweet.owner.toString() !== userId.toString()) {
        throw new ApiError(403, "You are not authorized to delete this tweet");
    }

    // Delete tweet + cascade delete likes & comments
    await Promise.all([
        Tweet.findByIdAndDelete(tweetId),
        Like.deleteMany({ tweet: tweetId }),
        Comment.deleteMany({ tweet: tweetId }),
    ]);

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Tweet deleted successfully"));
});

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
};
