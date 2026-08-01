import { Router } from "express";
import { getIndex, checkout } from "../controllers/order.controller.js";
import { isLogin } from "../middlewares/role.js"

const orderRouter = Router();

orderRouter.get("/", isLogin, getIndex);

orderRouter.post("/checkout", isLogin, checkout);

export { orderRouter };
