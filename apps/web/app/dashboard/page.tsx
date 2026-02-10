'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '../../lib/api';
import Link from 'next/link';

type Summary = {
  asOfDay: string;
  apps: { id: string; slug: string; name: string }[];
  activeInstalls: number;
  installs: number;
  uninstalls: number;
  mrrByCurrency: { currency: string; mrr: string; arr: string }[];
};

export default function Dashboard() {
  const [data, setData] = useState<Summary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<Summary>('/analytics/portfolio/summary')
      .then(setData)
      .catch((e) => setError(e.message));
  }, []);

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Dashboard</h1>
        <Link href="/apps">Apps →</Link>
      </div>

      {error && <div style={{ color: '#ff8a8a' }}>{error}</div>}

      {!data ? (
        <div>Loading...</div>
      ) : (
        <div className="grid grid-3">
          <div className="card">
            <h3>Active installs (EOD)</h3>
            <div style={{ fontSize: 32 }}>{data.activeInstalls}</div>
          </div>
          <div className="card">
            <h3>Installs (day)</h3>
            <div style={{ fontSize: 32 }}>{data.installs}</div>
          </div>
          <div className="card">
            <h3>Uninstalls (day)</h3>
            <div style={{ fontSize: 32 }}>{data.uninstalls}</div>
          </div>

          <div className="card" style={{ gridColumn: '1 / -1' }}>
            <h3>MRR</h3>
            <div className="grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
              {data.mrrByCurrency.map((r) => (
                <div key={r.currency}>
                  <div style={{ opacity: 0.8 }}>{r.currency}</div>
                  <div style={{ fontSize: 26 }}>{r.mrr}</div>
                  <div style={{ opacity: 0.8 }}>ARR: {r.arr}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="card" style={{ gridColumn: '1 / -1' }}>
            <h3>Apps</h3>
            <ul>
              {data.apps.map((a) => (
                <li key={a.id}>
                  {a.name} <span style={{ opacity: 0.7 }}>({a.slug})</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
