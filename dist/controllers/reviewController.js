"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const factory = require('./handleFactory');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const Review = require('../models/reviewModel');
/**
 * Get all reviews
 * @route GET /reviews
 * @group Review
 * @returns {object} 200 - An array of review objects
 */
exports.getAllReviews = catchAsync(async (req, res) => {
    let filter = {};
    if (req.params.tourId)
        filter = { tour: req.params.tourId };
    const reviews = await Review.find(filter);
    res.status(200).json({
        status: 'success',
        results: reviews.length,
        data: {
            reviews,
        },
    });
});
/**
 * Create a new review
 * @route POST /reviews
 * @group Review
 * @param {string} review.body.required - review text
 * @param {number} rating.body.required - rating
 * @param {string} tour.body.required - tour id
 * @param {string} user.body.required - user id
 * @returns {object} 201 - Created review object
 */
exports.createReview = catchAsync(async (req, res) => {
    if (!req.body.tour)
        req.body.tour = req.params.tourId;
    if (!req.body.user)
        req.body.user = req.user.id;
    const newReview = await Review.create(req.body);
    res.status(201).json({
        status: 'success',
        data: {
            review: newReview,
        },
    });
});
/**
 * Update a review by ID
 * @route PATCH /reviews/{id}
 * @group Review
 * @param {string} id.path.required - review id
 * @returns {object} 200 - Updated review object
 */
exports.updateReview = factory.updateOne(Review);
// exports.updateReview = catchAsync(async (req, res, next) => {
//   const review = await Review.findByIdAndUpdate(req.params.id, req.body, {
//     new: true,
//     runValidators: true,
//   });
//   if (!review) {
//     return next(new AppError('No review found with that ID', 404));
//   }
//   res.status(200).json({
//     status: 'success',
//     data: {
//       review,
//     },
//   });
// });
/**
 * Delete a review by ID
 * @route DELETE /reviews/{id}
 * @group Review
 * @param {string} id.path.required - review id
 * @returns {object} 204 - No content
 */
exports.deleteReview = factory.deleteOne(Review);
// exports.deleteReview = catchAsync(async (req, res, next) => {
//   const review = await Review.findByIdAndDelete(req.params.id);
//   if (!review) {
//     return next(new AppError('No review found with that ID', 404));
//   }
//   res.status(204).json({
//     status: 'success',
//     data: null,
//   });
// });
/**
 * Get a review by ID
 * @route GET /reviews/{id}
 * @group Review
 * @param {string} id.path.required - review id
 * @returns {object} 200 - Review object
 */
exports.getReview = catchAsync(async (req, res, next) => {
    const review = await Review.findById(req.params.id).select('-__v');
    if (!review) {
        return next(new AppError('No review found with that ID', 404));
    }
    res.status(200).json({
        status: 'success',
        data: {
            review,
        },
    });
});
