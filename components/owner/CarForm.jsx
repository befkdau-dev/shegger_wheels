'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Field from '@/components/ui/Field';
import { Alert } from '@/components/ui/States';
import { useToast } from '@/components/ui/Toast';
import { createCar, TRANSMISSIONS, updateCar } from '@/lib/cars';
import { findNeighbourhood, NEIGHBOURHOODS } from '@/lib/places';
import { PHOTO_LIBRARY } from '@/lib/photos';

const EMPTY = {
  make: '', model: '', year: new Date().getFullYear() - 3, transmission: 'Automatic', seats: 5,
  neighbourhood: '', latitude: '', longitude: '', pricePerDay: '', photos: [], description: '',
};

/** Create / edit listing form. Writes go through lib/cars.js, which re-checks role + ownership. */
export default function CarForm({ car }) {
  const router = useRouter();
  const { toast } = useToast();
  const editing = !!car;
  const [v, setV] = useState(car ? { ...car } : EMPTY);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');

  const set = (k) => (e) => setV((x) => ({ ...x, [k]: e.target.value }));
  const pickHood = (e) => {
    const h = findNeighbourhood(e.target.value);
    setV((x) => ({ ...x, neighbourhood: e.target.value, latitude: h ? h.lat : x.latitude, longitude: h ? h.lng : x.longitude }));
  };
  const togglePhoto = (src) =>
    setV((x) => ({ ...x, photos: x.photos.includes(src) ? x.photos.filter((p) => p !== src) : [...x.photos, src].slice(0, 6) }));

  const submit = (intent) => (e) => {
    e.preventDefault();
    const res = editing ? updateCar(car.id, v, intent) : createCar(v, intent);
    if (!res.ok) {
      setErrors(res.errors || {});
      setFormError(res.error);
      return;
    }
    const saved = res.car;
    toast(
      saved.status === 'draft'
        ? 'Draft saved.'
        : saved.status === 'pending'
          ? 'Listing submitted for admin review.'
          : 'Listing updated.',
    );
    router.push('/owner/cars');
  };

  const allPhotos = [...new Set([...(v.photos || []), ...PHOTO_LIBRARY.map((p) => p.src)])];
  const labelFor = (src) => PHOTO_LIBRARY.find((p) => p.src === src)?.label || 'Listing photo';
  const isDraftish = !editing || car.status === 'draft';

  return (
    <form className="card" onSubmit={submit('submit')} noValidate aria-label={editing ? 'Edit car listing' : 'New car listing'}>
      {formError ? <Alert type="error" title="Please fix the highlighted fields"><p className="mb-0">{formError}</p></Alert> : null}
      {editing && ['approved', 'inactive'].includes(car.status) ? (
        <Alert type="info" title="Live listing"><p className="mb-0">Changes to a live listing are saved immediately and it stays approved.</p></Alert>
      ) : null}
      {editing && car.status === 'rejected' ? (
        <Alert type="warning" title="This listing was rejected"><p className="mb-0">Fix the issues and save to send it back for review.</p></Alert>
      ) : null}

      <div className="form-grid" style={{ marginTop: 16 }}>
        <Field label="Make" error={errors.make} required>{(p) => <input {...p} className="input" value={v.make} onChange={set('make')} placeholder="Toyota" />}</Field>
        <Field label="Model" error={errors.model} required>{(p) => <input {...p} className="input" value={v.model} onChange={set('model')} placeholder="Corolla" />}</Field>
        <Field label="Year" error={errors.year} required>{(p) => <input {...p} className="input" type="number" inputMode="numeric" value={v.year} onChange={set('year')} />}</Field>
        <Field label="Transmission" error={errors.transmission} required>
          {(p) => <select {...p} className="select" value={v.transmission} onChange={set('transmission')}>{TRANSMISSIONS.map((t) => <option key={t}>{t}</option>)}</select>}
        </Field>
        <Field label="Seats" error={errors.seats} required>{(p) => <input {...p} className="input" type="number" inputMode="numeric" min="2" max="16" value={v.seats} onChange={set('seats')} />}</Field>
        <Field label="Daily price (ETB)" error={errors.pricePerDay} required hint="Whole birr, 500 to 50,000.">{(p) => <input {...p} className="input" type="number" inputMode="numeric" min="500" step="50" value={v.pricePerDay} onChange={set('pricePerDay')} />}</Field>
        <Field label="Neighbourhood" error={errors.neighbourhood} required hint="Picking one fills in sample coordinates.">
          {(p) => (
            <select {...p} className="select" value={v.neighbourhood} onChange={pickHood}>
              <option value="">Choose…</option>
              {NEIGHBOURHOODS.map((h) => <option key={h.name}>{h.name}</option>)}
            </select>
          )}
        </Field>
        <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '0 12px' }}>
          <Field label="Latitude" error={errors.latitude} required>{(p) => <input {...p} className="input" type="number" step="0.0001" value={v.latitude} onChange={set('latitude')} />}</Field>
          <Field label="Longitude" required>{(p) => <input {...p} className="input" type="number" step="0.0001" value={v.longitude} onChange={set('longitude')} />}</Field>
        </div>
        <Field className="full" label="Description" error={errors.description} required hint={`${(v.description || '').length}/600 characters`}>
          {(p) => <textarea {...p} className="textarea" value={v.description} onChange={set('description')} />}
        </Field>
      </div>

      <fieldset aria-describedby="photo-hint">
        <legend className="label">Photos (select 1 to 6)</legend>
        <p id="photo-hint" className="small muted">This demo does not upload files. Choose from the built-in placeholder library; the first selected photo is the cover.</p>
        <div className="photo-picker">
          {allPhotos.map((src) => {
            const checked = v.photos.includes(src);
            return (
              <label key={src} className="photo-option">
                <input type="checkbox" checked={checked} onChange={() => togglePhoto(src)} aria-label={labelFor(src)} />
                <Image src={src} alt="" width={160} height={100} />
                {checked ? <span className="tick" aria-hidden="true">✓</span> : null}
              </label>
            );
          })}
        </div>
        {errors.photos ? <span className="field-error" role="alert">{errors.photos}</span> : null}
      </fieldset>

      <div className="row" style={{ marginTop: 20 }}>
        <button type="submit" className="btn btn-accent btn-lg">
          {editing ? (['approved', 'inactive'].includes(car.status) ? 'Save changes' : 'Save and submit for review') : 'Submit for review'}
        </button>
        {isDraftish ? <button type="button" className="btn btn-outline btn-lg" onClick={submit('draft')}>Save as draft</button> : null}
        <Link className="btn btn-ghost btn-lg" href="/owner/cars">Cancel</Link>
      </div>
    </form>
  );
}
