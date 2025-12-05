'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations, Language, TranslationKeys } from '@/lib/translations';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string, params?: Record<string, string>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguageState] = useState<Language>('zh');

    useEffect(() => {
        const storedLang = localStorage.getItem('language') as Language;
        if (storedLang && (storedLang === 'zh' || storedLang === 'en')) {
            setLanguageState(storedLang);
        }
    }, []);

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem('language', lang);
    };

    const t = (path: string, params?: Record<string, string>): string => {
        const keys = path.split('.');
        let value: any = translations[language];

        for (const key of keys) {
            if (value && typeof value === 'object' && key in value) {
                value = value[key as keyof typeof value];
            } else {
                return path; // Return key if not found
            }
        }

        if (typeof value === 'string' && params) {
            return Object.entries(params).reduce((acc, [key, val]) => {
                return acc.replace(new RegExp(`{{${key}}}`, 'g'), val);
            }, value);
        }

        return typeof value === 'string' ? value : path;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
