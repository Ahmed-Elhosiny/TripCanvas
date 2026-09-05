import type { Place } from '../types';
import { CITIES, CATEGORY_META } from '../types';
import { durationLabel, money } from '../lib/format';
import type { Currency } from '../types';
import { Badge } from './ui';
import { CategoryIcon, CheckIcon, ClockIcon, PlusIcon, StarIcon } from './icons';

/* ---------------- rating ---------------- */

export function Rating({ rating, reviews }: { rating: number; reviews?: number }) {
  return (
    <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-ink">
      <StarIcon size={13} className="text-saffron" style={{ fill: 'var(--color-saffron)' }} />
      <span className="tnum">{rating.toFixed(1)}</span>
      {reviews !== undefined && <span className="tnum font-mono text-[10.5px] font-normal text-fog">({(reviews / 1000).toFixed(reviews >= 100000 ? 0 : 1)}k)</span>}
    </span>
  );
}

/* ---------------- place visual (photo or designed fallback) ---------------- */

export function PlaceVisual({ place, className = '' }: { place: Place; className?: string }) {
  if (place.image) {
    return (
      <div className={`overflow-hidden ${className}`}>
        <img src={place.image} alt={place.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]" />
      </div>
    );
  }
  const meta = CATEGORY_META[place.category];
  return (
    <div className={`relative flex items-center justify-center overflow-hidden ${className}`} style={{ background: 'var(--color-pine)' }}>
      <div className="dark-grain absolute inset-0" />
      <svg viewBox="0 0 100 60" className="absolute inset-0 h-full w-full opacity-25" preserveAspectRatio="none" aria-hidden="true">
        {[12, 24, 36, 48].map((y) => (
          <path key={y} d={`M0 ${y} Q 25 ${y - 6}, 50 ${y} T 100 ${y}`} fill="none" stroke="#7A9683" strokeWidth="0.7" />
        ))}
      </svg>
      <div className="relative flex flex-col items-center gap-1.5 text-chalk/90">
        <CategoryIcon category={place.category} size={26} />
        <span className="font-mono text-[9px] font-bold tracking-[0.18em]">
          {place.lat.toFixed(2)}°N · {place.lng.toFixed(2)}°E
        </span>
      </div>
      <span className="absolute left-2.5 top-2.5 h-2 w-2 rounded-full" style={{ background: meta.color }} />
    </div>
  );
}

/* ---------------- place card ---------------- */

export function PlaceCard({
  place,
  currency,
  saved,
  onToggleSave,
  onAdd,
}: {
  place: Place;
  currency: Currency;
  saved: boolean;
  onToggleSave: () => void;
  onAdd?: () => void;
}) {
  const meta = CATEGORY_META[place.category];
  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-line bg-bone shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lift">
      <div className="relative">
        <PlaceVisual place={place} className="h-40 w-full" />
        <div className="absolute left-2.5 top-2.5 flex gap-1.5">
          <Badge className="bg-ink/75 text-chalk backdrop-blur-sm">{meta.label}</Badge>
        </div>
        {place.image && (
          <div className="absolute bottom-2.5 right-2.5 rounded-md bg-ink/70 px-2 py-0.5 font-mono text-[10px] font-bold tracking-wider text-chalk backdrop-blur-sm">
            {CITIES[place.city].name.toUpperCase()}
          </div>
        )}
        {saved && (
          <div className="stamp-in absolute right-2.5 top-2.5 rounded border-2 border-persimmon bg-chalk/90 px-2 py-0.5 font-mono text-[10px] font-bold tracking-[0.16em] text-persimmon">
            SAVED
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-[17px] font-semibold leading-snug text-ink">{place.name}</h3>
          <Rating rating={place.rating} reviews={place.reviews} />
        </div>
        <p className="mt-0.5 font-mono text-[10.5px] font-bold uppercase tracking-[0.14em] text-fog">{place.area}</p>
        <p className="mt-2 line-clamp-2 text-[13px] leading-relaxed text-moss">{place.blurb}</p>
        <div className="mt-auto flex items-center justify-between pt-4">
          <div className="flex items-center gap-3 text-[12px] font-semibold text-moss">
            <span className="tnum font-mono text-[12.5px] font-bold text-ink">{place.cost > 0 ? money(place.cost, currency) : 'Free'}</span>
            <span className="inline-flex items-center gap-1">
              <ClockIcon size={13} /> {durationLabel(place.durationMin)}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            {saved && onAdd && (
              <button
                onClick={onAdd}
                title="Add to itinerary"
                aria-label={`Add ${place.name} to itinerary`}
                className="inline-flex h-8 items-center gap-1 rounded-lg bg-pine px-2.5 text-[11.5px] font-bold text-chalk transition-all hover:bg-ink active:translate-y-px"
              >
                <PlusIcon size={13} /> Day
              </button>
            )}
            <button
              onClick={onToggleSave}
              aria-pressed={saved}
              className={`inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-[11.5px] font-bold transition-all active:translate-y-px ${
                saved ? 'bg-persimmon/12 text-persimmon hover:bg-persimmon/20' : 'border border-line bg-chalk text-ink hover:border-persimmon/50 hover:text-persimmon'
              }`}
            >
              {saved ? <CheckIcon size={13} /> : <PlusIcon size={13} />}
              {saved ? 'Saved' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

/* ---------------- category legend dot ---------------- */

export function CategoryDot({ category, className = '' }: { category: string; className?: string }) {
  const meta = CATEGORY_META[category as keyof typeof CATEGORY_META];
  return <span className={`inline-block h-2 w-2 rounded-[3px] ${className}`} style={{ background: meta?.color ?? 'var(--color-fog)' }} />;
}
