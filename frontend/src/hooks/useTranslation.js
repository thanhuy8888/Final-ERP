import { useLanguage } from '../context/LanguageContext';
import vi from '../locales/vi.json';
import en from '../locales/en.json';

const translations = { vi, en };

export const useTranslation = () => {
    const { language, setLanguage, toggleLanguage } = useLanguage();

    const t = (key) => {
        const keys = key.split('.');
        let value = translations[language];

        for (const k of keys) {
            value = value?.[k];
        }

        return value || key; // Return key if translation not found
    };

    return { t, language, setLanguage, toggleLanguage };
};
