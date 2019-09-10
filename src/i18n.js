import i18n from "i18next";
import detector from "i18next-browser-languagedetector";
import {
	initReactI18next
} from "react-i18next";
import translationEN from './locales/en/translation.json';
import translationCN from './locales/cn/translation.json';

// the translations
const resources = {
	en: {
		translation: translationEN
	},
	zh: {
		translation: translationCN
	}
};

i18n
    .use(detector)
	.use(initReactI18next) // passes i18n down to react-i18next
	.init({
		detection: {
			order: ['navigator']
		},
		resources,
        fallbackLng: "en",
		keySeparator: false, // we do not use keys in form messages.welcome
		interpolation: {
			escapeValue: false // react already safes from xss
		}
	});
export default i18n;
