import * as dotenv from 'dotenv';
dotenv.config()
import express from 'express';
import initApp from './src/Modules/app.router.js';
const app = express();
const PORT = process.env.PORT || 3000;
//app.set(`case sensitive routing`,true); /**  عشان في البوستمان امنعه يقبل كابيتل وسمول ، بس يقبل متل ما انا كاتبة في الكود  في الايند بوينت */
initApp(app,express);



app.listen(PORT);