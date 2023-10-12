
import mongoose, {Schema,Types,model} from 'mongoose';
const subCategorySchema = new Schema ({
    name:{
        type:String,
        required:true,
        unique:true 
    },
    slug:{
        type:String,
        required:true,
    },
   image:{type:Object,
required:true
},
careatedBy:{
    type:Types.ObjectId,
    ref:'User',
    required:true
},
updatedBy:{
    type:Types.ObjectId,
    ref:'User',
    required:true

},
categoryId:{  
    type:Types.ObjectId,
    ref:'Category',
    required:true
}

},
{
    toJSON:{virtuals:true},
    toObject:{virtuals:true},
    timestamps:true
})
subCategorySchema.virtual('products',{    
    localField:'_id',
    foreignField:'subCategoryId',
    ref:'product'
})
const subCategoryModel = mongoose.models.subCategory ||  model('subCategory', subCategorySchema);
export default subCategoryModel;


