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


//router.post('/',fileUpload(fileValidation.image).single('mainImage'),productController.createProduct) 
router.post('/',auth(endpoint.create),fileUpload(fileValidation.image).fields([   
    {name:'mainImage',maxCount:1},
    {name:'subImages',maxCount:5}, 
]),productController.createProduct) ;


router.put('/update/:productId',auth(endpoint.update),fileUpload(fileValidation.image).fields([    
    {name:'mainImage',maxCount:1},
    {name:'subImages',maxCount:5}, 
]),productController.updateProduct) ;

router.patch('/softDelete/:productId',auth(endpoint.softDelete),productController.softDelete);

router.delete('/forceDelete/:productId',auth(endpoint.forceDelete),productController.forceDelete);

router.patch('/restore/:productId',auth(endpoint.restore),productController.restore);

router.get('/softdelete/',auth(endpoint.get),productController.getSoftDeleteProducts);


router.get('/:productId',productController.getProduct);
router.get('/',productController.getAllProducts);

export default router;