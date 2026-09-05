import { useI18n } from '../i18n/translations';
import { ChevronDownIcon, GlobeIcon } from './icons';
import { useState, useEffect, useRef } from 'react';

export function LanguageSwitcher() {
  const { locale, setLocale, isRTL } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const languages = [
    { code: 'en' as const, label: 'English', native: 'English' },
    { code: 'ar' as const, label: 'العربية', native: 'العربية' },
  ];

  const currentLang = languages.find((l) => l.code === locale) ?? languages[0];

  return (
    <div ref={ref} className="relative" dir="ltr">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Change language"
        aria-expanded={open}
        className="flex items-center gap-2 rounded-full border border-line bg-bone py-1 pl-1 pr-2.5 transition-all hover:border-ink/30 hover:shadow-pop"
      >
        <GlobeIcon size={14} className="text-moss" />
        <span className="hidden text-[13px] font-bold text-ink md:block">{currentLang.native}</span>
        <ChevronDownIcon size={13} className="text-moss" />
      </button>

      {open && (
        <div
          role="menu"
          className="rise-in absolute right-0 z-50 mt-1.5 min-w-[172px] overflow-hidden rounded-lg border border-line bg-bone p-1 shadow-lift"
        >
          {languages.map((lang) => (
            <button
              key={lang.code}
              role="menuitem"
              onClick={() => {
                setLocale(lang.code);
                setOpen(false);
              }}
              className={`flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-[13px] font-semibold transition-colors ${
                locale === lang.code
                  ? 'bg-pine text-chalk'
                  : 'text-ink hover:bg-mist'
              }`}
              dir={lang.code === 'ar' ? 'rtl' : 'ltr'}
            >
              <span style={{ fontFamily: lang.code === 'ar' ? 'var(--font-arabic)' : 'inherit' }}>
                {lang.native}
              </span>
              {locale === lang.code && (
                <span className="ml-auto">✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
