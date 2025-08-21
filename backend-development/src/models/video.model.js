import mongoose, { Schema } from 'mongoose';
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

// Define the schema for the Video model
const videoSchema = new Schema(
  {
    // URL of the video file, hosted on a service like Cloudinary
    videoFile: {
      type: String, // Storing the URL as a String
      required: [true, "Video file URL is required"],
    },
    
    // URL of the video's thumbnail image, also hosted on a service like Cloudinary
    thumbnail: {
      type: String,
      required: [true, "Thumbnail URL is required"],
    },
    
    // The title of the video
    title: {
      type: String, 
      required: [true, "Title is required"],
      trim: true,
      index: true // Adds an index for faster searching on the title field
    },
    
    // The description of the video
    description: {
      type: String, 
      required: [true, "Description is required"],
      trim: true,
    },
    
    // Duration of the video in seconds, typically provided by the cloud service
    duration: {
      type: Number, // Storing duration in seconds
      required: [true, "Duration is required"],
    },
    
    // The number of times the video has been viewed
    views: {
      type: Number,
      default: 0,
    },
    
    // A flag to control the visibility of the video (public or private)
    isPublished: {
      type: Boolean,
      default: true, // Default to published when a video is uploaded
    },
    
    // A reference to the User who owns/uploaded this video
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User" // Creates a link to the User collection
    },
  },
  {
    // Automatically adds 'createdAt' and 'updatedAt' fields
    timestamps: true
  }
);

// To enable text search on title and description for the getAllVideos controller
videoSchema.index({ title: 'text', description: 'text' });

// Add the mongoose-aggregate-paginate-v2 plugin to the schema.
// This is essential for the advanced pagination in the getAllVideos controller.
videoSchema.plugin(mongooseAggregatePaginate);

// Export the Mongoose model
export const Video = mongoose.model("Video", videoSchema);