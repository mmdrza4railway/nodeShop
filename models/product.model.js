import mongoose from "mongoose";

const productSchema = mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        desc: {
            type: String,
            required: true,
        },
        price: {
            type: Number,
            required: true,
            min: 0,
        },
        image: {
            type: String,
            default: null,
        },
        status: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    },
);

export const Product = mongoose.model("Product", productSchema);
