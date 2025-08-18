🏔 Natours

Natours is a full-featured tour booking application built with Node.js, Express, TypeScript, and MongoDB.
It allows users to browse, review, and book exciting tours around the world.

The project demonstrates:

Modern backend development practices

RESTful API design

Authentication & authorization

MVC architecture

🔑 Key Features

🔐 User authentication & authorization (JWT, roles: user, admin, guide)

🗺️ Tour browsing with advanced filtering, sorting, and pagination

⭐ User reviews & ratings for tours

💳 Booking system with Stripe payment integration

🔑 Secure password reset & email notifications

🧪 API testing with Postman

📘 RESTful API documented with Swagger

🎨 Responsive UI with Pug templates & custom CSS
🛠 Tech Stack

Backend: Node.js, Express, TypeScript

Database: MongoDB & Mongoose

Templating: Pug

Payments: Stripe API

Authentication: JWT

Email: Nodemailer

Linting: ESLint

🚀 Getting Started

Clone the repo and install dependencies:

git clone https://github.com/yourusername/natours.git
cd natours
npm install


Set up your environment variables (.env file):

MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
STRIPE_SECRET_KEY=your_stripe_key
EMAIL_USER=your_email
EMAIL_PASS=your_password


Run the development server:

npm run dev


Access the app at:
👉 http://localhost:3000
