import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, ShieldAlert, CheckCircle2, Mail } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-neutral-200 bg-neutral-50 text-neutral-600">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Col 1: Brand */}
          <div className="md:col-span-1">
            <Link
              to="/"
              className="flex items-center gap-2 text-lg font-bold tracking-tight text-neutral-900"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-forest-700 text-white">
                <Building2 className="h-4 w-4" />
              </span>
              <span>
                Urban <span className="text-forest-700">Nest</span>
              </span>
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-neutral-500">
              Thoughtful hostel and paying guest discovery for students and working professionals.
              Direct owner contact, transparent rent breakdowns, zero brokerage.
            </p>
          </div>

          {/* Col 2: Explore */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-900">
              Popular Cities
            </h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link to="/stays?city=Bengaluru" className="hover:text-forest-700">
                  Stays in Bengaluru
                </Link>
              </li>
              <li>
                <Link to="/stays?city=Pune" className="hover:text-forest-700">
                  Stays in Pune
                </Link>
              </li>
              <li>
                <Link to="/stays?city=Hyderabad" className="hover:text-forest-700">
                  Stays in Hyderabad
                </Link>
              </li>
              <li>
                <Link to="/stays?type=pg" className="hover:text-forest-700">
                  Paying Guest (PG) Stays
                </Link>
              </li>
              <li>
                <Link to="/stays?type=hostel" className="hover:text-forest-700">
                  Student Hostels
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Property Owners */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-900">
              For Property Owners
            </h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link to="/register?role=owner" className="hover:text-forest-700">
                  List Your Hostel or PG
                </Link>
              </li>
              <li>
                <Link to="/owner/dashboard" className="hover:text-forest-700">
                  Owner Dashboard
                </Link>
              </li>
              <li>
                <Link to="/owner/listings" className="hover:text-forest-700">
                  Manage Availability
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Trust & Safety Notice */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-900">
              Trust & Safety
            </h3>
            <div className="mt-3 space-y-2.5 text-xs leading-relaxed text-neutral-500">
              <p className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-forest-700" />
                <span>
                  Urban Nest is a discovery & direct-enquiry platform. We never charge booking
                  commissions.
                </span>
              </p>
              <p className="flex items-start gap-2">
                <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                <span>
                  Always visit the property in person and verify rental terms with the owner before
                  paying any deposit.
                </span>
              </p>
              <p className="flex items-center gap-2 pt-1 text-neutral-600">
                <Mail className="h-3.5 w-3.5 text-forest-700" />
                <span>support@urbannest.in</span>
              </p>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-neutral-200 pt-6 text-xs text-neutral-500 sm:flex-row">
          <p>© {new Date().getFullYear()} Urban Nest. Built for transparent student & professional living.</p>
          <div className="flex gap-6">
            <Link to="/stays" className="hover:text-neutral-800">
              Browse Stays
            </Link>
            <Link to="/login" className="hover:text-neutral-800">
              Demo Accounts
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
