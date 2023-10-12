
import mongoose, {Schema,Types,model} from 'mongoose';
const couponSchema = new Schema ({
    name:{
        type:String,
        required:true,
        unique:true /**  عشان اسم الكاتيجوري ما يتكرر ، هون عملت فاليديشن ع مستوى الداتا بيس فقط */
    },
    amount:{
        type:Number,
        default:1
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
    expierDate:{type:String,required:true},
    usedBy:[{type:Types.ObjectId,  /**  اليوزر الي استخدم الكوبون */
    ref:'User'}],
    createdBy:{type:Types.ObjectId,
    ref:'User'}

},

{
    timestamps:true
})

const couponModel = mongoose.models.coupon ||  model('coupon', couponSchema);
export default couponModel;


