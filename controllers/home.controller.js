import { Product } from "../models/product.model.js";

export const index = async (req, res) => {
    const products = await Product.find({status: true})
        .sort({ createdAt: -1 })
        .limit(4);

    res.render("home", {
        pageTitle: "فروشگاه",
        path: "/",
        user: req.user,
        products: products,
        success: req.flash("success")[0] || null,
        warn: req.flash("warn")[0] || null,
    });
};
