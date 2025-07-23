import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
const uploadOnCloudinary = async (localFilePath, cloudinaryUploadFolder = 'super-dev') => {
    try {
        if (!localFilePath) {
            return null;
        }
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: 'auto',
            folder: cloudinaryUploadFolder,
        });
        console.log('file uploaded on cloudinary', response);
        return response;
    }
    catch (error) {
        console.log('catch error in coudinary', error);
        return null;
    }
    finally {
        fs.unlinkSync(localFilePath);
    }
};
export { uploadOnCloudinary };
