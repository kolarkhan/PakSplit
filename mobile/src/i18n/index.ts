import { en } from './translations/en';
import { ur } from './translations/ur';

export const dictionary = { en, ur };

export const t = (language: 'en' | 'ur', key: keyof typeof en) => dictionary[language][key] ?? key;
