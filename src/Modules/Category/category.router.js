import { Router } from "express";
import fileUpload, { fileValidation } from "../../Services/multerCloudinary.js";
import * as categoryController from './controller/category.controller.js'
import * as validators from './category.validation.js';
import validation from "../../Middleware/validation.js";
import subCategory from "../subCategory/subCategory.router.js"
import { auth, roles } from "../../Middleware/auth.middleware.js";
import { endpoint } from "./category.endpoint.js";
const router=Router();


//router.post('/',auth([roles.Admin]),fileUpload(fileValidation.image).single('image'),validation(validators.createCategory),categoryController.createCategory)
router.post('/',auth(endpoint.create),fileUpload(fileValidation.image).single('image'),validation(validators.createCategory),categoryController.createCategory)

router.put('/update/:categoryId',auth(endpoint.update),fileUpload(fileValidation.image).single('image'),validation(validators.updateCategory),categoryController.updateCategory)
router.get('/:categoryId',auth(endpoint.get),validation(validators.getSpecificCategory),categoryController.getSpecificCategory)
router.get('/',auth(Object.values(roles)),categoryController.getAllCategories);     

router.use('/:categoryId/subCategory',subCategory);  
export default router;