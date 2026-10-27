import { ListingModel } from '../models/Listing.js';

export function slugifyText(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function generateUniqueListingSlug(title: string, locality: string): Promise<string> {
  const base = slugifyText(`${title}-${locality}`) || 'urban-nest-stay';
  let candidate = base;
  let counter = 1;

  while (await ListingModel.exists({ slug: candidate })) {
    counter += 1;
    candidate = `${base}-${counter}`;
  }

  return candidate;
}
