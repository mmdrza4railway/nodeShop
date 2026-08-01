import { Router } from "express";
import { getIndex } from "../controllers/profile.controller.js";
import { isLogin } from "../middlewares/role.js";

const profileRouter = Router();

profileRouter.get("/", isLogin, getIndex);

export { profileRouter };
