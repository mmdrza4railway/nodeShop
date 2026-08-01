import { Router } from "express";
import {
    getAdd,
    getProducts,
    postAdd,
    getManage,
    getEdit,
    postEdit,
    postDelete,
    getProduct,
} from "../controllers/product.controller.js";
import upload from "../middlewares/upload.js";

const productRouter = Router();

productRouter.get("/view/:productID", getProduct)

productRouter.get("/add", getAdd);
productRouter.post("/add", upload.single("image"), postAdd);

productRouter.get("/", getProducts);

productRouter.get("/manage", getManage);

productRouter.get("/edit/:productID", getEdit);
productRouter.post("/edit/:productID", upload.single("image"), postEdit);

productRouter.post("/delete/:productID", postDelete);

export { productRouter };
