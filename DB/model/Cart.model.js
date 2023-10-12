
import mongoose, {Schema,Types,model} from 'mongoose';
const cartSchema = new Schema ({
   userId:{type:Types.ObjectId,ref:'User',required:true,unique:true},
   products:[{ /**  حطيته في اريي لانه ممكن يطلب اكتر من منتج ، كل منتج اله اي دي واله كمية ، باي ديفولت الكمية بتكون واحد  */
    productId:{type:Types.ObjectId,ref:'product',required:true},
    qty:{type:Number,default:1,required:true},
   }]
},
{
    timestamps:true
})

const cartModel = mongoose.models.cart ||  model('cart', cartSchema);
export default cartModel;


