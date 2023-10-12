import mongoose, {Schema, Types, model} from 'mongoose';
const userSchema = new Schema({
    userName: {
        type: String,
        required: [true, 'userName is required']
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    confirmEmail: {
        type: Boolean,
        default: false
    },
    image: {
        type: Object
    },
    phone: {
        type: String
    },
    role: { 
        type: String,
        enum: [
            'User', 'Admin'
        ],
        default: 'User' 
    },
    status:{
        type:String,
        enum:['Active','Not-Active'],
        default:'Active',
    },
    gender:{
        type:String,
        enum:['Male','Female']
    },
    address:{
        type:String
    },
    forgetCode:{
        type:String,
        default:null
    },
    changePasswoedTime:{  
        type:Date
    },
    wishList:{
        type:[{type:Types.ObjectId,ref:'product'}]
    }


}, {timestamps: true})
const userModel = mongoose.models.User || model('User', userSchema);
export default userModel;
