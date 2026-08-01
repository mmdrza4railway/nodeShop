import { Session } from "../models/session.model.js";

export const getUser = async (req, res, next) => {
    const sessionToken = req.cookies.session || null;
    if (sessionToken) {
        try {
            const session = await Session.findOne({
                token: sessionToken,
            }).populate("userID");
            req.user = session.userID;
        } catch (error) {
            req.user = null;
        }
    }
    next();
};
