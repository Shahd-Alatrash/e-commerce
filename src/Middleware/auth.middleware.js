import userModel from "../../DB/model/User.model.js";
import { asyncHandler } from "../Services/errorHandling.js";
import { verifyToken } from "../Services/generateAndVerifyToken.js";


export const roles={
    Admin:'Admin',
    User:'User'
}

export const auth=(acessRoles=[])=>{   
    return asyncHandler(async (req,res,next)=>{
const{authorization}=req.headers;  
//return res.json(authorization);
if(!authorization?.startsWith(process.env.BEARERKEY))  {  
    return next(new Error ( `invalid bearerkey or invalid token `,{cause:400}))
}
//return res.json(authorization);
//const token=authorization.split(process.env.BEARERKEY); 
const token=authorization.split(process.env.BEARERKEY)[1];
//return res.json(token);
if(!token){ 
return next(new Error(`invalid token`,{cause:400}))
}
const decodded=verifyToken(token,process.env.LOGINTOKEN);
//return res.json(decodded);
if(!decodded){
    return next(new Error(`invalid token payload `,{cause:400}))
}
//const user=await userModel.findById(decodded.id);
const user=await userModel.findById(decodded.id).select('userName role changePasswoedTime');
if(!user){ /** ادا انحدفت التوكن تبعت اليوزر  */
return next(new Error(`not register user`,{cause:401})) 
}
if(!acessRoles.includes(user.role)){
return next(new Error(`user not aithorization role`),{cause:403});
}
if(parseInt(user.changePasswoedTime?.getTime()/1000)>decodded.iat){  
return next(new Error(`exp token`),{cause:400}); 
}
req.user=user; 
return next();
})
}