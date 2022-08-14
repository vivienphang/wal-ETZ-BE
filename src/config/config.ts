const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    console.log(process.env.MONGO_URI);
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`db connected, ${conn.connection.host}`);
  } catch (error) {
    console.log("error in connecting to db");
    console.log(error);
    process.exit(1);
  }
};

module.exports = connectDB;
