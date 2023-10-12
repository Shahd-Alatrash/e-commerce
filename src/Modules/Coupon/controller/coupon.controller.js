import couponModel from "../../../../DB/model/Coupon.model.js"
import { asyncHandler } from "../../../Services/errorHandling.js";

export const createCoupon=asyncHandler(async(req,res,next)=>{
    const{name}=req.body;
   // return res.json(req.body.expierDate); /**     "2023-04-15T07:10"   بطبعلي التاريخ والوقت*/
   //let date=Date.parse(req.body.expierDate);  /** عشان احوله الى صيغة تاريخ فقط بدون وقت */ 
  // return res.json(date); /** 1681535400000 */
 // const convertDate=new Date(date);
  //return res.json(convertDate); /**   "2023-04-15T05:10:00.000Z" */
 // return res.json(convertDate.toLocaleDateString());  /** "4/15/2023" */

 let date=new Date(req.body.expierDate);
 let now=new Date();/** برتجعلي التاريخ الحالي  */
 if(now.getTime()>=date.getTime()){  /** ادا الوقت قديم بعطيه ايرور، لازم يكون تاريخ بالمستقبل */  /** بقارن التاريخ الحالي مع التاريخ الي بدخله اليوزر ، ادا كان التاريخ الحالي اكبر من التاريخ الي بدخله اليوزر بعطي ايرور */
    return next(new Error(' invalid date',{cause:400}))
 }
date=date.toLocaleDateString();
req.body.expierDate=date;
 const convertDate=new Date(date);
req.body.expierDate=convertDate.toLocaleDateString();   
 if(await couponModel.findOne({name})){   /**  لما يضيف كوبون ما بدي الاسم الي رح يضيفه يكون مكرر  */
return next(new Error('duplicate coupon name',{cause:409}))
    }
    //return res.json(req.body)
    req.body.careatedBy=req.user._id;
    req.body.updatedBy=req.user._id;
    const coupon=await couponModel.create(req.body);
    return res.status(201).json({message:"success",coupon});
    })

    export const updateCoupon=asyncHandler(async(req,res,next)=>{
        const coupon=await couponModel.findById(req.params.couponId);
        if(!coupon){
            return next(new Error(`invalid coupon id ${req.params.couponId}`,{cause:400}))
        }
        if(req.body.name){  /** ادا بده يعدل ع الاسم  */
            if(coupon.name==req.body.name){ /** ادا كان الاسم الي باعته الضخص نفس الاسم الي موجود سابقا في الداتا بيس  */
                return next(new Error(`old name match new name`,{cause:400}))  

            }
            if(await couponModel.findOne({name:req.body.name})){/** t shirt واجى شخص بده يحولها الى  computer  وكاتيجوري اسمها  t shirt    عشان اتأكد الاسم الي باعته اليوزر هل هوي متل الي في الداتا بيس ام لا ، مثال لو عندي كاتيجوري اسمها  */
                return next(new Error(`duplicate coupon name`,{cause:409}))

            }
            coupon.name=req.body.name;
        }
if(req.body.amount){
    coupon.amount=req.body.amount;
}
req.body.updatedBy=req.user._id;
        await coupon.save();  /** مشان يخزن التعديل في الداتا بيس */
        return res.status(200).json({message:"success",coupon})
    })




    export const getCoupons=asyncHandler(async(req,res,next)=>{ 
        const coupon=await couponModel.find() 
        return res.status(200).json({message:"success",coupon});
    })
    

    export const getSpecificCoupon=asyncHandler(async(req,res,next)=>{ 
    const {couponId}=req.params;
    const coupon=await couponModel.findById(couponId)

   // return res.json(categoryId);
   if(!coupon){
    return next(new Error(`this coupon not found`,{cause:404}))
   }
   return res.status(200).json({message:"success",coupon})
    })
