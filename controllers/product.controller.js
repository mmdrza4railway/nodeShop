import { unlink } from "fs/promises";
import { Product } from "../models/product.model.js";
import { join } from "path";

export const getAdd = async (req, res) => {
    res.render("product/add", {
        pageTitle: "افزودن محصول",
        path: "/products/add",
        user: req.user,
        success: req.flash("success")[0] || null,
        errors: req.flash("errors")[0] || null,
        inputs: req.flash("inputs")[0] || null,
    });
};

export const postAdd = async (req, res) => {
    let title, desc, price, status;

    try {
        ({ title, desc, price, status } = req.body);

        const imageFile = req.file;
        const errors = {};

        if (!title?.trim()) {
            errors.title = "عنوان الزامی است";
        }

        if (!desc?.trim()) {
            errors.desc = "توضیحات الزامی است";
        }

        if (!price || Number(price) < 0) {
            errors.price = "قیمت معتبر نمی‌باشد";
        }

        if (!imageFile) {
            errors.image = "عکس محصول الزامی است";
        }

        if (imageFile?.size > 5242880) {
            errors.image = "حجم عکس نباید بیشتر از 5 مگابایت باشد";
        }

        if (Object.keys(errors).length > 0) {
            if (imageFile) {
                await unlink(join("public", "products", imageFile.filename));
            }

            req.flash("errors", errors);
            req.flash("inputs", {
                title,
                desc,
                price,
                status,
            });

            return res.redirect("/products/add");
        }

        await Product.create({
            title: title.trim(),
            desc: desc.trim(),
            price: Number(price),
            status: Boolean(Number(status)),
            image: imageFile.filename,
        });

        req.flash("success", "محصول با موفقیت ذخیره شد.");
        return res.redirect("/products/add");
    } catch (err) {
        console.error(err);

        if (req.file) {
            try {
                await unlink(join("public", "products", req.file.filename));
            } catch {}
        }

        req.flash("errors", {
            error: "مشکلی پیش آمد. لطفاً دوباره امتحان کنید.",
        });

        req.flash("inputs", {
            title,
            desc,
            price,
            status,
        });

        return res.redirect("/products/add");
    }
};

export const getProducts = async (req, res) => {
    const products = await Product.find({ status: true });

    res.render("product/products", {
        pageTitle: "محصولات",
        path: "/products",
        user: req.user,
        products: products,
    });
};

export const getProduct = async (req, res) => {
    const productID = req.params.productID;
    const product = await Product.findById(productID);

    res.render("product/view", {
        pageTitle: "محصولات",
        path: "/products/view",
        user: req.user,
        product: product,
    });
};

export const getManage = async (req, res) => {
    const products = await Product.find();

    res.render("product/manage", {
        pageTitle: "مدیریت محصولات",
        path: "/products/manage",
        user: req.user,
        products: products,
        success: req.flash("success")[0] || null,
    });
};

export const getEdit = async (req, res) => {
    const productID = req.params.productID;
    const product = await Product.findById(productID);

    res.render("product/edit", {
        pageTitle: "ویرایش محصول",
        path: "/products/edit",
        user: req.user,
        product: product,
        errors: req.flash("errors")[0] || null,
    });
};

export const postEdit = async (req, res) => {
    let title, desc, price, status;
    const productID = req.params.productID;
    const product = await Product.findById(productID);

    try {

        ({ title, desc, price, status } = req.body);

        const imageFile = req.file || null;
        const errors = {};

        if (!title?.trim()) {
            errors.title = "عنوان الزامی است";
        }

        if (!desc?.trim()) {
            errors.desc = "توضیحات الزامی است";
        }

        if (!price || Number(price) < 0) {
            errors.price = "قیمت معتبر نمی‌باشد";
        }

        if (imageFile?.size > 5242880) {
            errors.image = "حجم عکس نباید بیشتر از 5 مگابایت باشد";
        }

        if (Object.keys(errors).length > 0) {
            if (imageFile) {
                await unlink(join("public", "products", imageFile.filename));
            }

            return res.redirect(`/products/edit/${productID}`);
        }

        const oldImage = product.image

        product.title = title.trim();
        product.desc = desc.trim();
        product.price = Number(price);
        product.status = Boolean(Number(status));
        product.image = imageFile ? imageFile.filename : product.image;

        await product.save()

        req.flash("success", "محصول با موفقیت ویرایش شد.");

        if (imageFile) {
            await unlink(join("public", "products", oldImage));
        }

        return res.redirect("/products/manage");
    } catch (err) {
        console.error(err);

        if (req.file) {
            try {
                await unlink(join("public", "products", req.file.filename));
            } catch {}
        }

        req.flash("errors", {
            error: "مشکلی پیش آمد. لطفاً دوباره امتحان کنید.",
        });
        return res.redirect(`/products/edit/${productID}`);
    }
};

export const postDelete = async (req, res) => {
    try {
        const productID = req.params.productID;

        const product = await Product.findByIdAndDelete(productID);

        await unlink(join("public", "products", product.image));

        req.flash("success", "محصول با موفقیت حذف شد.");
        return res.redirect("/products/manage");
    } catch (error) {
        console.log(error);
        req.flash("errors", {
            error: "مشکلی پیش آمد. لطفاً دوباره امتحان کنید.",
        });
        return res.redirect("/products/manage");
    }
}