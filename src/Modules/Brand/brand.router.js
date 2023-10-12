import { Router } from "express";
import fileUpload, { fileValidation } from "../../Services/multerCloudinary.js";
import * as brandController from './controller/brand.controller.js'
import * as validators from './brand.validation.js';
import validation from "../../Middleware/validation.js";
import { auth } from "../../Middleware/auth.middleware.js";
import { endpoint } from "./brand.endpoint.js";

const router=Router();


router.get('/:categoryId',validation(validators.getAllBrands),brandController.getAllBrands)
router.post('/',auth(endpoint.create),fileUpload(fileValidation.image).single('image'),validation(validators.createBrand),brandController.createBrand)
router.put('/update/:categoryId',fileUpload(fileValidation.image).single('image'),validation(validators.updateBrand),brandController.updateBrand)


export default router;