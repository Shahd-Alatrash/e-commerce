import slugify from "slugify";
import cloudinary from "../../../Services/cloudinary.js";
import CategoryModel from "../../../../DB/model/Category.model.js"
import { asyncHandler } from "../../../Services/errorHandling.js";
import couponModel from "../../../../DB/model/Coupon.model.js";
import moment from 'moment'; /**  مكتبة لتسهيل التعامل مع التواريخ */
import productModel from "../../../../DB/model/Product.model.js";
import orderModel from "../../../../DB/model/Order.model .js";
import cartModel from "../../../../DB/model/Cart.model.js";

export const createOrder=asyncHandler(async(req,res,next)=>{  /** تلات اشياء لازم افحصهن ، الاولى هل الكوبون موجود ام لا من خلال اسمه بفحص ، التانية بفحص تاريخ انتهاء الكوبون ، التالتة بفحص هل اليوزر مستخدم هذا الكوبون ام لا لأنه مسموح فقط مرة واحدة يستخدم الكوبون */
const{products,address,phoneNumber,couponName,paymentType}=req.body;
if(couponName){/**   null بفحص ادا الكوبون موجود ام لا ، ادا موجود برجعلي معلوماته وادا مش موجود برجعلي  */
    const coupon=await couponModel.findOne({name:couponName.toLowerCase()});
if(!coupon){ /** ادا الكوبون كان موجود بدي اتأكد من تاريخ انتهائه  */
    return next(new Error(`invalid coupon ${couponName}`,{cause:400}));
}
let now=moment(); /** بترجعلي التاريخ الحالي  */
let parsed=moment(coupon.expierDate,'DD/MM/YYYY'); /** بترجعلي تاريخ انتهاء الكوبون */
let diff=now.diff(parsed,'days');/** بقارن بين التاريخ الحالي وتاريخ انتهاء صلاحية الكوبون  */ /** ادا رجعلي القيمة سالب معناته لسا ما انتهى تاريخ الكوبون  */
if(diff>=0){
    return next(new Error(`coupon is expired`,{cause:400}))
}

if(coupon.usedBy.includes(req.user._id)){ /**   ، هاي عبارة عن اريي موجودة في الكوبون موديل ، بفحص هل اليوزر اي دي موجود ام لا ادا موجود برجعلي انه الكوبون مستخدم سابقاusedBy  */
return next(new Error(`coupon already used by ${req.user._id}`,{cause:400}))
}
req.body.coupon=coupon;  /** وادا مش موجود اليوزر اي دي في الاريي اذن انا مش مستخدمة الكوبون */
}

/**  بفحص المنتج هل موجود ام لا ، وبفحص الكمية تبعته ، وبفحص هل هو محذوف امم لا  بعمل فور لوب بمشي ع كل المنتجات*/
const finalProductList=[];
const productIds=[];
let subtotal=0;
for(const product of products){
    const checkProduct=await productModel.findOne({
        _id:product.productId, /** معناها ال اي دي الي في الداتا بيس تكون نفسها هيي هيي الي في البرودكت اي _id */
        stock:{ $gte:product.qty} ,/** qty الستوك لازم تكون اكبر من  */
        deleted:false,
    })
    if(!checkProduct){
        return next(new Error(`invalid product`))

    }
    product.unitPrice=checkProduct.finalPrice; /**  هي معلومات المنتج في الداتا بيس  checkProduct  */
    product.finalPrice=product.qty * checkProduct.finalPrice;
    subtotal+=product.finalPrice;
    productIds.push(product.productId);  /**   تحتوي على المنتجات الي في الاوردر تبعي  productIds */
    finalProductList.push(product);
  //  return res.json(product);
}
//return res.json("ok"); /** ادا الكوبون تمام والمنتج تمام حسب جمل الشرط الي حطيتهم فوق ، وقتها بنفذ هاي */
const order=await orderModel.create({
    userId:req.user._id,
    address,
    phoneNumber,
    products:finalProductList,
    subtotal,
    couponId:req.body.coupon?._id,
    paymentType,
    finalPrice:subtotal-(subtotal*((req.body.coupon?.amount|0)/100)),
    status:(paymentType=='card')?'approved':'pending',/** بفحص الحالة ، ادا كانت كارد بعمله ابروفد ادا لا بعمله بيندنج */
})
for(const product of products){ /**  الي طلبهااليوزر ل برودكت معين  qty بحسب عدد ال  stock عشان اقلل ال */
await productModel.updateOne({_id:product.productId},{$inc:{stock:-product.qty}})
}
if(req.body.coupon){   /** ما بزبط انه يعمل اوردر كمان مرة بنفس الكوبون لانه خلص انضاف ع الاريي انه هاد استخدم الكوبون قبل هالمرة */ /*** usedBy عشان اضيف على الاريي الي اسمها  */
    await couponModel.updateOne({_id:req.body.coupon._id},{$addToSet:{usedBy:req.user._id}}) /*  بوش بتسمح للعنصر الواحد اضيف اكتر من مرة ، هاي لا ،push  تستخدم للاريي ، متل  addToSet */
}
await cartModel.updateOne({userId:req.user._id},{ /** مشان اشيل المنتج الي اشتريته من */  /**   /**  هاي طريقة عشان اشيل من الاريي ، عشان اعرف هاي السلة لمين اول شي بوخد اليوزر اي دي الي اصلا مخزن جول الموديل الي اسمه سلة pull  عشان اشيل المنتج الي طلبته من الكارت ،  */
$pull:{
    products:{ /**   هاي عبارة عن اريي جوا الموديل الي اسمه سلة وهوي عبارة عن اريي يحتوي ع المنتجات الي طلها اليوزر في الاوردر والكمية وسعر القطعة والسعر النهائي     products */
        productId:{$in:productIds}     /** ادا هاد المنتج موجود في الاريي الجديدة شيله */  /**    productIds يلي في الاوردر الي سميتها  productId     تساوي ال  productIdشرط ال  */   /*  *   تحتوي على ال كل ال اي دي تبع المنتجات الي في السلة  productIds كأنه استنساخ هون كأه عملت كمان اريي اسمها  */ /**  لي موجود جوا الاريي  productId */
    }
}
})

   return res.status(201).json({message:'success',order});
    })


export const createOrderWithAllItemFromCart = asyncHandler(async (req, res, next) => {
    const {  address, phoneNumber, couponName, paymentType } = req.body;
    const cart = await cartModel.findOne({ userId: req.user._id });
    if (!cart || cart.products.length == 0) { /** ادا اليوزر ما عنده سلة او السلة فارغة */
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
    for (let product of req.body.products) {   /**       هاي الداتا جاي من المونجو دي بي وليس من البودي req.body.products */
        const checkProduct = await productModel.findOne({
            _id: product.productId,
            stock: { $gte: product.qty },
            deleted: false,
        })
        if (!checkProduct) {
            return next(new Error(`invalid product`))

        }
        product=product.toObject(); /** Json  وليس  Bson ضروري اعمل هاي الخطوة والا ما بطبع الي تحتها ، لانه الداتا الي بتيجي من المونجو دي بي بتكون على شكل  */
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
    for (const product of req.body.products) {  /**   product   المنتجات الموجودة في السلة بلف عليهن كلهن  وادا موجود بضيفهن على ال  req.body.products */
        await productModel.updateOne({ _id: product.productId }, { $inc: { stock: -product.qty } })
    }
    if (req.body.coupon) {   
        await couponModel.updateOne({ _id: req.body.coupon._id }, { $addToSet: { usedBy: req.user._id } })
    }
    await cartModel.updateOne({ userId: req.user._id }, { 
      products:[], /** بنصفر الاريي */
    })

    return res.status(201).json({ message: 'success', order });

});


export const cancelOrder=asyncHandler(async(req,res,next)=>{ /** لالغاء الاوردر بحتاج للاي دي تبع الاوردر */
    const {orderId}=req.params;
    const{resonReject}=req.body;
    const order=await orderModel.findOne({_id:orderId,userId:req.user._id}); /**  لازم ابحث عن ال اي دي تبع الاوردر وكمان اليوزر اي دي لانه بلزم يكون اليوزر مسجل دخوله  */
    if(!order || order.status!='pending' || order.paymentType !='cash'){ 
        return next(new Error("cant cancel this order",{cause:400}));
        }
        /** بقدر الشخص يلغي ادا كان لسا مش موافق ع المنتج وكان لسا مش واصله ف بقدر يلغي */

        await orderModel.updateOne({_id:order._id},{status:'canceled',resonReject,updatedBy:req.user._id});

        for(const product of order.products){/**  بنفس عدد الي الغيته stock  لما اعمل كانسيل للمنتج معناته انا ما ستخدمت الكوبون ، ومعناته لازم ارجع اضيف الكمية الي الغيتها ع ال  */
            await productModel.updateOne({_id:product.productId},{
                $inc:{stock:product.qty} /** ازيد الكمية الي كان مشتريها اليوزر وعملها كانسيل */
            })
        }
        if(order.couponId){
            await couponModel.updateOne({_id:product.productId},{
                $pull:{userBy:req.user._id}
            })
        }
        return res.status(200).json({message:"success"});
})

export const updateOrderStatusFromAdmin=asyncHandler(async(req,res,next)=>{ /** الادمن بقدر يغير الحالة ما عدا ادا كانت واصلة ما بقدر يغيرها /**     هاد الفنكشن بقدر الادمن يشوف كل الاوردرز ويعدل ع الحالة تبعونهم ، بقدر يشوف كل الاوردر الي معمولهم كانسيل وبقدر يشوف كل الاوردر الي معمولهم موافقة وبقدر يشوف كل الي ع الطريق بيبنما اليوزر بقدر يعمل كانسيل فقط  */
const{orderId}=req.params;
const{status}=req.body; /**  الحالة الجديدة الي بده يختارها الادمن */

const order=await orderModel.findOne({_id:orderId});
if(!order || order.status=='delivered'){
    return next(new Error(`this order not found or this order status is :${order.status}`));   /** delivered   بترجعلي  ${order.status */
}
const changedOrderStatus=await orderModel.updateOne({_id:orderId},{status,updatedBy:req.user._id});
if(!changedOrderStatus.matchedCount){
    return next(new Error(`fail to change status this order`,{cause:400}));
}
return res.status(200).json({message:"success"});
})
