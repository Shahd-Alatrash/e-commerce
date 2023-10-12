export const asyncHandler = (fn) => {
    return(req, res, next) => {
        fn(req, res, next).catch((err) => {
            // if (process.env.MODE == "Dev") {  
            //     return res.status(500).json({message: "catch error", stack: err.stack});
            // } else {
            //     return res.status(500).json({message: "catch error"});
            // }
            return next(new Error(err))  
        });
    };
};

export const globalErrorHandler=(err,req,res,next)=>{   

if (process.env.MODE == "Dev") { 
return res.status(err.cause || 500).json({message: "catch error", stack: err.stack});
} else {
return res.status(err.cause || 500).json({message: "catch error"});
}
}
