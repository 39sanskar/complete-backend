import { Router } from 'express';
import {
    deleteVideo,
    getAllVideos,
    getVideoById,
    publishAVideo,
    togglePublishStatus,
    updateVideo,
} from "../controllers/video.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

// Create a new router instance
const router = Router();

// Apply the verifyJWT middleware to ALL routes defined in this file.
// This ensures that only authenticated users can access these video-related endpoints.
router.use(verifyJWT);

// --- Route Definitions ---

// Route for getting all videos and publishing a new one
router.route("/")
    // GET /api/v1/videos?query=...&userId=...
    .get(getAllVideos)
    
    // POST /api/v1/videos/
    // This is the video upload endpoint. It uses the 'upload' middleware from Multer.
    .post(
        upload.fields([
            // Expect a file field named "videoFile" (max 1 file)
            {
                name: "videoFile",
                maxCount: 1,
            },
            // Expect a file field named "thumbnail" (max 1 file)
            {
                name: "thumbnail",
                maxCount: 1,
            },
        ]),
        // After Multer processes the files, it passes control to the publishAVideo controller.
        publishAVideo
    );

// Routes for actions on a specific video, identified by its ID
router.route("/:videoId")
    // GET /api/v1/videos/some-video-id
    .get(getVideoById)
    
    // DELETE /api/v1/videos/some-video-id
    .delete(deleteVideo)
    
    // PATCH /api/v1/videos/some-video-id
    // This route also uses Multer's middleware, but 'upload.single' because we only expect
    // a single file ('thumbnail') for updates.
    .patch(upload.single("thumbnail"), updateVideo);

// Route to toggle the publish status of a video
// PATCH /api/v1/videos/toggle/publish/some-video-id
router.route("/toggle/publish/:videoId").patch(togglePublishStatus);

// Export the configured router
export default router;