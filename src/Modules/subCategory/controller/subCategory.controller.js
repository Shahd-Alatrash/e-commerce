import slugify from "slugify";
import cloudinary from "../../../Services/cloudinary.js";
import subCategoryModel from "../../../../DB/model/subCategory.model.js"
import { asyncHandler } from "../../../Services/errorHandling.js";

export const createSubCategory=asyncHandler(async(req,res,next)=>{
    //return res.json(req.params.categoryId);
    const{categoryId}=req.params;
    const{name}=req.body;
    if(await subCategoryModel.findOne({name})){  
//        return res.status(409).json({message:`duplicate category name ${name}`});
return next(new Error('duplicate sub category name',{cause:409}))
    }
    const{secure_url,public_id}=await cloudinary.uploader.upload(req.file.path,{folder:`${process.env.APP_NAME}/'CATEGORY'}`})
    const subcategory=await subCategoryModel.create({name,slug:slugify(name),categoryId,image:{secure_url,public_id},careatedBy:req.user._id,updatedBy:req.user._id});
    return res.status(201).json({message:"success",subcategory});
    })

    export const updateSubCategory=asyncHandler(async(req,res,next)=>{
        const{categoryId,subcategoryId}=req.params;
       // return res.json({categoryId,subcategoryId})
        const subcategory=await subCategoryModel.findOne({_id:subcategoryId,categoryId:categoryId});
        if(!subcategory){
            return next(new Error(`invalid sub category id ${req.params.categoryId}`,{cause:400}))
        }
        if(req.body.name){  
            if(subcategory.name==req.body.name){ 
                return next(new Error(`old name match new name`,{cause:400}))  

            }
            if(await subCategoryModel.findOne({name:req.body.name})){
                return next(new Error(`duplicate sub category name`,{cause:409}))

            }
            subcategory.name=req.body.name;
            subcategory.slug=slugify(req.body.name);
        }

        if(req.file){ 
            const{secure_url,public_id}=await cloudinary.uploader.upload(req.file.path,{folder:`$process.env.APP_NAME}/subcategory`});
            await cloudinary.uploader.destroy(subcategory.image.public_id);  
            subcategory.image={secure_url,public_id}
        }
        req.body.updatedBy=req.user._id;
        await subcategory.save();  
        return res.json({message:"success",subcategory})
    })



    export const getSpecificSubCategory=asyncHandler(async(req,res,next)=>{ 
    const {categoryId}=req.params;
   // return res.json(categoryId);
   const subcategory=await subCategoryModel.find({categoryId})
   return res.status(200).json({message:"success",subcategory})
    })

    export const getAllSubCategories=asyncHandler(async(req,res,next)=>{  
        const subcategories=await subCategoryModel.find().populate({
            path:'categoryId', 
            select:'-_id name'
        })

        return res.status(200).json({message:"success",subcategories})
    })

    export const getProducts=asyncHandler(async(req,res,next)=>{  
        const{subCategoryId}=req.params;
        const products=await subCategoryModel.findById(subCategoryId).populate({
            path:'products',
            match:{deleted:{$eq:false}},
            populate:{path:'reviews'}
        });
        return res.status(200).json({message:"success",products});
    })

   