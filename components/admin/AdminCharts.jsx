'use client';
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { statusLabel } from '@/lib/format';

export function StatusChart({ data }) {
  const rows = data.map((d) => ({ ...d, label: statusLabel(d.status) }));
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={rows} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e1e8f1" vertical={false} />
        <XAxis dataKey="label" tick={{ fill: '#33415a', fontSize: 11 }} interval={0} angle={-25} textAnchor="end" height={60} />
        <YAxis allowDecimals={false} tick={{ fill: '#33415a', fontSize: 12 }} />
        <Tooltip />
        <Bar dataKey="count" name="Bookings" fill="#2563a8" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function VolumeChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e1e8f1" vertical={false} />
        <XAxis dataKey="label" tick={{ fill: '#33415a', fontSize: 12 }} />
        <YAxis allowDecimals={false} tick={{ fill: '#33415a', fontSize: 12 }} />
        <Tooltip />
        <Line type="monotone" dataKey="bookings" name="Bookings created" stroke="#c98400" strokeWidth={3} dot={{ r: 4 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
