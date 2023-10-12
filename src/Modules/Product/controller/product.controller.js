import slugify from "slugify";
import cloudinary from "../../../Services/cloudinary.js";
import BrandModel from "../../../../DB/model/Brand.model.js";
import { asyncHandler } from "../../../Services/errorHandling.js";
import subCategoryModel from "../../../../DB/model/subCategory.model.js";
import brandModel from "../../../../DB/model/Brand.model.js";
import productModel from "../../../../DB/model/Product.model.js";

export const createProduct = asyncHandler(async (req, res, next) => {
  const { name,price,discount,categoryId,subCategoryId,brandId } = req.body;
  //res.json(req.files);   /** ادا بدي اتأكد انه الصور بوصلني بشكل صحيح  */
  /**  موجودين ام لا  categoryId,subCategoryId,brandId اول ما انشأ البرودكت لازم اتاكد هل  */
 const checkCategory=await subCategoryModel.findOne({_id:subCategoryId,categoryId});
 if(!checkCategory){
  return next(new Error(`invalid subCategoryId or categoryId `),{cause:400})
 }
 const checkBrand=await brandModel.findOne({_id:brandId});
 if(!checkBrand){
  return next(new Error(`invalid Brand `,{cause:400}))
 }
 req.body.slug=slugify(name);
 req.body.finalPrice=price-(price*((discount||0)/100));
 const{secure_url,public_id}=await cloudinary.uploader.upload(req.files.mainImage[0].path,{folder:`${process.env.APP_NAME}/'PRODUCT'}`}) /** mainImage مشان اقدر اوصل لل  */
 req.body.mainImage={secure_url,public_id};
if(req.body.subImages){ /** ادا ما في صور فرعية خلص بضيف البرودكت مباشرة ، ولكن ادا عندي صور فرعية بدي اعمل فور لوب وامشي عليهم وحدة وحدة */
req.body.subImages=[];
for(const file of req.body.subImages){
  const{secure_url,public_id}=await cloudinary.uploader.upload(file.path,{folder:`${process.env.APP_NAME}/'PRODUCT/SUBIMAGES'}`})
  req.body.subImages.push({secure_url,public_id});
}
}
req.body.careatedBy=req.user._id;
req.body.updatedBy=req.user._id;
const product=await productModel.create(req.body);
if(!product){
  return next(new Error(`fail to create product`,{cause:400}));
}


 return res.json({message:"success",product});
});






export const updateProduct = asyncHandler(async (req, res, next) => {
const{productId}=req.params; /** ما بعرف شو المعلومات الي بده يعدلهن ، ف بالاول بوخد ال اي دي تبعت البرودكت وبفحص هل هيي موجودة في الداتا بيس ام لا  */
const newProduct=await productModel.findById(productId);
if(!newProduct){
  return next(new Error(`product not found `,{cause:400}))
}
  const { name,price,discount,categoryId,subCategoryId,brandId } = req.body;
  
  if(categoryId && subCategoryId){ /**  كلهن الي جواتها  subCategory كلها وبهاي الحالة لازم اعدل ال category نفسها ، او بعدل على  category واضل جوا ال  subCategoryفي مرحلة التعديل بزبط اعدل ال  */
   const checkSubCategory=await subCategoryModel.findOne({_id:subCategoryId,categoryId});
   if(checkSubCategory){
    newProduct.subCategoryId=subCategoryId; /**  ، الي استلمها من فوق، يعني لسا ما غيرنا في الداتا بيس  subCategoryId غيره الى  ،  subCategoryId في جواته  newProduct معناها هاد ال   newProduct.subCategoryId */
    newProduct.categoryId=categoryId;
   }else{
    return next(new Error(`categoryId or subCategoryId not found `,{cause:400}))
   }
  }else if(subCategoryId){
    const checkSubCategory=await subCategoryModel.findOne({_id:subCategoryId});
    if(checkSubCategory){
      newProduct.subCategoryId=subCategoryId;
    }else{
      return next(new Error(`subCategoryId not found `,{cause:400}))
     }
  }
  //return res.json(newProduct);
  if(brandId){
    const checkBrand=await brandModel.findOne({_id:brandId});
    if(!checkBrand){
     return next(new Error(`invalid Brand `,{cause:400}))
    }else{
      newProduct.brandId=brandId;
    }
  }
  //return res.json(newProduct);

  if(name){
    newProduct.name=name;
    newProduct.slug=slugify(name);
  }
 // return res.json(newProduct);
 if(req.body.discription){
  newProduct.discription=req.body.discription;
 }
 if(req.body.stock){
  newProduct.stock=req.body.stock;
 }
 if(req.body.colors){
  newProduct.colors=req.body.colors;
 }
 if(req.body.size){
  newProduct.size=req.body.size;
 }
 //return res.json(newProduct);
 if(price && discount){ /** ممكن يغير السعر والخصم ، ممكن يغير فقط السعر ويخلي الخصم متل ما هوي  */
  newProduct.price=price;
  newProduct.discount=discount;
  newProduct.finalPrice=price-(price*((discount||0)/100));
 }else if(price){
  newProduct.price=price;
  newProduct.finalPrice=price-(price*((newProduct.discount)/100));/** لأنه مش باعتلي الخصم ، ف رح اوخد الخصم الي في الداتا بيس */
 }else if(discount){
  newProduct.discount=discount;
  newProduct.finalPrice=newProduct.price-(newProduct.price*((discount)/100));/**    لانه مش باعتلي السعر ، بوخد السعر الي في الداتا بيس newProduct.price */
 }
 if(req.files.mainImage.length){
  const{secure_url,public_id}=await cloudinary.uploader.upload(req.files.mainImage[0].path,{folder:`${process.env.APP_NAME}/'PRODUCT'}`}) 
  await cloudinary.uploader.destroy(newProduct.mainImage.public_id);
  newProduct.mainImage.secure_url=secure_url;
  newProduct.mainImage.public_id=public_id;
 }
 if(req.files.subImages.length){
  const subImages=[];
for(const file of req.files.subImages){
  const{secure_url,public_id}=await cloudinary.uploader.upload(file.path,{folder:`${process.env.APP_NAME}/'PRODUCT/SUBIMAGES'}`})
  subImages.push({secure_url,public_id});
}
newProduct.subImages=subImages;
 }
 newProduct.updatedBy=req.user._id;
const product=await newProduct.save(); /** عشان احدث المعلومات في الداتا بيس ، لانه كل الي فوق ما كنت اشتغل على الداتا بيس */
if(!product){
  return next(new Error(`fail to update product`,{cause:400}));
}


 return res.json({message:"success",product});
});




export const updateBrand = asyncHandler(async (req, res, next) => {
  const brand = await BrandModel.findById(req.params.brandId);
  if (!brand) {
    return next(
      new Error(`invalid brand id ${req.params.brandId}`, { cause: 400 })
    );
  }
  if (req.body.name) {
    if (brand.name == req.body.name) {
      return next(new Error(`old name match new name`, { cause: 400 }));
    }
    if (await BrandModel.findOne({ name: req.body.name })) {
      return next(new Error(`duplicate brand name`, { cause: 409 }));
    }
    brand.name = req.body.name;
    brand.slug = slugify(req.body.name);
  }

  if (req.file) {
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      req.file.path,
      { folder: `$process.env.APP_NAME}/brand` }
    );
    await cloudinary.uploader.destroy(brand.image.public_id);
    brand.image = {
      secure_url,
      public_id,
    };
  }
  req.body.updatedBy=req.user._id;

  await brand.save();
  return res.json({ message: "success", brand });
});

export const getAllBrands = asyncHandler(async (req, res, next) => {
  const { categoryId } = req.params;
  const brands = await BrandModel.find({ categoryId });
  return res.status(200).json({ message: "success", brands });
});

export const softDelete=asyncHandler(async(req,res,next)=>{/** السوفت ديليت الديفولت فولس ، لما اعمل سيند بتتحول الى ترو ف البوستمان  */    /**  انه اقدر اعمل استرجاع بعج ما احدف المنتج softDelete فكرة ال  */  /**  update  هيي عمل   softDelete فكرة ال  */
  let {productId}=req.params;
  const product=await productModel.findOneAndUpdate({_id:productId,deleted:false},{deleted:true},{new:true}); /** بقارن ال اي دي الي في الداتا بيس مع ال اي دي الي بعتها في الرابط ، وبشوف ادا الحدف فولس وقتها بحولها الى ترو وبعدل المعلومات الجديدة */
  if(!product){
    return next(new Error(`product not found`,{cause:400}));
  }
  return res.json({message:"success",product});
})


export const restore=asyncHandler(async(req,res,next)=>{    
  let {productId}=req.params;
  const product=await productModel.findOneAndUpdate({_id:productId,deleted:true},{deleted:false},{new:true});
  if(!product){
    return next(new Error(`product not found`,{cause:400}));
  }
  return res.json({message:"success",product});
})

export const forceDelete=asyncHandler(async(req,res,next)=>{
  let {productId}=req.params;
  const product=await productModel.findOneAndDelete({_id:productId,deleted:true});
  if(!product){
    return next(new Error(`product not found`,{cause:400}));
  }
  return res.json({message:"success",product});
})


export const getSoftDeleteProducts=asyncHandler(async(req,res,next)=>{
  const products=await productModel.find({deleted:true});
  return res.json({message:"success",products});
})

export const getProduct=asyncHandler(async(req,res,next)=>{
  const{productId}=req.params;
  const product=await productModel.findById(productId).populate('reviews');
  if(!product){
    return next(new Error(`product not found`,{cause:400}));
  }
  return res.json({message:"success",product});
})


export const getAllProducts=asyncHandler(async(req,res,next)=>{
  let{page,size}=req.query;  /***   عرض عدد معين من المنتجات في كل صفحة ، بدل ما يعرصضهن كلهن مرة واحدة  pagination  تطبيق فكرة ال  */
  if(!page || page  <=0){
    page=1;
  }
  if(!size || size <=0){
    size=3;
  }
  const skip=(page-1)*size;
  const products=await productModel.find().limit(size).skip(skip);/** http://localhost:3000/product?page=1&size=2 */    /**  عن كم منتج يتجاوز بكل صفحة skip  /**     يعني كم منتج يعرضلي بالصفحة limit */
  if(!products){
    return next(new Error(`product not found`,{cause:400}));
  }
  return res.json({message:"success",products});
})
