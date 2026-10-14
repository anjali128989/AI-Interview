const mongoose = require("mongoose");

let cached = global._mongoConn;

const connectDB = async () => {
  if (cached) return cached;
  if (!process.env.MONGO_URI) throw new Error("MONGO_URI is not set");

  cached = global._mongoConn = mongoose
    .connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 8000 })
    .then((m) => {
      console.log("MongoDB Connected");
      return m;
    })
    .catch((err) => {
      console.error("Mongo connect failed:", err.message);
      console.error("Reason:", err.reason?.toString());
      global._mongoConn = null;
      cached = null; // lets the next request retry
      throw err;
    });

  return cached;
};

module.exports = connectDB;