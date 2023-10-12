import { Router } from "express";
import fileUpload, { fileValidation } from "../../Services/multerCloudinary.js";
import * as cartController from './controller/cart.controller.js'
import validation from "../../Middleware/validation.js";
import { auth } from "../../Middleware/auth.middleware.js";
import { endpoint } from "./cart.endpoint.js";


const router=Router();

router.post('/',auth(endpoint.create),cartController.addProductToCart);

export default router;