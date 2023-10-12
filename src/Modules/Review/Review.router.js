import { Router } from "express";
import fileUpload, { fileValidation } from "../../Services/multerCloudinary.js";
import * as reviewController from './controller/Review.controller.js'
import * as validators from './Review.validation.js';
import validation from "../../Middleware/validation.js";
import { auth } from "../../Middleware/auth.middleware.js";
import { endpoint } from "./Review.endpoint.js";

const router=Router({mergeParams:true});

router.post('/',auth(endpoint.create),reviewController.createReview);
router.put('/updateReview/:reviewId',auth(endpoint.update),reviewController.updateReview);
export default router;