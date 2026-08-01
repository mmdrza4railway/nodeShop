import { Product } from "../models/product.model.js";

export const getCart = async (req, res) => {
    const cartItems = await req.user.populate('cart.items.product');

    const totalPrice = req.user.cart.items.reduce((total, item) => {
        return total + (item.product.price * item.quantity);
    }, 0);
    
    res.render("cart/cart", {
        pageTitle: "سبد خرید",
        path: "/cart",
        user: req.user,
        items: cartItems.cart.items,
        totalPrice,
        success: req.flash("success")[0] || null,
        warn: req.flash("warn")[0] || null,
    });
};

export const postAdd = async (req, res) => {
    try {
        const productID = req.params.productID;
        const user = req.user;

        const product = await Product.findById(productID);

        if (!product) {
            throw new Error("محصول یافت نشد");
        }

        const cartProductIndex = user.cart.items.findIndex((item) => {
            return item.product.toString() === product._id.toString();
        });

        if (cartProductIndex >= 0) {
            user.cart.items[cartProductIndex].quantity += 1;
        } else {
            user.cart.items.push({
                product: product._id,
                quantity: 1,
            });
        }

        await user.save();
        req.flash("success", "محصول به سبد خرید اضافه شد");
        res.redirect("/cart");
    } catch (error) {
        req.flash("warn", "خطایی پیش آمد");
        res.redirect("/products");
    }
};

export const postIncrease = async (req, res) => {
    try {
        const productID = req.params.productID;
        const user = req.user;

        const product = await Product.findById(productID);

        if (!product) {
            throw new Error("محصول یافت نشد");
        }

        const cartProductIndex = user.cart.items.findIndex((item) => {
            return item.product.toString() === product._id.toString();
        });

        user.cart.items[cartProductIndex].quantity += 1;

        await user.save();
        req.flash("success", "به تعداد محصول اضافه شد");
        res.redirect("/cart");
    } catch (error) {
        req.flash("warn", "خطایی پیش آمد");
        res.redirect("/cart");
    }
}

export const postDecrease = async (req, res) => {
    try {
        const productID = req.params.productID;
        const user = req.user;

        const product = await Product.findById(productID);

        if (!product) {
            throw new Error("محصول یافت نشد");
        }

        const cartProductIndex = user.cart.items.findIndex((item) => {
            return item.product.toString() === product._id.toString();
        });

        if (user.cart.items[cartProductIndex].quantity === 1) {
            user.cart.items.splice(cartProductIndex, 1)
            req.flash("success", "محصول از سبد خرید حذف شد");
        } else {
            user.cart.items[cartProductIndex].quantity -= 1;
            req.flash("success", "از تعداد محصول کم شد");
        }

        await user.save();
        res.redirect("/cart");
    } catch (error) {
        req.flash("warn", "خطایی پیش آمد");
        res.redirect("/cart");
    }
}