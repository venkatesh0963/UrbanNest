import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Building2, UserCheck, Home } from 'lucide-react';
import { registerSchema } from '@urban-nest/shared';
import { useAuth } from '../features/auth/AuthContext';

type RegisterFormValues = {
  name: string;
  email: string;
  password: string;
  role: 'user' | 'owner';
  phone?: string;
};

export const RegisterPage: React.FC = () => {
  const { register: registerAccount } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role') === 'owner' ? 'owner' : 'user';
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: initialRole,
      phone: '',
    },
  });

  const selectedRole = watch('role');

  const onSubmit = async (values: RegisterFormValues) => {
    setServerError(null);
    try {
      const created = await registerAccount(values);
      if (created.role === 'owner') {
        navigate('/owner/dashboard', { replace: true });
      } else {
        navigate('/stays', { replace: true });
      }
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Registration failed');
    }
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-lg flex-col justify-center px-4 py-12">
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col items-center text-center">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-forest-700 text-white shadow-sm">
            <Building2 className="h-5 w-5" />
          </span>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-neutral-900">
            Create your Urban Nest account
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Save favourite stays or list your hostel and PG properties
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          {serverError && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-700">
              {serverError}
            </div>
          )}

          {/* Account Type Picker */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700">
              I am joining as a
            </label>
            <div className="mt-2 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setValue('role', 'user')}
                className={`flex flex-col items-start rounded-xl border p-3.5 text-left transition-all ${
                  selectedRole === 'user'
                    ? 'border-forest-700 bg-forest-50/70 ring-2 ring-forest-600/20'
                    : 'border-neutral-200 hover:border-neutral-300'
                }`}
              >
                <UserCheck className="h-5 w-5 text-forest-700" />
                <span className="mt-2 text-sm font-bold text-neutral-900">
                  Student / Professional
                </span>
                <span className="mt-0.5 text-xs text-neutral-500">
                  Search & save stays
                </span>
              </button>

              <button
                type="button"
                onClick={() => setValue('role', 'owner')}
                className={`flex flex-col items-start rounded-xl border p-3.5 text-left transition-all ${
                  selectedRole === 'owner'
                    ? 'border-forest-700 bg-forest-50/70 ring-2 ring-forest-600/20'
                    : 'border-neutral-200 hover:border-neutral-300'
                }`}
              >
                <Home className="h-5 w-5 text-forest-700" />
                <span className="mt-2 text-sm font-bold text-neutral-900">
                  Property Owner
                </span>
                <span className="mt-0.5 text-xs text-neutral-500">
                  List & manage PGs/hostels
                </span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700">
              Full Name
            </label>
            <input
              type="text"
              placeholder="Ananya Sharma"
              {...register('name')}
              className="input-field mt-1.5"
            />
            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700">
              Email Address
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              {...register('email')}
              className="input-field mt-1.5"
            />
            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700">
              Phone Number (Optional)
            </label>
            <input
              type="tel"
              placeholder="+91 98450 12345"
              {...register('phone')}
              className="input-field mt-1.5"
            />
            {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700">
              Password (Min. 8 characters)
            </label>
            <input
              type="password"
              placeholder="••••••••"
              {...register('password')}
              className="input-field mt-1.5"
            />
            {errors.password && (
              <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
            )}
          </div>

          <button type="submit" disabled={isSubmitting} className="btn-primary w-full py-3">
            {isSubmitting ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-neutral-500">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-forest-700 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};
