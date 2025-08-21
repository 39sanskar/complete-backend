import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { Video } from "../models/video.model.js"; // This model is required for validation
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * @description Get all comments for a specific video with pagination.
 * This function uses an aggregation pipeline to enrich comment data with owner details.
 * @route GET /api/v1/comments/:videoId
 * @access Public (but requires JWT as per router setup)
 */

// --- Get all comments for a video
const getVideoComments = asyncHandler(async (req, res) => {
    // Extract videoId from URL parameters and pagination details from query string
    const { videoId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    // 1. Validate the videoId to ensure it's a valid MongoDB ObjectId
    if (!mongoose.isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid Video ID format");
    }

    // 2. Verify that the video actually exists in the database
    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video with this ID not found");
    }

    // 3. Create a MongoDB Aggregation Pipeline
    const commentsAggregate = Comment.aggregate([
        {
            // Stage 1: Filter comments to match only the requested videoId
            $match: {
                video: new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            // Stage 2: Join with the 'users' collection to get comment owner's details
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "ownerDetails",
                pipeline: [
                    {
                        // Project only the necessary fields from the user document
                        $project: {
                            username: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        },
        {
            // Stage 3: Deconstruct the ownerDetails array to get a single object
            $unwind: "$ownerDetails"
        },
        {
            // Stage 4: Reshape the final output documents
            $project: {
                _id: 1,
                content: 1,
                createdAt: 1,
                owner: "$ownerDetails" // Embed the owner details object
            }
        },
        {
            // Stage 5: Sort comments from newest to oldest
            $sort: {
                createdAt: -1
            }
        }
    ]);
    
    // 4. Execute the aggregation pipeline with pagination
    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        customLabels: {
            docs: 'comments',
            totalDocs: 'totalComments'
        }
    };

    const paginatedComments = await Comment.aggregatePaginate(commentsAggregate, options);

    // 5. Return the paginated results in a standardized response
    return res
        .status(200)
        .json(new ApiResponse(200, paginatedComments, "Comments fetched successfully"));
});

/**
 * @description Add a new comment to a video.
 * @route POST /api/v1/comments/:videoId
 * @access Private (Requires user to be logged in)
 */
// --- Add a new comment ----
const addComment = asyncHandler(async (req, res) => {
    // Extract videoId from URL and content from the request body
    const { videoId } = req.params;
    const { content } = req.body;

    // 1. Validate videoId
    if (!mongoose.isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid Video ID format");
    }
    
    if (!req.user?._id) {
        throw new ApiError(401, "Unauthorized request");
    }

    // 2. Validate that comment content is not empty
    if (!content || content.trim() === "") {
        throw new ApiError(400, "Comment content cannot be empty");
    }

    // 3. Check if the video exists
    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    // 4. Create the comment document in the database
    const comment = await Comment.create({
        content,
        video: videoId,
        owner: req.user?._id // The owner is the authenticated user from verifyJWT
    });

    if (!comment) {
        throw new ApiError(500, "Something went wrong while creating the comment");
    }

    // 5. Return the newly created comment
    return res
        .status(201)
        .json(new ApiResponse(201, comment, "Comment added successfully"));
});

/**
 * @description Update an existing comment.
 * @route PATCH /api/v1/comments/c/:commentId
 * @access Private (Requires ownership of the comment)
 */
// --- Update a comment ---
const updateComment = asyncHandler(async (req, res) => {
    // Extract commentId from URL and new content from the body
    const { commentId } = req.params;
    const { content } = req.body;

    // 1. Validate commentId
    if (!mongoose.isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid Comment ID format");
    }

    if (!req.user?._id) {
        throw new ApiError(401, "Unauthorized request");
    }

    // 2. Validate new content
    if (!content || content.trim() === "") {
        throw new ApiError(400, "Comment content cannot be empty");
    }

    // 3. Find the original comment
    const comment = await Comment.findById(commentId);
    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }

    // 4. Authorization Check: Ensure the person updating is the original owner
    if (comment.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "You are not authorized to update this comment");
    }

    // 5. Update the comment with the new content and save it

    const updatedComment = await Comment.findByIdAndUpdate(
        commentId,
        {
            $set: {
                content: content
            }
        },
        { new: true } // This option returns the document after the update
    );
    
    // 6. Return the updated comment
    return res
        .status(200)
        .json(new ApiResponse(200, updatedComment, "Comment updated successfully"));
});

/**
 * @description Delete a comment.
 * @route DELETE /api/v1/comments/c/:commentId
 * @access Private (Requires ownership of the comment or the video)
 */
// ---Delete a comment---
const deleteComment = asyncHandler(async (req, res) => {
    // Extract commentId from URL
    const { commentId } = req.params;
    
    // 1. Validate commentId
    if (!mongoose.isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid Comment ID format");
    }

    if (!req.user?._id) {
        throw new ApiError(401, "Unauthorized request");
    }
    
    // 2. Find the comment to be deleted
    const comment = await Comment.findById(commentId);
    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }

    // 3. Find the video the comment belongs to for the second authorization check
    const video = await Video.findById(comment.video);
    if (!video) {
        throw new ApiError(404, "Associated video not found");
    }

    // 4. Authorization Check:
    // A comment can be deleted by its own author OR the owner of the video.
    const isCommentOwner = comment.owner.toString() === req.user?._id.toString();
    const isVideoOwner = video.owner.toString() === req.user?._id.toString();
    
    if (!isCommentOwner && !isVideoOwner) {
        throw new ApiError(403, "You are not authorized to delete this comment");
    }

    // 5. Perform the deletion
    await Comment.findByIdAndDelete(commentId);

    // 6. Return a success response
    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Comment deleted successfully"));
});

// Export all the controller functions
export {
    getVideoComments, 
    addComment, 
    updateComment,
    deleteComment
};