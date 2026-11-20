const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const multer = require('multer');
const config = require('../config');
const { badRequest } = require('../lib/errors');

fs.mkdirSync(config.uploadDir, { recursive: true });

const ALLOWED = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/avif': '.avif',
};

// Magic-number signatures so a renamed executable can't pass as an image.
function looksLikeImage(buf) {
  if (!buf || buf.length < 12) return false;
  const hex = buf.subarray(0, 12).toString('hex');
  return (
    hex.startsWith('ffd8ff') || // jpeg
    hex.startsWith('89504e470d0a1a0a') || // png
    (hex.startsWith('52494646') && buf.subarray(8, 12).toString() === 'WEBP') || // webp
    buf.subarray(4, 12).toString().startsWith('ftypavi') // avif
  );
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, config.uploadDir),
  filename: (req, file, cb) => {
    const ext = ALLOWED[file.mimetype];
    cb(null, `${Date.now().toString(36)}-${crypto.randomBytes(8).toString('hex')}${ext}`);
  },
});

const uploader = multer({
  storage,
  limits: { fileSize: config.maxUploadMb * 1024 * 1024, files: 10 },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED[file.mimetype]) {
      return cb(badRequest('Only JPG, PNG, WebP or AVIF images are allowed'));
    }
    cb(null, true);
  },
});

/** Accepts up to 10 images in field "images", verifies their content, and returns public URLs. */
function imageUpload(req, res, next) {
  uploader.array('images', 10)(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        const msg =
          err.code === 'LIMIT_FILE_SIZE'
            ? `Each image must be smaller than ${config.maxUploadMb} MB`
            : err.message;
        return next(badRequest(msg));
      }
      return next(err);
    }
    const files = req.files || [];
    for (const f of files) {
      const fd = fs.openSync(f.path, 'r');
      const buf = Buffer.alloc(12);
      fs.readSync(fd, buf, 0, 12, 0);
      fs.closeSync(fd);
      if (!looksLikeImage(buf)) {
        files.forEach((x) => fs.rmSync(x.path, { force: true }));
        return next(badRequest(`"${f.originalname}" is not a valid image file`));
      }
    }
    req.uploaded = files.map((f) => ({ url: `/uploads/${f.filename}`, name: f.originalname, size: f.size }));
    next();
  });
}

/** Delete a previously uploaded local file (ignores remote URLs and anything outside the upload dir). */
function removeUploadedFile(url) {
  if (!url || !url.startsWith('/uploads/')) return;
  const file = path.join(config.uploadDir, path.basename(url));
  if (file.startsWith(config.uploadDir)) fs.rm(file, { force: true }, () => {});
}

module.exports = { imageUpload, removeUploadedFile };
