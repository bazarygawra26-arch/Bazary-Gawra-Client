import { NextRequest, NextResponse } from 'next/server';
import {
  getCityChoicesForGovernorate,
  getCountryChoices,
  getCountryDetails,
} from '../../../server/locations';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const cacheHeaders = {
  'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const locale = searchParams.get('lang') || 'en';
  const countryCode = searchParams.get('country')?.toUpperCase();
  const governorateCode = searchParams.get('governorate')?.toUpperCase();

  if (!countryCode) {
    return NextResponse.json(
      { countries: getCountryChoices(locale) },
      { headers: cacheHeaders }
    );
  }

  const details = getCountryDetails(countryCode, locale);
  if (!details) {
    return NextResponse.json({ error: 'Choose a valid country.' }, { status: 400 });
  }

  if (!governorateCode) {
    return NextResponse.json(details, { headers: cacheHeaders });
  }

  const location = getCityChoicesForGovernorate(countryCode, governorateCode, locale);
  if (!location) {
    return NextResponse.json({ error: 'Choose a valid governorate.' }, { status: 400 });
  }

  return NextResponse.json(
    { ...details, ...location },
    { headers: cacheHeaders }
  );
}
