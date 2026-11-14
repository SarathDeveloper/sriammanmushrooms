import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  // next-cloudinary's upload widget reads this same key in the browser, so it
  // is a NEXT_PUBLIC_ variable. The API key is not secret; the API secret is.
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export { cloudinary };

export {
  CLOUDINARY_FOLDER,
  isCloudinarySrc,
  toCloudinaryPublicId,
  normalizeCloudinaryImages,
} from "./cloudinary-utils";
