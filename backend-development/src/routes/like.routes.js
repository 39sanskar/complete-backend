import { Router } from 'express';
import {
    getLikedVideos,
    toggleCommentLike,
    toggleVideoLike,
    toggleTweetLike,
} from "../controllers/like.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

// Create a new router instance from Express
const router = Router();

// This is a crucial security step.
// The `router.use(verifyJWT)` line applies the `verifyJWT` middleware to every single route defined in this file.
// This means a user MUST be authenticated (logged in) to be able to like/unlike content or view their liked videos.
// If the user is not authenticated, the verifyJWT middleware will send an error response and the request
// will never reach the controller functions.
router.use(verifyJWT);

// --- Route Definitions for Toggling Likes ---

// Route to toggle a like on a video.
// It uses a POST request, which is a common practice for actions that change state, like toggling a like.
// The video's ID is passed as a URL parameter.
// e.g., POST http://localhost:8000/api/v1/likes/toggle/v/60d21b4667d0d8992e610c85
router.route("/toggle/v/:videoId").post(toggleVideoLike);

// Route to toggle a like on a comment.
// e.g., POST http://localhost:8000/api/v1/likes/toggle/c/60d21b4667d0d8992e610c99
router.route("/toggle/c/:commentId").post(toggleCommentLike);

// Route to toggle a like on a tweet.
// e.g., POST http://localhost:8000/api/v1/likes/toggle/t/60d21b4667d0d8992e610d12
router.route("/toggle/t/:tweetId").post(toggleTweetLike);


// --- Route Definition for Fetching Liked Content ---

// Route for the authenticated user to get a list of all the videos they have liked.
// It's a GET request because it's fetching data.
// e.g., GET http://localhost:8000/api/v1/likes/videos
router.route("/videos").get(getLikedVideos);

// Export the router so it can be mounted in your main app.js file
export default router;