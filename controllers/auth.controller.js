import { hash, compare } from "bcryptjs";
import { User } from "../models/user.model.js";
import { Session } from "../models/session.model.js";
import { randomBytes } from "crypto";
import { transport } from "../funcs/mailtrap.js";

export const getSignup = (req, res) => {
    res.render("auth/signup", {
        pageTitle: "ثبت نام",
        path: "/auth/signup",
        user: req.user,
        success: req.flash("success")[0] || null,
        errors: req.flash("errors")[0] || null,
        inputs: req.flash("inputs")[0] || null,
    });
};

export const postSignup = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        req.flash("inputs", { name, email });

        const findUser = await User.findOne({ email: email.trim() });

        const emailPattern =
            /^((?!\.)[\w\-_.]*[^.])(@\w+)(\.\w+(\.\w+)?[^.\W])$/;
        let errors = {};

        if (!name.trim()) errors.name = "نام الزامی است";

        if (name.trim().length > 32)
            errors.name = "نام حداکثر میتواند 32 کاراکتر باشد";

        if (!email || !emailPattern.test(email.trim()))
            errors.email = "ایمیل معتبر نمیباشد";

        if (findUser) errors.email = "ایمیل ثبت شده است";

        if (!password || password.length < 8)
            errors.password = "رمز عبور حداقل باید 8 کاراکتر باشد";

        if (Object.keys(errors).length > 0) {
            req.flash("errors", errors);
            return res.redirect("/auth/signup");
        }

        const hashedPass = await hash(password, 12);

        const user = new User({
            name: name.trim(),
            email: email.trim(),
            password: hashedPass,
        });
        await user.save();

        req.flash("success", "ثبت نام با موفقیت انجام شد. میتوانید وارد شوید.");
        res.redirect("/auth/login");
    } catch (error) {
        req.flash("errors", {
            error: "خطایی پیش آمد. لطفا دوباره امتحان کنید",
        });
        res.redirect("/auth/signup");
    }
};

export const getLogin = (req, res) => {
    res.render("auth/login", {
        pageTitle: "ورود",
        path: "/auth/login",
        user: req.user,
        success: req.flash("success")[0] || null,
        errors: req.flash("errors")[0] || null,
        inputs: req.flash("inputs")[0] || null,
        warn: req.flash("warn")[0] || null,
    });
};

export const postLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        req.flash("inputs", {
            email,
        });

        const emailPattern =
            /^((?!\.)[\w\-_.]*[^.])(@\w+)(\.\w+(\.\w+)?[^.\W])$/;
        let errors = {};

        if (!email || !emailPattern.test(email.trim()))
            errors.email = "ایمیل معتبر نمیباشد";

        if (!password) errors.password = "رمز عبور حداقل نمیتواند خالی باشد";

        if (Object.keys(errors).length > 0) {
            req.flash("errors", errors);
            return res.redirect("/auth/login");
        }

        const user = await User.findOne({ email: email.trim() });

        if (user) {
            const isMatch = await compare(password, user.password);
            if (!isMatch) errors.password = "رمز عبور اشتباه است";
        } else {
            errors.user = "کاربری با این ایمیل یافت نشد";
        }

        if (Object.keys(errors).length > 0) {
            req.flash("errors", errors);
            return res.redirect("/auth/login");
        }

        const token = randomBytes(32).toString("hex");

        const session = new Session({
            userID: user._id,
            token,
        });

        await session.save();

        res.cookie("session", token, {
            httpOnly: true,
            secure: process.env.PRODUCTION,
            maxAge: 24 * 60 * 60 * 1000,
            path: "/",
            sameSite: "lax",
        });

        req.flash("success", "خوش آمدید");
        res.redirect("/");
    } catch (error) {
        req.flash("errors", {
            error: "خطایی پیش آمد. لطفا دوباره امتحان کنید",
        });
        console.log(error);

        res.redirect("/auth/login");
    }
};

export const logout = async (req, res) => {
    try {
        const sessionToken = req.cookies.session;

        await Session.findOneAndDelete({ token: sessionToken });

        res.clearCookie("session");
        req.flash("warn", "از حساب کاربری خارج شدید");
        res.redirect("/auth/login");
    } catch (error) {
        req.flash("warn", "مشکلی پیش آمد");
        res.redirect("/");
    }
};

export const getChangePass = (req, res) => {
    res.render("auth/change-pass", {
        pageTitle: "تغییر رمز عبور",
        path: "/profile/change-password",
        user: req.user,
        success: req.flash("success")[0] || null,
        errors: req.flash("errors")[0] || null,
    });
};

export const postChangePass = async (req, res) => {
    try {
        const { currentPassword, newPassword, confirmPassword } = req.body;

        let errors = {};

        if (newPassword?.length < 8)
            errors.newPassword = "رمز عبور باید حداقل 8 کاراکتر باشد";

        if (newPassword !== confirmPassword)
            errors.confirmPassword = "تکرار رمز عبور مطابقت ندارد";

        const isMatch = await compare(currentPassword, req.user.password);
        if (!isMatch) errors.currentPassword = "رمز عبور فعلی اشتباه است";

        if (Object.keys(errors).length > 0) {
            req.flash("errors", errors);
            return res.redirect("/auth/change-password");
        }

        const hashedPass = await hash(newPassword, 12);
        req.user.password = hashedPass;

        await req.user.save();
        req.flash("success", "رمز عبور با موفقیت تغییر یافت");
        res.redirect("/profile");
    } catch (error) {
        req.flash("errors", {
            error: "خطایی پیش آمد. لطفا دوباره امتحان کنید",
        });
        console.log(error);
        res.redirect("/auth/change-password");
    }
};

export const getCreateResetToken = async (req, res) => {
    try {
        const token = randomBytes(32).toString("hex");

        req.user.resetToken = token;
        req.user.tokenExpired = Date.now() + 1000 * 60 * 15;

        await transport.sendMail({
            from: "admin@nodeshop.com",
            to: req.user.email,
            subject: "بازیابی رمز عبور",
            html: `
                <div style="direction: rtl; text-align: right; font-family: Tahoma, sans-serif;">
                    <h3>درخواست تغییر رمز عبور</h3>
                    <p>شما درخواست بازیابی رمز عبور داده‌اید. برای تنظیم رمز جدید روی لینک زیر کلیک کنید:</p>
                    <p><a href="http://localhost:3000/auth/reset-password/${token}" style="background-color: #0d6efd; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">تنظیم رمز عبور جدید</a></p>
                    <p>این لینک تا 15 دقیقه معتبر است.</p>
                </div>
            `,
        });
        await req.user.save();

        req.flash("success", "ایمیل بازیابی ارسال شد");
        res.redirect("/profile");
    } catch (error) {
        req.flash("errors", {
            error: "خطایی پیش آمد. لطفا دوباره امتحان کنید",
        });
        console.log(error);
        res.redirect("/auth/change-password");
    }
};

export const getResetPass = async (req, res) => {
    try {
        const token = req.params.token;

        const user = await User.findOne({
            resetToken: token,
            tokenExpired: {
                $gt: Date.now(),
            },
        });

        if (!user) {
            return res.redirect("/");
        }

        res.render("auth/reset-pass", {
            pageTitle: "تغییر رمز عبور",
            path: "/auth/reset-password",
            user: req.user,
            token: token,
            errors: req.flash("errors")[0] || null,
        });
    } catch (error) {
        console.log(error);
        res.redirect("/");
    }
};

export const postResetPass = async (req, res) => {
    const token = req.params.token;
    try {
        const { newPassword, confirmPassword } = req.body;

        let errors = {};

        if (!newPassword || newPassword.length < 8)
            errors.newPassword = "رمز عبور باید حداقل 8 کاراکتر باشد";

        if (newPassword !== confirmPassword)
            errors.confirmPassword = "رمز عبور مطابقت ندارد";

        if (Object.keys(errors).length > 0) {
            req.flash("errors", errors);
            return res.redirect(`/auth/reset-password/${token}`);
        }
        const user = await User.findOne({
            resetToken: token,
            tokenExpired: {
                $gt: Date.now(),
            },
        });

        const hashedPass = await hash(newPassword, 12);

        user.password = hashedPass;
        user.resetToken = "";
        await user.save();

        req.flash("success", "رمز عبور تغییر یافت");
        res.redirect(req.user ? "/profile" : "/auth/login");
    } catch (error) {
        console.log(error);
        req.flash("errors", { error: "مشکلی پیش آمد" });
        res.redirect(`/auth/reset-password/${token}`);
    }
};

export const getResetPassReq = async (req, res) => {
    res.render("auth/enter-email", {
        pageTitle: "بازیابی رمز عبور",
        path: "/auth/reset-password-request",
        user: req.user,
        success: req.flash("success")[0] || null,
        errors: req.flash("errors")[0] || null,
    });
};

export const postResetPassReq = async (req, res) => {
    try {
        const token = randomBytes(32).toString("hex");
        const email = req.body.email

        const findUser = await User.findOne({ email: email.trim() });

        const emailPattern =
            /^((?!\.)[\w\-_.]*[^.])(@\w+)(\.\w+(\.\w+)?[^.\W])$/;
        let errors = {};

        if (!email || !emailPattern.test(email.trim()))
            errors.email = "ایمیل معتبر نمیباشد";

        if (!findUser) errors.email = "ایمیل یافت نشد";

        if (Object.keys(errors).length > 0) {
            req.flash("errors", errors);
            return res.redirect("/auth/reset-password-request");
        }

        findUser.resetToken = token;
        findUser.tokenExpired = Date.now() + 1000 * 60 * 15;

        await transport.sendMail({
            from: "admin@nodeshop.com",
            to: findUser.email,
            subject: "بازیابی رمز عبور",
            html: `
                <div style="direction: rtl; text-align: right; font-family: Tahoma, sans-serif;">
                    <h3>درخواست تغییر رمز عبور</h3>
                    <p>شما درخواست بازیابی رمز عبور داده‌اید. برای تنظیم رمز جدید روی لینک زیر کلیک کنید:</p>
                    <p><a href="http://localhost:3000/auth/reset-password/${token}" style="background-color: #0d6efd; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">تنظیم رمز عبور جدید</a></p>
                    <p>این لینک تا 15 دقیقه معتبر است.</p>
                </div>
            `,
        });
        await findUser.save();

        req.flash("success", "ایمیل بازیابی ارسال شد");
        res.redirect("/auth/reset-password-request");
    } catch (error) {
        req.flash("errors", {
            error: "خطایی پیش آمد. لطفا دوباره امتحان کنید",
        });
        console.log(error);
        res.redirect("/auth/reset-password-request");
    }
};
