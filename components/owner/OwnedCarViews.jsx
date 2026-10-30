'use client';
// Client wrappers so the render-prop `children(car)` never has to cross the server -> client
// boundary (functions cannot be serialized as props from Server Components).
import AvailabilityManager from './AvailabilityManager';
import CarBookingsClient from './CarBookingsClient';
import CarForm from './CarForm';
import OwnedCar from './OwnedCar';

export function EditCarView({ carId }) {
  return <OwnedCar carId={carId} section="edit">{(car) => <CarForm key={car.id} car={car} />}</OwnedCar>;
}

export function AvailabilityView({ carId }) {
  return <OwnedCar carId={carId} section="availability">{(car) => <AvailabilityManager key={car.id} car={car} />}</OwnedCar>;
}

export function CarBookingsView({ carId }) {
  return <OwnedCar carId={carId} section="bookings">{(car) => <CarBookingsClient key={car.id} car={car} />}</OwnedCar>;
}
