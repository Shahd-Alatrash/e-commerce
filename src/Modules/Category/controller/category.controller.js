import slugify from "slugify";
import cloudinary from "../../../Services/cloudinary.js";
import CategoryModel from "../../../../DB/model/Category.model.js"
import { asyncHandler } from "../../../Services/errorHandling.js";

export const createCategory=asyncHandler(async(req,res,next)=>{
    //const{name}=req.body;
    const name=req.body.name.toLowerCase(); /** عشان يحول الاسم الي بيجي من البودي يحوله الى سمول ، نفس السطر السابق بس انه ضفت يحوله الى سمول  */
    if(await CategoryModel.findOne({name})){  /** عشان امنعه يضيف تنتين كاتيجوري بنفس الاسم  */
//        return res.status(409).json({message:`duplicate category name ${name}`});
return next(new Error('duplicate category name',{cause:409}))
    }
    const{secure_url,public_id}=await cloudinary.uploader.upload(req.file.path,{folder:`${process.env.APP_NAME}/'CATEGORY'}`})
    const category=await CategoryModel.create({name,slug:slugify(name),image:{secure_url,public_id},careatedBy:req.user._id,updatedBy:req.user._id});
    return res.status(201).json({message:"success",category});
    })

    export const updateCategory=asyncHandler(async(req,res,next)=>{
        const category=await CategoryModel.findById(req.params.categoryId);
        if(!category){
            return next(new Error(`invalid category id ${req.params.categoryId}`,{cause:400}))
        }
        if(req.body.name){  /** ادا بده يعدل ع الاسم  */
            if(category.name==req.body.name){ /** ادا كان الاسم الي باعته الضخص نفس الاسم الي موجود سابقا في الداتا بيس  */
                return next(new Error(`old name match new name`,{cause:400}))  

            }
            if(await CategoryModel.findOne({name:req.body.name})){/** t shirt واجى شخص بده يحولها الى  computer  وكاتيجوري اسمها  t shirt    عشان اتأكد الاسم الي باعته اليوزر هل هوي متل الي في الداتا بيس ام لا ، مثال لو عندي كاتيجوري اسمها  */
                return next(new Error(`duplicate category name`,{cause:409}))

            }
            category.name=req.body.name;
            category.slug=slugify(req.body.name);
        }

        if(req.file){ /** ادا بده يعدل صورة   */
            const{secure_url,public_id}=await cloudinary.uploader.upload(req.file.path,{folder:`$process.env.APP_NAME}/category`});
            await cloudinary.uploader.destroy(category.image.public_id);  /** بحدف الصورة القديمة وبحط الصورة الجديدة  */
            category.image={secure_url,public_id}
        }
        req.body.updatedBy=req.user._id;
        await category.save();  /** مشان يخزن التعديل في الداتا بيس */
        return res.json({message:"success",category})
    })


    export const getSpecificCategory=asyncHandler(async(req,res,next)=>{ /** تبعها id عرض معلومات كاتيجوري معينة من خلال ال  */
        const category=await CategoryModel.findById(req.params.categoryId);
        return res.status(200).json({message:"success",category});
    })

    export const getAllCategories=asyncHandler(async(req,res,next)=>{ /** عرض كل الكاتيجوري الي عنا  */
        const categories=await CategoryModel.find().populate('subCATEGORY') /** vitualPopulate  من خلال ال  parent - child  طريقة  */
        return res.status(200).json({message:"success",categories});
    })
    