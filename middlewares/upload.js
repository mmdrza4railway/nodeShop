import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, "public/products");
    },

    filename(req, file, cb) {
        const ext = path.extname(file.originalname);

        cb(null, Date.now() + ext);
    },
});

const fileFilter = (req, file, cb) => {
    if (
        file.mimetype === "image/png" ||
        file.mimetype === "image/jpeg" ||
        file.mimetype === "image/webp" ||
        file.mimetype === "image/jpg"
    ) {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

export default multer({
    storage,
    fileFilter,
});