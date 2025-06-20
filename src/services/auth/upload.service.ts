//src/services/auth/upload.service.ts
import { v2 as cloudinary } from "cloudinary";
import { Readable } from "stream";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadToCloudinary = (file: Express.Multer.File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: "vehiculos_redibo" },
      (error, result) => {
        if (error || !result) {
          reject(error);
        } else {
          resolve(result.secure_url);
        }
      }
    );

    Readable.from(file.buffer).pipe(uploadStream);
  });
};