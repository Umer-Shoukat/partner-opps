'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '../../lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@appops.local');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await apiFetch<{ access_token: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      localStorage.setItem('appops_token', res.access_token);
      router.replace('/dashboard');
    } catch (err: any) {
      setError(err?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container" style={{ maxWidth: 520 }}>
      <h1>AppOps Hub</h1>
      <div className="card">
        <form onSubmit={onSubmit} className="grid">
          <label>
            Email
            <input value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: '100%', padding: 10, marginTop: 6 }} />
          </label>
          <label>
            Password
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: '100%', padding: 10, marginTop: 6 }} />
          </label>
          {error && <div style={{ color: '#ff8a8a' }}>{error}</div>}
          <button disabled={loading} style={{ padding: 12, borderRadius: 10, border: 0, cursor: 'pointer' }}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
          <small style={{ opacity: 0.8 }}>
            Default dev credentials are controlled by API env: ADMIN_EMAIL / ADMIN_PASSWORD
          </small>
        </form>
      </div>
    </div>
  );
}
