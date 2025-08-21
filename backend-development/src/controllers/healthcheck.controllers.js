import mongoose from "mongoose";

import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


/**
 * @description Performs a basic health check on the application.
 * This endpoint is typically used by monitoring services (like AWS ELB, Kubernetes, Pingdom)
 * to verify that the application is live and responsive.
 * @route GET /api/v1/healthcheck
 * @access Public
 */
const healthcheck = asyncHandler(async (req, res) => {

    // Check MongoDB connection state (0=disconnected, 1=connected, 2=connecting, 3=disconnecting)
    if (mongoose.connection.readyState !== 1) {
        throw new ApiError(500, "Database connection is not healthy");
    }

    const healthStatus = {
        status: "OK",
        message: "Server is healthy and responding.",
        timestamp: new Date().toISOString(),
        uptime: `${process.uptime().toFixed(2)}s`,
        environment: process.env.NODE_ENV || "development"
        
    };

    return res
        .status(200)
        .json(new ApiResponse(200, healthStatus, "Health check performed successfully"));
});

export {
    healthcheck
};
