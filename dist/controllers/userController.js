"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const factory = require('./handleFactory');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const multer = require('multer');
const sharp = require('sharp');
const multerStorage = multer.memoryStorage();
const multerFilter = (_req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        // fixed syntax
        cb(null, true);
    }
    else {
        cb(new AppError('Not an image! Please upload only images.', 400));
    }
};
const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter,
});
exports.uploadUserPhoto = upload.single('photo');
exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
    if (!req.file)
        return next();
    req.file.filename =
        `user-${req.user.id}-${Date.now()}.jpeg`;
    await sharp(req.file.buffer)
        .resize(500, 500)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/users/${req.file.filename}`);
    next();
});
const filterObj = (obj, ...allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach((el) => {
        if (allowedFields.includes(el))
            newObj[el] = obj[el];
    });
    return newObj;
};
/**
 * Get all users
 * @route GET /users
 * @group User
 * @returns {object} 200 - An array of user objects
 */
exports.getAllUsers = catchAsync(async (_req, res, _next) => {
    const users = await User.find();
    res.status(200).json({
        status: 'success',
        results: users.length,
        data: {
            users,
        },
    });
});
/**
 * Get current user profile
 * @route GET /me
 * @group User
 * @returns {object} 200 - User profile data
 */
exports.getMe = (req, _res, next) => {
    req.params.id = req.user.id;
    next();
};
/**
 * Get a user by ID
 * @route GET /users/{id}
 * @group User
 * @param {string} id.path.required - user id
 * @returns {object} 200 - User object
 */
exports.getUser = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.params.id);
    if (!user) {
        return next(new AppError('No user found with that ID', 404));
    }
    res.status(200).json({
        status: 'success',
        data: {
            user,
        },
    });
});
/**
 * Update current user profile
 * @route PATCH /updateMe
 * @group User
 * @param {string} name.body - name
 * @param {string} email.body - email
 * @returns {object} 200 - Updated user object
 */
exports.updateMe = catchAsync(async (req, res, next) => {
    if (req.body.password || req.body.passwordConfirm) {
        return next(new AppError('This route is not for password updates. Please use /updateMyPassword.', 400));
    }
    const filteredBody = filterObj(req.body, 'name', 'email');
    if (req.file)
        filteredBody.photo = req.file.filename;
    const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
        new: true,
        runValidators: true,
    });
    res.status(200).json({
        status: 'success',
        data: {
            user: updatedUser,
        },
    });
});
/**
 * Delete current user
 * @route DELETE /deleteMe
 * @group User
 * @returns {object} 204 - No content
 */
exports.deleteMe = factory.deleteOne(User);
/**
 * Create a new user (admin only)
 * @route POST /users
 * @group User
 * @param {string} name.body.required - name
 * @param {string} email.body.required - email
 * @param {string} password.body.required - password
 * @param {string} passwordConfirm.body.required - password confirmation
 * @returns {object} 201 - Created user object
 */
exports.createUser = (_req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route is not defined yet.',
    });
};
/**
 * Update a user by ID (admin only)
 * @route PATCH /users/{id}
 * @group User
 * @param {string} id.path.required - user id
 * @returns {object} 200 - Updated user object
 */
exports.updateUser = factory.updateOne(User);
/**
 * Delete a user by ID (admin only)
 * @route DELETE /users/{id}
 * @group User
 * @param {string} id.path.required - user id
 * @returns {object} 204 - No content
 */
exports.deleteUser = factory.deleteOne(User);
