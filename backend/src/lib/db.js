import mongoose from 'mongoose';

const connectDB = async () => {
  const conn = await mongoose.connect(process.env.MONGO_URI + '/chatty', {
    serverSelectionTimeoutMS: 5000,
    maxPoolSize: 10,
    socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
    family: 4, // Use IPv4, skip IPv6
    retryWrites: true,
    retryReads: true,
  });
  
  
  console.log(`MongoDB Connected: ${conn.connection.host}`);
  return conn;
};

// Handle shutdown gracefully
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  process.exit(0);
});

export default connectDB;