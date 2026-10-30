// NEXT_PUBLIC_SITE_URL is public configuration (never a secret).
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');
export const SITE_NAME = 'Sheggar Wheels';
export const SITE_DESCRIPTION =
  'Peer-to-peer car rental in Addis Ababa. Browse cars from local owners, book with a simulated TeleBirr checkout, or list your own car. Portfolio demo with simulated data.';
