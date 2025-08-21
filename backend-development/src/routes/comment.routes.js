import { Router } from 'express';
import {
    addComment,
    deleteComment,
    getVideoComments,
    updateComment,
} from "../controllers/comment.controllers.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"

// Initialize a new router instance from Express
const router = Router();

// Apply the verifyJWT middleware to ALL routes defined in this file.
// This is a crucial security measure. It ensures that a user must be authenticated (logged in)
// to perform any of the actions below (get, add, update, or delete comments).
// The verifyJWT middleware will check for a valid token and attach the user's data to the `req` object as `req.user`.
router.use(verifyJWT);

// --- Route Definitions ---

// Define routes that operate on a collection of comments related to a specific video.
// These routes are grouped by the videoId parameter.
router.route("/:videoId")
    // GET request to /api/comments/some-video-id
    // Fetches all comments for the specified video.
    .get(getVideoComments)
    
    // POST request to /api/comments/some-video-id
    // Adds a new comment to the specified video.
    .post(addComment);

// Define routes that operate on a single, specific comment.
// These routes are grouped by the commentId parameter.
// Using "/c/" is a good practice to avoid route conflicts with "/:videoId".
router.route("/c/:commentId")
    // DELETE request to /api/comments/c/some-comment-id
    // Deletes the specified comment.
    .delete(deleteComment)
    
    // PATCH request to /api/comments/c/some-comment-id
    // Updates the specified comment. Using PATCH is standard for partial updates.
    .patch(updateComment);

// Export the router to be used in the main application file (app.js).
export default router;