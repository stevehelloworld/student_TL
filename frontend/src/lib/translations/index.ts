import { zh } from './zh';
import { en } from './en';

export const translations = {
    zh,
    en,
};

export type Language = 'zh' | 'en';
export type TranslationKeys = typeof zh;
