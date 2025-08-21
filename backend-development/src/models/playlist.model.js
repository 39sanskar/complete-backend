import mongoose, { Schema } from "mongoose";

// Define the schema for the Playlist model
const playlistSchema = new Schema(
    {
        // Name of the playlist, e.g., "My Favorite Songs"
        name: {
            type: String,
            required: [true, "Playlist name is required"],
            trim: true,
        },
        
        // A short description of the playlist's content
        description: {
            type: String,
            required: [true, "Playlist description is required"],
            trim: true,
        },
        
        // An array of references to Video documents.
        // This is the core of the playlist, holding the list of video IDs.
        videos: [
            {
                type: Schema.Types.ObjectId,
                ref: "Video" // This tells Mongoose the IDs in this array refer to documents in the 'Video' collection
            }
        ],
        
        // Reference to the User who owns this playlist.
        // This is crucial for authorization and for fetching user-specific playlists.
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User" // Refers to a document in the 'User' collection
        },
    }, 
    {
        // Automatically add 'createdAt' and 'updatedAt' fields to each document
        timestamps: true
    }
);

// Export the Mongoose model so it can be used in other parts of the application (like controllers)
export const Playlist = mongoose.model("Playlist", playlistSchema);