
import mongoose, {Schema,Types,model} from 'mongoose';
const productSchema = new Schema ({
    name:{
        type:String,
        required:true,
        unique:true ,
        trim:true
    },
    slug:{
        type:String,
        required:true
    },
    discription:String,
    stock:{  
        type:Number,
        default:1
    },
    price:{
        type:Number,
        default:1
    },
    discount:{ 
        type:Number,
        default:0
    },
    finalPrice:{ 
        type:Number,
        default:1
    },
    colors:[String],
    size:[{
        type:String,
        enum:['s','m','lh','xl']
    }],
    mainImage:{
        type:Object,
        required:true
    },
    subImages:{
        type:Object
    },

    deleted:{   
        type:Boolean,
        default:false,
    },

    categoryId:{  type:Types.ObjectId, ref:'Category', required:true},
    subCategoryId:{   type:Types.ObjectId, ref:'subCategory', required:true},
    brandId:{  type:Types.ObjectId,ref:'brand',required:true},

    careatedBy:{  type:Types.ObjectId,  ref:'User', required:true},
    updatedBy:{ type:Types.ObjectId, ref:'User',required:true},
},
{
    toJSON:{virtuals:true},
    toObject:{virtuals:true},
    timestamps:true
})
productSchema.virtual('reviews',{ 
    localField:'_id',
    foreignField:'productId', 
    ref:"review"  
})
const productModel = mongoose.models.product ||  model('product', productSchema);
export default productModel;


