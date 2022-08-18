import passport from 'passport';
import { Router } from "express";
import { productsTest } from "../controller/testController.js";
import { getAllProductsController,getOneProductController, postNewProduct } from "../controller/productsController.js";
import { cartControllerGet, cartControllerPost, cartControllerProductsPost, cartControllerDelete, cartControllerProductDelete } from "../controller/cartController.js";
import { loginController, loginPostController, logOutController  } from "../controller/loginController.js";
import { registerController, registerPostController } from "../controller/registerController.js";
import { logginMiddleware } from "../middleware/logginMiddleware.js";


const router = Router()

//Rutas Test
router.get('/products-test', productsTest)

//Rutas de register
router.get('/register', registerController)
router.post('/register', passport.authenticate("register", { failureRedirect: "/api/Error-sign" }), registerPostController)

//Rutas Login-Loguot
router.get('/login', loginController)
router.post('/login', loginPostController )
router.get('/logout', logginMiddleware, logOutController)

//Rutas de Producto
router.get('/products/all', logginMiddleware, getAllProductsController)
router.get('/products/:id', logginMiddleware, getOneProductController)
router.post('/products', logginMiddleware, postNewProduct )

//Rutas de carritos
router.get('/carts/:id/products', cartControllerGet)
router.post('/carts', cartControllerPost)
router.post('/carts/:id/products', cartControllerProductsPost)
router.delete('/carts/:id', cartControllerDelete)
router.delete('/carts/:id/products/:id_prod', cartControllerProductDelete)

export default router