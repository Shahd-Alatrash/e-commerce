import mongoose from 'mongoose';

const connectDB = async ()=>{

    return await mongoose.connect(process.env.DB_LOCAL)
    .then( ()=>{
        console.log("connect db");
    } ).catch( (err)=>{
        console.log(`error to connect db ${err}`)
    } )
}

export default connectDB