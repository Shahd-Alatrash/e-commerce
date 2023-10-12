import { Router } from "express";
import fileUpload, { fileValidation } from "../../Services/multerCloudinary.js";
import * as productController from './controller/product.controller.js'
import reviewRouter from '../Review/Review.router.js';
import * as validators from './product.validation.js';
import validation from "../../Middleware/validation.js";
import { auth, roles } from "../../Middleware/auth.middleware.js";
import { endpoint } from "./product.endpoint.js";

const router=Router({mergeParams:true});
router.use('/:productId/review', reviewRouter);


//router.post('/',fileUpload(fileValidation.image).single('mainImage'),productController.createProduct) /** هون بس للمين ايمج  */
router.post('/',auth(endpoint.create),fileUpload(fileValidation.image).fields([    /** هون ادا بدي ابعت اكتر من صورة ، الاولى المين ايميج والباقيات السب ايميج  */
    {name:'mainImage',maxCount:1},
    {name:'subImages',maxCount:5}, /** لحد خمس صور بقدر اضيف  */
]),productController.createProduct) ;


router.put('/update/:productId',auth(endpoint.update),fileUpload(fileValidation.image).fields([    /** هون ادا بدي ابعت اكتر من صورة ، الاولى المين ايميج والباقيات السب ايميج  */
    {name:'mainImage',maxCount:1},
    {name:'subImages',maxCount:5}, 
]),productController.updateProduct) ;

router.patch('/softDelete/:productId',auth(endpoint.softDelete),productController.softDelete);/** استرجاع بعد الحذف  */

router.delete('/forceDelete/:productId',auth(endpoint.forceDelete),productController.forceDelete);/**حدف بشكل نهائي  */

router.patch('/restore/:productId',auth(endpoint.restore),productController.restore);

router.get('/softdelete/',auth(endpoint.get),productController.getSoftDeleteProducts);/** هاد الفنكشن بعرضلي كل المنتجات الي معملولها سوفت ديليت */


router.get('/:productId',productController.getProduct);
router.get('/',productController.getAllProducts);

export default router;