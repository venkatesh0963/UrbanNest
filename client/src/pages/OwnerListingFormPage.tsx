import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  Send,
  Sparkles,
} from 'lucide-react';
import { api } from '../api/client';
import { PhotoDropzone } from '../components/PhotoDropzone';
import type {
  ListingType,
  GenderPolicy,
  AvailabilityStatus,
  RoomTypeOption,
  ListingPhoto,
} from '../types';

const COMMON_AMENITIES = [
  'Wi-Fi',
  'Food',
  'Laundry',
  'Power Backup',
  'AC',
  'CCTV Security',
  'Housekeeping',
  'Gym',
  'Two-Wheeler Parking',
  'Study Desk',
  'RO Water',
  'Geyser',
];

export const OwnerListingFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState('');
  const [type, setType] = useState<ListingType>('pg');
  const [genderPolicy, setGenderPolicy] = useState<GenderPolicy>('any');
  const [availability, setAvailability] = useState<AvailabilityStatus>('available');
  const [description, setDescription] = useState('');

  // Location
  const [city, setCity] = useState('Bengaluru');
  const [locality, setLocality] = useState('');
  const [address, setAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [pincode, setPincode] = useState('');

  // Pricing
  const [monthlyRent, setMonthlyRent] = useState(8500);
  const [deposit, setDeposit] = useState(15000);
  const [foodIncluded, setFoodIncluded] = useState(true);
  const [electricityIncluded, setElectricityIncluded] = useState(true);
  const [noticePeriodDays, setNoticePeriodDays] = useState(30);
  const [lockInPeriodMonths, setLockInPeriodMonths] = useState(1);

  // Room types
  const [roomTypes, setRoomTypes] = useState<RoomTypeOption[]>([
    { sharing: 'double', monthlyRent: 8500, availableBeds: 4 },
  ]);

  // Amenities & Rules
  const [amenities, setAmenities] = useState<string[]>([
    'Wi-Fi',
    'Food',
    'Laundry',
    'Power Backup',
    'CCTV Security',
  ]);
  const [houseRulesText, setHouseRulesText] = useState(
    'ID verification required at move-in\nNo smoking inside rooms'
  );

  // Photos
  const [photos, setPhotos] = useState<ListingPhoto[]>([
    {
      url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80',
      caption: 'Bedroom & study desk',
      isPrimary: true,
    },
  ]);
  const [cloudinaryStatus, setCloudinaryStatus] = useState<string | null>(null);

  // Contact
  const [phone, setPhone] = useState('+91 98450 22334');
  const [email, setEmail] = useState('owner@urbannest.in');
  const [whatsappEnabled, setWhatsappEnabled] = useState(true);
  const [preferredTime, setPreferredTime] = useState('9:00 AM – 8:00 PM');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const { data: existingData, isLoading: loadingExisting } = useQuery({
    queryKey: ['owner', 'listing', id],
    queryFn: () => api.getOwnerListingById(id!),
    enabled: isEditing,
  });

  useEffect(() => {
    if (existingData?.listing) {
      const l = existingData.listing;
      setTitle(l.title);
      setType(l.type);
      setGenderPolicy(l.genderPolicy);
      setAvailability(l.availability);
      setDescription(l.description);
      setCity(l.location.city);
      setLocality(l.location.locality);
      setAddress(l.location.address);
      setLandmark(l.location.landmark || '');
      setPincode(l.location.pincode || '');
      setMonthlyRent(l.pricing.monthlyRent);
      setDeposit(l.pricing.deposit);
      setFoodIncluded(l.pricing.foodIncluded);
      setElectricityIncluded(Boolean(l.pricing.electricityIncluded));
      setNoticePeriodDays(l.pricing.noticePeriodDays ?? 30);
      setLockInPeriodMonths(l.pricing.lockInPeriodMonths ?? 1);
      setRoomTypes(l.roomTypes);
      setAmenities(l.amenities);
      setHouseRulesText((l.houseRules || []).join('\n'));
      setPhotos(l.photos);
      setPhone(l.contact.phone || '');
      setEmail(l.contact.email || '');
      setWhatsappEnabled(l.contact.whatsappEnabled);
      setPreferredTime(l.contact.preferredTime || '9:00 AM – 8:00 PM');
    }
  }, [existingData]);

  const toggleAmenity = (item: string) => {
    setAmenities((prev) =>
      prev.includes(item) ? prev.filter((a) => a !== item) : [...prev, item]
    );
  };

  const handleCheckSignedUpload = async () => {
    if (!id) {
      setCloudinaryStatus(
        'Save draft first to request a listing-scoped Cloudinary upload signature, or add photo URLs below.'
      );
      return;
    }
    try {
      const sig = await api.getPhotoUploadSignature(id);
      if (sig.mode === 'cloudinary') {
        setCloudinaryStatus(
          `Signed Cloudinary upload ready for folder "${sig.folder}" (timestamp ${sig.timestamp}).`
        );
      } else {
        setCloudinaryStatus(sig.message || 'Direct URL & preset upload active.');
      }
    } catch (err) {
      setCloudinaryStatus(err instanceof Error ? err.message : 'Unable to request signature');
    }
  };

  const handleSave = async (submitForReview: boolean) => {
    setErrorMsg(null);
    setSaving(true);

    try {
      const payload = {
        title,
        type,
        description,
        location: {
          city,
          locality,
          address,
          landmark: landmark || undefined,
          pincode: pincode || undefined,
        },
        pricing: {
          monthlyRent: Number(monthlyRent),
          deposit: Number(deposit),
          foodIncluded,
          electricityIncluded,
          noticePeriodDays: Number(noticePeriodDays),
          lockInPeriodMonths: Number(lockInPeriodMonths),
        },
        roomTypes: roomTypes.map((rt) => ({
          sharing: rt.sharing,
          monthlyRent: Number(rt.monthlyRent),
          availableBeds: Number(rt.availableBeds),
        })),
        amenities,
        houseRules: houseRulesText
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean),
        genderPolicy,
        photos,
        contact: {
          phone: phone.trim() || null,
          email: email.trim() || null,
          whatsappEnabled,
          preferredTime,
        },
        availability,
        submitForReview,
      };

      if (isEditing && id) {
        await api.updateOwnerListing(id, payload);
      } else {
        await api.createOwnerListing(payload);
      }

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['owner'] }),
        queryClient.invalidateQueries({ queryKey: ['listings'] }),
        queryClient.invalidateQueries({ queryKey: ['admin'] }),
      ]);
      navigate('/owner/listings');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to save listing');
    } finally {
      setSaving(false);
    }
  };

  if (isEditing && loadingExisting) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12">
        <div className="h-96 animate-pulse rounded-2xl bg-neutral-100" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <Link
        to="/owner/listings"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-neutral-600 hover:text-neutral-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Owner Listings
      </Link>

      <div className="mt-4 border-b border-neutral-200 pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
          {isEditing ? 'Edit Accommodation Listing' : 'Create New Accommodation Listing'}
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          Provide accurate rent, deposit, room sharing configurations, and direct contact details.
        </p>
      </div>

      {errorMsg && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
          {errorMsg}
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSave(true);
        }}
        className="mt-8 space-y-8"
      >
        {/* 1. Basic Information */}
        <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xs space-y-4">
          <h2 className="text-base font-bold text-neutral-900">1. Basic Property Details</h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="sm:col-span-3">
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700">
                Property Title
              </label>
              <input
                type="text"
                required
                minLength={5}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Greenview Executive PG & Co-Living"
                className="input-field mt-1.5"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700">
                Property Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as ListingType)}
                className="input-field mt-1.5"
              >
                <option value="pg">Paying Guest (PG)</option>
                <option value="hostel">Student Hostel</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700">
                Gender Policy
              </label>
              <select
                value={genderPolicy}
                onChange={(e) => setGenderPolicy(e.target.value as GenderPolicy)}
                className="input-field mt-1.5"
              >
                <option value="any">Co-ed / Any Gender</option>
                <option value="male">Men Only</option>
                <option value="female">Women Only</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700">
                Availability
              </label>
              <select
                value={availability}
                onChange={(e) => setAvailability(e.target.value as AvailabilityStatus)}
                className="input-field mt-1.5"
              >
                <option value="available">Available</option>
                <option value="limited">Limited Beds Left</option>
                <option value="unavailable">Currently Full</option>
              </select>
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700">
                Detailed Description (Min. 20 chars)
              </label>
              <textarea
                rows={4}
                required
                minLength={20}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the rooms, meal quality, nearby colleges/tech parks, and commute convenience..."
                className="input-field mt-1.5"
              />
            </div>
          </div>
        </section>

        {/* 2. Location */}
        <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xs space-y-4">
          <h2 className="text-base font-bold text-neutral-900">2. Location & Address</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700">
                City
              </label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Bengaluru"
                className="input-field mt-1.5"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700">
                Locality / Neighbourhood
              </label>
              <input
                type="text"
                required
                value={locality}
                onChange={(e) => setLocality(e.target.value)}
                placeholder="Koramangala / BTM Layout / HSR"
                className="input-field mt-1.5"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700">
                Approximate Street Address
              </label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="80 Feet Road, 4th Block (Avoid publishing private flat numbers)"
                className="input-field mt-1.5"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700">
                Nearby Landmark
              </label>
              <input
                type="text"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                placeholder="Near Metro Station / Tech Park Gate"
                className="input-field mt-1.5"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700">
                PIN Code
              </label>
              <input
                type="text"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                placeholder="560034"
                className="input-field mt-1.5"
              />
            </div>
          </div>
        </section>

        {/* 3. Pricing & Room Sharing */}
        <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xs space-y-5">
          <h2 className="text-base font-bold text-neutral-900">
            3. Rent, Deposit & Room Configurations
          </h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700">
                Starting Monthly Rent (₹)
              </label>
              <input
                type="number"
                required
                min={1000}
                value={monthlyRent}
                onChange={(e) => setMonthlyRent(Number(e.target.value))}
                className="input-field mt-1.5"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700">
                Security Deposit (₹)
              </label>
              <input
                type="number"
                required
                min={0}
                value={deposit}
                onChange={(e) => setDeposit(Number(e.target.value))}
                className="input-field mt-1.5"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700">
                Notice Period (Days)
              </label>
              <input
                type="number"
                min={0}
                value={noticePeriodDays}
                onChange={(e) => setNoticePeriodDays(Number(e.target.value))}
                className="input-field mt-1.5"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700">
                Lock-in (Months)
              </label>
              <input
                type="number"
                min={0}
                value={lockInPeriodMonths}
                onChange={(e) => setLockInPeriodMonths(Number(e.target.value))}
                className="input-field mt-1.5"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-6 pt-1">
            <label className="inline-flex items-center gap-2 text-sm font-medium text-neutral-800">
              <input
                type="checkbox"
                checked={foodIncluded}
                onChange={(e) => setFoodIncluded(e.target.checked)}
                className="h-4 w-4 rounded border-neutral-300 text-forest-700"
              />
              Food / Meals Included in Rent
            </label>

            <label className="inline-flex items-center gap-2 text-sm font-medium text-neutral-800">
              <input
                type="checkbox"
                checked={electricityIncluded}
                onChange={(e) => setElectricityIncluded(e.target.checked)}
                className="h-4 w-4 rounded border-neutral-300 text-forest-700"
              />
              Standard Electricity Included
            </label>
          </div>

          {/* Room Types List */}
          <div className="border-t border-neutral-200 pt-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-neutral-700">
                Room Sharing Options
              </label>
              <button
                type="button"
                onClick={() =>
                  setRoomTypes((prev) => [
                    ...prev,
                    { sharing: 'single', monthlyRent: 13000, availableBeds: 2 },
                  ])
                }
                className="inline-flex items-center gap-1 text-xs font-semibold text-forest-700 hover:underline"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Room Option
              </button>
            </div>

            <div className="mt-3 space-y-2.5">
              {roomTypes.map((rt, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-1 gap-3 rounded-xl border border-neutral-200 bg-neutral-50 p-3 sm:grid-cols-10 sm:items-center"
                >
                  <div className="sm:col-span-4">
                    <label className="block text-[11px] text-neutral-500">Sharing Type</label>
                    <select
                      value={rt.sharing}
                      onChange={(e) => {
                        const updated = [...roomTypes];
                        updated[idx].sharing = e.target.value as RoomTypeOption['sharing'];
                        setRoomTypes(updated);
                      }}
                      className="input-field mt-1 py-1.5"
                    >
                      <option value="single">Single Private</option>
                      <option value="double">Double Sharing</option>
                      <option value="triple">Triple Sharing</option>
                      <option value="four_plus">4+ Sharing</option>
                    </select>
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-[11px] text-neutral-500">Monthly Rent (₹)</label>
                    <input
                      type="number"
                      min={1000}
                      value={rt.monthlyRent}
                      onChange={(e) => {
                        const updated = [...roomTypes];
                        updated[idx].monthlyRent = Number(e.target.value);
                        setRoomTypes(updated);
                      }}
                      className="input-field mt-1 py-1.5"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] text-neutral-500">Available Beds</label>
                    <input
                      type="number"
                      min={0}
                      value={rt.availableBeds}
                      onChange={(e) => {
                        const updated = [...roomTypes];
                        updated[idx].availableBeds = Number(e.target.value);
                        setRoomTypes(updated);
                      }}
                      className="input-field mt-1 py-1.5"
                    />
                  </div>

                  <div className="flex justify-end sm:col-span-1 sm:pt-4">
                    {roomTypes.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          setRoomTypes((prev) => prev.filter((_, i) => i !== idx))
                        }
                        className="rounded-lg p-1.5 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 4. Amenities & House Rules */}
        <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xs space-y-5">
          <h2 className="text-base font-bold text-neutral-900">4. Facilities & House Rules</h2>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700">
              Select Available Amenities
            </label>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {COMMON_AMENITIES.map((item) => {
                const selected = amenities.includes(item);
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggleAmenity(item)}
                    className={`rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all ${
                      selected
                        ? 'border-forest-700 bg-forest-700 text-white'
                        : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300'
                    }`}
                  >
                    {item}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700">
              House Rules (One rule per line)
            </label>
            <textarea
              rows={3}
              value={houseRulesText}
              onChange={(e) => setHouseRulesText(e.target.value)}
              className="input-field mt-1.5"
            />
          </div>
        </section>

        {/* 5. Property Photos (Drag-and-Drop File Upload + Cloudinary / URL) */}
        <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-bold text-neutral-900">
                5. Property Photos (Drag & Drop Upload)
              </h2>
              <p className="text-xs text-neutral-500">
                Drag and drop image files directly from your computer, reorder photos, and pick a
                cover image.
              </p>
            </div>
            <button
              type="button"
              onClick={handleCheckSignedUpload}
              className="inline-flex items-center gap-1.5 rounded-xl border border-forest-200 bg-forest-50 px-3 py-1.5 text-xs font-semibold text-forest-800 hover:bg-forest-100"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Verify Cloudinary Signature
            </button>
          </div>

          {cloudinaryStatus && (
            <div className="rounded-xl bg-neutral-100 p-3 text-xs text-neutral-700">
              {cloudinaryStatus}
            </div>
          )}

          <PhotoDropzone photos={photos} onChange={setPhotos} />
        </section>

        {/* 6. Direct Contact Preferences */}
        <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xs space-y-4">
          <h2 className="text-base font-bold text-neutral-900">6. Direct Contact Preferences</h2>
          <p className="text-xs text-neutral-500">
            Control how prospective students and working professionals reach out to you.
          </p>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700">
                Contact Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98450 22334"
                className="input-field mt-1.5"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700">
                Contact Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="owner@example.com"
                className="input-field mt-1.5"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700">
                Preferred Contact Hours
              </label>
              <input
                type="text"
                value={preferredTime}
                onChange={(e) => setPreferredTime(e.target.value)}
                placeholder="9:00 AM – 8:00 PM"
                className="input-field mt-1.5"
              />
            </div>
          </div>

          <label className="inline-flex items-center gap-2 pt-1 text-sm font-medium text-neutral-800">
            <input
              type="checkbox"
              checked={whatsappEnabled}
              onChange={(e) => setWhatsappEnabled(e.target.checked)}
              className="h-4 w-4 rounded border-neutral-300 text-forest-700"
            />
            Enable 1-click WhatsApp enquiry link on property page
          </label>
        </section>

        {/* Submit Actions */}
        <div className="flex flex-wrap items-center justify-end gap-3 border-t border-neutral-200 pt-6">
          <button
            type="button"
            disabled={saving}
            onClick={() => handleSave(false)}
            className="btn-secondary"
          >
            <Save className="h-4 w-4" />
            <span>Save as Draft</span>
          </button>

          <button type="submit" disabled={saving} className="btn-primary">
            <Send className="h-4 w-4" />
            <span>{saving ? 'Publishing...' : 'Publish Property Live'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
