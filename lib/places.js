// Sample neighbourhood centres for Addis Ababa. These are approximate, seeded
// coordinates for the demo - NOT live vehicle positions.
export const CITY = 'Addis Ababa';

export const NEIGHBOURHOODS = [
  { name: 'Ayat', lat: 9.023, lng: 38.875 },
  { name: 'Bole', lat: 8.9957, lng: 38.786 },
  { name: 'CMC', lat: 9.015, lng: 38.842 },
  { name: 'Gerji', lat: 8.996, lng: 38.836 },
  { name: 'Kazanchis', lat: 9.0195, lng: 38.7635 },
  { name: 'Lebu', lat: 8.957, lng: 38.719 },
  { name: 'Lideta', lat: 9.009, lng: 38.736 },
  { name: 'Megenagna', lat: 9.021, lng: 38.801 },
  { name: 'Old Airport', lat: 8.984, lng: 38.749 },
  { name: 'Piassa', lat: 9.0365, lng: 38.7515 },
  { name: 'Sarbet', lat: 8.992, lng: 38.7385 },
  { name: 'Summit', lat: 9.0035, lng: 38.863 },
];

export function findNeighbourhood(name) {
  return NEIGHBOURHOODS.find((h) => h.name === name) || null;
}

// Rough bounding box used to validate manually-entered coordinates.
export const ADDIS_BOUNDS = { minLat: 8.8, maxLat: 9.2, minLng: 38.6, maxLng: 39.0 };

/** Predefined sample points used by the *simulated* trip tracker. */
export const SIMULATION_OFFSETS = [
  [0, 0],
  [0.006, 0.004],
  [0.012, 0.011],
  [0.015, 0.02],
  [0.011, 0.03],
  [0.004, 0.035],
];
