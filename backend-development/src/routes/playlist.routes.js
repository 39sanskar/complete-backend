import { Router } from 'express';
import {
    addVideoToPlaylist,
    createPlaylist,
    deletePlaylist,
    getPlaylistById,
    getUserPlaylists,
    removeVideoFromPlaylist,
    updatePlaylist,
} from "../controllers/playlist.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

// Create a new router instance from Express
const router = Router();

// Apply the verifyJWT middleware to ALL routes defined in this file.
// This is a global security layer for this router, ensuring that a user must be authenticated
// to perform any playlist-related action.
router.use(verifyJWT);

// --- Define the Routes ---

// Route for creating a new playlist.
// POST /api/v1/playlists/
router.route("/").post(createPlaylist);

// Routes for actions on a specific playlist, identified by its ID.
// This groups GET, PATCH, and DELETE for the same URL endpoint.
router.route("/:playlistId")
    // GET /api/v1/playlists/some-playlist-id
    .get(getPlaylistById)
    
    // PATCH /api/v1/playlists/some-playlist-id
    .patch(updatePlaylist)
    
    // DELETE /api/v1/playlists/some-playlist-id
    .delete(deletePlaylist);

// Route for adding a specific video to a specific playlist.
// PATCH is appropriate here as we are modifying a part of the playlist resource.
// PATCH /api/v1/playlists/add/some-video-id/some-playlist-id
router.route("/add/:videoId/:playlistId").patch(addVideoToPlaylist);

// Route for removing a specific video from a specific playlist.
// PATCH /api/v1/playlists/remove/some-video-id/some-playlist-id
router.route("/remove/:videoId/:playlistId").patch(removeVideoFromPlaylist);

// Route for getting all playlists created by a specific user.
// GET /api/v1/playlists/user/some-user-id
router.route("/user/:userId").get(getUserPlaylists);

// Export the configured router to be used in the main application file (app.js)
export default router;