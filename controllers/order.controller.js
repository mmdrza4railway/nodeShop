import { Order } from "../models/order.model.js";

export const getIndex = async (req, res) => {
    try {
        const orders = await Order.find({ userID: req.user._id });

        res.render("order/order", {
            pageTitle: "سفارشات",
            path: "/orders",
            user: req.user,
            orders: orders,
            success: req.flash("success")[0] || null,
            warn: req.flash("warn")[0] || null,
        });
    } catch (error) {
        console.log(error);
        res.redirect("/");
    }
};

export const checkout = async (req, res) => {
    try {
        await req.user.populate('cart.items.product');

        const totalPrice = req.user.cart.items.reduce((total, item) => {
            return total + (item.product.price * item.quantity);
        }, 0);

        if (req.user.cart.items.length < 1) {
            req.flash("warn", "سبد خرید خالی است")
            return res.redirect("/cart")
        }

        if (req.user.balance < totalPrice) {
            req.flash("warn", "موجودی شما کافی نمیباشد")
            return res.redirect("/cart")
        }

        const items = req.user.cart.items.map((item, index) => {
            return {
                product: item.product._id,
                price: item.product.price,
                quantity: item.quantity
            }
        });

        const order = new Order({
            userID: req.user._id,
            amount: totalPrice,
            items: items
        })

        await order.save()

        req.user.balance -= totalPrice
        req.user.cart.items = []

        await req.user.save()

        req.flash("success", "سفارش شما با موفقیت ثبت شد")
        res.redirect("/orders")
    } catch (error) {
        console.log(error);
        req.flash("warn", "خطایی رخ داد");
        res.redirect("/cart");
    }
};
