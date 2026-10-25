import Link from "next/link";
import { getCurrentTenant } from "@/lib/supabase/tenant";
import { getTranslations } from 'next-intl/server';
import { APP_NAME } from '@/lib/app-name';
import { IconBrandTwitter, IconBrandFacebook, IconBrandInstagram, IconBrandYoutube, IconBrandLinkedin, IconBrandTiktok, IconBrandGithub } from '@tabler/icons-react'
import type { FooterSettings, SocialPlatform } from "@/lib/landing-pages/types";

const DEFAULT_TENANT_ID = '00000000-0000-0000-0000-000000000001'

const SOCIAL_ICONS: Record<SocialPlatform, React.ComponentType<{ className?: string }>> = {
    twitter: IconBrandTwitter,
    facebook: IconBrandFacebook,
    instagram: IconBrandInstagram,
    youtube: IconBrandYoutube,
    linkedin: IconBrandLinkedin,
    tiktok: IconBrandTiktok,
    github: IconBrandGithub,
}

interface FooterProps {
    footerSettings?: FooterSettings
}

export async function Footer({ footerSettings }: FooterProps = {}) {
    const tenant = await getCurrentTenant();
    const t = await getTranslations('landingPageBuilder.footer');
    // Real product name (#730) when there's no tenant to brand this footer with
    // (the platform's own marketing pages).
    const platformName = APP_NAME;
    const brandName = tenant && tenant.id !== DEFAULT_TENANT_ID ? tenant.name : platformName;
    const isModelingAcademy = (!tenant || tenant.id === DEFAULT_TENANT_ID) && APP_NAME.toLowerCase().includes('modeling academy')

    // If footerSettings is provided, render custom footer
    if (footerSettings) {
        return (
            <footer className="border-t border-border bg-muted/50 py-12">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
                        {/* Brand column */}
                        <div>
                            <h3 className="font-bold text-lg mb-4 text-foreground">{brandName}</h3>
                            {footerSettings.description && (
                                <p className="text-muted-foreground text-sm">{footerSettings.description}</p>
                            )}
                            {footerSettings.socialLinks && footerSettings.socialLinks.length > 0 && (
                                <div className="flex items-center gap-3 mt-4">
                                    {footerSettings.socialLinks.map((link, idx) => {
                                        const Icon = SOCIAL_ICONS[link.platform]
                                        if (!Icon) return null
                                        return (
                                            <a
                                                key={idx}
                                                href={link.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-muted-foreground hover:text-foreground transition-colors"
                                                title={link.platform}
                                            >
                                                <Icon className="w-5 h-5" />
                                            </a>
                                        )
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Custom columns */}
                        {footerSettings.columns?.map((column, idx) => (
                            <div key={idx}>
                                <h4 className="font-semibold text-foreground mb-4">{column.title}</h4>
                                <ul className="space-y-2 text-sm text-muted-foreground">
                                    {column.links?.map((link, linkIdx) => (
                                        <li key={linkIdx}>
                                            <a href={link.href} className="hover:text-foreground transition-colors">
                                                {link.label}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>

                    <div className="mt-12 pt-8 border-t border-border text-center text-sm text-muted-foreground">
                        {footerSettings.copyrightText || `\u00A9 ${new Date().getFullYear()} ${brandName}. ${t('allRightsReserved')}`}
                    </div>
                </div>
            </footer>
        )
    }

    if (isModelingAcademy) {
        return (
            <footer className="border-t border-white/10 bg-[#0d1713] py-12 text-white">
                <div className="container mx-auto px-4">
                    <div className="flex flex-wrap items-start justify-between gap-8">
                        <div className="max-w-xl">
                            <h3 className="text-lg font-bold">{brandName}</h3>
                            <p className="mt-3 text-sm leading-6 text-white/55">
                                A bilingual, competition-oriented mathematical modeling tutorial built around defensible assumptions, derivations, evidence, and decisions.
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-x-7 gap-y-3 text-sm text-white/65">
                            <Link href="/#syllabus" className="hover:text-amber-300">Syllabus</Link>
                            <Link href="/#quizzes" className="hover:text-amber-300">Quizzes</Link>
                            <Link href="/courses/1" className="hover:text-amber-300">Course center</Link>
                            <Link href="/auth/login" className="hover:text-amber-300">My Learning</Link>
                        </div>
                    </div>
                    <div className="mt-10 border-t border-white/10 pt-6 text-xs text-white/35">
                        &copy; {new Date().getFullYear()} {brandName}. Built for careful modeling, not black-box answers.
                    </div>
                </div>
            </footer>
        )
    }

    // Default footer (#730): every link must resolve to a route that
    // actually exists under app/[locale]/(public)/ — a school that hasn't
    // configured its own footer yet gets Courses, Pricing and About, not
    // "Instructors" / "Careers" / "Contact" / legal pages that were never built.
    return (
        <footer className="border-t border-border bg-muted/50 py-12">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                    <div>
                        <h3 className="font-bold text-lg mb-4 text-foreground">{brandName}</h3>
                        <p className="text-muted-foreground text-sm">
                            {t('defaultDescription')}
                        </p>
                    </div>

                    <div>
                        <h4 className="font-semibold text-foreground mb-4">{t('platform')}</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link href="/courses" className="hover:text-foreground transition-colors">{t('courses')}</Link></li>
                            <li><Link href="/pricing" className="hover:text-foreground transition-colors">{t('pricing')}</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold text-foreground mb-4">{t('company')}</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link href="/about" className="hover:text-foreground transition-colors">{t('aboutUs')}</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="mt-12 pt-8 border-t border-border text-center text-sm text-muted-foreground">
                    &copy; {new Date().getFullYear()} {brandName}. {t('allRightsReserved')}
                </div>
            </div>
        </footer>
    );
}
