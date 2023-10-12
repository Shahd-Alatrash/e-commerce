import slugify from "slugify";
import cloudinary from "../../../Services/cloudinary.js";
import subCategoryModel from "../../../../DB/model/subCategory.model.js"
import { asyncHandler } from "../../../Services/errorHandling.js";

export const createSubCategory=asyncHandler(async(req,res,next)=>{
    //return res.json(req.params.categoryId);
    const{categoryId}=req.params;
    const{name}=req.body;
    if(await subCategoryModel.findOne({name})){  /** عشان امنعه يضيف تنتين كاتيجوري بنفس الاسم  */
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
        if(req.body.name){  /** ادا بده يعدل ع الاسم  */
            if(subcategory.name==req.body.name){ /** ادا كان الاسم الي مخزن في الداتا بيس مساوي للاسم الي باعته اليوزر */
                return next(new Error(`old name match new name`,{cause:400}))  

            }
            if(await subCategoryModel.findOne({name:req.body.name})){/** ادا بعتلي اسم مش نفسه ولكن موجود عندي في الداتا بيس  */
                return next(new Error(`duplicate sub category name`,{cause:409}))

            }
            subcategory.name=req.body.name; /**  لما يوصل هون معناها ما دخل ع الجمل الشرطية الداخلية ، دخل ع الخارجية فقط لأنه لو دخل ع الداخليات في ريتيرن بتطلعه منهن     */
            subcategory.slug=slugify(req.body.name);
        }

        if(req.file){ /** ادا بده يعدل صورة   */
            const{secure_url,public_id}=await cloudinary.uploader.upload(req.file.path,{folder:`$process.env.APP_NAME}/subcategory`});
            await cloudinary.uploader.destroy(subcategory.image.public_id);  /** بحدف الصورة القديمة وبحط الصورة الجديدة  */
            subcategory.image={secure_url,public_id}
        }
        req.body.updatedBy=req.user._id;
        await subcategory.save();  /** مشان يخزن التعديل في الداتا بيس */
        return res.json({message:"success",subcategory})
    })



    export const getSpecificSubCategory=asyncHandler(async(req,res,next)=>{ /**معين category  الي تابعين ل    subcategory  ادا بدي اعرض ال  */
    const {categoryId}=req.params;
   // return res.json(categoryId);
   const subcategory=await subCategoryModel.find({categoryId})
   return res.status(200).json({message:"success",subcategory})
    })

    export const getAllSubCategories=asyncHandler(async(req,res,next)=>{  /** subcategory ادا بدي اعرض كل ال   */
        const subcategories=await subCategoryModel.find().populate({
            path:'categoryId',  /** subcategory في جدول ال  ref الي عاملها  */
            select:'-_id name'
        })

        return res.status(200).json({message:"success",subcategories})
    })

    export const getProducts=asyncHandler(async(req,res,next)=>{  /** معينة  subCategory  مشان اعرض المنتجات الي موجودة في ال  */
        const{subCategoryId}=req.params;
        const products=await subCategoryModel.findById(subCategoryId).populate({
            path:'products',
            match:{deleted:{$eq:false}},
            populate:{path:'reviews'}
        });
        return res.status(200).json({message:"success",products});
    })

   