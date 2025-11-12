import fs from "fs";
import cloudinary from "../config/cloudinary.js";

/**
 * Upload a local file to Cloudinary
 * @param {string} filePath - local path to the file
 * @param {string} folder - folder name inside your Cloudinary account
 * @returns {Promise<{url: string, public_id: string}>}
 */
export async function uploadToCloudinary(filePath, folder = "avatars") {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder,
      resource_type: "image",
    });

    return { url: result.secure_url, public_id: result.public_id };
  } catch (err) {
    throw err;
  }
}

/**
 * Delete an image from Cloudinary by public_id
 */
export async function deleteFromCloudinary(publicId) {
  try {
    if (!publicId) return;
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    // log and continue
    console.error("Failed to delete from Cloudinary:", err.message || err);
  }
}

/**
 * Remove a local file if it exists
 */
export function removeLocalFile(path) {
  try {
    if (fs.existsSync(path)) fs.unlinkSync(path);
  } catch (err) {
    console.error("Failed to remove temp file:", err.message || err);
  }
}

export default { uploadToCloudinary, deleteFromCloudinary, removeLocalFile };
