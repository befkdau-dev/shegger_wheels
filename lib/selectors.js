// Small pure selectors shared by components (no storage access, safe anywhere).

/** Cars visible publicly: approved AND owned by an active (not suspended) user. */
export function publicCarsFrom(cars, users) {
  return cars.filter((car) => {
    if (car.status !== 'approved') return false;
    const owner = users.find((u) => u.id === car.ownerId);
    return !!owner && owner.status === 'active';
  });
}

/** Map of carId -> { average, count } using only real reviews. */
export function ratingMap(reviews) {
  const map = new Map();
  for (const r of reviews) {
    const entry = map.get(r.carId) || { sum: 0, count: 0 };
    entry.sum += r.rating;
    entry.count += 1;
    map.set(r.carId, entry);
  }
  const out = new Map();
  for (const [id, { sum, count }] of map) out.set(id, { average: Math.round((sum / count) * 10) / 10, count });
  return out;
}

export function carTitle(car) {
  return car ? `${car.year} ${car.make} ${car.model}` : 'Unknown car';
}

export function userName(users, id) {
  return users.find((u) => u.id === id)?.name || 'Unknown user';
}
