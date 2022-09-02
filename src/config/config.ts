import mongoose from "mongoose";

const connectDB: Function = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI as string);
    console.log(`db connected, ${conn.connection.host}`);
  } catch (error) {
    console.log("error in connecting to db");
    console.log(error);
    process.exit(1);
  }
};

export default connectDB;
