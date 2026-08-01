import mongoose from "mongoose";

export function connectDB() {
    mongoose
        .connect(process.env.DATABASE_URL)
        .then(() => console.log("DB connected"))
        .catch(() => {
            setTimeout(() => connectDB(), 2000)
        });
}