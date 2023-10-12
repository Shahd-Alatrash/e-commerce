
import mongoose, {Schema,Types,model} from 'mongoose';
const orderSchema = new Schema ({
        userId:{
            type:Types.ObjectId,
            ref:'User',
            required:true
        },
        address:{
            type:String,
            required:true
        },
        phoneNumber:[{
            type:String,
            required:true
        }],
        products:[{
            productId:{ type:Types.ObjectId, ref:'product',  required:true  } ,
            qty:{type:Number,required:true},
            unitPrice:{type:Number,required:true}, 
            finalPrice:{type:Number,required:true}, 

        }],
        couponId:{
            type:Types.ObjectId,
            ref:'coupon'
        },
        finalPrice:{  
            type:Number,
            required:true
        },
        subtotal:{  
        type:Number,
        required:true
    },
        paymentType:{  
            type:String,
            default:'cash',
            enum:['cash','card']
        },
        status:{ 
            type:String,
            default:'pending',
            enum:['pending','canceled','approved','onWay','delivered']
        },
        resonReject:String,
        note:String,
        updatedBy:{
            type:Types.ObjectId,
            ref:'User',        
        },
},
{
    timestamps:true
})

const orderModel = mongoose.models.order ||  model('order', orderSchema);
export default orderModel;


