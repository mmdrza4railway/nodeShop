import mongoose from "mongoose";

const paymentSchema = mongoose.Schema(
    {
        userID: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        authority: {
            type: String,
            required: true,
        },
        url: {
            type: String,
            required: true,
        },
        amount: {
            type: Number,
            required: true,
        },
        status: {
            type: String,
            enum: ["pending", "success", "failure"],
            default: "pending",
        },
    },
    {
        timestamps: true,
    },
);

export const Payment = mongoose.model("Payment", paymentSchema);
