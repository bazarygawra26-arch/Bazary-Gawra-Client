export function formatPrice(amount: number, currency: string = 'IQD', locale: string = 'ku'): string {
  const formattedNumber = amount.toLocaleString('en-US');
  const currencyLabels: Record<string, Record<string, string>> = {
    IQD: {
      ku: 'دینار',
      ckb: 'دینار',
      ar: 'د.ع',
      en: 'IQD',
    },
    USD: {
      ku: 'دۆلار',
      ckb: 'دۆلار',
      ar: 'دولار',
      en: 'USD',
    },
  };

  const symbol = currencyLabels[currency]?.[locale] || currency;
  return `${formattedNumber} ${symbol}`;
}

export function formatNumber(num: number, locale: string = 'ku'): string {
  return num.toLocaleString('en-US');
}
