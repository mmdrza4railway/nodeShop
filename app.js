import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import flash from "connect-flash";
import session from "express-session";
import { connectDB } from "./config/db.js";
import { checkDB } from "./middlewares/check-db.js";
import { homeRouter } from "./routes/home.router.js";
import { authRouter } from "./routes/auth.router.js";
import { getUser } from "./middlewares/getUser.js";
import { productRouter } from "./routes/product.router.js";
import { cartRouter } from "./routes/cart.router.js";
import {profileRouter} from "./routes/profile.router.js"
import { paymentRouter } from "./routes/payment.router.js";
import { orderRouter } from "./routes/order.router.js";

dotenv.config();
const app = express();

// set
app.set("view engine", "ejs");
app.set("views", "./views");

// middleware
app.use(checkDB);
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
    session({
        secret: "mmdrza",
        resave: false,
        saveUninitialized: false,
    }),
);
app.use(flash());
app.use(getUser);
app.use("/public", express.static("public"));

// route
app.use("/", homeRouter);
app.use("/auth", authRouter);
app.use("/products", productRouter);
app.use("/cart", cartRouter);
app.use("/profile", profileRouter);
app.use("/payment", paymentRouter);
app.use("/orders", orderRouter)

app.listen(process.env.PORT || 3000, () => {
    connectDB();
});