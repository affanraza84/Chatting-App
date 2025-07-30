import User from '../models/user.model.js'
import bcrypt from 'bcryptjs'
import { generateToken } from '../lib/utils.js'
import cloudinary from '../lib/cloudinary.js'

export const signup = async (req, res) => {
    const { fullName, email, password } = req.body;

    console.log(`[AUTH] 📝 Signup attempt for email: ${email}`);

    try {
        // Validation
        if (!fullName || !email || !password) {
            console.log(`[AUTH] ❌ Signup failed - Missing fields: fullName=${!!fullName}, email=${!!email}, password=${!!password}`);
            return res.status(400).json({
                success: false,
                message: 'All fields are required',
                error: 'MISSING_FIELDS'
            });
        }

        if (password.length < 6) {
            console.log(`[AUTH] ❌ Signup failed - Password too short: ${password.length} characters`);
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters',
                error: 'PASSWORD_TOO_SHORT'
            });
        }

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            console.log(`[AUTH] ❌ Signup failed - Email already exists: ${email}`);
            return res.status(400).json({
                success: false,
                message: 'User already exists',
                error: 'EMAIL_EXISTS'
            });
        }

        // Hash password and create user
        const salt = bcrypt.genSaltSync(12);
        const hashedPassword = bcrypt.hashSync(password, salt);

        const newUser = new User({
            fullName,
            email,
            password: hashedPassword,
        });

        await newUser.save();
        const token = generateToken(newUser._id, res);

        console.log(`[AUTH] ✅ User created successfully: ${email} (ID: ${newUser._id})`);

        return res.status(201).json({
            _id: newUser._id,
            fullName: newUser.fullName,
            email: newUser.email,
            profilePic: newUser.profilePic,
            token: token // Include token for cross-domain support
        });

    } catch (error) {
        console.error(`[AUTH] ❌ Signup error for ${email}:`, error.message);
        console.error(`[AUTH] Stack trace:`, error.stack);

        return res.status(500).json({
            success: false,
            message: 'Internal server error during signup',
            error: 'INTERNAL_ERROR'
        });
    }
}

export const login = async (req, res) => {
    const { email, password } = req.body;

    console.log(`[AUTH] 🔐 Login attempt for email: ${email}`);

    try {
        // Validation
        if (!email || !password) {
            console.log(`[AUTH] ❌ Login failed - Missing fields: email=${!!email}, password=${!!password}`);
            return res.status(400).json({
                success: false,
                message: 'All fields are required',
                error: 'MISSING_FIELDS'
            });
        }

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (!existingUser) {
            console.log(`[AUTH] ❌ Login failed - User not found: ${email}`);
            return res.status(400).json({
                success: false,
                message: 'Invalid credentials',
                error: 'INVALID_CREDENTIALS'
            });
        }

        // Verify password
        const isPasswordCorrect = await bcrypt.compare(password, existingUser.password);
        if (!isPasswordCorrect) {
            console.log(`[AUTH] ❌ Login failed - Invalid password for: ${email}`);
            return res.status(400).json({
                success: false,
                message: 'Invalid credentials',
                error: 'INVALID_CREDENTIALS'
            });
        }

        // Generate token and login
        const token = generateToken(existingUser._id, res);

        console.log(`[AUTH] ✅ Login successful: ${email} (ID: ${existingUser._id})`);

        return res.status(200).json({
            _id: existingUser._id,
            fullName: existingUser.fullName,
            email: existingUser.email,
            profilePic: existingUser.profilePic,
            token: token // Include token for cross-domain support
        });

    } catch (error) {
        console.error(`[AUTH] ❌ Login error for ${email}:`, error.message);
        console.error(`[AUTH] Stack trace:`, error.stack);

        return res.status(500).json({
            success: false,
            message: 'Internal server error during login',
            error: 'INTERNAL_ERROR'
        });
    }
}

export const logout = (req, res) => {
    console.log(`[AUTH] 🚪 Logout attempt for user: ${req.user?._id || 'unknown'}`);

    try {
        if (req.cookies.token) {
            res.clearCookie('token', {
                httpOnly: true,
                sameSite: 'strict',
                secure: process.env.NODE_ENV === 'production',
            });

            console.log(`[AUTH] ✅ Logout successful for user: ${req.user?._id || 'unknown'}`);

            return res.status(200).json({
                success: true,
                message: 'Logout successful'
            });
        } else {
            console.log(`[AUTH] ❌ Logout failed - No token found`);
            return res.status(400).json({
                success: false,
                message: 'No token found',
                error: 'NO_TOKEN'
            });
        }
    } catch (error) {
        console.error(`[AUTH] ❌ Logout error:`, error.message);
        console.error(`[AUTH] Stack trace:`, error.stack);

        return res.status(500).json({
            success: false,
            message: 'Internal server error during logout',
            error: 'INTERNAL_ERROR'
        });
    }
}

export const updateProfile = async (req, res) => {
    try {
        console.log("Request received in updateProfile");
        console.log("Request file:", req.file);
        console.log("Request user:", req.user);

        if (!req.file) {
            console.log("No file found in request");
            return res.status(400).json({
                success: false,
                message: 'Profile picture is required'
            });
        }

        console.log("File buffer size:", req.file.buffer.length);

        try {
            const uploadResult = await new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    { folder: 'profile-pics' },
                    (error, result) => {
                        if (error) {
                            console.log("Cloudinary upload error:", error);
                            reject(error);
                        } else {
                            console.log("Cloudinary upload success:", result);
                            resolve(result);
                        }
                    }
                );

                uploadStream.write(req.file.buffer);
                uploadStream.end();
            });

            console.log("Upload complete, updating user");

            const updatedUser = await User.findByIdAndUpdate(
                req.user._id,
                { profilePic: uploadResult.secure_url },
                { new: true }
            );

            console.log("User updated:", updatedUser);

            if (updatedUser) {
                // Remove password from response
                updatedUser.password = undefined;

                return res.status(200).json({
                    success: true,
                    message: 'Profile updated successfully',
                    ...updatedUser.toObject()
                });
            } else {
                return res.status(500).json({
                    success: false,
                    message: 'Failed to update user profile'
                });
            }
        } catch (cloudinaryError) {
            console.log("Error during Cloudinary upload:", cloudinaryError);
            return res.status(500).json({
                success: false,
                message: 'Image upload to cloud storage failed'
            });
        }
    } catch (error) {
        console.log("Update profile error:", error);
        return res.status(500).json({
            success: false,
            message: 'Something went wrong'
        });
    }
}

export const checkAuth = (req, res) => {
    console.log(`[AUTH] 🔍 Auth check for user: ${req.user?._id || 'unauthenticated'}`);

    try {
        if (req.user) {
            console.log(`[AUTH] ✅ Auth check successful for user: ${req.user._id}`);
            return res.status(200).json(req.user);
        } else {
            console.log(`[AUTH] ❌ Auth check failed - User not authenticated`);
            return res.status(401).json({
                success: false,
                message: 'User is not authenticated',
                error: 'NOT_AUTHENTICATED'
            });
        }
    } catch (error) {
        console.error(`[AUTH] ❌ Auth check error:`, error.message);
        console.error(`[AUTH] Stack trace:`, error.stack);

        return res.status(500).json({
            success: false,
            message: 'Internal server error during auth check',
            error: 'INTERNAL_ERROR'
        });
    }
}
