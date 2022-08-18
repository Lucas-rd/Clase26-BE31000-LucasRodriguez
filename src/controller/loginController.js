import passport from "passport"

const loginController = async (req, res) => {

    await res.render("plantillaLogin.ejs")
    
}

const loginPostController = async (req, res) => {
    req.session.user = req.body.email
    await passport.authenticate("login", { failureRedirect: "/faillogin" }),

    res.redirect("/api/products/all")
}

const logOutController = async (req, res) => {
    let user = req.session.user
    req.session.destroy()

    res.render({user} ,"plantillaDeslogeo.ejs")
}

export { loginController, loginPostController, logOutController }