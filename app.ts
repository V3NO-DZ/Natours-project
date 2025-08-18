const xss = require('xss');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const hpp = require('hpp');
const path = require('path');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/ErrorController');
const tourRouter = require('./routes/tourRoutes');
const viewRouter = require('./routes/viewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const cookieParser = require('cookie-parser');

const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('.//swagger'); // Adjust path as needed

import type { Request, Response, NextFunction } from 'express';

const app = express();

app.set('view engine', 'pug');
const rootDir = process.cwd();
app.set('views', path.join(rootDir, 'views'));
app.use(express.static(path.join(rootDir, 'public')));

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", 'https://js.stripe.com'],
      connectSrc: ["'self'", 'https://api.stripe.com'],
      frameSrc: ["'self'", 'https://js.stripe.com', 'https://hooks.stripe.com'],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  })
);

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!',
});
app.use('/api', limiter);

// NoSQL sanitize
const sanitizeNoSQL = (req: Request, _res: Response, next: NextFunction) => {
  const sanitize = (obj: any) => {
    if (!obj || typeof obj !== 'object') return;
    for (const key in obj) {
      if (key.startsWith('$') || key.includes('.')) delete obj[key];
    }
  };
  sanitize(req.body);
  sanitize(req.query);
  sanitize(req.params as any);
  next();
};
app.use(sanitizeNoSQL);

// XSS sanitize
const sanitizeXSS = (req: Request, _res: Response, next: NextFunction) => {
  const sanitize = (obj: any) => {
    if (typeof obj !== 'object' || obj === null) return;
    for (const key in obj) {
      if (typeof (obj as any)[key] === 'string') {
        (obj as any)[key] = xss((obj as any)[key]);
      } else if (typeof (obj as any)[key] === 'object') {
        sanitize((obj as any)[key]);
      }
    }
  };

  req.body = JSON.parse(JSON.stringify(req.body || {}));
  sanitize(req.body);
  sanitize(req.query);
  sanitize(req.params as any);

  next();
};
app.use(sanitizeXSS);

app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// add requestTime
app.use((req: Request, _res: Response, next: NextFunction) => {
  req.requestTime = new Date().toISOString();
  next();
});

app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use((req: Request, _res: Response, next: NextFunction) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server! 🤷`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
