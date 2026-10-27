import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Building2, KeyRound, ArrowRight } from 'lucide-react';
import { loginSchema } from '@urban-nest/shared';
import { useAuth } from '../features/auth/AuthContext';

type LoginFormValues = {
  email: string;
  password: string;
};

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [serverError, setServerError] = useState<string | null>(null);

  const from = (location.state as { from?: string })?.from || '/';

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setServerError(null);
    try {
      const loggedInUser = await login(values);
      if (from !== '/') {
        navigate(from, { replace: true });
      } else if (loggedInUser.role === 'admin') {
        navigate('/admin', { replace: true });
      } else if (loggedInUser.role === 'owner') {
        navigate('/owner/dashboard', { replace: true });
      } else {
        navigate('/stays', { replace: true });
      }
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Unable to sign in');
    }
  };

  const fillDemo = (email: string) => {
    setValue('email', email);
    setValue('password', 'Password123!');
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-md flex-col justify-center px-4 py-12">
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col items-center text-center">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-forest-700 text-white shadow-sm">
            <Building2 className="h-5 w-5" />
          </span>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-neutral-900">
            Welcome back to Urban Nest
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Sign in to access saved stays or manage your listings
          </p>
        </div>

        {/* Quick Demo Credentials Box */}
        <div className="mt-6 rounded-xl border border-forest-200 bg-forest-50/70 p-3.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-forest-900">
            <KeyRound className="h-3.5 w-3.5 text-forest-700" />
            <span>Quick Fill Demo Accounts (Password: Password123!)</span>
          </div>
          <div className="mt-2.5 grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => fillDemo('student@urbannest.in')}
              className="rounded-lg border border-forest-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-forest-800 hover:bg-forest-100"
            >
              Renter / Student
            </button>
            <button
              type="button"
              onClick={() => fillDemo('owner@urbannest.in')}
              className="rounded-lg border border-forest-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-forest-800 hover:bg-forest-100"
            >
              Property Owner
            </button>
            <button
              type="button"
              onClick={() => fillDemo('admin@urbannest.in')}
              className="rounded-lg border border-forest-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-forest-800 hover:bg-forest-100"
            >
              Administrator
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          {serverError && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-700">
              {serverError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700">
              Email Address
            </label>
            <input
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              {...register('email')}
              className="input-field mt-1.5"
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700">
              Password
            </label>
            <input
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              {...register('password')}
              className="input-field mt-1.5"
            />
            {errors.password && (
              <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
            )}
          </div>

          <button type="submit" disabled={isSubmitting} className="btn-primary w-full py-3">
            <span>{isSubmitting ? 'Signing in...' : 'Sign In'}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-neutral-500">
          Don’t have an account yet?{' '}
          <Link to="/register" className="font-semibold text-forest-700 hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
};
