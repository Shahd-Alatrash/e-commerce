import { Router } from "express";
import fileUpload, { fileValidation } from "../../Services/multerCloudinary.js";
import * as subCategoryController from './controller/subCategory.controller.js'
import * as validators from './subCategory.validation.js';
import validation from "../../Middleware/validation.js";
        const router=Router({mergeParams:true});  /** عشان يقدر الابن يتشارك البارمس تبعون الاب */

router.post('/',fileUpload(fileValidation.image).single('image'),validation(validators.createSubCategory),subCategoryController.createSubCategory)
    
router.put('/update/:subcategoryId',fileUpload(fileValidation.image).single('image'),validation(validators.updateSubCategory),subCategoryController.updateSubCategory)  /**  www.facebook.com/category/25488/subcategory/update/24458
*/
 router.get('/',subCategoryController.getSpecificSubCategory)
 router.get('/all',subCategoryController.getAllSubCategories)
 router.get('/:subCategoryId/products',subCategoryController.getProducts);   /**  mergeParams:true  رح استفيد من فكرة  */ /** مشان لما ادخل ع السبكاتيجوري اعرض المنتجات الي موجودة فيه */
 export default router;