import slugify from "slugify";
import cloudinary from "../../../Services/cloudinary.js";
import ReviewModel from "../../../../DB/model/Review.model.js";
import orderMedel from "../../../../DB/model/Order.model .js"
import { asyncHandler } from "../../../Services/errorHandling.js";

export const createReview=asyncHandler(async(req,res,next)=>{
    const{productId}=req.params;
    const{comment,rating}=req.body;
    const order=await orderMedel.findOne({
        userId:req.user._id,  /** اليوزر ممكن يكون عنده اكثر من اوردر  */   /**    اليوزر الي مسجل دخوله ، لازم يستاوو  req.user._id      ،  هاي الموجودة في جدول الاوردر   userId */
        status:'delivered', 
        "products.productId":productId
    });
    if(!order){
        return next(new Error(`can't review product before receive it`,{cause:400}));
    }

    /** الشخص بقدر يعمل ريفيو مرة واحدة فقط  */
    const checkReciew=await ReviewModel.findOne({createdBy:req.user._id,productId});/** جبت اليوزر والمنتجات الي معلق عليهم */
    if(checkReciew){ /** هاي معناها اادا كان اليوزر هاد معلق قبل هالمرة مش مسموحله يعلق كمان مرة  */
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

export const updateReview=asyncHandler(async(req,res,next)=>{  /** عمل تعديل ع تعليق لمنتج معين  */
    const{productId,reviewId}=req.params;
    const review=await ReviewModel.findByIdAndUpdate({_id:reviewId,createdBy:req.user._id,productId:productId},req.body,{new:true});/***   بعدل حسب الي باعته في البودي ، ممكن اعدل التقييم او ممكن اعدل التعليق ، حسب انا شو باعتة في البودي */
    return res.status(200).json({message:"success",review});

})