/* ============================================================
   SHANTI GURUKUL — MongoDB Connection Setup
   config/db.js : Mongoose connection with error handling
   ============================================================ */
import mongoose from 'mongoose';

export async function connectDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/shanti_gurukul';
  try {
    const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 2500 });
    console.log(`🍃 MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    // Non-fatal fallback for development if needed
    return null;
  }
}

export default connectDB;
