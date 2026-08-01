export const isGhost = async (req, res, next) => {
    if (!req.user) {
        next()
    } else {
        res.redirect("/")
    }
}

export const isLogin = async (req, res, next) => {
    if (req.user) {
        next()
    } else {
        res.redirect("/auth/login")
    }
}

export const isAdmin = async (req, res, next) => {
    if (req.user && ["superadmin", "admin"].includes(req.user.role)) {
        next()
    } else {
        res.redirect("/")
    }
}