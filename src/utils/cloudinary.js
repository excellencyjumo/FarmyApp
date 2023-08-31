import {v2 as cloudinary} from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config({path: '../../config.env'});

cloudinary.config({
    cloud_name: 'farmyapp', //process.env.CLOUDINARY_CLOUD_NAME,
    api_key: '587516492499594',// process.env.CLOUDINARY_API_KEY,
    api_secret:'_iXFm7rvgsEo98-d8-w_caXZFPU', //process.env.CLOUDINARY_API_SECRET,
  });

  const uploadToCloudinary = (file) => {
    const result = cloudinary.uploader.upload(file)
    return result
    // return new Promise(resolve => {
    //     cloudinary.uploader.upload(file) .then(result => {
    //         resolve({
    //             url:result.secure_url,
    //             id: result.public_id
    //         }, {
    //             resource_type:auto,
    //             folder:folder
    //         })
    //     })
    // })
}

export default uploadToCloudinary