import mongoose from 'mongoose';


const connectDB = async () => {
  try {
    // This tells it to look at Render's dashboard instead of a hardcoded string!
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};
export default connectDB;