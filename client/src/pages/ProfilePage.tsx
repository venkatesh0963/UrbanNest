import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, CheckCircle2, Building2 } from 'lucide-react';
import { useAuth } from '../features/auth/AuthContext';

export const ProfilePage: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [role, setRole] = useState<'user' | 'owner'>(
    user?.role === 'owner' ? 'owner' : 'user'
  );
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);
    setErrorMsg(null);
    try {
      const updated = await updateProfile({
        name,
        phone: phone.trim() ? phone.trim() : null,
        role: user.role === 'admin' ? undefined : role,
      });
      setFeedback('Profile settings updated successfully.');
      if (updated.role === 'owner' && user.role === 'user') {
        setTimeout(() => navigate('/owner/dashboard'), 1000);
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex items-center gap-3 border-b border-neutral-200 pb-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-forest-50 text-forest-700">
            <User className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-neutral-900">Account Settings</h1>
            <p className="text-xs text-neutral-500">
              {user.email} • Role:{' '}
              <span className="font-semibold uppercase text-forest-700">{user.role}</span>
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          {feedback && (
            <div className="flex items-center gap-2 rounded-xl border border-forest-200 bg-forest-50 p-3.5 text-xs font-medium text-forest-800">
              <CheckCircle2 className="h-4 w-4 text-forest-700" />
              <span>{feedback}</span>
            </div>
          )}

          {errorMsg && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs font-medium text-red-700">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700">
              Full Name
            </label>
            <input
              type="text"
              required
              minLength={2}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field mt-1.5"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700">
              Email Address (Verified Login ID)
            </label>
            <input
              type="email"
              disabled
              value={user.email}
              className="input-field mt-1.5 bg-neutral-100 text-neutral-500 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700">
              Phone Number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98450 12345"
              className="input-field mt-1.5"
            />
          </div>

          {user.role !== 'admin' && (
            <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
              <div className="flex items-start gap-3">
                <Building2 className="mt-0.5 h-5 w-5 text-forest-700" />
                <div className="flex-1">
                  <label className="block text-sm font-bold text-neutral-900">
                    Property Owner Capabilities
                  </label>
                  <p className="mt-0.5 text-xs text-neutral-600">
                    Need to publish a hostel or PG accommodation? Enable owner access on your
                    account to create and manage property listings.
                  </p>
                  <div className="mt-3 flex gap-3">
                    <label className="inline-flex items-center gap-2 text-xs font-semibold">
                      <input
                        type="radio"
                        checked={role === 'user'}
                        onChange={() => setRole('user')}
                        className="text-forest-700 focus:ring-forest-600"
                      />
                      Renter / Student Only
                    </label>
                    <label className="inline-flex items-center gap-2 text-xs font-semibold">
                      <input
                        type="radio"
                        checked={role === 'owner'}
                        onChange={() => setRole('owner')}
                        className="text-forest-700 focus:ring-forest-600"
                      />
                      Renter + Property Owner Access
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="pt-2">
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Saving Changes...' : 'Save Account Settings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
