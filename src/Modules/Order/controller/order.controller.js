import slugify from "slugify";
import cloudinary from "../../../Services/cloudinary.js";
import CategoryModel from "../../../../DB/model/Category.model.js"
import { asyncHandler } from "../../../Services/errorHandling.js";
import couponModel from "../../../../DB/model/Coupon.model.js";
import moment from 'moment';
import productModel from "../../../../DB/model/Product.model.js";
import orderModel from "../../../../DB/model/Order.model .js";
import cartModel from "../../../../DB/model/Cart.model.js";

export const createOrder=asyncHandler(async(req,res,next)=>{  
const{products,address,phoneNumber,couponName,paymentType}=req.body;
if(couponName){
    const coupon=await couponModel.findOne({name:couponName.toLowerCase()});
if(!coupon){ 
    return next(new Error(`invalid coupon ${couponName}`,{cause:400}));
}
let now=moment(); 
let parsed=moment(coupon.expierDate,'DD/MM/YYYY'); 
let diff=now.diff(parsed,'days');
if(diff>=0){
    return next(new Error(`coupon is expired`,{cause:400}))
}

if(coupon.usedBy.includes(req.user._id)){
return next(new Error(`coupon already used by ${req.user._id}`,{cause:400}))
}
req.body.coupon=coupon;  
}

const finalProductList=[];
const productIds=[];
let subtotal=0;
for(const product of products){
    const checkProduct=await productModel.findOne({
        _id:product.productId, 
        stock:{ $gte:product.qty} ,
        deleted:false,
    })
    if(!checkProduct){
        return next(new Error(`invalid product`))

    }
    product.unitPrice=checkProduct.finalPrice;
    product.finalPrice=product.qty * checkProduct.finalPrice;
    subtotal+=product.finalPrice;
    productIds.push(product.productId); 
    finalProductList.push(product);
  //  return res.json(product);
}
//return res.json("ok"); 
const order=await orderModel.create({
    userId:req.user._id,
    address,
    phoneNumber,
    products:finalProductList,
    subtotal,
    couponId:req.body.coupon?._id,
    paymentType,
    finalPrice:subtotal-(subtotal*((req.body.coupon?.amount|0)/100)),
    status:(paymentType=='card')?'approved':'pending',
})
for(const product of products){ 
await productModel.updateOne({_id:product.productId},{$inc:{stock:-product.qty}})
}
if(req.body.coupon){  
    await couponModel.updateOne({_id:req.body.coupon._id},{$addToSet:{usedBy:req.user._id}}) 
}
await cartModel.updateOne({userId:req.user._id},{   
$pull:{
    products:{
        productId:{$in:productIds}     
    }
}
})

   return res.status(201).json({message:'success',order});
    })


export const createOrderWithAllItemFromCart = asyncHandler(async (req, res, next) => {
    const {  address, phoneNumber, couponName, paymentType } = req.body;
    const cart = await cartModel.findOne({ userId: req.user._id });
    if (!cart || cart.products.length == 0) {
        return next(new Error("empty cart", { cause: 400 }));
    }
    req.body.products=cart.products;
    if (couponName) {
        const coupon = await couponModel.findOne({ name: couponName.toLowerCase() });
        if (!coupon) { 
            return next(new Error(`invalid coupon ${couponName}`, { cause: 400 }));
        }
    }
    const finalProductList = [];
    const productIds = [];
    let subtotal = 0;
    for (let product of req.body.products) {   
        const checkProduct = await productModel.findOne({
            _id: product.productId,
            stock: { $gte: product.qty },
            deleted: false,
        })
        if (!checkProduct) {
            return next(new Error(`invalid product`))

        }
        product=product.toObject(); 
        product.unitPrice = checkProduct.finalPrice;
        product.finalPrice = product.qty * checkProduct.finalPrice;
        subtotal += product.finalPrice;
        productIds.push(product.productId);
        finalProductList.push(product);
    }
   // return res.json(finalProductList);
    const order=await orderModel.create({
        userId:req.user._id,
        address,
        phoneNumber,
        products:finalProductList,
        subtotal,
        couponId:req.body.coupon?._id,
        paymentType,
        finalPrice:subtotal-(subtotal*((req.body.coupon?.amount|0)/100)),
        status:(paymentType=='card')?'approved':'pending',
    })
    for (const product of req.body.products) { 
        await productModel.updateOne({ _id: product.productId }, { $inc: { stock: -product.qty } })
    }
    if (req.body.coupon) {   
        await couponModel.updateOne({ _id: req.body.coupon._id }, { $addToSet: { usedBy: req.user._id } })
    }
    await cartModel.updateOne({ userId: req.user._id }, { 
      products:[], 
    })

    return res.status(201).json({ message: 'success', order });

});


export const cancelOrder=asyncHandler(async(req,res,next)=>{ 
    const {orderId}=req.params;
    const{resonReject}=req.body;
    const order=await orderModel.findOne({_id:orderId,userId:req.user._id});
    if(!order || order.status!='pending' || order.paymentType !='cash'){ 
        return next(new Error("cant cancel this order",{cause:400}));
        }
 

        await orderModel.updateOne({_id:order._id},{status:'canceled',resonReject,updatedBy:req.user._id});

        for(const product of order.products){
            await productModel.updateOne({_id:product.productId},{
                $inc:{stock:product.qty} 
            })
        }
        if(order.couponId){
            await couponModel.updateOne({_id:product.productId},{
                $pull:{userBy:req.user._id}
            })
        }
        return res.status(200).json({message:"success"});
})

export const updateOrderStatusFromAdmin=asyncHandler(async(req,res,next)=>{
const{orderId}=req.params;
const{status}=req.body; 

const order=await orderModel.findOne({_id:orderId});
if(!order || order.status=='delivered'){
    return next(new Error(`this order not found or this order status is :${order.status}`));   
}
const changedOrderStatus=await orderModel.updateOne({_id:orderId},{status,updatedBy:req.user._id});
if(!changedOrderStatus.matchedCount){
    return next(new Error(`fail to change status this order`,{cause:400}));
}
return res.status(200).json({message:"success"});
})
