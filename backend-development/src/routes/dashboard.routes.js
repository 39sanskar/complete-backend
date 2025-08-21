import { Router } from 'express';
import {
    getChannelStats,
    getChannelVideos,
} from "../controllers/dashboard.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

// Create a new router instance from Express
const router = Router();

// Apply the verifyJWT middleware to ALL routes defined in this file.
// This is a critical security measure. The dashboard contains sensitive or private information
// (like total views, subscriber counts, and a list of all videos including unpublished ones)
// that should only be accessible to the authenticated owner of the channel.
router.use(verifyJWT);

// --- Route Definitions for the Dashboard ---

// Define the route to get the channel's statistics.
// This endpoint will return an aggregation of data like total subscribers, views, likes, etc.
// It's a GET request because it's retrieving data.
// e.g., GET http://localhost:8000/api/v1/dashboard/stats
router.route("/stats").get(getChannelStats);

// Define the route to get all videos uploaded by the channel owner.
// This is different from the public video listing because it might include unpublished videos
// and provides a more detailed view for the content creator.
// e.g., GET http://localhost:8000/api/v1/dashboard/videos
router.route("/videos").get(getChannelVideos);

// Export the router so it can be mounted in your main app.js file
export default router;