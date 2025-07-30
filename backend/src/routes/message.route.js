import express from 'express'
import { protectRoute } from '../middlewares/auth.middleware.js'
import { getUsersForSidebar, getMessages, sendMessages } from '../controllers/message.controller.js'

const router = express.Router();

// Middleware to validate MongoDB ObjectId format
const validateObjectId = (req, res, next) => {
    const { id } = req.params;

    // MongoDB ObjectId validation regex
    const objectIdRegex = /^[0-9a-fA-F]{24}$/;

    if (!objectIdRegex.test(id)) {
        console.log(`[MESSAGE] ❌ Invalid ObjectId format: ${id}`);
        return res.status(400).json({
            success: false,
            message: 'Invalid user ID format',
            error: 'INVALID_ID_FORMAT'
        });
    }

    next();
};

// Routes
router.get('/users', protectRoute, getUsersForSidebar);
router.get('/:id', protectRoute, getMessages);
router.post('/send/:id', protectRoute, sendMessages);

export default router;