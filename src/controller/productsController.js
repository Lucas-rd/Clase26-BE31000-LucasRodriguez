import { productDAO } from "../DAO/productDAO.js"

const getAllProductsController = async (req, res) => {
    // const { user } = req.session
    //Este req.user viene de la estrategia definida de passport.local y ya no hace falta recurrir al req.session
    const { email } = req.user
    const products = await productDAO.getAll()

    res.render("plantillaProducts.ejs", { email, products })
}

const getOneProductController = async (req, res) => {
    const { id } = req.params
    const { user } = req.session
    const products = await productDAO.getById(id)

    res.render("plantillaProducts.ejs", { user, products })
}

const postNewProduct = async (req, res) => {
    const newProduct = req.body
    const { user } = req.session

    await productDAO.createDocument(newProduct)
    const products = await productDAO.getAll()
    
    res.render("plantillaProducts.ejs", { user, products })
}

export { getAllProductsController, getOneProductController, postNewProduct }