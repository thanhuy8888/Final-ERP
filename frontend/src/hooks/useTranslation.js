import { useCallback } from 'react';
import { useLanguage } from '../context/LanguageContext';
import vi from '../locales/vi.json';
import en from '../locales/en.json';

const translations = { vi, en };

export const useTranslation = () => {
    const { language, setLanguage, toggleLanguage } = useLanguage();

    const t = useCallback((key, params = {}) => {
        const keys = key.split('.');
        let value = translations[language];

        for (const k of keys) {
            value = value?.[k];
        }

        if (!value) {
            console.warn(`Translation missing for key: ${key} in language: ${language}`);
            return key;
        }

        // Simple interpolation: replaces {{key}} with params[key]
        if (params && typeof params === 'object') {
            Object.keys(params).forEach(paramKey => {
                const regex = new RegExp(`{{${paramKey}}}`, 'g');
                value = value.replace(regex, params[paramKey]);
            });
        }

        return value;
    }, [language]);

    return { t, language, setLanguage, toggleLanguage };
};
