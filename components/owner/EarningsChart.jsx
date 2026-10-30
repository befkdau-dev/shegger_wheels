'use client';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { formatETB } from '@/lib/format';

export default function EarningsChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e1e8f1" vertical={false} />
        <XAxis dataKey="label" tick={{ fill: '#33415a', fontSize: 12 }} />
        <YAxis tick={{ fill: '#33415a', fontSize: 12 }} tickFormatter={(v) => (v >= 1000 ? `${v / 1000}k` : v)} width={44} />
        <Tooltip formatter={(v) => formatETB(v)} />
        <Legend />
        <Bar dataKey="earned" name="Earned" fill="#12305a" radius={[4, 4, 0, 0]} />
        <Bar dataKey="projected" name="Projected" fill="#f0a202" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
