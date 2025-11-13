// utils/uploadCloudinary.js
import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier";

export const uploadBufferToCloudinary = (fileBuffer, folder = "certificates") =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "image" },
      (err, result) => {
        if (err) return reject(err);
        resolve(result.secure_url); // lấy secure_url
      }
    );
    streamifier.createReadStream(fileBuffer).pipe(stream);
  });

export const uploadManyBuffers = async (files, folder) => {
  const urls = [];
  for (const f of files) {
    const url = await uploadBufferToCloudinary(f.buffer, folder);
    urls.push(url);
  }
  return urls;
};
