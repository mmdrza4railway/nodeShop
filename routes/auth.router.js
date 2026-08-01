import { Router } from "express";
import {
    getSignup,
    postSignup,
    getLogin,
    postLogin,
    logout,
    getChangePass,
    postChangePass,
    getCreateResetToken,
    getResetPass,
    postResetPass,
    getResetPassReq,
    postResetPassReq,
} from "../controllers/auth.controller.js";
import { isGhost, isAdmin, isLogin } from "../middlewares/role.js"

const authRouter = Router();

authRouter.get("/signup", isGhost, getSignup);
authRouter.post("/signup", isGhost, postSignup);

authRouter.get("/login", isGhost, getLogin);
authRouter.post("/login", isGhost, postLogin);

authRouter.post("/logout", isLogin, logout);

authRouter.get("/change-password", isLogin, getChangePass);
authRouter.post("/change-password", isLogin, postChangePass);

authRouter.get("/reset-password", isLogin, getCreateResetToken);
authRouter.get("/reset-password/:token", getResetPass);
authRouter.post("/reset-password/:token", postResetPass);

authRouter.get("/reset-password-request", getResetPassReq);
authRouter.post("/reset-password-request", postResetPassReq);

export { authRouter };
