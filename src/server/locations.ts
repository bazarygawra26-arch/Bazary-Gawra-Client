import 'server-only';
import { City, Country, State } from 'country-state-city';

export type SupportedLocale = 'en' | 'ku' | 'ar';

export interface LocationChoice {
  value: string;
  label: string;
  searchText: string;
}

export interface CountryChoice extends LocationChoice {
  phoneCode: string;
  canonicalName: string;
}

export interface ValidatedLocation {
  countryCode: string;
  country: string;
  governorateCode: string;
  governorate: string;
  city: string;
  phoneCode: string;
}

const governorateNames: Record<string, { ku: string; ar: string }> = {
  AN: { ku: 'پارێزگای ئەنبار', ar: 'محافظة الأنبار' },
  MU: { ku: 'پارێزگای موسەننا', ar: 'محافظة المثنى' },
  QA: { ku: 'پارێزگای قادسیە', ar: 'محافظة القادسية' },
  BB: { ku: 'پارێزگای بابل', ar: 'محافظة بابل' },
  BG: { ku: 'پارێزگای بەغدا', ar: 'محافظة بغداد' },
  BA: { ku: 'پارێزگای بەسرە', ar: 'محافظة البصرة' },
  DQ: { ku: 'پارێزگای زیقار', ar: 'محافظة ذي قار' },
  DI: { ku: 'پارێزگای دیالە', ar: 'محافظة ديالى' },
  DA: { ku: 'پارێزگای دهۆک', ar: 'محافظة دهوك' },
  AR: { ku: 'پارێزگای هەولێر', ar: 'محافظة أربيل' },
  KA: { ku: 'پارێزگای کەربەلا', ar: 'محافظة كربلاء' },
  KI: { ku: 'پارێزگای کەرکووک', ar: 'محافظة كركوك' },
  MA: { ku: 'پارێزگای میسان', ar: 'محافظة ميسان' },
  NA: { ku: 'پارێزگای نەجەف', ar: 'محافظة النجف' },
  NI: { ku: 'پارێزگای نەینەوا', ar: 'محافظة نينوى' },
  SD: { ku: 'پارێزگای سەلاحەدین', ar: 'محافظة صلاح الدين' },
  SU: { ku: 'پارێزگای سلێمانی', ar: 'محافظة السليمانية' },
  WA: { ku: 'پارێزگای واسط', ar: 'محافظة واسط' },
};

const iraqiCityNames: Record<string, { ku: string; ar: string }> = {
  baghdad: { ku: 'بەغدا', ar: 'بغداد' },
  erbil: { ku: 'هەولێر', ar: 'أربيل' },
  arbil: { ku: 'هەولێر', ar: 'أربيل' },
  dohuk: { ku: 'دهۆک', ar: 'دهوك' },
  'dihok': { ku: 'دهۆک', ar: 'دهوك' },
  basrah: { ku: 'بەسرە', ar: 'البصرة' },
  kirkuk: { ku: 'کەرکووک', ar: 'كركوك' },
  mosul: { ku: 'مووسڵ', ar: 'الموصل' },
  halabjah: { ku: 'هەڵەبجە', ar: 'حلبجة' },
  'as sulaymaniyah': { ku: 'سلێمانی', ar: 'السليمانية' },
};

function normalizedLocale(locale: string): SupportedLocale {
  if (locale === 'ar') return 'ar';
  if (locale === 'ku' || locale === 'ckb') return 'ku';
  return 'en';
}

function displayCountryName(countryCode: string, fallback: string, locale: SupportedLocale) {
  try {
    const language = locale === 'ku' ? 'ckb' : locale;
    const localizedName = new Intl.DisplayNames([language], { type: 'region' }).of(countryCode);
    return localizedName && localizedName.toUpperCase() !== countryCode ? localizedName : fallback;
  } catch {
    return fallback;
  }
}

function displayGovernorateName(
  stateName: string,
  stateCode: string,
  countryCode: string,
  locale: SupportedLocale
) {
  if (locale === 'en') return stateName;
  if (countryCode !== 'IQ') return stateName;
  return governorateNames[stateCode]?.[locale] || stateName;
}

function normalizeCityName(name: string) {
  return name
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim();
}

function displayCityName(name: string, countryCode: string, locale: SupportedLocale) {
  if (countryCode !== 'IQ' || locale === 'en') return name;
  return iraqiCityNames[normalizeCityName(name)]?.[locale] || name;
}

export function getCountryChoices(localeValue: string): CountryChoice[] {
  const locale = normalizedLocale(localeValue);
  const collator = new Intl.Collator(locale === 'ku' ? 'ckb' : locale, { sensitivity: 'base' });
  return Country.getAllCountries()
    .map((country) => ({
      value: country.isoCode,
      label: displayCountryName(country.isoCode, country.name, locale),
      searchText: `${country.name} ${country.isoCode} ${country.phonecode}`,
      phoneCode: country.phonecode.replace(/\D/g, ''),
      canonicalName: country.name,
    }))
    .sort((a, b) => collator.compare(a.label, b.label));
}

export function getCountryDetails(countryCode: string, localeValue: string) {
  const country = Country.getCountryByCode(countryCode.toUpperCase());
  if (!country) return null;

  const locale = normalizedLocale(localeValue);
  const states = State.getStatesOfCountry(country.isoCode);
  const countryCities = City.getCitiesOfCountry(country.isoCode) || [];
  return {
    country: {
      code: country.isoCode,
      name: country.name,
      label: displayCountryName(country.isoCode, country.name, locale),
      phoneCode: country.phonecode.replace(/\D/g, ''),
    },
    governorates: states
      .map((state) => ({
        value: state.isoCode,
        label: displayGovernorateName(state.name, state.isoCode, country.isoCode, locale),
        searchText: state.name,
        canonicalName: state.name,
      }))
      .sort((a, b) => a.label.localeCompare(b.label, locale === 'ku' ? 'ckb' : locale)),
    cities: states.length > 0
      ? []
      : getCityChoices(countryCities, country.isoCode, locale),
    customCityAllowed: states.length === 0 && countryCities.length === 0,
  };
}

function getCityChoices(
  cities: Array<{ name: string }>,
  countryCode: string,
  locale: SupportedLocale
) {
  const uniqueCities = new Map<string, { value: string; label: string; searchText: string }>();
  for (const city of cities) {
    if (!uniqueCities.has(city.name)) {
      uniqueCities.set(city.name, {
        value: city.name,
        label: displayCityName(city.name, countryCode, locale),
        searchText: city.name,
      });
    }
  }
  return [...uniqueCities.values()].sort((a, b) =>
    a.label.localeCompare(b.label, locale === 'ku' ? 'ckb' : locale)
  );
}

export function getCityChoicesForGovernorate(
  countryCode: string,
  governorateCode: string,
  localeValue: string
) {
  const locale = normalizedLocale(localeValue);
  const state = State.getStateByCodeAndCountry(governorateCode, countryCode);
  if (!state) return null;

  const cities = City.getCitiesOfState(countryCode, governorateCode);
  return {
    cities: getCityChoices(cities, countryCode, locale),
    customCityAllowed: cities.length === 0,
  };
}

export function validateLocation(
  countryCode: string,
  governorateCode: string,
  cityValue: string
): ValidatedLocation | null {
  const country = Country.getCountryByCode(countryCode.toUpperCase());
  const city = cityValue.trim();
  if (!country || !city || city.length > 100) return null;

  const states = State.getStatesOfCountry(country.isoCode);
  let stateName = '';
  let availableCities: Array<{ name: string }> = [];
  let resolvedGovernorateCode = '';

  if (states.length > 0) {
    const state = states.find((item) => item.isoCode === governorateCode);
    if (!state) return null;
    stateName = state.name;
    resolvedGovernorateCode = state.isoCode;
    availableCities = City.getCitiesOfState(country.isoCode, state.isoCode);
  } else {
    if (governorateCode) return null;
    availableCities = City.getCitiesOfCountry(country.isoCode) || [];
  }

  if (availableCities.length > 0 && !availableCities.some((item) => item.name === city)) {
    return null;
  }

  return {
    countryCode: country.isoCode,
    country: country.name,
    governorateCode: resolvedGovernorateCode,
    governorate: stateName,
    city,
    phoneCode: country.phonecode.replace(/\D/g, ''),
  };
}
