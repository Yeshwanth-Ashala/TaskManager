import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    // We are hardcoding the link just to test!
    const conn = await mongoose.connect('mongodb+srv://Yeshwanth:tasktracker123@tasktracker.w5w3nz2.mongodb.net/TaskManager?appName=TaskTracker');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;