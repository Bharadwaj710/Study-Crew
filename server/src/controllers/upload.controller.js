import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier";

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_TYPES = {
  image: ["image/jpeg", "image/png", "image/gif", "image/webp"],
  pdf: ["application/pdf"],
  document: [
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "text/plain",
    "application/zip",
  ],
};

const isAllowedMime = (mime) => {
  return (
    ALLOWED_MIME_TYPES.image.includes(mime) ||
    ALLOWED_MIME_TYPES.pdf.includes(mime) ||
    ALLOWED_MIME_TYPES.document.includes(mime)
  );
};

const getFileType = (mime) => {
  if (ALLOWED_MIME_TYPES.image.includes(mime)) return "image";
  if (ALLOWED_MIME_TYPES.pdf.includes(mime)) return "pdf";
  return "file";
};

export const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file provided" });
    }

    const { groupId } = req.body;
    const file = req.file;

    // Validate MIME type
    if (!isAllowedMime(file.mimetype)) {
      return res.status(400).json({
        message: `File type not allowed. Allowed types: images, PDF, documents`,
      });
    }

    // Validate file size
    const maxSize = file.mimetype.startsWith("image")
      ? MAX_IMAGE_SIZE
      : MAX_FILE_SIZE;
    if (file.size > maxSize) {
      const sizeMB = Math.floor(maxSize / 1024 / 1024);
      return res.status(400).json({
        message: `File size exceeds limit of ${sizeMB}MB`,
      });
    }

    // Prepare Cloudinary upload options
    const uploadOptions = {
      resource_type: "auto",
      folder: groupId ? `studycrew/groups/${groupId}` : "studycrew/uploads",
      public_id: `${Date.now()}_${file.originalname.replace(/\s+/g, "_")}`,
      overwrite: false,
      secure: true,
    };

    // Upload buffer to Cloudinary via upload_stream
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, resu) => {
          if (error) return reject(error);
          resolve(resu);
        }
      );
      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });

    // Construct a Cloudinary direct-download URL using fl_attachment with original filename
    let downloadUrl = result.secure_url;
    try {
      const encodedName = encodeURIComponent(
        file.originalname || result.public_id
      );
      downloadUrl = result.secure_url.replace(
        "/upload/",
        `/upload/fl_attachment:${encodedName}/`
      );
    } catch (e) {
      // fallback to secure_url
      downloadUrl = result.secure_url;
    }

    res.json({
      url: result.secure_url,
      downloadUrl,
      public_id: result.public_id,
      name: file.originalname,
      size: file.size,
      mime: file.mimetype,
      type: getFileType(file.mimetype),
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ message: "Upload failed", error: error.message });
  }
};

export const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file provided" });
    }

    const file = req.file;

    // Validate MIME type (images only for avatar)
    if (!ALLOWED_MIME_TYPES.image.includes(file.mimetype)) {
      return res.status(400).json({
        message: "Only image files are allowed for avatars",
      });
    }

    // Validate file size
    if (file.size > MAX_IMAGE_SIZE) {
      return res.status(400).json({
        message: `Image size exceeds limit of ${Math.floor(
          MAX_IMAGE_SIZE / 1024 / 1024
        )}MB`,
      });
    }

    // Upload buffer to Cloudinary with transformation
    const uploadOptions = {
      resource_type: "auto",
      folder: "studycrew/avatars",
      public_id: `${req.user.userId}_${Date.now()}`,
      transformation: [
        {
          width: 400,
          height: 400,
          crop: "fill",
          gravity: "face",
        },
      ],
      secure: true,
    };

    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, resu) => {
          if (error) return reject(error);
          resolve(resu);
        }
      );
      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });

    let downloadUrl = result.secure_url;
    try {
      const encodedName = encodeURIComponent(
        file.originalname || result.public_id
      );
      downloadUrl = result.secure_url.replace(
        "/upload/",
        `/upload/fl_attachment:${encodedName}/`
      );
    } catch (e) {
      downloadUrl = result.secure_url;
    }

    res.json({
      url: result.secure_url,
      downloadUrl,
      public_id: result.public_id,
      name: file.originalname,
      size: file.size,
      mime: file.mimetype,
    });
  } catch (error) {
    console.error("Avatar upload error:", error);
    res
      .status(500)
      .json({ message: "Avatar upload failed", error: error.message });
  }
};
