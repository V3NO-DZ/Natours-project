import mongoose, { Schema, model, Document, Types } from 'mongoose';

export interface BookingDocument extends Document {
  tour: Types.ObjectId;
  user: Types.ObjectId;
  price: number;
  createdAt: Date;
  paid: boolean;
}

const bookingSchema = new Schema<BookingDocument>({
  tour: {
    type: Schema.Types.ObjectId,
    ref: 'Tour',
    required: [true, 'Booking must belong to a Tour!'],
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Booking must belong to a User!'],
  },
  price: {
    type: Number,
    require: [true, 'Booking must have a price.'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  paid: {
    type: Boolean,
    default: true,
  },
});

bookingSchema.pre(/^find/, function (this: any, next) {
  this.populate('user').populate({
    path: 'tour',
    select: 'name',
  });
  next();
});

const Booking = model<BookingDocument>('Booking', bookingSchema);

module.exports = Booking;
