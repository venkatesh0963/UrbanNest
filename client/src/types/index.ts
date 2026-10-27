export * from '@urban-nest/shared';

export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export const SHARING_LABELS: Record<string, string> = {
  single: 'Single Private',
  double: 'Double Sharing',
  triple: 'Triple Sharing',
  four_plus: '4+ Sharing',
};

export const GENDER_LABELS: Record<string, string> = {
  any: 'Co-ed / All Genders',
  male: 'Men Only',
  female: 'Women Only',
};

export const STATUS_BADGE_STYLES: Record<string, string> = {
  published: 'bg-forest-100 text-forest-800 border border-forest-200',
  pending: 'bg-amber-50 text-amber-800 border border-amber-200',
  draft: 'bg-neutral-100 text-neutral-700 border border-neutral-200',
  rejected: 'bg-red-50 text-red-700 border border-red-200',
  suspended: 'bg-red-100 text-red-900 border border-red-300',
};

export const REPORT_REASON_LABELS: Record<string, string> = {
  incorrect_information: 'Incorrect Rent or Facility Information',
  fake_or_scam: 'Suspected Fake or Scam Listing',
  unavailable_property: 'Property No Longer Available',
  inappropriate_content: 'Inappropriate Photos or Description',
  duplicate_listing: 'Duplicate Advertisement',
  other: 'Other Issue',
};
