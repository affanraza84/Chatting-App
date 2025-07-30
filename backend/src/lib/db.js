import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      // Remove sslValidate completely
      ssl: true, // Keep this for TLS/SSL connections
      tlsAllowInvalidCertificates: false, // Important for production
      authMechanism: 'SCRAM-SHA-256', // Modern authentication
      retryWrites: true,
      retryReads: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 30000
    });
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

export default connectDB;