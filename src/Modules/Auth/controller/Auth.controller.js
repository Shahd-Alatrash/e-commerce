import userModel from "../../../../DB/model/User.model.js";
import { generateToken, verifyToken } from "../../../Services/generateAndVerifyToken.js";
import { compare, hash } from "../../../Services/hashAndCompare.js";
import { sendEmail } from "../../../Services/sendEmail.js";
import { loginSchema, signupSchema } from "../Auth.validation.js";


export const signup= async (req,res,next)=>{

   
    const {userName,email,password} = req.body;
  
    const user = await userModel.findOne({email});
    if(user){
   //     return res.status(409).json({message:"email already exists"});
        return next(new Error("email already exists"));
    }
    const hashPassword = hash(password);

    const token = generateToken({email},process.env.EMAIL_TOKEN);
    const link =`http://localhost:3000/auth/confirmEmail/${token}`;
    await sendEmail(email,'confirm email',`<a href="${link}">verify your email</a>`);

    const createUser = await userModel.create({userName,email,password:hashPassword});

    return res.status(201).json({message:"Done",user:createUser._id});

}

export const confirmEmail = async(req,res)=>{

    const {token} = req.params;

    const decoded = verifyToken(token,process.env.EMAIL_TOKEN);
    
    const user = await userModel.updateOne({email:decoded.email},{confirmEmail:true});
    return res.redirect('https://www.facebook.com')
}


export const login = async(req,res,next)=>{
        const {email,password} = req.body;
      
        const user = await userModel.findOne({email});
        if(!user){
            return next(new Error("email not exists"));
        }else {
            if(!user.confirmEmail){
                return next(new Error("plz verify your email"));
            }
            const match = compare(password,user.password);
            if(!match){
                return next(new Error("in valid password"));
            }else {
                const token =generateToken({id:user._id});
                return res.status(200).json({message:"Done",token});
            }
        
    }
    
}