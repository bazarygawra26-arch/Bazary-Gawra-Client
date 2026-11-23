'use client';

import React, { KeyboardEvent, useId, useState } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';

export interface SearchableOption {
  value: string;
  label: string;
  searchText?: string;
}

interface SearchableSelectProps {
  id: string;
  label: string;
  value: string;
  options: SearchableOption[];
  placeholder: string;
  searchPlaceholder: string;
  clearLabel: string;
  emptyMessage: string;
  moreResultsMessage: string;
  disabled?: boolean;
  error?: string;
  dir: 'ltr' | 'rtl';
  locale: string;
  onChange: (value: string) => void;
}

interface SearchableMultiSelectProps {
  id: string;
  label: string;
  searchPlaceholder: string;
  emptyMessage: string;
  options: SearchableOption[];
  value: string[];
  error?: string;
  dir: 'ltr' | 'rtl';
  locale: string;
  onChange: (value: string[]) => void;
}

const labelClassName = 'mb-1.5 block text-sm font-semibold text-neutral-700';
const inputClassName =
  'w-full rounded-xl border border-[#EAE7DF] bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus-visible:border-[#8C5E00] focus-visible:ring-2 focus-visible:ring-[#8C5E00]/20 disabled:cursor-not-allowed disabled:bg-neutral-100';

export function SearchableSelect({
  id,
  label,
  value,
  options,
  placeholder,
  searchPlaceholder,
  clearLabel,
  emptyMessage,
  moreResultsMessage,
  disabled = false,
  error,
  dir,
  locale,
  onChange,
}: SearchableSelectProps) {
  const generatedId = useId();
  const listboxId = `${generatedId}-options`;
  const errorId = `${generatedId}-error`;
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const selectedOption = options.find((option) => option.value === value);
  const normalizedQuery = query.trim().toLocaleLowerCase(locale);
  const matchingOptions = normalizedQuery
    ? options.filter((option) =>
        `${option.label} ${option.searchText || ''} ${option.value}`
          .toLocaleLowerCase(locale)
          .includes(normalizedQuery)
      )
    : options;
  const visibleOptions = matchingOptions.slice(0, 100);
  const hasMoreOptions = matchingOptions.length > visibleOptions.length;
  const visibleValue = isOpen ? query : selectedOption?.label || '';
  const activeOption = visibleOptions[activeIndex];

  function chooseOption(option: SearchableOption) {
    onChange(option.value);
    setQuery('');
    setIsOpen(false);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setIsOpen(true);
      setActiveIndex((index) => Math.min(index + 1, Math.max(visibleOptions.length - 1, 0)));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setIsOpen(true);
      setActiveIndex((index) => Math.max(index - 1, 0));
    } else if (event.key === 'Home' && isOpen) {
      event.preventDefault();
      setActiveIndex(0);
    } else if (event.key === 'End' && isOpen) {
      event.preventDefault();
      setActiveIndex(Math.max(visibleOptions.length - 1, 0));
    } else if (event.key === 'Enter' && isOpen && activeOption) {
      event.preventDefault();
      chooseOption(activeOption);
    } else if (event.key === 'Escape' && isOpen) {
      event.preventDefault();
      setIsOpen(false);
      setQuery('');
    } else if (event.key === 'Tab') {
      setIsOpen(false);
      setQuery('');
    }
  }

  return (
    <div className="relative" dir={dir}>
      <label htmlFor={id} className={labelClassName}>{label}</label>
      <div className="relative">
        <input
          id={id}
          type="text"
          role="combobox"
          autoComplete="off"
          aria-autocomplete="list"
          aria-expanded={isOpen}
          aria-controls={listboxId}
          aria-activedescendant={isOpen && activeOption ? `${listboxId}-${activeIndex}` : undefined}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          disabled={disabled}
          value={visibleValue}
          placeholder={isOpen ? searchPlaceholder : placeholder}
          className={`${inputClassName} pe-16 ${error ? 'border-red-400' : ''}`}
          onFocus={() => {
            setIsOpen(true);
            setQuery('');
            setActiveIndex(0);
          }}
          onChange={(event) => {
            setQuery(event.target.value);
            setIsOpen(true);
            setActiveIndex(0);
            if (value) onChange('');
          }}
          onKeyDown={handleKeyDown}
          onBlur={() => {
            setIsOpen(false);
            setQuery('');
          }}
        />
        <div className="pointer-events-none absolute inset-y-0 end-3 flex items-center gap-2 text-neutral-400">
          {value && !disabled && (
            <button
              type="button"
              aria-label={clearLabel}
              className="pointer-events-auto rounded p-1 hover:bg-neutral-100"
              onPointerDown={(event) => event.preventDefault()}
              onClick={() => {
                onChange('');
                setQuery('');
                setIsOpen(true);
              }}
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
          <ChevronDown className="h-4 w-4" aria-hidden="true" />
        </div>
      </div>
      {isOpen && !disabled && (
        <ul
          id={listboxId}
          role="listbox"
          aria-label={label}
          dir={dir}
          className="absolute z-30 mt-1 max-h-60 w-full overflow-y-auto rounded-xl border border-[#EAE7DF] bg-white p-1 shadow-lg"
        >
          {visibleOptions.length > 0 ? (
            <>
              {visibleOptions.map((option, index) => (
                <li
                  id={`${listboxId}-${index}`}
                  key={option.value}
                  role="option"
                  aria-selected={option.value === value}
                  className={`cursor-pointer rounded-lg px-3 py-2.5 text-sm text-neutral-800 ${
                    index === activeIndex ? 'bg-[#FFF8E8]' : 'hover:bg-[#FAF9F6]'
                  }`}
                  onPointerDown={(event) => event.preventDefault()}
                  onClick={() => chooseOption(option)}
                >
                  {option.label}
                </li>
              ))}
              {hasMoreOptions && (
                <li role="presentation" className="px-3 py-2 text-xs text-neutral-500">
                  {moreResultsMessage}
                </li>
              )}
            </>
          ) : (
            <li role="presentation" className="px-3 py-2.5 text-sm text-neutral-500">
              {emptyMessage}
            </li>
          )}
        </ul>
      )}
      {error && <p id={errorId} role="alert" className="mt-1.5 text-xs font-medium text-red-600">{error}</p>}
    </div>
  );
}

export function SearchableMultiSelect({
  id,
  label,
  searchPlaceholder,
  emptyMessage,
  options,
  value,
  error,
  dir,
  locale,
  onChange,
}: SearchableMultiSelectProps) {
  const searchId = `${id}-search`;
  const listId = `${id}-options`;
  const errorId = `${id}-error`;
  const [query, setQuery] = useState('');
  const normalizedQuery = query.trim().toLocaleLowerCase(locale);
  const visibleOptions = options.filter((option) =>
    `${option.label} ${option.searchText || ''} ${option.value}`
      .toLocaleLowerCase(locale)
      .includes(normalizedQuery)
  );

  function toggleOption(optionValue: string) {
    onChange(
      value.includes(optionValue)
        ? value.filter((selected) => selected !== optionValue)
        : [...value, optionValue]
    );
  }

  return (
    <fieldset
      className="sm:col-span-2"
      aria-describedby={error ? errorId : undefined}
      aria-invalid={Boolean(error)}
    >
      <legend className={labelClassName}>{label}</legend>
      <div className="relative">
        <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" aria-hidden="true" />
        <input
          id={searchId}
          type="search"
          autoComplete="off"
          aria-label={searchPlaceholder}
          aria-controls={listId}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={searchPlaceholder}
          className={`${inputClassName} ps-10 ${error ? 'border-red-400' : ''}`}
        />
      </div>
      <div
        id={listId}
        role="group"
        aria-label={label}
        dir={dir}
        className="mt-2 grid max-h-48 gap-1 overflow-y-auto rounded-xl border border-[#EAE7DF] p-2 sm:grid-cols-2"
      >
        {visibleOptions.length > 0 ? (
          visibleOptions.map((option) => (
            <label
              key={option.value}
              className="flex min-h-11 cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-sm text-neutral-700 hover:bg-[#FAF9F6]"
            >
              <input
                type="checkbox"
                checked={value.includes(option.value)}
                onChange={() => toggleOption(option.value)}
                className="h-4 w-4 shrink-0 accent-[#8C5E00]"
              />
              <span>{option.label}</span>
            </label>
          ))
        ) : (
          <p className="px-2 py-2 text-sm text-neutral-500">{emptyMessage}</p>
        )}
      </div>
      {error && <p id={errorId} role="alert" className="mt-1.5 text-xs font-medium text-red-600">{error}</p>}
    </fieldset>
  );
}
