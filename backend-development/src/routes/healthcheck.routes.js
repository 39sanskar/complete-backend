import { Router } from 'express';
import { healthcheck } from "../controllers/healthcheck.controllers.js";

// Create a new router instance from Express
const router = Router();

// Define the health check route.
// It's a GET request because it's simply retrieving the status of the server (a resource).
router.route('/healthcheck').get(healthcheck);

// --- IMPORTANT NOTE ---
// Notice that this router does NOT use the `verifyJWT` middleware.
// This is intentional and correct. A health check endpoint must be public and accessible
// without any authentication, so that automated monitoring services can easily access it
// to determine the application's health.

// Export the router to be used in the main application file (app.js)
export default router;