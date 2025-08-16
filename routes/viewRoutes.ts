const express = require('express');
const viewsController = require('../controllers/viewsController');
const authController = require('../controllers/authController');
const bookingController = require('../controllers/bookingController');
import type { Request, Response, NextFunction } from 'express';

const router = express.Router();

/**
 * @swagger
 * /signup:
 *   get:
 *     summary: Render signup form
 *     tags: [View]
 *     responses:
 *       200:
 *         description: Signup form rendered
 */
router.get('/signup', authController.isLoggedin, viewsController.getSignupForm);
/**
 * @swagger
 * /login:
 *   get:
 *     summary: Render login form
 *     tags: [View]
 *     responses:
 *       200:
 *         description: Login form rendered
 */
router.get('/login', authController.isLoggedin, viewsController.getLoginForm);
/**
 * @swagger
 * /:
 *   get:
 *     summary: Render overview page
 *     tags: [View]
 *     responses:
 *       200:
 *         description: Overview page rendered
 */
router.get(
  '/',
  bookingController.createBookingCheckout,
  authController.isLoggedin,
  viewsController.getOverview
);
/**
 * @swagger
 * /tour/{slug}:
 *   get:
 *     summary: Render tour detail page
 *     tags: [View]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Tour detail page rendered
 */
router.get(
  '/tour/:slug',
  authController.isLoggedin,
  viewsController.getTourPage
);
/**
 * @swagger
 * /me:
 *   get:
 *     summary: Render account page
 *     tags: [View]
 *     responses:
 *       200:
 *         description: Account page rendered
 */
router.get('/me', authController.protect, viewsController.getAccount);
/**
 * @swagger
 * /my-tours:
 *   get:
 *     summary: Render user's booked tours page
 *     tags: [View]
 *     responses:
 *       200:
 *         description: My tours page rendered
 */
router.get('/my-tours', authController.protect, viewsController.getMyTours);
/**
 * @swagger
 * /submit-user-data:
 *   post:
 *     summary: Update user data from account page
 *     tags: [View]
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: User data updated and account page rendered
 */
router.post(
  '/submit-user-data',
  authController.protect,
  viewsController.updateUserData
);

module.exports = router;
