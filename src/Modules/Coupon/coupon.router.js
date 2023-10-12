import { Router } from "express";
import * as couponController from './controller/coupon.controller.js'
import * as validators from './coupon.validation.js';
import validation from "../../Middleware/validation.js";
import { auth } from "../../Middleware/auth.middleware.js";
import { endpoint } from "./coupon.endpoint.js";
const router=Router();

router.post('/',auth(endpoint.create),validation(validators.createCoupon),couponController.createCoupon)
router.get('/',couponController.getCoupons)
router.get('/:couponId',validation(validators.getSpecificCoupon),couponController.getSpecificCoupon)
router.put('/update/:couponId',validation(validators.updateCoupon),couponController.updateCoupon)

export default router;