import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const ConnectDB = async () => {
    try{
      const connect =  await mongoose.connect(process.env.MONGO_URI as string)
      console.log(`MongoDB connected:${connect.connection.host} Successfully !`)
    } catch (error){
      console.log(`MongoDB connection failed: ${error}`)
      process.exit(1)
        
    }
}

export default ConnectDB;