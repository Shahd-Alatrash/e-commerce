
import mongoose, {Schema,Types,model} from 'mongoose';
const reviewSchema = new Schema ({
    comment:{type:String,required:true},
    productId:{type:Types.ObjectId,ref:'product',required:true},
    createdBy:{  type:Types.ObjectId,   ref:'User',  required:true  },
    orderId:{  type:Types.ObjectId,   ref:'order',  required:true  },
    rating:{type:Number,required:true,min:1,max:5},
},
{
    timestamps:true
})

const reviewModel = mongoose.models.review ||  model('review', reviewSchema);
export default reviewModel;

