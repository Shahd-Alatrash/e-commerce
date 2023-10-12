import slugify from "slugify";
import cloudinary from "../../../Services/cloudinary.js";
import ReviewModel from "../../../../DB/model/Review.model.js";
import orderMedel from "../../../../DB/model/Order.model .js"
import { asyncHandler } from "../../../Services/errorHandling.js";

export const createReview=asyncHandler(async(req,res,next)=>{
    const{productId}=req.params;
    const{comment,rating}=req.body;
    const order=await orderMedel.findOne({
        userId:req.user._id,  
        status:'delivered', 
        "products.productId":productId
    });
    if(!order){
        return next(new Error(`can't review product before receive it`,{cause:400}));
    }

 
    const checkReciew=await ReviewModel.findOne({createdBy:req.user._id,productId});
    if(checkReciew){ 
       return next(new Error (` already review by you`,{cause:400}))
    }

    const review=await ReviewModel.create({
        createdBy:req.user._id,
        orderId:order._id,
        productId,
        comment,
        rating,
    })
   
   
    return res.status(201).json({message:"success",review});


})

export const updateReview=asyncHandler(async(req,res,next)=>{ 
    const{productId,reviewId}=req.params;
    const review=await ReviewModel.findByIdAndUpdate({_id:reviewId,createdBy:req.user._id,productId:productId},req.body,{new:true});
    return res.status(200).json({message:"success",review});

})