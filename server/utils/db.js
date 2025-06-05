import mongoose from 'mongoose';
import { MongoClient } from 'mongodb';

let mongooseConnection;
let nativeDb;

const connectDB = async () => {
  try {
    console.log("Attempting to connect to MongoDB...");
    
    // Mongoose connection
    mongooseConnection = await mongoose.connect('mongodb://localhost:27017/openVOC', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    // Native MongoDB driver connection
    const client = new MongoClient('mongodb://localhost:27017');
    await client.connect();
    nativeDb = client.db('openVOC');
    
    console.log("✅ MongoDB Connected");
    return nativeDb;
  } catch (err) {
    console.error("❌ MongoDB Connection Error:", err);
    process.exit(1);
  }
};

const getDb = () => {
  if (!nativeDb) {
    throw new Error('Database not initialized!');
  }
  return nativeDb;
};

export { connectDB, getDb };