import bcrypt from 'bcryptjs';
import { UserModel } from '../models/User.js';
import { ListingModel } from '../models/Listing.js';
import { FavouriteModel } from '../models/Favourite.js';
import { ReportModel } from '../models/Report.js';
import { connectDatabase, disconnectDatabase } from '../config/db.js';

export async function seedInitialData(force = false): Promise<void> {
  const existingCount = await ListingModel.countDocuments();
  if (existingCount > 0 && !force) {
    return;
  }

  if (force) {
    await Promise.all([
      FavouriteModel.deleteMany({}),
      ReportModel.deleteMany({}),
      ListingModel.deleteMany({}),
      UserModel.deleteMany({}),
    ]);
  }

  const passwordHash = await bcrypt.hash('Password123!', 10);

  const [adminUser, owner1, owner2, studentUser] = await UserModel.create([
    {
      name: 'Aarav Mehta (Admin)',
      email: 'admin@urbannest.in',
      passwordHash,
      role: 'admin',
      phone: '+91 98450 11000',
      isActive: true,
      isVerified: true,
    },
    {
      name: 'Rajeshwari Nair',
      email: 'owner@urbannest.in',
      passwordHash,
      role: 'owner',
      phone: '+91 98450 22334',
      isActive: true,
      isVerified: true,
    },
    {
      name: 'Vikramaditya Rao',
      email: 'vikram.stays@urbannest.in',
      passwordHash,
      role: 'owner',
      phone: '+91 98861 44556',
      isActive: true,
      isVerified: true,
    },
    {
      name: 'Ananya Sharma',
      email: 'student@urbannest.in',
      passwordHash,
      role: 'user',
      phone: '+91 97312 88990',
      isActive: true,
      isVerified: true,
    },
  ]);

  const listings = await ListingModel.create([
    {
      ownerId: owner1._id,
      title: 'The Canopy Co-Living & PG',
      slug: 'the-canopy-co-living-pg-koramangala',
      type: 'pg',
      description:
        'Thoughtfully designed paying guest accommodation in the heart of Koramangala 4th Block. Walking distance to Sony World Signal, major tech startups, and study cafes. Features ergonomic study desks, high-speed 300 Mbps dual-band fiber Wi-Fi, nutritious home-style meals, and sunlit balconies.',
      location: {
        city: 'Bengaluru',
        locality: 'Koramangala',
        address: '4th Block, Near Sony World Junction, 80 Feet Road',
        landmark: 'Opposite Third Wave Coffee Roasters',
        pincode: '560034',
        coordinates: { lat: 12.9352, lng: 77.6245 },
      },
      pricing: {
        monthlyRent: 11500,
        deposit: 20000,
        foodIncluded: true,
        electricityIncluded: true,
        maintenanceAmount: 0,
        noticePeriodDays: 30,
        lockInPeriodMonths: 3,
        extraCharges: [
          { label: 'Laundry (Ironing optional)', amount: 500, frequency: 'monthly' },
        ],
      },
      roomTypes: [
        { sharing: 'single', monthlyRent: 16500, availableBeds: 2 },
        { sharing: 'double', monthlyRent: 11500, availableBeds: 4 },
      ],
      amenities: [
        'Wi-Fi',
        'Food',
        'Laundry',
        'Power Backup',
        'Housekeeping',
        'CCTV Security',
        'Study Desk',
        'RO Water',
        'Geyser',
      ],
      houseRules: [
        'No smoking inside bedrooms',
        'Quiet study hours after 10:30 PM',
        'ID proof mandatory at move-in',
      ],
      genderPolicy: 'any',
      photos: [
        {
          url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80',
          caption: 'Sunlit double-sharing bedroom with ergonomic study desk',
          isPrimary: true,
        },
        {
          url: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1200&q=80',
          caption: 'Community lounge and dining space',
        },
        {
          url: 'https://images.unsplash.com/photo-1540518614846-7ede433c457?auto=format&fit=crop&w=1200&q=80',
          caption: 'Private single studio room',
        },
      ],
      contact: {
        phone: '+919845022334',
        email: 'owner@urbannest.in',
        whatsappEnabled: true,
        preferredTime: '9:00 AM – 8:00 PM',
      },
      status: 'published',
      availability: 'available',
      featured: true,
      viewsCount: 142,
      moderation: {
        reviewedBy: adminUser._id,
        reviewedAt: new Date(),
        rejectionReason: null,
        adminNotes: 'Verified property details and owner contact.',
      },
    },
    {
      ownerId: owner1._id,
      title: 'Cedar Haven Women’s PG',
      slug: 'cedar-haven-womens-pg-btm-layout',
      type: 'pg',
      description:
        'Safe, serene, and spotless women-only PG in BTM Layout 2nd Stage. Biometric entry, 24/7 female warden on premises, freshly cooked North & South Indian meals three times a day, and dedicated rooftop terrace garden.',
      location: {
        city: 'Bengaluru',
        locality: 'BTM Layout',
        address: '2nd Stage, 100 Feet Ring Road, Near Udupi Garden Signal',
        landmark: '200m from BTM Metro Station',
        pincode: '560076',
        coordinates: { lat: 12.9166, lng: 77.6101 },
      },
      pricing: {
        monthlyRent: 8500,
        deposit: 15000,
        foodIncluded: true,
        electricityIncluded: true,
        maintenanceAmount: 0,
        noticePeriodDays: 30,
        lockInPeriodMonths: 2,
        extraCharges: [],
      },
      roomTypes: [
        { sharing: 'single', monthlyRent: 13500, availableBeds: 1 },
        { sharing: 'double', monthlyRent: 9500, availableBeds: 3 },
        { sharing: 'triple', monthlyRent: 8500, availableBeds: 5 },
      ],
      amenities: [
        'Wi-Fi',
        'Food',
        'Laundry',
        'CCTV Security',
        'Power Backup',
        'Housekeeping',
        'RO Water',
        'Geyser',
      ],
      houseRules: [
        'Female residents only',
        'Biometric entry after 10:30 PM',
        'Parents and female guests welcome in common lounge',
      ],
      genderPolicy: 'female',
      photos: [
        {
          url: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80',
          caption: 'Bright double sharing room with wardrobe',
          isPrimary: true,
        },
        {
          url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1200&q=80',
          caption: 'Reading corner & common seating area',
        },
      ],
      contact: {
        phone: '+919845022334',
        email: 'owner@urbannest.in',
        whatsappEnabled: true,
        preferredTime: '8:30 AM – 9:00 PM',
      },
      status: 'published',
      availability: 'available',
      featured: true,
      viewsCount: 198,
      moderation: {
        reviewedBy: adminUser._id,
        reviewedAt: new Date(),
        rejectionReason: null,
        adminNotes: 'Inspected photos and safety amenities.',
      },
    },
    {
      ownerId: owner2._id,
      title: 'Scholar’s Courtyard Student Hostel',
      slug: 'scholars-courtyard-student-hostel-hsr-layout',
      type: 'hostel',
      description:
        'Purpose-built student hostel in HSR Layout Sector 2 with a dedicated 24x7 quiet library room, high-speed internet, indoor recreation zone, and wholesome mess facility. Ideal for engineering students, UPSC/GATE aspirants, and interns.',
      location: {
        city: 'Bengaluru',
        locality: 'HSR Layout',
        address: '27th Main Road, Sector 2, HSR Layout',
        landmark: 'Near NIFT Campus',
        pincode: '560102',
        coordinates: { lat: 12.9116, lng: 77.6474 },
      },
      pricing: {
        monthlyRent: 7200,
        deposit: 10000,
        foodIncluded: true,
        electricityIncluded: true,
        maintenanceAmount: 0,
        noticePeriodDays: 30,
        lockInPeriodMonths: 1,
        extraCharges: [],
      },
      roomTypes: [
        { sharing: 'double', monthlyRent: 9200, availableBeds: 4 },
        { sharing: 'triple', monthlyRent: 7800, availableBeds: 6 },
        { sharing: 'four_plus', monthlyRent: 7200, availableBeds: 8 },
      ],
      amenities: [
        'Wi-Fi',
        'Food',
        'Study Desk',
        'Laundry',
        'Power Backup',
        'CCTV Security',
        'Two-Wheeler Parking',
        'RO Water',
      ],
      houseRules: [
        'Valid college ID or internship offer letter required',
        'Strictly substance-free campus',
      ],
      genderPolicy: 'male',
      photos: [
        {
          url: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1200&q=80',
          caption: 'Clean student hostel rooms and study desks',
          isPrimary: true,
        },
        {
          url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
          caption: 'Dedicated 24x7 study room',
        },
      ],
      contact: {
        phone: '+919886144556',
        email: 'vikram.stays@urbannest.in',
        whatsappEnabled: true,
        preferredTime: '10:00 AM – 7:00 PM',
      },
      status: 'published',
      availability: 'available',
      featured: true,
      viewsCount: 116,
      moderation: {
        reviewedBy: adminUser._id,
        reviewedAt: new Date(),
        rejectionReason: null,
        adminNotes: 'Approved.',
      },
    },
    {
      ownerId: owner2._id,
      title: 'Oakwood Executive Stays Indiranagar',
      slug: 'oakwood-executive-stays-indiranagar',
      type: 'pg',
      description:
        'Boutique air-conditioned PG for working professionals near Indiranagar 100 Feet Road and Metro Station. Hotel-grade orthopedic mattresses, attached modern washrooms, daily housekeeping, and optional gourmet meal plans.',
      location: {
        city: 'Bengaluru',
        locality: 'Indiranagar',
        address: '12th Main, HAL 2nd Stage, Indiranagar',
        landmark: '5 mins walk from Indiranagar Metro',
        pincode: '560038',
        coordinates: { lat: 12.9719, lng: 77.6412 },
      },
      pricing: {
        monthlyRent: 14500,
        deposit: 30000,
        foodIncluded: false,
        electricityIncluded: false,
        maintenanceAmount: 500,
        noticePeriodDays: 30,
        lockInPeriodMonths: 3,
        extraCharges: [
          { label: 'AC Sub-meter Electricity', amount: 800, frequency: 'usage_based' },
        ],
      },
      roomTypes: [
        { sharing: 'single', monthlyRent: 19500, availableBeds: 1 },
        { sharing: 'double', monthlyRent: 14500, availableBeds: 2 },
      ],
      amenities: [
        'Wi-Fi',
        'AC',
        'Laundry',
        'Power Backup',
        'Housekeeping',
        'Gym',
        'CCTV Security',
        'Study Desk',
        'Two-Wheeler Parking',
        'Geyser',
      ],
      houseRules: [
        '30-day notice period prior to move-out',
        'No loud music after 10:00 PM',
      ],
      genderPolicy: 'any',
      photos: [
        {
          url: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
          caption: 'Executive AC suite with balcony access',
          isPrimary: true,
        },
        {
          url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80',
          caption: 'Workstation and lounge',
        },
      ],
      contact: {
        phone: '+919886144556',
        email: 'vikram.stays@urbannest.in',
        whatsappEnabled: true,
        preferredTime: '9:00 AM – 8:00 PM',
      },
      status: 'published',
      availability: 'limited',
      featured: true,
      viewsCount: 230,
      moderation: {
        reviewedBy: adminUser._id,
        reviewedAt: new Date(),
        rejectionReason: null,
        adminNotes: 'Approved premium listing.',
      },
    },
    {
      ownerId: owner1._id,
      title: 'Greenleaf Tech Park PG',
      slug: 'greenleaf-tech-park-pg-whitefield',
      type: 'pg',
      description:
        'Spacious and well-ventilated PG right opposite ITPL Back Gate in Whitefield. Zero commute stress for IT professionals working in ITPB, EPIP Zone, and Bagmane World Technology Center. Includes 3 meals, gym access, and two-wheeler parking.',
      location: {
        city: 'Bengaluru',
        locality: 'Whitefield',
        address: 'Pattandur Agrahara, Near ITPL Gate 3',
        landmark: 'Walking distance to Pattandur Agrahara Metro',
        pincode: '560066',
        coordinates: { lat: 12.985, lng: 77.7368 },
      },
      pricing: {
        monthlyRent: 9000,
        deposit: 15000,
        foodIncluded: true,
        electricityIncluded: true,
        maintenanceAmount: 0,
        noticePeriodDays: 30,
        lockInPeriodMonths: 1,
        extraCharges: [],
      },
      roomTypes: [
        { sharing: 'single', monthlyRent: 14000, availableBeds: 2 },
        { sharing: 'double', monthlyRent: 9000, availableBeds: 6 },
      ],
      amenities: [
        'Wi-Fi',
        'Food',
        'Laundry',
        'Power Backup',
        'Gym',
        'Two-Wheeler Parking',
        'CCTV Security',
        'Housekeeping',
        'Geyser',
      ],
      houseRules: ['No smoking indoors', 'Rent due by the 5th of every month'],
      genderPolicy: 'any',
      photos: [
        {
          url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
          caption: 'Modern furnished bedroom',
          isPrimary: true,
        },
      ],
      contact: {
        phone: '+919845022334',
        email: 'owner@urbannest.in',
        whatsappEnabled: true,
        preferredTime: '9:00 AM – 8:00 PM',
      },
      status: 'published',
      availability: 'available',
      featured: false,
      viewsCount: 84,
      moderation: {
        reviewedBy: adminUser._id,
        reviewedAt: new Date(),
        rejectionReason: null,
        adminNotes: null,
      },
    },
    {
      ownerId: owner2._id,
      title: 'Banyan Tree Student Hostel',
      slug: 'banyan-tree-student-hostel-viman-nagar',
      type: 'hostel',
      description:
        'Clean, community-focused student hostel in Viman Nagar, Pune. 5 minutes walk from Symbiosis campus and Phoenix Marketcity. Wholesome home-cooked Maharashtrian & North Indian meals, study pods, and 24/7 security.',
      location: {
        city: 'Pune',
        locality: 'Viman Nagar',
        address: 'Lane 4, Datta Mandir Chowk, Viman Nagar',
        landmark: 'Near Symbiosis International University',
        pincode: '411014',
        coordinates: { lat: 18.5679, lng: 73.9143 },
      },
      pricing: {
        monthlyRent: 8800,
        deposit: 15000,
        foodIncluded: true,
        electricityIncluded: true,
        maintenanceAmount: 0,
        noticePeriodDays: 30,
        lockInPeriodMonths: 3,
        extraCharges: [],
      },
      roomTypes: [
        { sharing: 'double', monthlyRent: 10500, availableBeds: 3 },
        { sharing: 'triple', monthlyRent: 8800, availableBeds: 5 },
      ],
      amenities: [
        'Wi-Fi',
        'Food',
        'Study Desk',
        'Laundry',
        'Power Backup',
        'CCTV Security',
        'RO Water',
      ],
      houseRules: ['Curfew at 11:00 PM on weekdays', 'Visitors allowed in ground floor lounge'],
      genderPolicy: 'female',
      photos: [
        {
          url: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1200&q=80',
          caption: 'Twin sharing student accommodation',
          isPrimary: true,
        },
      ],
      contact: {
        phone: '+919886144556',
        email: 'vikram.stays@urbannest.in',
        whatsappEnabled: true,
        preferredTime: '9:00 AM – 7:00 PM',
      },
      status: 'published',
      availability: 'available',
      featured: false,
      viewsCount: 69,
      moderation: {
        reviewedBy: adminUser._id,
        reviewedAt: new Date(),
        rejectionReason: null,
        adminNotes: null,
      },
    },
    {
      ownerId: owner1._id,
      title: 'Cyber Heights Co-Living PG',
      slug: 'cyber-heights-co-living-pg-gachibowli',
      type: 'pg',
      description:
        'Modern paying guest stay in Gachibowli, Hyderabad, close to DLF Cyber City and Financial District. Equipped with AC rooms, high-speed internet, daily meals, and ergonomic workspaces.',
      location: {
        city: 'Hyderabad',
        locality: 'Gachibowli',
        address: 'Telecom Nagar, Near DLF Gate 2, Gachibowli',
        landmark: 'Opposite IIIT Hyderabad',
        pincode: '500032',
        coordinates: { lat: 17.4401, lng: 78.3489 },
      },
      pricing: {
        monthlyRent: 9800,
        deposit: 15000,
        foodIncluded: true,
        electricityIncluded: false,
        maintenanceAmount: 0,
        noticePeriodDays: 30,
        lockInPeriodMonths: 2,
        extraCharges: [],
      },
      roomTypes: [
        { sharing: 'single', monthlyRent: 15000, availableBeds: 2 },
        { sharing: 'double', monthlyRent: 9800, availableBeds: 4 },
      ],
      amenities: [
        'Wi-Fi',
        'Food',
        'AC',
        'Laundry',
        'Power Backup',
        'CCTV Security',
        'Housekeeping',
        'Two-Wheeler Parking',
      ],
      houseRules: ['Government ID verification mandatory'],
      genderPolicy: 'any',
      photos: [
        {
          url: 'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?auto=format&fit=crop&w=1200&q=80',
          caption: 'Spacious AC room with balcony',
          isPrimary: true,
        },
      ],
      contact: {
        phone: '+919845022334',
        email: 'owner@urbannest.in',
        whatsappEnabled: true,
        preferredTime: '9:00 AM – 8:00 PM',
      },
      status: 'published',
      availability: 'available',
      featured: false,
      viewsCount: 91,
      moderation: {
        reviewedBy: adminUser._id,
        reviewedAt: new Date(),
        rejectionReason: null,
        adminNotes: null,
      },
    },
    {
      ownerId: owner1._id,
      title: 'Pinehurst Men’s Stay (Pending Review)',
      slug: 'pinehurst-mens-stay-electronic-city',
      type: 'pg',
      description:
        'Newly renovated PG in Electronic City Phase 1 near Wipro and Infosys gates. Spacious double and triple sharing rooms with home-style meals and high-speed fiber Wi-Fi.',
      location: {
        city: 'Bengaluru',
        locality: 'Electronic City',
        address: 'Neeladri Road, Electronic City Phase 1',
        landmark: 'Near Wipro Gate 10',
        pincode: '560100',
        coordinates: { lat: 12.8452, lng: 77.6602 },
      },
      pricing: {
        monthlyRent: 7500,
        deposit: 12000,
        foodIncluded: true,
        electricityIncluded: true,
        maintenanceAmount: 0,
        noticePeriodDays: 30,
        lockInPeriodMonths: 1,
        extraCharges: [],
      },
      roomTypes: [
        { sharing: 'double', monthlyRent: 8500, availableBeds: 4 },
        { sharing: 'triple', monthlyRent: 7500, availableBeds: 6 },
      ],
      amenities: ['Wi-Fi', 'Food', 'Laundry', 'Power Backup', 'CCTV Security', 'RO Water'],
      houseRules: ['No smoking indoors'],
      genderPolicy: 'male',
      photos: [
        {
          url: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1200&q=80',
          caption: 'Double sharing room',
          isPrimary: true,
        },
      ],
      contact: {
        phone: '+919845022334',
        email: 'owner@urbannest.in',
        whatsappEnabled: true,
        preferredTime: '9:00 AM – 8:00 PM',
      },
      status: 'pending',
      availability: 'available',
      featured: false,
      viewsCount: 0,
      moderation: {
        reviewedBy: null,
        reviewedAt: null,
        rejectionReason: null,
        adminNotes: null,
      },
    },
  ]);

  // Seed sample favourites for studentUser
  await FavouriteModel.create([
    { userId: studentUser._id, listingId: listings[0]._id },
    { userId: studentUser._id, listingId: listings[1]._id },
  ]);

  // Seed a sample report for admin moderation queue
  await ReportModel.create({
    reporterId: studentUser._id,
    listingId: listings[3]._id,
    reason: 'incorrect_information',
    details:
      'Called to enquire about single sharing room; owner mentioned only 1 bed is left and AC electricity is ₹9 per unit.',
    status: 'open',
  });

  console.log('[Seed] Populated initial users, listings, favourites, and reports.');
}

// Allow running directly via `npm run seed`
if (process.argv[1]?.endsWith('seed.ts')) {
  (async () => {
    try {
      await connectDatabase();
      await seedInitialData(true);
      await disconnectDatabase();
      console.log('[Seed] Done.');
      process.exit(0);
    } catch (err) {
      console.error('[Seed] Failed:', err);
      process.exit(1);
    }
  })();
}
