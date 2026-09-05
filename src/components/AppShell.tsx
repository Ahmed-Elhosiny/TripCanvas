import type { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast, useTripStore } from '../store/store';
import { Dropdown } from './ui';
import { ChevronDownIcon, DownloadIcon, GearIcon, LogoMark, XIcon } from './icons';
import { useState } from 'react';
import { Button, Modal } from './ui';

export function Wordmark({ dark = false }: { dark?: boolean }) {
  return (
    <Link to="/trips" className="group flex items-center gap-2.5" aria-label="TripCanvas home">
      <LogoMark size={30} className="transition-transform duration-300 group-hover:rotate-12" />
      <span className="leading-none">
        <span className={`block font-display text-[18px] font-bold tracking-tight ${dark ? 'text-chalk' : 'text-ink'}`}>TripCanvas</span>
        <span className={`mt-0.5 block font-mono text-[8.5px] font-bold tracking-[0.3em] ${dark ? 'text-fern' : 'text-fog'}`}>FIELD PLANNER</span>
      </span>
    </Link>
  );
}

export function AppShell({ trail, children }: { trail?: ReactNode; children: ReactNode }) {
  const { state, resetAll } = useTripStore();
  const { push } = useToast();
  const navigate = useNavigate();
  const [confirmReset, setConfirmReset] = useState(false);
  const s = state.settings;
  const initials = s.traveler.split(' ').map((w) => w[0]).slice(0, 2).join('');

  const exportData = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tripcanvas-export.json';
    a.click();
    URL.revokeObjectURL(url);
    push('success', 'Export ready', 'Your trips were downloaded as JSON.');
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 border-b border-line bg-chalk/92 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[1320px] items-center gap-4 px-4 sm:px-6">
          <Wordmark />
          {trail && (
            <>
              <span className="hidden h-6 w-px bg-line sm:block" />
              <div className="min-w-0 flex-1">{trail}</div>
            </>
          )}
          <div className="ml-auto flex items-center gap-2">
            <Dropdown
              label="Account menu"
              align="right"
              button={
                <button className="flex items-center gap-2 rounded-full border border-line bg-bone py-1 pl-1 pr-2.5 transition-all hover:border-ink/30 hover:shadow-pop">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-pine font-mono text-[10.5px] font-bold text-chalk">{initials}</span>
                  <span className="hidden text-[13px] font-bold text-ink md:block">{s.traveler.split(' ')[0]}</span>
                  <ChevronDownIcon size={13} className="text-moss" />
                </button>
              }
              items={[
                { label: 'Settings', icon: <GearIcon size={15} />, onClick: () => navigate('/settings') },
                { label: 'Export data', icon: <DownloadIcon size={15} />, onClick: exportData },
                { label: 'Reset demo data', icon: <XIcon size={15} />, danger: true, onClick: () => setConfirmReset(true) },
              ]}
            />
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-line bg-mist/40">
        <div className="mx-auto flex max-w-[1320px] flex-col items-center justify-between gap-2 px-4 py-5 sm:flex-row sm:px-6">
          <p className="font-mono text-[10.5px] font-bold tracking-[0.18em] text-fog">TRIPCANVAS — PLAN · ROUTE · REMEMBER</p>
          <p className="font-mono text-[10.5px] tracking-[0.14em] text-fog">41.9028° N, 12.4964° E · MADE FOR WANDERERS</p>
        </div>
      </footer>

      <Modal open={confirmReset} onClose={() => setConfirmReset(false)} kicker="Careful" title="Reset demo data?">
        <p className="text-[14px] leading-relaxed text-moss">
          This discards every change you've made and restores the original Italy, Japan and Paris trips. There's no undo.
        </p>
        <div className="mt-5 flex justify-end gap-2.5">
          <Button variant="ghost" onClick={() => setConfirmReset(false)}>
            Keep my trips
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              resetAll();
              setConfirmReset(false);
              push('success', 'Demo data restored', 'Fresh canvas, fresh journey.');
            }}
          >
            Reset everything
          </Button>
        </div>
      </Modal>
    </div>
  );
}
