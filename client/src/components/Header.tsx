import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  Building2,
  Heart,
  Menu,
  X,
  User as UserIcon,
  LogOut,
  ShieldCheck,
  LayoutDashboard,
  PlusCircle,
} from 'lucide-react';
import { useAuth } from '../features/auth/AuthContext';
import { useFavourites } from '../features/favourites/useFavourites';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const { favouriteIds } = useFavourites();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setMobileMenuOpen(false);
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link
          to="/"
          className="flex items-center gap-2.5 text-xl font-bold tracking-tight text-neutral-900"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-forest-700 text-white shadow-sm">
            <Building2 className="h-5 w-5" />
          </span>
          <span>
            Urban <span className="text-forest-700">Nest</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex md:items-center md:gap-7">
          <NavLink
            to="/stays"
            className={({ isActive }) =>
              `text-sm font-medium transition-colors ${
                isActive ? 'text-forest-700 font-semibold' : 'text-neutral-600 hover:text-neutral-900'
              }`
            }
          >
            Explore Stays
          </NavLink>

          <NavLink
            to={
              user
                ? user.role === 'owner' || user.role === 'admin'
                  ? '/owner/listings/new'
                  : '/profile'
                : '/register?role=owner'
            }
            className={({ isActive }) =>
              `text-sm font-medium transition-colors ${
                isActive ? 'text-forest-700 font-semibold' : 'text-neutral-600 hover:text-neutral-900'
              }`
            }
          >
            List Your Property
          </NavLink>

          {(user?.role === 'owner' || user?.role === 'admin') && (
            <NavLink
              to="/owner/dashboard"
              className={({ isActive }) =>
                `inline-flex items-center gap-1.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-forest-700 font-semibold'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`
              }
            >
              <LayoutDashboard className="h-4 w-4" />
              Owner Hub
            </NavLink>
          )}

          {user?.role === 'admin' && (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `inline-flex items-center gap-1.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-forest-700 font-semibold'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`
              }
            >
              <ShieldCheck className="h-4 w-4 text-forest-700" />
              Admin
            </NavLink>
          )}
        </nav>

        {/* Right Actions */}
        <div className="hidden md:flex md:items-center md:gap-3">
          {user ? (
            <>
              <Link
                to="/favourites"
                className="relative inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 px-3 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
                title="Saved Properties"
              >
                <Heart className="h-4 w-4 text-forest-700" />
                <span>Saved</span>
                {favouriteIds.size > 0 && (
                  <span className="ml-0.5 rounded-full bg-forest-100 px-1.5 py-0.2 text-xs font-semibold text-forest-800">
                    {favouriteIds.size}
                  </span>
                )}
              </Link>

              <Link
                to="/profile"
                className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 px-3.5 py-2 text-sm font-medium text-neutral-800 transition-colors hover:bg-neutral-50"
              >
                <UserIcon className="h-4 w-4 text-neutral-500" />
                <span className="max-w-[120px] truncate">{user.name.split(' ')[0]}</span>
                <span className="rounded-md bg-neutral-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-neutral-600">
                  {user.role}
                </span>
              </Link>

              <button
                onClick={handleLogout}
                className="inline-flex items-center justify-center rounded-xl p-2 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-800"
                title="Sign out"
                aria-label="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-xl px-4 py-2 text-sm font-semibold text-neutral-700 transition-colors hover:bg-neutral-100"
              >
                Log in
              </Link>
              <Link to="/register" className="btn-primary">
                Create Account
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="flex items-center gap-2 md:hidden">
          {user && (
            <Link
              to="/favourites"
              className="relative rounded-lg p-2 text-neutral-600 hover:bg-neutral-100"
              aria-label="Saved properties"
            >
              <Heart className="h-5 w-5" />
              {favouriteIds.size > 0 && (
                <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-forest-700 text-[10px] font-bold text-white">
                  {favouriteIds.size}
                </span>
              )}
            </Link>
          )}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((v) => !v)}
            className="rounded-xl p-2 text-neutral-700 hover:bg-neutral-100"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="border-t border-neutral-200 bg-white px-4 pb-5 pt-3 md:hidden">
          <div className="flex flex-col space-y-2">
            <Link
              to="/stays"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-xl px-3 py-2.5 text-sm font-medium text-neutral-800 hover:bg-neutral-50"
            >
              Explore Stays
            </Link>
            <Link
              to={
                user
                  ? user.role === 'owner' || user.role === 'admin'
                    ? '/owner/listings/new'
                    : '/profile'
                  : '/register?role=owner'
              }
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-neutral-800 hover:bg-neutral-50"
            >
              <PlusCircle className="h-4 w-4 text-forest-700" />
              List Your Property
            </Link>

            {user ? (
              <>
                <Link
                  to="/favourites"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-xl px-3 py-2.5 text-sm font-medium text-neutral-800 hover:bg-neutral-50"
                >
                  Saved Properties ({favouriteIds.size})
                </Link>
                {(user.role === 'owner' || user.role === 'admin') && (
                  <Link
                    to="/owner/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-xl px-3 py-2.5 text-sm font-medium text-neutral-800 hover:bg-neutral-50"
                  >
                    Owner Dashboard
                  </Link>
                )}
                {user.role === 'admin' && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-xl px-3 py-2.5 text-sm font-medium text-forest-800 bg-forest-50"
                  >
                    Admin Moderation
                  </Link>
                )}
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-xl px-3 py-2.5 text-sm font-medium text-neutral-800 hover:bg-neutral-50"
                >
                  Account Settings ({user.name})
                </Link>
                <button
                  onClick={handleLogout}
                  className="mt-2 w-full rounded-xl border border-neutral-200 px-3 py-2.5 text-left text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <div className="mt-2 grid grid-cols-2 gap-2 pt-2 border-t border-neutral-100">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn-secondary text-center"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn-primary text-center"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
