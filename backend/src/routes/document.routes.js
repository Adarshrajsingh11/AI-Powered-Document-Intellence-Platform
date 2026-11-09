import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { Router } from 'express';
import multer from 'multer';
import { env } from '../config/env.js';
import { get, list, remove, upload } from '../controllers/document.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { ApiError } from '../utils/ApiError.js';
import { ALLOWED_EXTENSIONS, fixFileName, getExtension, isAllowedFile } from '../utils/fileValidation.js';
import { documentIdParams } from '../validators/document.validator.js';

const storage = multer.diskStorage({
  destination(req, file, cb) {
    const dir = path.join(env.UPLOAD_DIR, req.user.id); // one folder per user
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => cb(null, `${randomUUID()}${getExtension(fixFileName(file.originalname))}`),
});

const uploader = multer({
  storage,
  limits: { fileSize: env.MAX_FILE_SIZE_BYTES, files: 1 },
  fileFilter(req, file, cb) {
    if (!isAllowedFile(fixFileName(file.originalname), file.mimetype)) {
      return cb(new ApiError(400, `Unsupported file type. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}`));
    }
    return cb(null, true);
  },
});

const router = Router();
router.use(authenticate); // runs before multer so unauthenticated users cannot write files

router.post('/', uploader.single('file'), upload);
router.get('/', list);
router.get('/:id', validateRequest({ params: documentIdParams }), get);
router.delete('/:id', validateRequest({ params: documentIdParams }), remove);

export default router;
