const mongoose = require('mongoose');
const { Schema, model, Types } = mongoose;
const slugify = require('slugify');

export interface GeoPoint {
  type: 'Point';
  coordinates: number[];
  address?: string;
  description?: string;
}

export interface TourLocation extends GeoPoint {
  day: number;
}

export interface TourDocument {
  name: string;
  slug?: string;
  duration: number;
  maxGroupSize: number;
  difficulty: 'easy' | 'medium' | 'difficult';
  ratingsAverage: number;
  ratingsQuantity: number;
  price: number;
  priceDiscount?: number;
  summary: string;
  description?: string;
  imageCover?: string;
  images?: string[];
  createdAt?: Date;
  startDates?: Date[];
  secretTour: boolean;
  startLocation?: GeoPoint;
  locations?: TourLocation[];
  guides: any[];
  // virtuals
  durationWeeks?: number;
}

const tourSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      maxlength: [40, 'A tour name must have less or equal then 40 characters'],
      minlength: [10, 'A tour name must have more or equal then 10 characters'],
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either: easy, medium, difficult',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
      set: (val: number) => Math.round(val * 10) / 10,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (this: TourDocument, val: number) {
          return val < this.price;
        },
        message: 'Discount price ({VALUE}) should be below regular price',
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a description'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now,
      select: false,
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    guides: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
(tourSchema as any).index({ price: 1, ratingsAverage: -1 });
(tourSchema as any).index({ slug: 1 });
(tourSchema as any).index({ startLocation: '2dsphere' });

// Virtuals
(tourSchema as any).virtual('durationWeeks').get(function (this: TourDocument) {
  return this.duration / 7;
});

(tourSchema as any).virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});

// Document middleware
(tourSchema as any).pre('save', function (this: TourDocument, next: Function) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// (OPTIONAL) Populate guides manually before saving
(tourSchema as any).pre('save', async function (this: any, next: Function) {
  if (!Array.isArray(this.guides)) return next();
  const guidesPromises = this.guides.map((id: any) =>
    mongoose.model('User').findById(id)
  );
  this.guides = await Promise.all(guidesPromises);
  next();
});

// Query middleware
(tourSchema as any).pre(/^find/, function (this: any, next: Function) {
  this.find({ secretTour: { $ne: true } });
  (this as any).start = Date.now();
  next();
});

(tourSchema as any).pre(/^find/, function (this: any, next: Function) {
  this.populate({ path: 'guides', select: '-__v -passwordChangedAt' });
  next();
});

(tourSchema as any).post(
  /^find/,
  function (this: any, _docs: any, next: Function) {
    // console.log(`Query took ${Date.now() - this.start} milliseconds!`);
    next();
  }
);

const Tour = model('Tour', tourSchema);

module.exports = Tour;
