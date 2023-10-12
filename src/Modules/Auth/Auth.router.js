import {Router} from 'express';
import * as AuthController from './controller/Auth.controller.js';
import { asyncHandler } from '../../Services/errorHandling.js';
import validation from '../../Middleware/validation.js';
import * as validators from './Auth.validation.js';
const router =Router();

 router.post('/signup' ,validation(validators.signupSchema),(AuthController.signup))
 router.post('/login',validation(validators.loginSchema),(AuthController.login))
 router.get('/confirmEmail/:token',validation(validators.token),AuthController.confirmEmail)
 router.get('/NewconfirmEmail/:token',validation(validators.token),AuthController.NewconfirmEmail) 
 router.patch('/sendCode',validation(validators.sendCode),AuthController.sendCode); 
 router.patch('/forgetPassword',validation(validators.forgetPassword),AuthController.forgetPassword); 
 export default router;