import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// --- TOGGLE A USER'S SUBSCRIPTION TO A CHANNEL ---
const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    const subscriberId = req.user?._id;

    // Validate channelId
    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel ID");
    }

    // Prevent user from subscribing to themselves
    if (channelId.toString() === subscriberId.toString()) {
        throw new ApiError(400, "User cannot subscribe to their own channel");
    }

    // Check if the channel (user being subscribed to) exists
    const channel = await User.findById(channelId);
    if (!channel) {
        throw new ApiError(404, "Channel not found");
    }

    // Check if a subscription already exists
    const existingSubscription = await Subscription.findOne({
        subscriber: subscriberId,
        channel: channelId,
    });

    if (existingSubscription) {
        // If it exists, delete it (unsubscribe)
        await Subscription.findByIdAndDelete(existingSubscription._id);

        return res
            .status(200)
            .json(new ApiResponse(200, { subscribed: false }, "Unsubscribed successfully"));
    } else {
        // If it does not exist, create it (subscribe)
        await Subscription.create({
            subscriber: subscriberId,
            channel: channelId,
        });

        return res
            .status(201)
            .json(new ApiResponse(201, { subscribed: true }, "Subscribed successfully"));
    }
});

// --- GET SUBSCRIBER LIST OF A CHANNEL ---
// Corresponds to route GET /u/:channelId (we'll rename param for clarity)
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    // Renaming for clarity based on function's purpose
    const { subscriberId: channelId } = req.params;

    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel ID");
    }

    // Aggregation pipeline to find subscribers of the given channel
    const subscribers = await Subscription.aggregate([
        {
            // Stage 1: Match all documents where the 'channel' field is the given channelId
            $match: {
                channel: new mongoose.Types.ObjectId(channelId),
            },
        },
        {
            // Stage 2: Join with the 'users' collection to get the details of the subscriber
            $lookup: {
                from: "users",
                localField: "subscriber",
                foreignField: "_id",
                as: "subscriberInfo",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            fullName: 1,
                            avatar: 1,
                        },
                    },
                ],
            },
        },
        {
            // Stage 3: Deconstruct the 'subscriberInfo' array
            $unwind: "$subscriberInfo",
        },
        {
            // Stage 4: Replace the root with the subscriber's details
            $replaceRoot: { newRoot: "$subscriberInfo" },
        },
    ]);

    return res
        .status(200)
        .json(new ApiResponse(200, subscribers, "Channel subscribers fetched successfully"));
});

// --- GET CHANNEL LIST TO WHICH A USER HAS SUBSCRIBED ---
// Corresponds to route GET /c/:subscriberId (we'll rename param for clarity)
const getSubscribedChannels = asyncHandler(async (req, res) => {
    // Renaming for clarity based on function's purpose
    const { channelId: subscriberId } = req.params;

    if (!isValidObjectId(subscriberId)) {
        throw new ApiError(400, "Invalid user ID");
    }

    // Aggregation pipeline to find channels the user is subscribed to
    const subscribedChannels = await Subscription.aggregate([
        {
            // Stage 1: Match all documents where the 'subscriber' field is the given subscriberId
            $match: {
                subscriber: new mongoose.Types.ObjectId(subscriberId),
            },
        },
        {
            // Stage 2: Join with the 'users' collection to get the details of the channel
            $lookup: {
                from: "users",
                localField: "channel",
                foreignField: "_id",
                as: "channelInfo",
                pipeline: [
                    {
                        // Also fetch subscriber count for each channel
                        $lookup: {
                            from: "subscriptions",
                            localField: "_id",
                            foreignField: "channel",
                            as: "subscribers"
                        }
                    },
                    {
                        $addFields: {
                            subscriberCount: { $size: "$subscribers" }
                        }
                    },
                    {
                        $project: {
                            username: 1,
                            fullName: 1,
                            avatar: 1,
                            subscriberCount: 1
                        },
                    },
                ],
            },
        },
        {
            // Stage 3: Deconstruct the 'channelInfo' array
            $unwind: "$channelInfo",
        },
        {
            // Stage 4: Replace the root with the channel's details
            $replaceRoot: { newRoot: "$channelInfo" },
        },
    ]);

    return res
        .status(200)
        .json(new ApiResponse(200, subscribedChannels, "Subscribed channels fetched successfully"));
});

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels,
};