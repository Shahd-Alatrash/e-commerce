import slugify from "slugify";
import cloudinary from "../../../Services/cloudinary.js";
import BrandModel from "../../../../DB/model/Brand.model.js";
import { asyncHandler } from "../../../Services/errorHandling.js";
import productModel from "../../../../DB/model/Product.model.js";
import cartModel from "../../../../DB/model/Cart.model.js";

export const addProductToCart = asyncHandler(async (req, res, next) => {
  const{productId,qty}=req.body;
  const product=await productModel.findById(productId);
  if(!product){
    return next(new Error(`product is not found`,{cause:400}));
  }
  if(product.stock<qty){ /** ادا طلب اليوزر كمية اكبر من العدد المتوفر في المخزن */
    return next(new Error(`invalid product quantity`,{cause:400}));
  }
  const cart=await cartModel.findOne({userId:req.user._id});/** اليوزر الواحد لازم اله سلة وحدة ، بفحص اول شي هل اليوزر اله سلم ام لا ، ادا ما في اله بقوم بانشاء سلة اله */
  if(!cart){
   const newCart=await cartModel.create({
    userId:req.user._id,
    products:[{productId,qty}],
   });
   return res.status(201).json({message:"success",newCart});
  }
  let matchProducts=false;
 for( let i=0;i<cart.products.length;i++){/** ادا اليوزر عنده سلة وعنده المنتج جوا السلة ، اذن بهاي الحالة بدي اعدل ع الكمية فقط */
 if(cart.products[i].productId.toString()===productId){ /**   هاي نوعها اوبجكت بحولها الى سترنج عشان اقدر اقارنها لما احط تلات اشارات يساوي مع السترنج الي قبالها cart.products[i].productId */
cart.products[i].qty=qty;
matchProducts=true;
break;
 }
 if(matchProducts==false){ /** معناها المنتج جديد بدي اروح اضيفه ع السلة ، مشش اعدل الكمية متل ال اف الي فوق ، فقط اضيفه ع السلة */
  cart.products.push({productId,qty});
 }
 }
 cart.save();
 return res.status(200).json({message:"success"});
});



