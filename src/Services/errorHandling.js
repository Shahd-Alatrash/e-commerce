export const asyncHandler = (fn) => {
    return(req, res, next) => {
        fn(req, res, next).catch((err) => {
            // if (process.env.MODE == "Dev") {   /**   بحتاج اعرف الايرور شو هوي بالزبط develpment ما في داعي ابين الايرور شو بالزبط ، في مرحلة ال   production  في مرحلة ال   ،  develpment and production  لأنه المشروع يقسم الى قسمين ،  process.env.MODE */
            //     return res.status(500).json({message: "catch error", stack: err.stack});
            // } else {
            //     return res.status(500).json({message: "catch error"});
            // }
            return next(new Error(err))  /**   globalErrorHandler  عشان يستدعي ال  next(new Error */
        });
    };
};

export const globalErrorHandler=(err,req,res,next)=>{   /** globalErrorHandler بوخد اربعة باراميتر بكون  middleware اي  */

if (process.env.MODE == "Dev") {   /**   بحتاج اعرف الايرور شو هوي بالزبط develpment ما في داعي ابين الايرور شو بالزبط ، في مرحلة ال   production  في مرحلة ال   ،  develpment and production  لأنه المشروع يقسم الى قسمين ،  process.env.MODE */
return res.status(err.cause || 500).json({message: "catch error", stack: err.stack});
} else {
return res.status(err.cause || 500).json({message: "catch error"});
}
}
