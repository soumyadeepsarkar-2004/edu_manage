/**
 * Cloudinary upload service.
 *
 * Usage:
 *   Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET in backend/.env
 *   to enable cloud storage.  If the vars are absent the service is a no-op and
 *   Multer falls back to the local / /tmp disk strategy.
 */

let cloudinary = null;

const isConfigured = () => {
  return !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
};

const getCloudinary = () => {
  if (!isConfigured()) return null;

  if (!cloudinary) {
    try {
      const { v2 } = require('cloudinary');
      v2.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
        secure: true,
      });
      cloudinary = v2;
    } catch (err) {
      console.warn('[Cloudinary] Package not installed:', err.message);
      return null;
    }
  }
  return cloudinary;
};

/**
 * Upload a file buffer to Cloudinary.
 * @param {Buffer} buffer    - File data
 * @param {string} folder    - Cloudinary folder e.g. 'edu_manage/materials'
 * @param {object} options   - Additional cloudinary upload options
 * @returns {{ url: string, publicId: string } | null}
 */
const uploadBuffer = async (buffer, folder = 'edu_manage', options = {}) => {
  const cld = getCloudinary();
  if (!cld) return null;

  return new Promise((resolve, reject) => {
    const stream = cld.uploader.upload_stream(
      { folder, resource_type: 'auto', ...options },
      (error, result) => {
        if (error) return reject(error);
        resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );
    stream.end(buffer);
  });
};

/**
 * Delete a file from Cloudinary by public_id.
 */
const deleteFile = async (publicId, resourceType = 'auto') => {
  const cld = getCloudinary();
  if (!cld) return;
  try {
    await cld.uploader.destroy(publicId, { resource_type: resourceType });
  } catch (err) {
    console.error('[Cloudinary] Delete failed:', err.message);
  }
};

/**
 * Build a Multer storage engine that uploads to Cloudinary.
 * Requires the `multer-storage-cloudinary` package to be installed.
 * Falls back to null if not available, triggering disk storage fallback.
 */
const getCloudinaryStorage = (folder = 'edu_manage') => {
  if (!isConfigured()) return null;
  try {
    const { CloudinaryStorage } = require('multer-storage-cloudinary');
    const cld = getCloudinary();
    if (!cld) return null;
    return new CloudinaryStorage({
      cloudinary: cld,
      params: {
        folder,
        resource_type: 'auto',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx', 'ppt', 'pptx', 'mp4', 'mov', 'avi', 'webm', 'txt'],
      },
    });
  } catch (err) {
    console.warn('[Cloudinary] multer-storage-cloudinary not installed — using disk storage.');
    return null;
  }
};

module.exports = { isConfigured, uploadBuffer, deleteFile, getCloudinaryStorage };
