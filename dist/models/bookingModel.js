"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const bookingSchema = new mongoose_1.Schema({
    tour: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Tour',
        required: [true, 'Booking must belong to a Tour!'],
    },
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
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
bookingSchema.pre(/^find/, function (next) {
    this.populate('user').populate({
        path: 'tour',
        select: 'name',
    });
    next();
});
const Booking = (0, mongoose_1.model)('Booking', bookingSchema);
module.exports = Booking;
