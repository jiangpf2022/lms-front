'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { APP_NAME } from '@/lib/app-name';

export function LanguageSwitcher() {
  const pathname = usePathname();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('common');
  const modelingAcademy = APP_NAME.toLowerCase().includes('modeling academy');

  const switchLocale = (newLocale: string) => {
    const currentPath = pathname;
    const parts = currentPath.split('/');
    // Parts: ["", "en", "dashboard"]

    // Check if parts[1] is a locale
    if (['en', 'es', 'zh'].includes(parts[1])) {
      parts[1] = newLocale;
    } else {
      // Should not happen with 'always' prefix providing middleware works.
      // But if we are at root /, and middleware didn't redirect for some reason?
      // Just insert it.
      parts.splice(1, 0, newLocale);
    }

    const newPath = parts.join('/').replace('//', '/');
    router.push(newPath);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "w-9 px-0")}>
        <Globe className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all" />
        <span className="sr-only">{modelingAcademy && locale.startsWith('zh') ? '切换语言' : t('toggleLanguage')}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => switchLocale('en')}>English</DropdownMenuItem>
        {modelingAcademy ? (
          <DropdownMenuItem onClick={() => switchLocale('zh')}>中文</DropdownMenuItem>
        ) : (
          <>
            <DropdownMenuItem onClick={() => switchLocale('es')}>Español</DropdownMenuItem>
            <DropdownMenuItem onClick={() => switchLocale('zh')}>中文</DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
