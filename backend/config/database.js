import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    // Use MongoDB Atlas connection string from environment variable
    // Format: mongodb+srv://username:password@cluster.mongodb.net/databaseName?retryWrites=true&w=majority
    const mongoURI = process.env.MONGODB_URI;
    
    if (!mongoURI) {
      console.error('❌ MONGODB_URI environment variable is not set!');
      console.error('Please set MONGODB_URI in your .env file');
      console.error('Format: mongodb+srv://username:password@cluster.mongodb.net/databaseName');
      process.exit(1);
    }

    const conn = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    if (error.message.includes('authentication failed')) {
      console.error('💡 Tip: Check your MongoDB Atlas username and password in the connection string');
    } else if (error.message.includes('ENOTFOUND')) {
      console.error('💡 Tip: Check your MongoDB Atlas cluster URL');
    } else if (error.message.includes('SRV')) {
      console.error('💡 Tip: Make sure your connection string uses mongodb+srv:// protocol');
    }
    process.exit(1);
  }
};

export default connectDB;