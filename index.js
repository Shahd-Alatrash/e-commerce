import * as dotenv from 'dotenv';
dotenv.config()
import express from 'express';
import initApp from './src/Modules/app.router.js';
const app = express();
const PORT = 3000;
initApp(app,express);



app.listen(PORT,()=>{
    console.log(`server listening on ${PORT}`);
})