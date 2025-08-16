const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const Tour = require('../models/tourModel');
const factory = require('./handleFactory');
const multer = require('multer');
const sharp = require('sharp');
import type { Request, Response, NextFunction } from 'express';
import type { FileFilterCallback } from 'multer';

const multerStorage = multer.memoryStorage();

const multerFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400));
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadTourImages = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 },
]);

// upload.single('image') req.file
// upload.array('images', 5) req.files

exports.resizeTourImages = catchAsync(
  async (req: Request, _res: Response, next: NextFunction) => {
    const files = req.files as
      | { [fieldname: string]: Express.Multer.File[] }
      | Express.Multer.File[]
      | undefined;

    if (!files || Array.isArray(files)) return next();
    if (!files.imageCover || !files.images) return next();

    // 1) Cover image
    req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;
    await sharp(files.imageCover[0].buffer)
      .resize(2000, 1333)
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toFile(`public/img/tours/${req.body.imageCover}`);

    // 2) Images
    req.body.images = [] as string[];

    await Promise.all(
      files.images.map(async (file: Express.Multer.File, i: number) => {
        const filename = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;

        await sharp(file.buffer)
          .resize(2000, 1333)
          .toFormat('jpeg')
          .jpeg({ quality: 90 })
          .toFile(`public/img/tours/${filename}`);

        (req.body.images as string[]).push(filename);
      })
    );

    next();
  }
);

exports.aliasTopTours = (req: Request, _res: Response, next: NextFunction) => {
  (req.query as any).limit = '5';
  (req.query as any).sort = '-ratingsAverage,price';
  (req.query as any).fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

/**
 * Get all tours
 * @route GET /tours
 * @group Tour
 * @returns {object} 200 - An array of tour objects
 */
exports.getAllTours = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const features = new APIFeatures(Tour.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const tours = await features.query;

    res.status(200).json({
      status: 'success',
      results: tours.length,
      data: { tours },
    });
  }
);
/**
 * Get a tour by ID
 * @route GET /tours/{id}
 * @group Tour
 * @param {string} id.path.required - tour id
 * @returns {object} 200 - Tour object
 */
exports.getTour = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const tour = await Tour.findById(req.params.id)
      .populate('reviews')
      .select('-__v');
    if (!tour) {
      return next(new AppError('No tour found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: { tour },
    });
  }
);
/**
 * Create a new tour
 * @route POST /tours
 * @group Tour
 * @param {string} name.body.required - name
 * @param {number} price.body.required - price
 * @returns {object} 201 - Created tour object
 */
exports.createTour = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const newTour = await Tour.create(req.body);
    res.status(201).json({ status: 'success', data: { tour: newTour } });
  }
);
/**
 * Update a tour by ID
 * @route PATCH /tours/{id}
 * @group Tour
 * @param {string} id.path.required - tour id
 * @returns {object} 200 - Updated tour object
 */
exports.updateTour = factory.updateOne(Tour);
/**
 * Delete a tour by ID
 * @route DELETE /tours/{id}
 * @group Tour
 * @param {string} id.path.required - tour id
 * @returns {object} 204 - No content
 */
exports.deleteTour = factory.deleteOne(Tour);

exports.getTourStats = catchAsync(
  async (_req: Request, res: Response, _next: NextFunction) => {
    const stats = await Tour.aggregate([
      { $match: { ratingsAverage: { $gte: 4.5 } } },
      {
        $group: {
          _id: { $toUpper: '$difficulty' },
          numTours: { $sum: 1 },
          numRatings: { $sum: '$ratingsQuantity' },
          avgRating: { $avg: '$ratingsAverage' },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
        },
      },
      { $sort: { avgPrice: 1 } },
    ]);

    res.status(200).json({ status: 'success', data: { stats } });
  }
);

exports.getMonthlyPlan = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const year = Number(req.params.year);

    const plan = await Tour.aggregate([
      { $unwind: '$startDates' },
      {
        $match: {
          startDates: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`),
          },
        },
      },
      {
        $group: {
          _id: { $month: '$startDates' },
          numTourStarts: { $sum: 1 },
          tours: { $push: '$name' },
        },
      },
      { $addFields: { month: '$_id' } },
      { $project: { _id: 0 } },
      { $sort: { numTourStarts: -1 } },
      { $limit: 12 },
    ]);

    res.status(200).json({ status: 'success', data: { plan } });
  }
);

// /tours-distance/233/center/34.111745,-113491/unit/m
exports.getToursWithin = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { distance, latlng, unit } = req.params as unknown as {
      distance: string;
      latlng: string;
      unit: 'mi' | 'km' | string;
    };
    const [latStr, lngStr] = latlng.split(',');
    const lat = parseFloat(latStr);
    const lng = parseFloat(lngStr);

    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      return next(
        new AppError(
          'Please provide latitude and longitude in the format lat,lng',
          400
        )
      );
    }

    const dist = parseFloat(distance);
    // Convert distance to radians
    const radius = unit === 'mi' ? dist / 3963.2 : dist / 6378.1;

    const tours = await Tour.find({
      startLocation: {
        $geoWithin: { $centerSphere: [[lng, lat], radius] },
      },
    });

    res.status(200).json({
      status: 'success',
      results: tours.length,
      data: { data: tours },
    });
  }
);

exports.getDistances = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { latlng, unit } = req.params as unknown as {
      latlng: string;
      unit: 'mi' | 'km' | string;
    };
    const [latStr, lngStr] = latlng.split(',');
    const lat = parseFloat(latStr);
    const lng = parseFloat(lngStr);

    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      return next(
        new AppError(
          'Please provide latitude and longitude in the format lat,lng',
          400
        )
      );
    }

    const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

    const distances = await Tour.aggregate([
      {
        $geoNear: {
          near: { type: 'Point', coordinates: [lng, lat] },
          distanceField: 'distance',
          distanceMultiplier: multiplier,
          key: 'startLocation',
        },
      },
      { $project: { distance: 1, name: 1 } },
    ]);

    res.status(200).json({ status: 'success', data: { data: distances } });
  }
);
