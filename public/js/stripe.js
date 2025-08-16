/* eslint-disable */
 import { showAlert } from './alerts.js';
const stripe = Stripe(
  'pk_test_51RuubYFJQFflLNKXNq9NRfODKAG7AVzxENGN8iwakm6DqX3wWyYMPcjy8oTO5q1CGhFUHGUirWK6TDnfqXmMtygx00aVUL991G'
);

export const bookTour = async (tourId) => {
  try {
    // 1) Get checkout session from API
    const res = await fetch(`/api/v1/bookings/checkout-session/${tourId}`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

    const sessionData = await res.json();
    console.log(sessionData);

    // 2) Create checkout form + charge credit card
    await stripe.redirectToCheckout({
      sessionId: sessionData.session.id,
    });
  } catch (err) {
    console.error(err);
    showAlert('error', err.message || 'Something went wrong!');
  }
};

const bookBtn = document.getElementById('book-tour');

if (bookBtn) {
  bookBtn.addEventListener('click', (e) => {
    e.target.textContent = 'Processing...';
    const { tourId } = e.target.dataset;
    bookTour(tourId);
  });
}
