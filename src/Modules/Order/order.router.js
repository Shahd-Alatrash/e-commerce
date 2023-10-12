import { Router } from "express";
import fileUpload, { fileValidation } from "../../Services/multerCloudinary.js";
import * as orderController from './controller/order.controller.js'
import * as validators from './order.validation.js';
import validation from "../../Middleware/validation.js";
import subCategory from "../subCategory/subCategory.router.js" 
import { auth, roles } from "../../Middleware/auth.middleware.js";
import { endpoint } from "./order.endpoint.js";
const router=Router();

router.post('/',auth(endpoint.create),orderController.createOrder);
router.post('/allItemFromCart',auth(endpoint.create),orderController.createOrderWithAllItemFromCart);
router.patch('/cancel/:orderId',auth(endpoint.cancel),orderController.cancelOrder);
router.patch('/changeStatusFromAdmin/:orderId',auth(endpoint.changeStatusFromAdmin),orderController.updateOrderStatusFromAdmin);




export default router;