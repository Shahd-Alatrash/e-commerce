
import mongoose, {Schema,Types,model} from 'mongoose';
const CategorySchema = new Schema ({
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

},
{
    toJSON:{virtuals:true},
    toObject:{virtuals:true},
    timestamps:true
})
CategorySchema.virtual('subCATEGORY',{  
    localField:'_id',
    foreignField:'categoryId',  
    ref:"subCategory"  
})
const CategoryModel = mongoose.models.Category ||  model('Category', CategorySchema);
export default CategoryModel;


