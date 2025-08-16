const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Tour = require('../models/tourModel');
const Booking = require('../models/bookingModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handleFactory');
import type { Request, Response, NextFunction } from 'express';

/**
 * Get Stripe checkout session for a tour
 * @route GET /bookings/checkout-session/{tourId}
 * @group Booking
 * @param {string} tourId.path.required - tour id
 * @returns {object} 200 - Stripe session object
 */
exports.getCheckoutSession = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // 1) Get the currently booked tour
    const tour = await Tour.findById((req.params as any).tourId);
    console.log(tour);

    if (!tour) {
      return next(new AppError('No tour found with that ID', 404));
    }

    // 2) Create checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      success_url: `${req.protocol}://${req.get('host')}/my-tours/?tour=${
        (req.params as any).tourId
      }&user=${(req.user as any).id}&price=${tour.price}`,
      cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
      customer_email: (req.user as any).email,
      client_reference_id: (req.params as any).tourId,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${tour.name} Tour`,
              description: tour.summary,
              images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
            },
            unit_amount: tour.price * 100,
          },
          quantity: 1,
        },
      ],
    });

    // 3) Create session as response
    res.status(200).json({
      status: 'success',
      session,
    });
  }
);

exports.createBookingCheckout = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { tour, user, price } = req.query;

    if (!tour && !user && !price) return next();
    await Booking.create({ tour, user, price });

    res.redirect(req.originalUrl.split('?')[0]);
  }
);

/**
 * Get all bookings
 * @route GET /bookings
 * @group Booking
 * @returns {object} 200 - An array of booking objects
 */
exports.getAllBookings = catchAsync(
  async (_req: Request, res: Response, _next: NextFunction) => {
    const bookings = await Booking.find();
    res.status(200).json({
      status: 'success',
      results: bookings.length,
      data: {
        bookings,
      },
    });
  }
);

/**
 * Create a new booking
 * @route POST /bookings
 * @group Booking
 * @param {string} tour.body.required - tour id
 * @param {string} user.body.required - user id
 * @param {number} price.body.required - price
 * @returns {object} 201 - Created booking object
 */
exports.createBooking = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const newBooking = await Booking.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        booking: newBooking,
      },
    });
  }
);

/**
 * Get a booking by ID
 * @route GET /bookings/{id}
 * @group Booking
 * @param {string} id.path.required - booking id
 * @returns {object} 200 - Booking object
 */
exports.getBooking = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const booking = await Booking.findById((req.params as any).id).select(
      '-__v'
    );

    if (!booking) {
      return next(new AppError('No booking found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        booking,
      },
    });
  }
);

/**
 * Update a booking by ID
 * @route PATCH /bookings/{id}
 * @group Booking
 * @param {string} id.path.required - booking id
 * @returns {object} 200 - Updated booking object
 */
exports.updateBooking = factory.updateOne(Booking);

/**
 * Delete a booking by ID
 * @route DELETE /bookings/{id}
 * @group Booking
 * @param {string} id.path.required - booking id
 * @returns {object} 204 - No content
 */
exports.deleteBooking = factory.deleteOne(Booking);
