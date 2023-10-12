import { customAlphabet } from "nanoid";
import userModel from "../../../../DB/model/User.model.js";
import {asyncHandler} from "../../../Services/errorHandling.js";
import {generateToken, verifyToken} from "../../../Services/generateAndVerifyToken.js";
import {compare, hash} from "../../../Services/hashAndCompare.js";
import {sendEmail} from "../../../Services/sendEmail.js";
import {loginSchema, signupSchema} from "../Auth.validation.js";

export const signup = asyncHandler(async (req, res, next) => {
    const {userName, email, password} = req.body;

    const user = await userModel.findOne({email});
    if (user) { //     return res.status(409).json({message:"email already exists"});
        return next(new Error("email already exists", {cause: 409}));
    }
    // const hashPassword = hash(password); 

    // const token = generateToken({email},process.env.EMAIL_TOKEN);
    // const link =`http://localhost:3000/auth/confirmEmail/${token}`;
    // await sendEmail(email,'confirm email',`<a href="${link}">verify your email</a>`);
    // const createUser = await userModel.create({userName,email,password:hashPassword});

    const token = generateToken({
        email
    }, process.env.SIGNUP_TOKEN, 60 * 5); 

    const refreshToken = generateToken({
        email
    }, process.env.SIGNUP_TOKEN, 60 * 60 * 24);
    
    // const link =`http://localhost:3000/auth/confirmEmail/${token}`;

    /**  ادا كنت رافعة المشروع ع سيرفر  https  او  http   بترجعلي  ${req.protocol} */
    /** www......com  او رابط الموقع تبعي   localhost:3000  بترجعلي  ${req.headers.host} */
    const link = `${
        req.protocol
    }://${
        req.headers.host
    }/auth/confirmEmail/${token}`;

    // const Rlink =`http://localhost:3000/auth/NewconfirmEmail/${refreshToken}`;
    const Rlink = `${
        req.protocol
    }://${
        req.headers.host
    }/auth/NewconfirmEmail/${refreshToken}`;

    const html = `<a href="${link}">verify email</a>  <br />  <br /> <br />  <br /> <a href="${Rlink}">send new email </a> `; /** http/localhost:3000/auth/confirmEmail/  هيك بطلعلي        /التوكن المشفرة verify email لما كبست ع  */
    await sendEmail(email, `confirm email`, html);
    const hashPassword = hash(password);
    const createUser = await userModel.create({userName, password: hashPassword, email});

    return res.status(201).json({message: "success", user: createUser._id});
});

export const confirmEmail = asyncHandler(async (req, res) => {
    const {token} = req.params;
    const decoded = verifyToken(token, process.env.SIGNUP_TOKEN); /** فك تشفير التوكن */

    if (! decoded ?. email) {
        return next(new Error("invalid tpken payload", {cause: 400}));
    }
    const user = await userModel.updateOne({
        email: decoded.email
    }, {confirmEmail: true});
    if (user.modifiedCount) {
        return res.status(200).redirect(`${
            process.env.FE_URL
        }`);
    } else {
        return next(new Error("not register account or your email is verify", {cause: 400}));
    }
});

export const login = asyncHandler(async (req, res, next) => {
    const {email, password} = req.body;

    const user = await userModel.findOne({email});
    if (! user) {
        return next(new Error("email not exists"), {cause: 404});
    } else {
        if (! user.confirmEmail) {
            return next(new Error("plz verify your email", {cause: 400}));
        }
        const match = compare(password, user.password);
        if (! match) {
            return next(new Error("in valid password"));
        } else {
            const token = generateToken({id: user._id,role:user.role},process.env.LOGINTOKEN,'1h');
            const refreshToken=generateToken({id: user._id,role:user.role},process.env.LOGINTOKEN,60*60*24*365);/** التوكن الاولى الي لما يعمل تسجيل دخول مدتها فقط ساعة ، بعد ساعة ادا عمل ريكوست معين ما رح يزبط لانه رح يعمل تسجيل خروج تلقائي ، هون بتيجي فكرة الريفرش ، نفس التوكن بس خليت مدتها سنة  */
            return res.status(200).json({message: "Done", token,refreshToken});
        }
    }
});

export const NewconfirmEmail = asyncHandler(async (req, res, next) => {
    let {token} = req.params;
    const {email} = verifyToken(token, process.env.SIGNUP_TOKEN); /** بفك تشفثير التوكن وبوخد منها الايميل  */
    if (!email) {
        return next(new Error("invalid token payload", {cause: 400}));
    }
    const user = await userModel.findOne({email});
    if (! user) {
        return next(new Error("not register account", {cause: 409}));
    }
    /** ادا اليوزر موجود بدي اتأكد هل الكونفيرم ايميل اله ترو ام فولس */
    if (user.confirmEmail) { /** في حال كان عامل كونفيرم ايميل واجى يعمل كونفيرم ايميل كمان مرة ، بحوله ع رابط اللينكد ان الي انا حاطيته تحت ،او على رابط اللوج ان انه خلص انت سجلت دخولك  */
        return res.status(200).redirect(`${
            process.env.FE_URL
        }`);
    }
    token = generateToken({
        email
    }, process.env.SIGNUP_TOKEN, 60 * 5);
    const link = `${
        req.protocol
    }://${
        req.headers.host
    }/auth/confirmEmail/${token}`;

    const html = `<a href="${link}">verify email</a>`;
    await sendEmail(email, `confirm email`, html);
    return res.status(201).send(`<p>new confirm email send to your inbox</p>`);
});

export const sendCode=asyncHandler(async(req,res,next)=>{
    const {email}=req.body;
    // const code=customAlphabet('123456789AbCd',4); /**   مكتبة موجودة داخل النانو اي دي ، بتنشألي نص عشوائي ، هون بختار اربع احرف وارقام من الي انا مدخلهن ، عشان يرسلهن ك كود الى الايميل لتأكيد الدخول وتغيير كلمة السر عند النسيان  customAlphabet */
    // return res.json(code());

    let code=customAlphabet('123456789AbCd',4);
    code=code();
    const user=await userModel.findOneAndUpdate({email},{forgetCode:code},{new:true});/** اليوزر الي ايميله  يساوي الايميل الي مبعوث روح على فورجيت كود عنده وحطلي قيمتها الكود الي هون  */
    const html=`<p> code is ${code}</p>`;
    await sendEmail(email,`forget password`,html);
    return res.status(200).json({message:"success",user});

})

export const forgetPassword=asyncHandler(async(req,res,next)=>{
    const{code,email,password}=req.body;
    const user =await userModel.findOne({email});

    if(!user){ /** ادا ما في ايميل اصلا */
        return next(new Error(`not register account`,{cause:400}));
    }
    if(user.forgetCode!=code || !code){ /** ادا الكود الي دخله غير عن الكود الي مخزن في الداتا بيس  */
        return next(new Error(`invalid code`,{cause:400}));
    }
    user.password=hash(password); /** شفر الباسوورد الجديدة */
    user.forgetCode=null; /** معناها انه خلص انا عدلت الباسوورد تبعتي  */
    user.changePasswoedTime=Date.now(); /**  الوقت الي بتتغير فيه الباسوورد changePasswoedTime   ، بترجع الوقت الحالي   Date.now() */
    user.save(); /** عشان يحفظ الي عملته */
    return res.status(200).json({message:"success",user});
})