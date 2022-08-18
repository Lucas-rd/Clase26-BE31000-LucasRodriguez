
const registerController = async(req, res) =>{
    
    res.render('plantillaRegister.ejs')
}

const registerPostController = async(req, res) =>{
    req.session.user = req.body.email
    console.log("**********CONSOLE LOG controler register POST***********")
    

    res.redirect("/api/products/all")
}

export { registerController, registerPostController }