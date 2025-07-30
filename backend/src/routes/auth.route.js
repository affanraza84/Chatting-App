import express from 'express'
import multer from 'multer'
import { signup, login, logout, updateProfile, checkAuth } from '../controllers/auth.controller.js'
import { protectRoute } from '../middlewares/auth.middleware.js'

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: multer.memoryStorage() });

router.use((req, res, next) => {
    console.log(`Route accessed: ${req.method} ${req.originalUrl}`);
    next();
});

router.post('/signup', signup)
router.post('/login', login)
router.post('/logout', logout)

router.put('/update-profile', protectRoute, upload.single('profilePic'), updateProfile);


router.get('/check', protectRoute, checkAuth)

export default router;
