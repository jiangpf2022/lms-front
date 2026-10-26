import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/language-switcher";
import { getLocale, getTranslations } from 'next-intl/server';
import { getCurrentTenant } from "@/lib/supabase/tenant";
import { APP_NAME } from '@/lib/app-name';
import { NavbarTenantSwitcher } from "@/components/tenant/navbar-tenant-switcher";
import type { HeaderSettings } from "@/lib/landing-pages/types";
import type { TenantOption } from "@/components/tenant/navbar-tenant-switcher";
import { getSessionUser } from '@/lib/supabase/tenant'
import { isModelingDeveloper } from '@/lib/modeling/developer-settings'
import { cn } from '@/lib/utils'

const DEFAULT_TENANT_ID = '00000000-0000-0000-0000-000000000001'

interface NavbarProps {
    headerSettings?: HeaderSettings
}

export async function Navbar({ headerSettings }: NavbarProps = {}) {
    const configuredModelingAcademy = APP_NAME.toLowerCase().includes('modeling academy')
    const [supabase, user, t, locale, tenant] = await Promise.all([
        createClient(),
        getSessionUser(),
        getTranslations('navbar'),
        getLocale(),
        configuredModelingAcademy ? Promise.resolve(null) : getCurrentTenant(),
    ])

    const isMainPlatform = configuredModelingAcademy || !tenant || tenant.id === DEFAULT_TENANT_ID
    const isModelingAcademy = isMainPlatform && configuredModelingAcademy
    const userId = user?.id ?? null
    const isDeveloper = isModelingAcademy && isModelingDeveloper(user)
    const localized = (path: string) => `/${locale}${path}`
    const isChinese = locale.toLowerCase().startsWith('zh')

    // Load branding overrides from tenant_settings. `setting_value` is jsonb, so
    // the stored shape is only a claim until it is read — anything that is not a
    // string is dropped rather than rendered.
    let brandingOverrides: Record<string, string | undefined> = {};
    if (tenant && !isModelingAcademy) {
        const { data: tsData } = await supabase
            .from('tenant_settings')
            .select('setting_key, setting_value')
            .eq('tenant_id', tenant.id)
            .in('setting_key', ['site_name', 'logo_url']);
        if (tsData) {
            brandingOverrides = tsData.reduce<Record<string, string | undefined>>((acc, s) => {
                const stored = (s.setting_value as { value?: unknown } | null)?.value;
                if (typeof stored === 'string' && stored.trim()) acc[s.setting_key] = stored;
                return acc;
            }, {});
        }
    }

    // Get user's tenants for the switcher
    let userTenants: TenantOption[] = [];
    if (userId && !isModelingAcademy) {
        const { data } = await supabase
            .from('tenant_users')
            .select('role, tenant:tenants(id, slug, name)')
            .eq('user_id', userId)
            .eq('status', 'active');
        userTenants = (data ?? []).flatMap((tu) => {
            // PostgREST types an embedded to-one relation as possibly-array.
            const row = Array.isArray(tu.tenant) ? tu.tenant[0] : tu.tenant;
            return row ? [{ id: row.id, slug: row.slug, name: row.name, role: tu.role }] : [];
        });
    }

    const brandName = brandingOverrides.site_name || tenant?.name || APP_NAME;
    const logoUrl = brandingOverrides.logo_url || tenant?.logo_url;
    const platformLogo = '/brand/logo-mark.svg';

    return (
        <nav className="fixed top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
            <div className="container mx-auto flex h-16 items-center gap-2 px-3 md:gap-6 md:px-6">

                {/* Logo + Tenant Branding */}
                <div className={isModelingAcademy ? "hidden shrink-0 items-center gap-3 md:flex" : "flex shrink-0 items-center gap-3"}>
                    <Link href={isModelingAcademy ? localized('') : '/'} prefetch className="flex items-center space-x-2">
                        {logoUrl ? (
                            <img src={logoUrl} alt={brandName} className="w-8 h-8 rounded-lg object-cover" />
                        ) : isMainPlatform ? (
                            <img src={platformLogo} alt={brandName} className="w-8 h-8" />
                        ) : (
                            // The school's theme colour, via the tokens the layout resolved (#763).
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-primary">
                                <span className="font-bold text-primary-foreground">{brandName[0]?.toUpperCase()}</span>
                            </div>
                        )}
                        <span className={isModelingAcademy ? "hidden font-bold text-lg text-foreground tracking-tight xl:inline" : "font-bold text-lg text-foreground tracking-tight"}>
                            {brandName}
                        </span>
                    </Link>

                    {userTenants.length > 1 && (
                        <NavbarTenantSwitcher tenants={userTenants} />
                    )}
                </div>

                {/* Center Links */}
                <div className={isModelingAcademy ? "flex min-w-0 flex-1 items-center justify-center gap-0 sm:gap-1 lg:gap-3" : "hidden md:flex items-center space-x-8"}>
                    {isModelingAcademy ? (
                        <>
                            <Link href={localized('')} prefetch className="whitespace-nowrap rounded-full px-1.5 py-2 text-[10px] font-bold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:px-2 sm:text-xs lg:text-sm">
                                {isChinese ? '首页' : 'Home'}
                            </Link>
                            {[1, 2, 3].map((level) => <Link key={level} href={localized(`/courses/1/levels/${level}`)} prefetch className={cn('inline-flex whitespace-nowrap rounded-full border px-1.5 py-1.5 text-[9px] font-black sm:px-2 lg:px-2.5 lg:text-[10px]', level === 1 && 'border-emerald-300 bg-emerald-50 text-emerald-800 dark:bg-emerald-400/10 dark:text-emerald-200', level === 2 && 'border-amber-300 bg-amber-50 text-amber-800 dark:bg-amber-300/10 dark:text-amber-200', level === 3 && 'border-rose-300 bg-rose-50 text-rose-800 dark:bg-rose-400/10 dark:text-rose-200')}><span className="lg:hidden">L{level}</span><span className="hidden lg:inline">{isChinese ? `级别 ${level}` : `Level ${level}`}</span></Link>)}
                            <Link href={localized('/practice-center')} prefetch className="whitespace-nowrap rounded-full px-1.5 py-2 text-[10px] font-bold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:px-2 sm:text-xs lg:text-sm">
                                <span className="lg:hidden">{isChinese ? '练习' : 'Practice'}</span><span className="hidden lg:inline">{isChinese ? '练习中心' : 'Practice Center'}</span>
                            </Link>
                            <Link href={localized('/learning-center')} prefetch className="whitespace-nowrap rounded-full px-1.5 py-2 text-[10px] font-bold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:px-2 sm:text-xs lg:text-sm">
                                <span className="lg:hidden">{isChinese ? '面板' : 'Dashboard'}</span><span className="hidden lg:inline">{isChinese ? '学习面板' : 'Dashboard'}</span>
                            </Link>
                            {isDeveloper && <Link href={localized('/developer-center')} prefetch className="whitespace-nowrap rounded-full bg-rose-100 px-2 py-2 text-[10px] font-black text-rose-800 transition-colors hover:bg-rose-200 dark:bg-rose-400/10 dark:text-rose-200 sm:text-xs lg:text-sm">
                                <span className="lg:hidden">{isChinese ? '开发' : 'Dev'}</span><span className="hidden lg:inline">{isChinese ? '开发者中心' : 'Developer Center'}</span>
                            </Link>}
                        </>
                    ) : isMainPlatform ? (
                        <>
                            <Link href="/#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                                {t('features')}
                            </Link>
                            <Link href="/platform-pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                                {t('pricing')}
                            </Link>
                            <Link href="/creators" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                                {t('creators')}
                            </Link>
                        </>
                    ) : headerSettings?.navLinks && headerSettings.navLinks.length > 0 ? (
                        <>
                            {headerSettings.navLinks.map((link, idx) => (
                                <Link key={idx} href={link.href} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                                    {link.label}
                                </Link>
                            ))}
                        </>
                    ) : (
                        <>
                            <Link href="/courses" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                                {t('courses')}
                            </Link>
                            <Link href="/about" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                                {t('about')}
                            </Link>
                        </>
                    )}
                </div>

                {/* Right Actions */}
                <div className="flex shrink-0 items-center space-x-2 md:space-x-4">
                    {(headerSettings?.showLanguageSwitcher !== false) && <LanguageSwitcher />}

                    {userId ? (
                        <div className="flex items-center gap-2">
                            {isModelingAcademy ? (
                                <Button variant="outline" className="hidden xl:inline-flex" render={<Link href={localized('/learning-center')} prefetch />}>
                                    {isChinese ? '我的学习' : 'My Dashboard'}
                                </Button>
                            ) : <Button variant="outline" render={<Link href={localized('/dashboard/student')} />}>
                                {t('dashboard')}
                            </Button>}
                        </div>
                    ) : (
                        <>
                            {(headerSettings?.showLoginButton !== false) && (
                                <Button
                                    variant="ghost"
                                    className="hidden text-muted-foreground hover:text-foreground sm:inline-flex"
                                    render={<Link href={localized('/auth/login')} />}
                                >
                                    {isModelingAcademy ? (isChinese ? '登录' : 'Login') : t('login')}
                                </Button>
                            )}
                            {headerSettings?.ctaText && headerSettings?.ctaLink ? (
                                <Button className="font-medium" render={<Link href={headerSettings.ctaLink} />}>
                                    {headerSettings.ctaText}
                                </Button>
                            ) : isModelingAcademy ? (
                                <Button className="hidden font-medium xl:inline-flex" render={<Link href={localized('/courses/1')} prefetch />}>
                                    {isChinese ? '开始学习 →' : 'Start learning →'}
                                </Button>
                            ) : isMainPlatform ? (
                                <Button className="font-medium" render={<Link href="/create-school" />}>
                                    {t('startFree')} →
                                </Button>
                            ) : (
                                <Button className="font-medium" render={<Link href="/auth/sign-up?next=/join-school" />}>
                                    {t('join')} {tenant?.name}
                                </Button>
                            )}
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}
