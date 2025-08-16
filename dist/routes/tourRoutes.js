"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require('express');
const tourController = require('./../controllers/tourController');
const authController = require('./../controllers/authController');
const reviewRouter = require('./../routes/reviewRoutes');
const router = express.Router();
router.use('/:tourId/reviews', reviewRouter);
/**
 * @swagger
 * /tours/top-5-cheap:
 *   get:
 *     summary: Get top 5 cheap tours
 *     tags: [Tour]
 *     responses:
 *       200:
 *         description: List of top 5 cheap tours
 */
router
    .route('/top-5-cheap')
    .get(tourController.aliasTopTours, tourController.getAllTours);
/**
 * @swagger
 * /tours/tour-stats:
 *   get:
 *     summary: Get tour statistics
 *     tags: [Tour]
 *     responses:
 *       200:
 *         description: Tour statistics
 */
router.route('/tour-stats').get(tourController.getTourStats);
/**
 * @swagger
 * /tours/monthly-plan/{year}:
 *   get:
 *     summary: Get monthly plan for tours
 *     tags: [Tour]
 *     parameters:
 *       - in: path
 *         name: year
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Monthly plan data
 */
router
    .route('/monthly-plan/:year')
    .get(authController.protect, authController.restrictTo('admin', 'lead-guide', 'guide'), tourController.getMonthlyPlan);
/**
 * @swagger
 * /tours/tours-within/{distance}/center/{latlng}/unit/{unit}:
 *   get:
 *     summary: Get tours within a certain distance
 *     tags: [Tour]
 *     parameters:
 *       - in: path
 *         name: distance
 *         required: true
 *         schema:
 *           type: number
 *       - in: path
 *         name: latlng
 *         required: true
 *         schema:
 *           type: string
 *         description: Latitude and longitude in the format lat,lng
 *       - in: path
 *         name: unit
 *         required: true
 *         schema:
 *           type: string
 *           enum: [mi, km]
 *     responses:
 *       200:
 *         description: List of tours within the specified distance
 */
router
    .route('/tours-within/:distance/center/:latlng/unit/:unit')
    .get(tourController.getToursWithin);
/**
 * @swagger
 * /tours/distances/{latlng}/unit/{unit}:
 *   get:
 *     summary: Get distances to all tours from a point
 *     tags: [Tour]
 *     parameters:
 *       - in: path
 *         name: latlng
 *         required: true
 *         schema:
 *           type: string
 *         description: Latitude and longitude in the format lat,lng
 *       - in: path
 *         name: unit
 *         required: true
 *         schema:
 *           type: string
 *           enum: [mi, km]
 *     responses:
 *       200:
 *         description: Distances to all tours
 */
router.route('/distances/:latlng/unit/:unit').get(tourController.getDistances);
/**
 * @swagger
 * /tours:
 *   get:
 *     summary: Get all tours
 *     tags: [Tour]
 *     responses:
 *       200:
 *         description: List of all tours
 *   post:
 *     summary: Create a new tour
 *     tags: [Tour]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               duration:
 *                 type: number
 *               maxGroupSize:
 *                 type: number
 *               difficulty:
 *                 type: string
 *               price:
 *                 type: number
 *     responses:
 *       201:
 *         description: Tour created successfully
 */
router
    .route('/')
    .get(tourController.getAllTours)
    .post(authController.protect, authController.restrictTo('admin', 'lead-guide'), tourController.createTour);
/**
 * @swagger
 * /tours/{id}:
 *   get:
 *     summary: Get a tour by ID
 *     tags: [Tour]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Tour data
 *   patch:
 *     summary: Update a tour by ID
 *     tags: [Tour]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *     responses:
 *       200:
 *         description: Tour updated successfully
 *   delete:
 *     summary: Delete a tour by ID
 *     tags: [Tour]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Tour deleted successfully
 */
router
    .route('/:id')
    .get(tourController.getTour)
    .patch(authController.protect, authController.restrictTo('admin', 'lead-guide'), tourController.uploadTourImages, tourController.resizeTourImages, tourController.updateTour)
    .delete(authController.protect, authController.restrictTo('admin', 'lead-guide'), tourController.deleteTour);
module.exports = router;
