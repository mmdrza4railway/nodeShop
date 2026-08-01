import { Router } from "express";
import { index } from "../controllers/home.controller.js";

const homeRouter = Router();

homeRouter.get("/", index);

export { homeRouter };
