
import mongoose, {Schema,Types,model} from 'mongoose';
const brandSchema = new Schema ({
    name:{
        type:String,
        required:true,
        unique:true 
    },
    image:
    {type:Object,
        required:true
        },

    createdBy:{
        type:Types.ObjectId,
        ref:'User',
      //  required:true
    },
    updatedBy:{
        type:Types.ObjectId,
        ref:'User',
        required:true
    
    },

    categoryId:{type:Types.ObjectId,ref:'Category',required:true}

},
{
    timestamps:true
})

const brandModel = mongoose.models.brand ||  model('brand', brandSchema);
export default brandModel;


