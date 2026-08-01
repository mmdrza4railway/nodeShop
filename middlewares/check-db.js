import mongoose from "mongoose";

export const checkDB = (req, res, next) => {
    if (mongoose.connection.readyState !== 1) {
        return res.render("error", {
            pageTitle: "error",
            text: "Service unavailable"
        });
    }
    next();
};