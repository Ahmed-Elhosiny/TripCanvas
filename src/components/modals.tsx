import { useEffect, useMemo, useState } from 'react';
import type { Activity, ActivityCategory, Currency, Expense, ExpenseCategory, Memory, Place, Trip } from '../types';
import { CATEGORIES_LIST, CITIES, EXPENSE_META } from '../meta';
import { getPlace } from '../data/places';
import { COVER_CHOICES } from '../data/images';
import { currencySymbol, fmtDate, toEur, uid } from '../lib/format';
import type { TripInput } from '../store/store';
import { Button, Chip, Field, Input, Modal, Select, Textarea } from './ui';

/* ------------------------------------------------------------------ */
/*  Activity modal (add / edit / quick-add from a place)               */
/* ------------------------------------------------------------------ */

export function ActivityModal({
  open,
  onClose,
  trip,
  initialDayId,
  activity,
  fixedPlace,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  trip: Trip;
  initialDayId?: string;
  activity?: Activity;
  fixedPlace?: Place;
  onSave: (dayId: string, activity: Activity) => void;
}) {
  const savedPlaces = useMemo(
    () => trip.savedPlaceIds.map((id) => getPlace(id)).filter((p): p is Place => Boolean(p)),
    [trip.savedPlaceIds],
  );

  const [dayId, setDayId] = useState(initialDayId ?? trip.days[0]?.id ?? '');
  const [placeId, setPlaceId] = useState<string>(activity?.placeId ?? fixedPlace?.id ?? '');
  const [customTitle, setCustomTitle] = useState(activity && !activity.placeId ? activity.title : '');
  const [category, setCategory] = useState<ActivityCategory>(activity?.category ?? fixedPlace?.category ?? 'attraction');
  const [time, setTime] = useState(activity?.time ?? '10:00');
  const [duration, setDuration] = useState(activity?.durationMin ?? fixedPlace?.durationMin ?? 60);
  const [cost, setCost] = useState<number>(activity?.cost ?? fixedPlace?.cost ?? 0);
  const [note, setNote] = useState(activity?.note ?? '');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setDayId(initialDayId ?? trip.days[0]?.id ?? '');
    setPlaceId(activity?.placeId ?? fixedPlace?.id ?? '');
    setCustomTitle(activity && !activity.placeId ? activity.title : '');
    setCategory(activity?.category ?? fixedPlace?.category ?? 'attraction');
    setTime(activity?.time ?? '10:00');
    setDuration(activity?.durationMin ?? fixedPlace?.durationMin ?? 60);
    setCost(activity?.cost ?? fixedPlace?.cost ?? 0);
    setNote(activity?.note ?? '');
    setError('');
  }, [open, activity, fixedPlace, initialDayId, trip.days]);

  const place = placeId ? getPlace(placeId) : undefined;
  const isCustom = !place;

  const selectPlace = (id: string) => {
    setPlaceId(id);
    const p = getPlace(id);
    if (p) {
      setCategory(p.category);
      setDuration(p.durationMin);
      setCost(p.cost);
    }
  };

  const submit = () => {
    const title = isCustom ? customTitle.trim() : place?.name ?? '';
    if (!title) return setError('Give the activity a name.');
    if (!time) return setError('Pick a start time.');
    if (duration <= 0) return setError('Duration must be positive.');
    const next: Activity = {
      id: activity?.id ?? uid('act'),
      placeId: place?.id,
      title,
      category,
      time,
      durationMin: duration,
      cost: Math.max(0, cost),
      note: note.trim() || undefined,
      lat: place?.lat,
      lng: place?.lng,
    };
    onSave(dayId, next);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} kicker={activity ? 'Edit plan' : 'New plan'} title={activity ? 'Edit activity' : fixedPlace ? `Add ${fixedPlace.name}` : 'Add activity'}>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3.5">
          <Field label="Day">
            <Select value={dayId} onChange={(e) => setDayId(e.target.value)}>
              {trip.days.map((d, i) => (
                <option key={d.id} value={d.id}>
                  Day {i + 1} · {fmtDate(d.date)} — {CITIES[d.city].name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Start time">
            <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
          </Field>
        </div>

        {!fixedPlace && !activity && (
          <Field label="Place" hint="from your saved places">
            <Select value={placeId} onChange={(e) => selectPlace(e.target.value)}>
              <option value="">Custom activity…</option>
              {savedPlaces.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — {CITIES[p.city].name}
                </option>
              ))}
            </Select>
          </Field>
        )}

        {isCustom && (
          <Field label="Title" error={error === 'Give the activity a name.' ? error : undefined}>
            <Input value={customTitle} onChange={(e) => setCustomTitle(e.target.value)} placeholder="e.g. Train to Florence" invalid={error === 'Give the activity a name.'} />
          </Field>
        )}

        <div>
          <Field label="Category">
            <div className="flex flex-wrap gap-1.5 pt-1">
              {CATEGORIES_LIST.map((c) => (
                <Chip key={c} active={category === c} onClick={() => setCategory(c)}>
                  {c === 'other' ? 'Logistics' : c.charAt(0).toUpperCase() + c.slice(1)}
                </Chip>
              ))}
            </div>
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3.5">
          <Field label="Duration (min)">
            <Input type="number" min={5} step={5} value={duration} onChange={(e) => setDuration(Number(e.target.value))} />
          </Field>
          <Field label="Est. cost (€)">
            <Input type="number" min={0} step={1} value={cost} onChange={(e) => setCost(Number(e.target.value))} />
          </Field>
        </div>

        <Field label="Notes" hint="optional">
          <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Tickets, reservations, tips…" />
        </Field>

        {error && !isCustom && <p className="text-[12.5px] font-semibold text-persimmon">{error}</p>}

        <div className="flex justify-end gap-2.5 pt-1">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={submit}>{activity ? 'Save changes' : 'Add to day'}</Button>
        </div>
      </div>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/*  Expense modal                                                      */
/* ------------------------------------------------------------------ */

export function ExpenseModal({
  open,
  onClose,
  currency,
  expense,
  defaultDate,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  currency: Currency;
  expense?: Expense;
  defaultDate: string;
  onSave: (expense: Expense) => void;
}) {
  const [label, setLabel] = useState('');
  const [amount, setAmount] = useState(0);
  const [category, setCategory] = useState<ExpenseCategory>('food');
  const [date, setDate] = useState(defaultDate);
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setLabel(expense?.label ?? '');
    setAmount(expense ? Math.round(expense.amount * 100) / 100 : 0);
    setCategory(expense?.category ?? 'food');
    setDate(expense?.date ?? defaultDate);
    setNote(expense?.note ?? '');
    setError('');
  }, [open, expense, defaultDate]);

  const submit = () => {
    if (!label.trim()) return setError('Give the expense a label.');
    if (!amount || amount <= 0) return setError('Amount must be greater than zero.');
    onSave({
      id: expense?.id ?? uid('exp'),
      label: label.trim(),
      category,
      amount: toEur(amount, currency),
      date,
      note: note.trim() || undefined,
    });
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} kicker="Budget" title={expense ? 'Edit expense' : 'Log expense'}>
      <div className="space-y-4">
        <Field label="Label" error={error === 'Give the expense a label.' ? error : undefined}>
          <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. Uffizi timed entry" invalid={!!error && !label.trim()} autoFocus />
        </Field>
        <div className="grid grid-cols-2 gap-3.5">
          <Field label={`Amount (${currencySymbol(currency)})`} error={error.includes('Amount') ? error : undefined}>
            <Input type="number" min={0} step={0.5} value={amount || ''} onChange={(e) => setAmount(Number(e.target.value))} placeholder="0" />
          </Field>
          <Field label="Date">
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </Field>
        </div>
        <Field label="Category">
          <div className="flex flex-wrap gap-1.5 pt-1">
            {(Object.keys(EXPENSE_META) as ExpenseCategory[]).map((c) => (
              <Chip key={c} active={category === c} onClick={() => setCategory(c)}>
                {EXPENSE_META[c].label}
              </Chip>
            ))}
          </div>
        </Field>
        <Field label="Note" hint="optional">
          <Textarea value={note} onChange={(e) => setNote(e.target.value)} />
        </Field>
        <div className="flex justify-end gap-2.5 pt-1">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={submit}>{expense ? 'Save changes' : 'Log expense'}</Button>
        </div>
      </div>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/*  Memory modal                                                       */
/* ------------------------------------------------------------------ */

export function MemoryModal({
  open,
  onClose,
  trip,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  trip: Trip;
  onSave: (memory: Memory) => void;
}) {
  const gallery = useMemo(() => {
    const imgs = new Set<string>();
    if (trip.cover) imgs.add(trip.cover);
    trip.savedPlaceIds.forEach((id) => {
      const img = getPlace(id)?.image;
      if (img) imgs.add(img);
    });
    return [...imgs];
  }, [trip]);

  const [date, setDate] = useState(trip.start);
  const [place, setPlace] = useState('');
  const [city, setCity] = useState(trip.cities[0]);
  const [image, setImage] = useState<string | undefined>(gallery[0]);
  const [caption, setCaption] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setDate(trip.start);
    setPlace('');
    setCity(trip.cities[0]);
    setImage(gallery[0]);
    setCaption('');
    setNote('');
    setError('');
  }, [open, trip.start, trip.cities, gallery]);

  const submit = () => {
    if (!place.trim()) return setError('Where was this?');
    if (!caption.trim()) return setError('Write a caption — future you will thank you.');
    onSave({ id: uid('mem'), date, place: place.trim(), city, image, caption: caption.trim(), note: note.trim() || undefined });
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} kicker="Journal" title="New memory" width="max-w-xl">
      <div className="space-y-4">
        <Field label="Photo">
          <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1 pt-1">
            {gallery.map((img) => (
              <button
                key={img}
                onClick={() => setImage(img)}
                aria-label="Select photo"
                className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2 transition-all ${image === img ? 'border-persimmon' : 'border-transparent opacity-70 hover:opacity-100'}`}
              >
                <img src={img} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </Field>
        <div className="grid grid-cols-2 gap-3.5">
          <Field label="Date">
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </Field>
          <Field label="City">
            <Select value={city} onChange={(e) => setCity(e.target.value as Memory['city'])}>
              {trip.cities.map((c) => (
                <option key={c} value={c}>
                  {CITIES[c].name}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <Field label="Place" error={error === 'Where was this?' ? error : undefined}>
          <Input value={place} onChange={(e) => setPlace(e.target.value)} placeholder="e.g. Piazzale Michelangelo" />
        </Field>
        <Field label="Caption" error={error.includes('caption') ? error : undefined}>
          <Input value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="One line you'll want to remember" />
        </Field>
        <Field label="Longer note" hint="optional">
          <Textarea value={note} onChange={(e) => setNote(e.target.value)} />
        </Field>
        <div className="flex justify-end gap-2.5 pt-1">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={submit}>Pin memory</Button>
        </div>
      </div>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/*  Create trip modal                                                  */
/* ------------------------------------------------------------------ */

export function CreateTripModal({ open, onClose, onCreate }: { open: boolean; onClose: () => void; onCreate: (input: TripInput) => void }) {
  const [name, setName] = useState('');
  const [cover, setCover] = useState(COVER_CHOICES[0].src);
  const [start, setStart] = useState('2025-07-01');
  const [end, setEnd] = useState('2025-07-08');
  const [cities, setCities] = useState<string[]>([]);
  const [budget, setBudget] = useState(1200);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) return;
    setName('');
    setCover(COVER_CHOICES[0].src);
    setStart('2025-07-01');
    setEnd('2025-07-08');
    setCities([]);
    setBudget(1200);
    setErrors({});
  }, [open]);

  const toggleCity = (id: string) =>
    setCities((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id as never]));

  const submit = () => {
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = 'Name your trip.';
    if (!start || !end) next.dates = 'Pick both dates.';
    else if (end < start) next.dates = 'The return must be after departure.';
    if (cities.length === 0) next.cities = 'Pick at least one city.';
    if (!budget || budget <= 0) next.budget = 'Set a budget above zero.';
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    onCreate({
      name: name.trim(),
      cover,
      start,
      end,
      cities: cities as TripInput['cities'],
      budget: toEur(budget, 'EUR'),
    });
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} kicker="New journey" title="Create a trip" width="max-w-xl">
      <div className="space-y-4">
        <Field label="Trip name" error={errors.name}>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Portugal in Spring" autoFocus invalid={!!errors.name} />
        </Field>
        <Field label="Cover">
          <div className="no-scrollbar flex gap-2 overflow-x-auto pt-1">
            {COVER_CHOICES.map((c) => (
              <button
                key={c.id}
                onClick={() => setCover(c.src)}
                aria-label={`Cover: ${c.label}`}
                className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2 transition-all ${cover === c.src ? 'border-persimmon' : 'border-transparent opacity-70 hover:opacity-100'}`}
              >
                <img src={c.src} alt="" className="h-full w-full object-cover" />
                <span className="absolute bottom-1 left-1.5 font-mono text-[9px] font-bold tracking-wider text-chalk drop-shadow">{c.label.toUpperCase()}</span>
              </button>
            ))}
          </div>
        </Field>
        <div className="grid grid-cols-2 gap-3.5">
          <Field label="Departs" error={errors.dates}>
            <Input type="date" value={start} onChange={(e) => setStart(e.target.value)} />
          </Field>
          <Field label="Returns">
            <Input type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
          </Field>
        </div>
        <Field label="Cities" hint={`${cities.length} selected`} error={errors.cities}>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {(Object.keys(CITIES) as (keyof typeof CITIES)[]).map((id) => (
              <Chip key={id} active={cities.includes(id)} onClick={() => toggleCity(id)}>
                {CITIES[id].name}
              </Chip>
            ))}
          </div>
        </Field>
        <Field label="Budget (€)" error={errors.budget}>
          <Input type="number" min={0} step={50} value={budget || ''} onChange={(e) => setBudget(Number(e.target.value))} />
        </Field>
        <div className="flex justify-end gap-2.5 pt-1">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={submit}>Create trip</Button>
        </div>
      </div>
    </Modal>
  );
}
