import { useState } from 'react';
import type { Trip } from '../../types';
import { CITIES } from '../../types';
import { useToast, useTripStore } from '../../store/store';
import { fmtDate } from '../../lib/format';
import { MemoryModal } from '../../components/modals';
import { Button, EmptyState, IconBtn, Tip } from '../../components/ui';
import { CameraIcon, PinIcon, PlusIcon, QuoteIcon, TrashIcon } from '../../components/icons';

const TILTS = ['-rotate-2', 'rotate-1', 'rotate-2', '-rotate-1', 'rotate-0', '-rotate-2'];
const TAPES = ['bg-saffron/60', 'bg-teal/40', 'bg-persimmon/40', 'bg-plum/30'];

export default function Memories({ trip }: { trip: Trip }) {
  const { addMemory, deleteMemory } = useTripStore();
  const { push } = useToast();
  const [modalOpen, setModalOpen] = useState(false);

  const sorted = [...trip.memories].sort((a, b) => (a.date < b.date ? -1 : 1));

  return (
    <div className="mx-auto max-w-[1320px] px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="flex items-center gap-2.5 font-mono text-[11px] font-bold tracking-[0.24em] text-persimmon">
            <span className="h-px w-8 bg-persimmon" /> THE KEEPSAKE
          </p>
          <h2 className="mt-2.5 font-display text-[32px] font-semibold leading-none tracking-tight text-ink sm:text-[38px]">Memories</h2>
          <p className="mt-2 max-w-[58ch] text-[13.5px] leading-relaxed text-moss">
            The trip ends; the journal doesn't. Pin the moments worth rereading — {trip.memories.length} pinned so far.
          </p>
        </div>
        <Button onClick={() => setModalOpen(true)}><PlusIcon size={15} /> Pin a memory</Button>
      </div>

      <div className="mt-9">
        {sorted.length === 0 ? (
          <EmptyState
            icon={<CameraIcon size={22} />}
            title="Your story isn't written yet"
            desc="When the trip happens — or when you're dreaming it up — pin photos, dates and one-line truths here. They'll hang like postcards."
            action={<Button onClick={() => setModalOpen(true)}><PlusIcon size={14} /> Pin the first memory</Button>}
          />
        ) : (
          <div className="columns-1 gap-6 sm:columns-2 xl:columns-3 [&>*]:mb-6">
            {sorted.map((m, i) => (
              <article
                key={m.id}
                className={`group relative break-inside-avoid rounded-lg border border-line bg-bone p-3 pb-5 shadow-card transition-all duration-500 hover:rotate-0 hover:shadow-lift ${TILTS[i % TILTS.length]}`}
              >
                <span className={`absolute -top-2.5 left-7 z-10 h-5 w-16 -rotate-3 ${TAPES[i % TAPES.length]}`} />
                <span className={`absolute -top-2 right-9 z-10 h-4 w-10 rotate-6 ${TAPES[(i + 1) % TAPES.length]}`} />

                <div className="flex items-center justify-between gap-2 px-1 pt-1.5">
                  <p className="font-mono text-[10px] font-bold tracking-[0.2em] text-persimmon">
                    {fmtDate(m.date, 'MMM d').toUpperCase()} · {CITIES[m.city].name.toUpperCase()}
                  </p>
                  <span className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                    <Tip label="Remove">
                      <IconBtn
                        label="Delete memory"
                        className="h-7 w-7 hover:text-persimmon"
                        onClick={() => {
                          deleteMemory(trip.id, m.id);
                          push('info', 'Memory unpinned', 'Back into the suitcase of forgetting.');
                        }}
                      >
                        <TrashIcon size={13} />
                      </IconBtn>
                    </Tip>
                  </span>
                </div>

                {m.image && (
                  <div className="mt-2.5 overflow-hidden rounded-md">
                    <img src={m.image} alt={m.caption} loading="lazy" className="w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
                  </div>
                )}

                <div className="px-1.5 pt-3.5">
                  <h3 className="flex items-start gap-2 font-display text-[18px] font-semibold italic leading-snug text-ink">
                    <QuoteIcon size={16} className="mt-1.5 shrink-0 text-persimmon/60" />
                    {m.caption}
                  </h3>
                  {m.note && <p className="mt-2.5 text-[13px] leading-relaxed text-moss">{m.note}</p>}
                  <p className="mt-3 flex items-center gap-1.5 font-mono text-[10px] font-bold tracking-[0.18em] text-fog">
                    <PinIcon size={11} className="text-persimmon" /> {m.place.toUpperCase()}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      <MemoryModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        trip={trip}
        onSave={(memory) => {
          addMemory(trip.id, memory);
          push('success', 'Memory pinned', `"${memory.caption}" — kept safe.`);
        }}
      />
    </div>
  );
}
