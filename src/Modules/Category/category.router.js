import { Router } from "express";
import fileUpload, { fileValidation } from "../../Services/multerCloudinary.js";
import * as categoryController from './controller/category.controller.js'
import * as validators from './category.validation.js';
import validation from "../../Middleware/validation.js";
import subCategory from "../subCategory/subCategory.router.js"/**www.facebook.com/category/25488/subcategory    ،  subCategory  الى  category  عشان يدخل من ال */
import { auth, roles } from "../../Middleware/auth.middleware.js";
import { endpoint } from "./category.endpoint.js";
const router=Router();


/**    عشان امنع اليوزر يضيف كاتيجوري ، فقط الادمن الي بقدر  middleware  عبارة عن  auth([]) */
//router.post('/',auth([roles.Admin]),fileUpload(fileValidation.image).single('image'),validation(validators.createCategory),categoryController.createCategory)
router.post('/',auth(endpoint.create),fileUpload(fileValidation.image).single('image'),validation(validators.createCategory),categoryController.createCategory)

router.put('/update/:categoryId',auth(endpoint.update),fileUpload(fileValidation.image).single('image'),validation(validators.updateCategory),categoryController.updateCategory)
router.get('/:categoryId',auth(endpoint.get),validation(validators.getSpecificCategory),categoryController.getSpecificCategory)
router.get('/',auth(Object.values(roles)),categoryController.getAllCategories);     /**   بهاي الحالة اي حدا جوا هاي الاريي بضيفه هناك بقدر يشوف كل الكاتيجوري ، auth.middelware.js الي جوا  roles  يعني فردت كل ال  /**www.facebook.com/category/25488/subcategory    ،  subCategory  الى  category  عشان يدخل من ال */  /**  حولت الاوبجكت الى اريي ، وعرضت كلشي جوا الاريي ، سواء كان يوزر او كان ادمن بقدر يشوف كل الكاتيجوري  Object.values(roles) */

router.use('/:categoryId/subCategory',subCategory);  
export default router;