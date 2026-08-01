import ZarinpalCheckout from "zarinpal-checkout";
import { Payment } from "../models/payment.model.js";
import { User } from "../models/user.model.js";

const zarinpal = ZarinpalCheckout.create(
    "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
    true,
    "IRT",
);

export const increaseBalance = async (req, res) => {
    try {
        const amount = req.body.amount;

        const request = await zarinpal.PaymentRequest({
            Amount: amount,
            CallbackURL: "http://localhost:3000/payment/check",
            Description: req.user._id,
            Email: req.user.email,
            Mobile: "09120000000",
        });

        if (request.status !== 100) {
            req.flash("warn", "خطایی پیش آمد. لطفا دوباره امتحان کنید");
            return res.redirect("/profile");
        }

        const payment = new Payment({
            userID: req.user._id,
            authority: request.authority,
            url: request.url,
            amount: amount,
        });

        await payment.save();
        res.redirect(request.url);
    } catch (error) {
        req.flash("warn", "خطایی پیش آمد. لطفا دوباره امتحان کنید");
        console.log(error);
        res.redirect("/profile");
    }
};

export const checkPayment = async (req, res) => {
    try {
        const { Authority, Status } = req.query;
        const payment = await Payment.findOne({ authority: Authority });
        const user = await User.findById(payment.userID);

        const verified = await zarinpal.PaymentVerification({
            Amount: payment.amount,
            Authority: Authority,
        });

        if (verified.status === 100) {
            payment.status = "success";
            user.balance += payment.amount;
    
            await payment.save();
            await user.save();
    
            req.flash("success", "تراکنش با موفقیت انجام شد");
            return res.redirect("/profile");
        }
    } catch (error) {
        const { Authority, Status } = req.query;
        const payment = await Payment.findOne({ authority: Authority });
        const user = await User.findById(payment.userID);
        
        payment.status = "failure";
        await payment.save();

        req.flash("warn", "تراکنش شکست خورد");
        res.redirect("/profile");
    }
};
