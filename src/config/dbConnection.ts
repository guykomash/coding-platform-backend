import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) {
      throw new Error('MongoDB URI was not found.');
    }
    await mongoose.connect(MONGODB_URI, {});
  } catch (err) {
    console.error(err);
  }
};
