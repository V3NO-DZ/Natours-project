"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const catchAsync = require('../utils/catchAsync');
const Tour = require('../models/tourModel');
const AppError = require('../utils/appError');
const User = require('./../models/userModel');
const Booking = require('./../models/bookingModel');
/**
 * Render overview page
 * @route GET /
 * @group View
 * @returns {string} 200 - HTML page
 */
exports.getOverview = catchAsync(async (_req, res) => {
    const tours = await Tour.find();
    res.status(200).render('overview', {
        title: 'All Tours',
        tours,
    });
});
/**
 * Render tour detail page
 * @route GET /tour/{slug}
 * @group View
 * @param {string} slug.path.required - tour slug
 * @returns {string} 200 - HTML page
 */
exports.getTourPage = catchAsync(async (req, res, next) => {
    const tour = await Tour.findOne({ slug: req.params.slug }).populate({
        path: 'reviews',
        fields: 'review rating user',
    });
    if (!tour)
        return next(new AppError('There is no tour with that name.', 404));
    res.status(200).render('tour', {
        title: `${tour.name} tour`,
        tour,
    });
});
/**
 * Render login form
 * @route GET /login
 * @group View
 * @returns {string} 200 - HTML page
 */
exports.getLoginForm = catchAsync(async (_req, res) => {
    res.status(200).render('login', {
        title: 'Login into your account',
    });
});
/**
 * Render signup form
 * @route GET /signup
 * @group View
 * @returns {string} 200 - HTML page
 */
exports.getSignupForm = catchAsync(async (_req, res) => {
    res.status(200).render('signup', {
        title: 'Sign up now!',
    });
});
/**
 * Render account page
 * @route GET /me
 * @group View
 * @returns {string} 200 - HTML page
 */
exports.getAccount = (_req, res) => {
    res.status(200).render('account', {
        title: 'Your account',
    });
};
/**
 * Update user data from account page
 * @route POST /submit-user-data
 * @group View
 * @param {string} name.body - name
 * @param {string} email.body - email
 * @returns {string} 200 - HTML page
 */
exports.updateUserData = catchAsync(async (req, res, _next) => {
    const updatedUser = await User.findByIdAndUpdate(req.user.id, {
        name: req.body.name,
        email: req.body.email,
    }, {
        new: true,
        runValidators: true,
    });
    res.status(200).render('account', {
        title: 'Your account',
        user: updatedUser,
    });
});
/**
 * Render user's booked tours page
 * @route GET /my-tours
 * @group View
 * @returns {string} 200 - HTML page
 */
exports.getMyTours = catchAsync(async (req, res, _next) => {
    const bookings = await Booking.find({ user: req.user.id });
    const tourIDs = bookings.map((el) => el.tour);
    const tours = await Tour.find({ _id: { $in: tourIDs } });
    res.status(200).render('overview', {
        title: 'My Tours',
        tours,
    });
});
