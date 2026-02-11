import { Language, translations } from '@/constants/translations';
import { AuthService } from '@/utils/auth';
import React, { createContext, useContext, useEffect, useState } from 'react';

type LanguageContextType = {
    language: Language;
    setLanguage: (lang: Language) => Promise<void>;
    t: (key: keyof typeof translations['en']) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [language, setLang] = useState<Language>('en');

    useEffect(() => {
        const loadLanguage = async () => {
            const session = await AuthService.getSession();
            if (session?.language) {
                setLang(session.language as Language);
            }
        };
        loadLanguage();
    }, []);

    const setLanguage = async (lang: Language) => {
        setLang(lang);
        const session = await AuthService.getSession() || {};
        await AuthService.setSession({ ...session, language: lang });
    };

    const t = (key: keyof typeof translations['en']): string => {
        const langTranslations = translations[language] || translations['en'];
        return (langTranslations as any)[key] || (translations['en'] as any)[key] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useTranslation = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useTranslation must be used within a LanguageProvider');
    }
    return context;
};
