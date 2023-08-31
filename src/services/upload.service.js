import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary'
import { ErrorHandler } from './src/utils/errorHandler.js';
dotenv.config({path: './config.env'});


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  
  const memoryStorage = multer.memoryStorage();
  
  const upload = multer({
    storage: memoryStorage,
  });
  
  const uploadToCloudinary = async (fileString, format) => {
    try {
      const { uploader } = cloudinary;
  
      const res = await uploader.upload(
        `data:image/${format};base64,${fileString}`
      );
  
      return res;
    } catch (error) {
      throw new ErrorHandler(500, error);
    }
  };
  
  module.exports = {
    upload,
    uploadToCloudinary,
  };
  