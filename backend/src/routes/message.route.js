import express from 'express'
import { protectRoute } from '../middlewares/auth.middleware.js';
const router = express.Router();
import { getUsersForSidebar } from '../controllers/message.controller.js';
import { getMessages } from '../controllers/message.controller.js';
import { sendMessages } from '../controllers/message.controller.js';

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
router.get('/:id', protectRoute, validateObjectId, getMessages);
router.post('/send/:id', protectRoute, validateObjectId, sendMessages);

export default router;