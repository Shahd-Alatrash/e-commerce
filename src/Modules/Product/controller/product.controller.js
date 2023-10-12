import slugify from "slugify";
import cloudinary from "../../../Services/cloudinary.js";
import BrandModel from "../../../../DB/model/Brand.model.js";
import { asyncHandler } from "../../../Services/errorHandling.js";
import subCategoryModel from "../../../../DB/model/subCategory.model.js";
import brandModel from "../../../../DB/model/Brand.model.js";
import productModel from "../../../../DB/model/Product.model.js";

export const createProduct = asyncHandler(async (req, res, next) => {
  const { name,price,discount,categoryId,subCategoryId,brandId } = req.body;
  //res.json(req.files);   

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
 const{secure_url,public_id}=await cloudinary.uploader.upload(req.files.mainImage[0].path,{folder:`${process.env.APP_NAME}/'PRODUCT'}`}) 
 req.body.mainImage={secure_url,public_id};
if(req.body.subImages){ 
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
const{productId}=req.params;
const newProduct=await productModel.findById(productId);
if(!newProduct){
  return next(new Error(`product not found `,{cause:400}))
}
  const { name,price,discount,categoryId,subCategoryId,brandId } = req.body;
  
  if(categoryId && subCategoryId){ 
   const checkSubCategory=await subCategoryModel.findOne({_id:subCategoryId,categoryId});
   if(checkSubCategory){
    newProduct.subCategoryId=subCategoryId; 
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
 if(price && discount){ 
  newProduct.price=price;
  newProduct.discount=discount;
  newProduct.finalPrice=price-(price*((discount||0)/100));
 }else if(price){
  newProduct.price=price;
  newProduct.finalPrice=price-(price*((newProduct.discount)/100));
 }else if(discount){
  newProduct.discount=discount;
  newProduct.finalPrice=newProduct.price-(newProduct.price*((discount)/100));
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
const product=await newProduct.save(); 
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

export const softDelete=asyncHandler(async(req,res,next)=>{ 
  let {productId}=req.params;
  const product=await productModel.findOneAndUpdate({_id:productId,deleted:false},{deleted:true},{new:true}); 
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
  let{page,size}=req.query;  
  if(!page || page  <=0){
    page=1;
  }
  if(!size || size <=0){
    size=3;
  }
  const skip=(page-1)*size;
  const products=await productModel.find().limit(size).skip(skip);    
  if(!products){
    return next(new Error(`product not found`,{cause:400}));
  }
  return res.json({message:"success",products});
})
