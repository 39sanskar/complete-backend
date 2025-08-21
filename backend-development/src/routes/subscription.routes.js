import { Router } from 'express';
import {
    getSubscribedChannels,
    getUserChannelSubscribers,
    toggleSubscription,
} from "../controllers/subscription.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

// Create a new router instance from Express
const router = Router();

// Apply the verifyJWT middleware to ALL routes in this file.
// This ensures that only authenticated users can access these endpoints.
router.use(verifyJWT);

// --- Route Definitions ---

// This route handles two actions on a specific channel, identified by 'channelId'.
router.route("/c/:channelId")
    // POST request to /api/v1/subscriptions/c/some-channel-id
    // This is the action to subscribe to or unsubscribe from the channel.
    // POST is used because it creates or deletes a resource (the subscription).
    .post(toggleSubscription)
    
    // GET request to /api/v1/subscriptions/c/some-channel-id
    // This fetches the list of channels that the user specified by 'channelId' is subscribed to.
    // The function name `getSubscribedChannels` makes this clear.
    .get(getSubscribedChannels);


// This route is for getting the list of subscribers for a specific channel.
// The channel is identified by the 'channelId' parameter.
// GET request to /api/v1/subscriptions/u/some-channel-id
router.route("/u/:channelId").get(getUserChannelSubscribers);
// Note: While the parameter is named 'subscriberId' in your original file, using 'channelId'
// here would be more consistent with the function's purpose (getting subscribers OF a channel).
// However, the controller logic can easily handle either name.

// Export the configured router to be used in the main application file (app.js)
export default router;