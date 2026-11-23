'use client';

import React, { useEffect, useState } from 'react';
import { SearchableOption, SearchableSelect } from '../ui/SearchableSelect';

interface LocationFieldsProps {
  idPrefix: string;
  locale: 'en' | 'ku' | 'ar';
  dir: 'ltr' | 'rtl';
  countryCode: string;
  governorateCode: string;
  city: string;
  phone: string;
  labels: {
    country: string;
    countryPlaceholder: string;
    countrySearch: string;
    governorate: string;
    governoratePlaceholder: string;
    governorateSearch: string;
    city: string;
    cityPlaceholder: string;
    citySearch: string;
    phone: string;
    noCities: string;
    loading: string;
    moreResults: string;
    noOptions: string;
    clear: string;
    locationUnavailable: string;
  };
  error?: string;
  onCountryChange: (value: string) => void;
  onGovernorateChange: (value: string) => void;
  onCityChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
  onValidityChange: (isValid: boolean) => void;
}

interface LocationResponse {
  countries?: Array<SearchableOption & { phoneCode: string }>;
  country?: { code: string; name: string; label: string; phoneCode: string };
  governorates?: Array<SearchableOption & { canonicalName: string }>;
  cities?: SearchableOption[];
  customCityAllowed?: boolean;
  error?: string;
}

const inputClassName =
  'w-full rounded-xl border border-[#EAE7DF] bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus-visible:border-[#8C5E00] focus-visible:ring-2 focus-visible:ring-[#8C5E00]/20';
const labelClassName = 'mb-1.5 block text-sm font-semibold text-neutral-700';

export function LocationFields({
  idPrefix,
  locale,
  dir,
  countryCode,
  governorateCode,
  city,
  phone,
  labels,
  error,
  onCountryChange,
  onGovernorateChange,
  onCityChange,
  onPhoneChange,
  onValidityChange,
}: LocationFieldsProps) {
  const [countries, setCountries] = useState<NonNullable<LocationResponse['countries']>>([]);
  const [countriesLocale, setCountriesLocale] = useState('');
  const [countryLoadFailure, setCountryLoadFailure] = useState<{ locale: string; message: string } | null>(null);
  const [governorates, setGovernorates] = useState<NonNullable<LocationResponse['governorates']>>([]);
  const [cities, setCities] = useState<NonNullable<LocationResponse['cities']>>([]);
  const [phoneCode, setPhoneCode] = useState('');
  const [customCityAllowed, setCustomCityAllowed] = useState(false);
  const [locationDataKey, setLocationDataKey] = useState('');
  const [locationLoadFailure, setLocationLoadFailure] = useState<{ key: string; message: string } | null>(null);
  const locationRequestKey = `${locale}:${countryCode}:${governorateCode}`;
  const hasCurrentLocationData = Boolean(countryCode && locationDataKey === locationRequestKey);
  const isLoadingCountries = countriesLocale !== locale && countryLoadFailure?.locale !== locale;
  const isLoadingOptions = Boolean(countryCode) &&
    !hasCurrentLocationData &&
    locationLoadFailure?.key !== locationRequestKey;
  const loadError =
    countryLoadFailure?.locale === locale
      ? countryLoadFailure.message
      : locationLoadFailure?.key === locationRequestKey
        ? locationLoadFailure.message
        : '';
  const countryOptions = countriesLocale === locale ? countries : [];
  const governorateOptions = hasCurrentLocationData ? governorates : [];
  const cityOptions = hasCurrentLocationData ? cities : [];
  const currentPhoneCode = hasCurrentLocationData ? phoneCode : '';
  const currentCustomCityAllowed = hasCurrentLocationData && customCityAllowed;

  useEffect(() => {
    const controller = new AbortController();

    async function loadCountries() {
      try {
        const response = await fetch(`/api/locations?lang=${locale}`, {
          cache: 'force-cache',
          signal: controller.signal,
        });
        const result = await response.json() as LocationResponse;
        if (!response.ok || !Array.isArray(result.countries)) {
          throw new Error(result.error || labels.locationUnavailable);
        }
        if (controller.signal.aborted) return;
        setCountries(result.countries);
        setCountriesLocale(locale);
        setCountryLoadFailure(null);
      } catch (loadFailure) {
        if (!controller.signal.aborted) {
          setCountryLoadFailure({
            locale,
            message: loadFailure instanceof Error ? loadFailure.message : labels.locationUnavailable,
          });
        }
      }
    }

    void loadCountries();
    return () => controller.abort();
  }, [labels.locationUnavailable, locale]);

  useEffect(() => {
    const controller = new AbortController();

    if (!countryCode) return () => controller.abort();

    async function loadLocationOptions() {
      try {
        const params = new URLSearchParams({ country: countryCode, lang: locale });
        if (governorateCode) params.set('governorate', governorateCode);
        const response = await fetch(`/api/locations?${params.toString()}`, {
          cache: 'force-cache',
          signal: controller.signal,
        });
        const result = await response.json() as LocationResponse;
        if (!response.ok || !result.country) {
          throw new Error(result.error || labels.locationUnavailable);
        }
        if (controller.signal.aborted) return;
        setPhoneCode(result.country.phoneCode);
        setGovernorates(result.governorates || []);
        setCities(result.cities || []);
        setCustomCityAllowed(Boolean(result.customCityAllowed));
        setLocationDataKey(locationRequestKey);
        setLocationLoadFailure(null);
      } catch (loadFailure) {
        if (!controller.signal.aborted) {
          setLocationLoadFailure({
            key: locationRequestKey,
            message: loadFailure instanceof Error ? loadFailure.message : labels.locationUnavailable,
          });
        }
      }
    }

    void loadLocationOptions();
    return () => controller.abort();
  }, [countryCode, governorateCode, labels.locationUnavailable, locale, locationRequestKey]);

  useEffect(() => {
    const hasValidGovernorate = governorateOptions.length === 0 || Boolean(governorateCode);
    const hasValidCity = hasCurrentLocationData && (
      cities.length > 0
        ? cities.some((option) => option.value === city)
        : currentCustomCityAllowed && city.trim().length >= 2 && city.trim().length <= 100
    );

    onValidityChange(
      !isLoadingCountries &&
      !isLoadingOptions &&
      Boolean(countryCode && currentPhoneCode && hasValidGovernorate && hasValidCity)
    );
  }, [
    city,
    cities,
    countryCode,
    currentCustomCityAllowed,
    currentPhoneCode,
    governorateCode,
    governorateOptions.length,
    hasCurrentLocationData,
    isLoadingCountries,
    isLoadingOptions,
    onValidityChange,
  ]);

  const isCityDisabled =
    !countryCode ||
    isLoadingOptions ||
    (governorateOptions.length > 0 && !governorateCode);

  return (
    <div className="grid gap-4 sm:grid-cols-2" dir={dir}>
      <SearchableSelect
        id={`${idPrefix}-country`}
        label={labels.country}
        value={countryCode}
        options={countryOptions}
        placeholder={isLoadingCountries ? labels.loading : labels.countryPlaceholder}
        searchPlaceholder={labels.countrySearch}
        clearLabel={labels.clear}
        emptyMessage={labels.noOptions}
        moreResultsMessage={labels.moreResults}
        disabled={isLoadingCountries || countryOptions.length === 0}
        error={error && !countryCode ? error : undefined}
        dir={dir}
        locale={locale === 'ku' ? 'ckb' : locale}
        onChange={(value) => {
          onCountryChange(value);
          onGovernorateChange('');
          onCityChange('');
          onPhoneChange('');
        }}
      />

      {governorateOptions.length > 0 && (
        <SearchableSelect
          id={`${idPrefix}-governorate`}
          label={labels.governorate}
          value={governorateCode}
          options={governorateOptions}
          placeholder={isLoadingOptions ? labels.loading : labels.governoratePlaceholder}
          searchPlaceholder={labels.governorateSearch}
          clearLabel={labels.clear}
          emptyMessage={labels.noOptions}
          moreResultsMessage={labels.moreResults}
          disabled={!countryCode || isLoadingOptions}
          error={error && !governorateCode ? error : undefined}
          dir={dir}
          locale={locale === 'ku' ? 'ckb' : locale}
          onChange={(value) => {
            onGovernorateChange(value);
            onCityChange('');
          }}
        />
      )}

      {cityOptions.length > 0 || !currentCustomCityAllowed ? (
        <SearchableSelect
          id={`${idPrefix}-city`}
          label={labels.city}
          value={city}
          options={cityOptions}
          placeholder={isCityDisabled ? labels.governoratePlaceholder : labels.cityPlaceholder}
          searchPlaceholder={labels.citySearch}
          clearLabel={labels.clear}
          emptyMessage={labels.noOptions}
          moreResultsMessage={labels.moreResults}
          disabled={isCityDisabled}
          error={error && !city ? error : undefined}
          dir={dir}
          locale={locale === 'ku' ? 'ckb' : locale}
          onChange={onCityChange}
        />
      ) : currentCustomCityAllowed && !isLoadingOptions ? (
        <div>
          <label htmlFor={`${idPrefix}-city`} className={labelClassName}>{labels.city}</label>
          <input
            id={`${idPrefix}-city`}
            required
            maxLength={100}
            autoComplete="address-level2"
            value={city}
            onChange={(event) => onCityChange(event.target.value)}
            placeholder={labels.cityPlaceholder}
            className={`${inputClassName} ${error && !city ? 'border-red-400' : ''}`}
          />
        </div>
      ) : (
        <div>
          <label htmlFor={`${idPrefix}-city-loading`} className={labelClassName}>{labels.city}</label>
          <p
            id={`${idPrefix}-city-loading`}
            className="flex min-h-[46px] items-center rounded-xl border border-[#EAE7DF] bg-neutral-50 px-4 text-sm text-neutral-500"
            aria-live="polite"
          >
            {isLoadingOptions ? labels.loading : labels.noCities}
          </p>
        </div>
      )}

      <div>
        <label htmlFor={`${idPrefix}-phone`} className={labelClassName}>{labels.phone}</label>
        <div className="flex gap-2" dir="ltr">
          <span
            className="flex min-w-16 items-center justify-center rounded-xl border border-[#EAE7DF] bg-neutral-50 px-3 text-sm font-semibold text-neutral-700"
            aria-label={labels.phone}
          >
            {currentPhoneCode ? `+${currentPhoneCode}` : '+'}
          </span>
          <input
            id={`${idPrefix}-phone`}
            type="tel"
            inputMode="tel"
            autoComplete="tel-national"
            required
            maxLength={24}
            pattern="[0-9(). -]{5,24}"
            value={phone}
            onChange={(event) => onPhoneChange(event.target.value)}
            placeholder="750 123 4567"
            aria-invalid={Boolean(error && !phone)}
            className={`${inputClassName} min-w-0 ${error && !phone ? 'border-red-400' : ''}`}
          />
        </div>
      </div>

      {loadError && (
        <p role="alert" className="text-sm text-red-700 sm:col-span-2">{loadError}</p>
      )}
      {error && (
        <p role="alert" className="text-sm text-red-700 sm:col-span-2">{error}</p>
      )}
    </div>
  );
}
