import mongoose from "mongoose";

const userSchema = mongoose.Schema(
    {
        name: {
            type: String,
            trim: true,
            required: true,
            maxlength: 32,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            match: /^((?!\.)[\w\-_.]*[^.])(@\w+)(\.\w+(\.\w+)?[^.\W])$/,
        },
        password: {
            type: String,
            required: true,
            minlength: 8,
        },
        role: {
            type: String,
            enum: ["user", "admin", "superadmin"],
            default: "user",
        },
        cart: {
            items: {
                type: [
                    {
                        product: {
                            type: mongoose.Schema.Types.ObjectId,
                            ref: "Product",
                        },
                        quantity: {
                            type: Number,
                            min: 1,
                            default: 1,
                        },
                    },
                ],
                default: [],
            },
        },
        balance: {
            type: Number,
            default: 0
        },
        resetToken: {
            type: String,
            default: null,
        },
        tokenExpired: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    },
);

export const User = mongoose.model("User", userSchema);
