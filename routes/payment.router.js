import { Router } from "express";
import { checkPayment, increaseBalance } from "../controllers/payment.controller.js";
import { isLogin } from "../middlewares/role.js";

const paymentRouter = Router();

paymentRouter.post("/increase-balance", isLogin, increaseBalance);
paymentRouter.get("/check", checkPayment);

export { paymentRouter };
