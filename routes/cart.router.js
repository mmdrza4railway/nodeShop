import { Router } from "express";
import {
    getCart,
    postAdd,
    postDecrease,
    postIncrease,
} from "../controllers/cart.controller.js";
import { isLogin } from "../middlewares/role.js"

const cartRouter = Router();

cartRouter.get("/", isLogin, getCart);
cartRouter.post("/add/:productID", isLogin, postAdd);

cartRouter.post("/increase/:productID", isLogin, postIncrease);
cartRouter.post("/decrease/:productID", isLogin, postDecrease);

export { cartRouter };
