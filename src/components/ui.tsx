import { useEffect, useRef, useState } from 'react';
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { createPortal } from 'react-dom';
import { AlertIcon, CheckIcon, ChevronDownIcon, InfoIcon, XIcon } from './icons';
import { useToast } from '../store/store';
import type { Toast } from '../store/store';

/* ---------------- scroll reveal ---------------- */

export function Reveal({ children, className = '', delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className={`reveal ${inView ? 'is-in' : ''} ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

/* ---------------- buttons ---------------- */

type Variant = 'primary' | 'dark' | 'outline' | 'ghost' | 'paper';

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-persimmon text-bone hover:bg-flame active:translate-y-px shadow-[0_10px_24px_-12px_rgba(228,87,46,0.6)]',
  dark: 'bg-pine text-chalk hover:bg-ink active:translate-y-px',
  outline: 'border border-line bg-bone text-ink hover:border-ink/40 hover:bg-mist/50 active:translate-y-px',
  ghost: 'text-moss hover:bg-mist/60 hover:text-ink active:translate-y-px',
  paper: 'bg-chalk text-ink hover:bg-mist active:translate-y-px',
};

const SIZES = {
  sm: 'h-8 px-3 text-[12.5px] gap-1.5',
  md: 'h-10 px-4 text-[13.5px] gap-2',
  lg: 'h-12 px-6 text-[15px] gap-2.5',
};

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: keyof typeof SIZES }) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-lg font-semibold tracking-wide transition-all duration-200 disabled:opacity-40 disabled:pointer-events-none ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

export function IconBtn({
  label,
  className = '',
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <button
      aria-label={label}
      title={label}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-lg text-moss transition-all duration-200 hover:bg-mist/70 hover:text-ink active:translate-y-px disabled:opacity-40 ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

/* ---------------- badges & chips ---------------- */

export function Badge({ className = '', children }: { className?: string; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 font-mono text-[10.5px] font-bold uppercase tracking-[0.12em] ${className}`}>
      {children}
    </span>
  );
}

export function Chip({
  active,
  onClick,
  children,
  className = '',
}: {
  active?: boolean;
  onClick?: () => void;
  children: ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex h-8 items-center gap-1.5 rounded-full border px-3.5 text-[12.5px] font-semibold transition-all duration-200 ${
        active
          ? 'border-pine bg-pine text-chalk shadow-[0_6px_16px_-8px_rgba(28,56,48,0.7)]'
          : 'border-line bg-bone text-moss hover:border-ink/30 hover:text-ink'
      } ${className}`}
    >
      {children}
    </button>
  );
}

/* ---------------- form fields ---------------- */

export function Field({ label, error, hint, children }: { label: string; error?: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-baseline justify-between font-mono text-[10.5px] font-bold uppercase tracking-[0.14em] text-moss">
        {label}
        {hint && <span className="font-sans text-[11px] font-medium normal-case tracking-normal text-fog">{hint}</span>}
      </span>
      {children}
      {error && (
        <span className="mt-1.5 flex items-center gap-1 text-[12px] font-medium text-persimmon">
          <AlertIcon size={13} /> {error}
        </span>
      )}
    </label>
  );
}

const FIELD_CLS =
  'w-full rounded-lg border border-line bg-bone px-3.5 text-[14px] text-ink placeholder:text-fog/80 transition-all duration-200 focus:border-pine focus:ring-2 focus:ring-pine/15 outline-none';

export function Input({ className = '', invalid, ...rest }: InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }) {
  return <input className={`${FIELD_CLS} h-10 ${invalid ? 'border-persimmon/60' : ''} ${className}`} {...rest} />;
}

export function Select({ className = '', children, ...rest }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select className={`${FIELD_CLS} h-10 appearance-none pr-9 ${className}`} {...rest}>
        {children}
      </select>
      <ChevronDownIcon size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-moss" />
    </div>
  );
}

export function Textarea({ className = '', ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={`${FIELD_CLS} min-h-[84px] py-2.5 resize-y ${className}`} {...rest} />;
}

/* ---------------- modal ---------------- */

export function Modal({
  open,
  onClose,
  title,
  kicker,
  children,
  width = 'max-w-lg',
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  kicker?: string;
  children: ReactNode;
  width?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-end justify-center p-0 sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-label={title}>
      <button aria-label="Close dialog" className="absolute inset-0 bg-ink/55 backdrop-blur-[3px]" onClick={onClose} />
      <div className={`rise-in relative max-h-[92vh] w-full ${width} overflow-y-auto thin-scroll rounded-t-2xl bg-chalk shadow-lift sm:rounded-xl border border-line`}>
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-line/70 bg-chalk/95 px-6 py-4 backdrop-blur-sm">
          <div>
            {kicker && <p className="font-mono text-[10.5px] font-bold uppercase tracking-[0.18em] text-persimmon">{kicker}</p>}
            <h2 className="font-display text-[21px] font-semibold leading-tight text-ink">{title}</h2>
          </div>
          <IconBtn label="Close" onClick={onClose}>
            <XIcon size={17} />
          </IconBtn>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>,
    document.body,
  );
}

/* ---------------- dropdown ---------------- */

export function Dropdown({
  button,
  items,
  align = 'right',
  label,
}: {
  button: ReactNode;
  items: { label: string; icon?: ReactNode; danger?: boolean; onClick: () => void }[];
  align?: 'left' | 'right';
  label: string;
}) {
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

  return (
    <div ref={ref} className="relative">
      <div onClick={() => setOpen((v) => !v)} aria-haspopup="menu" aria-expanded={open} aria-label={label}>
        {button}
      </div>
      {open && (
        <div
          role="menu"
          className={`rise-in absolute z-40 mt-1.5 min-w-[172px] overflow-hidden rounded-lg border border-line bg-bone p-1 shadow-lift ${align === 'right' ? 'right-0' : 'left-0'}`}
        >
          {items.map((item) => (
            <button
              key={item.label}
              role="menuitem"
              onClick={() => {
                setOpen(false);
                item.onClick();
              }}
              className={`flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-[13px] font-semibold transition-colors ${
                item.danger ? 'text-persimmon hover:bg-persimmon/10' : 'text-ink hover:bg-mist'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------------- tooltip ---------------- */

export function Tip({ label, children, side = 'top' }: { label: string; children: ReactNode; side?: 'top' | 'bottom' }) {
  return (
    <span className="group/tip relative inline-flex">
      {children}
      <span
        role="tooltip"
        className={`pointer-events-none absolute left-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded-md bg-ink px-2.5 py-1 font-mono text-[10.5px] font-bold uppercase tracking-wider text-chalk opacity-0 shadow-pop transition-all duration-200 group-hover/tip:opacity-100 ${
          side === 'top' ? 'bottom-full mb-1.5 translate-y-1 group-hover/tip:translate-y-0' : 'top-full mt-1.5 -translate-y-1 group-hover/tip:translate-y-0'
        }`}
      >
        {label}
      </span>
    </span>
  );
}

/* ---------------- empty state ---------------- */

export function EmptyState({ icon, title, desc, action }: { icon: ReactNode; title: string; desc: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-dashed border-line bg-bone/60 px-6 py-14 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-line bg-chalk text-moss">{icon}</div>
      <h3 className="font-display text-[19px] font-semibold text-ink">{title}</h3>
      <p className="mt-1.5 max-w-sm text-[13.5px] leading-relaxed text-moss">{desc}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

/* ---------------- progress & stats ---------------- */

export function ProgressBar({ value, color = 'var(--color-persimmon)', className = '' }: { value: number; color?: string; className?: string }) {
  const pct = Math.min(100, Math.max(0, value));
  return (
    <div className={`h-1.5 w-full overflow-hidden rounded-full bg-mist ${className}`}>
      <div className="h-full rounded-full transition-all duration-700 ease-out" style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}

export function Stat({ value, label, accent }: { value: ReactNode; label: string; accent?: boolean }) {
  return (
    <div className="min-w-0">
      <p className={`tnum font-display text-[26px] font-semibold leading-none ${accent ? 'text-persimmon' : 'text-ink'}`}>{value}</p>
      <p className="mt-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-fog">{label}</p>
    </div>
  );
}

/* ---------------- toaster ---------------- */

function ToastCard({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const meta = {
    success: { icon: <CheckIcon size={14} />, cls: 'bg-teal text-bone' },
    error: { icon: <AlertIcon size={14} />, cls: 'bg-persimmon text-bone' },
    info: { icon: <InfoIcon size={14} />, cls: 'bg-pine text-chalk' },
  }[toast.kind];

  return (
    <div className="toast-in pointer-events-auto flex w-full max-w-[340px] items-start gap-3 rounded-lg border border-line bg-bone p-3.5 shadow-lift">
      <span className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${meta.cls}`}>{meta.icon}</span>
      <div className="min-w-0 flex-1">
        <p className="text-[13.5px] font-bold leading-snug text-ink">{toast.title}</p>
        {toast.desc && <p className="mt-0.5 text-[12.5px] leading-snug text-moss">{toast.desc}</p>}
      </div>
      <button onClick={onDismiss} aria-label="Dismiss notification" className="text-fog transition-colors hover:text-ink">
        <XIcon size={14} />
      </button>
    </div>
  );
}

export function Toaster() {
  const { toasts, dismiss } = useToast();
  return createPortal(
    <div className="pointer-events-none fixed bottom-5 right-5 z-[90] flex flex-col items-end gap-2.5" aria-live="polite">
      {toasts.map((t) => (
        <ToastCard key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />
      ))}
    </div>,
    document.body,
  );
}
