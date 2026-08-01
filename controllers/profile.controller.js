export const getIndex = (req, res) => {
    res.render("profile/profile", {
        pageTitle: "پروفایل",
        path: "/profile",
        user: req.user,
        success: req.flash("success")[0] || null,
        warn: req.flash("warn")[0] || null,
    });
}