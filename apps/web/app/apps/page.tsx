'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '../../lib/api';

type App = { id: string; slug: string; name: string };

export default function AppsPage() {
  const [apps, setApps] = useState<App[]>([]);
  const [slug, setSlug] = useState('pushbot');
  const [name, setName] = useState('Pushbot');
  const [createdKey, setCreatedKey] = useState<{ keyId: string; secret: string } | null>(null);

  async function load() {
    const data = await apiFetch<App[]>('/apps');
    setApps(data);
  }

  useEffect(() => {
    load().catch(console.error);
  }, []);

  async function createApp() {
    await apiFetch('/apps', { method: 'POST', body: JSON.stringify({ slug, name }) });
    await load();
  }

  async function createKey(appId: string) {
    const res = await apiFetch<{ keyId: string; secret: string }>(`/apps/${appId}/keys`, { method: 'POST' });
    setCreatedKey(res);
  }

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Apps</h1>
        <Link href="/dashboard" style={{ opacity: 0.9 }}>Dashboard</Link>
      </div>

      <div className="grid grid-3" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
        <div className="card">
          <h3>Create App</h3>
          <div className="grid">
            <input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="slug" style={{ padding: 10 }} />
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="name" style={{ padding: 10 }} />
            <button onClick={createApp} style={{ padding: 12, borderRadius: 10, border: 0, cursor: 'pointer' }}>
              Create
            </button>
          </div>
        </div>
        <div className="card" style={{ gridColumn: 'span 2' }}>
          <h3>Generated Ingestion Key</h3>
          {createdKey ? (
            <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(createdKey, null, 2)}</pre>
          ) : (
            <p style={{ opacity: 0.8 }}>Click "Create key" on an app to generate.</p>
          )}
        </div>
      </div>

      <div className="grid" style={{ marginTop: 16 }}>
        {apps.map((a) => (
          <div key={a.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 600 }}>{a.name}</div>
              <div style={{ opacity: 0.7 }}>{a.slug}</div>
            </div>
            <button onClick={() => createKey(a.id)} style={{ padding: 10, borderRadius: 10, border: 0, cursor: 'pointer' }}>
              Create key
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
