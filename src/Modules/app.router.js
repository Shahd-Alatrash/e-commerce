
import connectDB from '../../DB/connection.js';
import { globalErrorHandler } from '../Services/errorHandling.js';
import AuthRouter from './Auth/Auth.router.js';
import UserRouter from './User/User.router.js';
import CategoryRouter from './Category/category.router.js';
import subCategoryRouter from './subCategory/subCategory.router.js'
import couponRouter from './Coupon/coupon.router.js'
import brandRouter from './Brand/brand.router.js'
import productRouter from './Product/product.router.js'
import cartRouter from './Cart/cart.router.js'
import orderRouter from './Order/order.router.js'
import cors from 'cors'

import path from 'path'; 
import {fileURLToPath} from 'url';
 const __dirname = path.dirname(fileURLToPath(import.meta.url));
 const fullPath=path.join(__dirname,'../upload');

const initApp=(app,express)=>{

app.use(async(req,res,next)=>{
    //console.log(req.header('origin'));
//     var whitelist = ['http://example1.com', 'http://example2.com']   /** مشان اسمه لفرونت معين يشتغل ع مشروعي ، بحط رابط مشروع الفرونت وقتها بصير يقدر يستخدم مشروعي الباك  */ /** مشان احدد مين بقدر يشوف الموقع تبعي ويستخدمه */
//    if(!whitelist.includes(req.header('origin'))){
//     return next(new Error(`invalid origin`,{cause:403}))
//    }
    next();
})
    app.use(cors())  /** هاي معناها مسموح الكل يستخدم مشروعي  */
    connectDB();
    app.use(express.json());
    app.use('/upload',express.static(fullPath));
    app.use("/auth", AuthRouter);
    app.use('/user', UserRouter);
    app.use('/category', CategoryRouter);
    app.use('/subCategory', subCategoryRouter);
    app.use('/coupon', couponRouter);
    app.use('/brand', brandRouter);
    app.use('/product', productRouter);
    app.use('/cart', cartRouter);
    app.use('/order', orderRouter);
    app.use('/*', (req,res)=>{
        return res.json({messaga:"page not found"});
    })

    //global error handler
    app.use(globalErrorHandler)

}

export default initApp;