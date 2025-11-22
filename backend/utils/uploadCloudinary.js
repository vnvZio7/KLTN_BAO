// utils/uploadCloudinary.js
import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier";
import path from "path";

function toNodeBuffer(input) {
  if (!input) return null;
  if (Buffer.isBuffer(input)) return input;
  if (input instanceof ArrayBuffer) return Buffer.from(new Uint8Array(input));
  if (ArrayBuffer.isView(input)) return Buffer.from(input.buffer);
  throw new Error("Không thể convert sang Node Buffer");
}

export const uploadBufferToCloudinary = (file, folder = "pomera/assignments") =>
  new Promise((resolve, reject) => {
    if (!file) return reject(new Error("File không hợp lệ"));

    const nodeBuffer = toNodeBuffer(file.buffer);
    if (!nodeBuffer) return reject(new Error("Buffer của file không hợp lệ"));

    const isImage = file.mimetype?.startsWith("image/");
    const resourceType = isImage ? "image" : "raw";

    const parsed = path.parse(file.originalname || "file");
    const publicId = parsed.name;
    const format = parsed.ext ? parsed.ext.slice(1) : undefined;

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType,
        public_id: publicId,
        format,
      },
      (err, result) => {
        if (err) return reject(err);
        resolve(result.secure_url); // nếu bạn chỉ cần url
      }
    );

    streamifier.createReadStream(nodeBuffer).pipe(uploadStream);
  });

export const uploadManyBuffers = async (files = [], folder) => {
  const urls = [];
  for (const f of files) {
    const url = await uploadBufferToCloudinary(f, folder); // TRUYỀN FILE, KHÔNG PHẢI buffer
    urls.push(url);
  }
  return urls;
};
