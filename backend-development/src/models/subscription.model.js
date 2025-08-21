import mongoose, { Schema } from "mongoose";

// Define the schema for the Subscription model
const subscriptionSchema = new Schema(
    {
        // 'subscriber' is a reference to a User document.
        // This field stores the ObjectId of the user who is performing the subscription.
        subscriber: {
            type: Schema.Types.ObjectId, // The data type is a MongoDB ObjectId
            ref: "User", // This tells Mongoose that this ID refers to a document in the 'User' collection
            required: true,
        },

        // 'channel' is also a reference to a User document.
        // This field stores the ObjectId of the user who is being subscribed to.
        // We call it 'channel' because in this context, every user is a potential channel.
        channel: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    {
        // Automatically add 'createdAt' and 'updatedAt' fields.
        // 'createdAt' is particularly useful for knowing when a subscription happened.
        timestamps: true,
    }
);

// To prevent a user from subscribing to the same channel more than once,
// we can create a unique compound index on both fields.
subscriptionSchema.index({ subscriber: 1, channel: 1 }, { unique: true });

// Export the Mongoose model so it can be used in controllers
export const Subscription = mongoose.model("Subscription", subscriptionSchema);