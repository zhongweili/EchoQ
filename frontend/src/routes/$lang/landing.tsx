import { Hero } from "../../components/Landing/Hero";
import { Features } from "../../components/Landing/Features";
import { HowItWorks } from "../../components/Landing/HowItWorks";
import { CTA } from "../../components/Landing/CTA";
import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';

export const Route = createFileRoute('/$lang/landing')({
    component: Landing,
    parseParams: (params) => {
        return {
            lang: params.lang
        }
    }
});

function Landing() {
    const { i18n } = useTranslation();
    const { lang } = Route.useParams();

    useEffect(() => {
        if (lang && i18n.language !== lang) {
            i18n.changeLanguage(lang);
        }
    }, [lang, i18n]);

    return (
        <main className="bg-white">
            <Hero />
            <Features />
            <HowItWorks />
            <CTA />
        </main>
    );
}
