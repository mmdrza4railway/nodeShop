import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
    {
        userID: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        items: [
            {
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Product",
                    required: true,
                },
                price: { type: Number, required: true },
                quantity: { type: Number, required: true, default: 1 },
            },
        ],
        amount: {
            type: Number,
            required: true,
        },
    },
    { timestamps: true }
);

export const Order = mongoose.model("Order", orderSchema);