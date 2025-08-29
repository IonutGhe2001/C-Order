import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import ro from '../locales/ro/common.json';
import en from '../locales/en/common.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      ro: { translation: ro },
      en: { translation: en }
    },
    lng: 'ro',
    fallbackLng: 'en',
    interpolation: { escapeValue: false }
  });

export const formatDate = (date: Date) =>
  new Intl.DateTimeFormat(i18n.language).format(date);

export const formatDateTime = (date: Date) =>
  new Intl.DateTimeFormat(i18n.language, {
    dateStyle: 'short',
    timeStyle: 'short'
  }).format(date);

export const formatNumber = (n: number) =>
  new Intl.NumberFormat(i18n.language).format(n);

export default i18n;