import { useState } from 'react';
import type { Currency, DistanceUnit } from '../types';
import { useToast, useTripStore } from '../store/store';
import { AppShell } from '../components/AppShell';
import { Button, Field, Input, Reveal, Select } from '../components/ui';
import { CheckIcon, CompassIcon, DownloadIcon, GearIcon, WalletIcon, XIcon } from '../components/icons';

export default function SettingsPage() {
  const { state, updateSettings, resetAll } = useTripStore();
  const { push } = useToast();
  const s = state.settings;

  const [traveler, setTraveler] = useState(s.traveler);
  const [email, setEmail] = useState(s.email);
  const [home, setHome] = useState(s.home);
  const [currency, setCurrency] = useState<Currency>(s.currency);
  const [unit, setUnit] = useState<DistanceUnit>(s.unit);
  const [confirmingReset, setConfirmingReset] = useState(false);

  const initials = s.traveler.split(' ').map((w) => w[0]).slice(0, 2).join('');

  const saveProfile = () => {
    if (!traveler.trim()) return push('error', 'Name required', 'Every traveler needs a name.');
    updateSettings({ traveler: traveler.trim(), email: email.trim(), home: home.trim() });
    push('success', 'Profile saved', 'Bon voyage, ' + traveler.trim().split(' ')[0] + '.');
  };

  const savePrefs = () => {
    updateSettings({ currency, unit });
    push('success', 'Preferences saved', `Amounts now shown in ${currency}, distances in ${unit}.`);
  };

  const exportData = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tripcanvas-export.json';
    a.click();
    URL.revokeObjectURL(url);
    push('success', 'Export ready', 'Your atlas was downloaded as JSON.');
  };

  return (
    <AppShell
      trail={<p className="font-mono text-[11px] font-bold tracking-[0.2em] text-moss">BASECAMP <span className="text-line">/</span> <span className="text-ink">SETTINGS</span></p>}
    >
      <div className="mx-auto max-w-[880px] px-4 py-10 sm:px-6">
        <Reveal>
          <p className="flex items-center gap-2.5 font-mono text-[11px] font-bold tracking-[0.24em] text-persimmon">
            <span className="h-px w-8 bg-persimmon" /> BASECAMP
          </p>
          <h1 className="mt-3 font-display text-[40px] font-semibold tracking-tight text-ink">Settings</h1>
        </Reveal>

        {/* profile */}
        <Reveal className="mt-10">
          <section className="rounded-xl border border-line bg-bone p-6 shadow-card sm:p-7" aria-labelledby="profile-h">
            <div className="flex items-center gap-4">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-pine font-display text-[20px] font-bold text-chalk">{initials}</span>
              <div>
                <h2 id="profile-h" className="font-display text-[22px] font-semibold text-ink">Traveler profile</h2>
                <p className="text-[13px] text-moss">Who's packing the suitcase?</p>
              </div>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <Field label="Full name">
                <Input value={traveler} onChange={(e) => setTraveler(e.target.value)} />
              </Field>
              <Field label="Email">
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Home base">
                  <Input value={home} onChange={(e) => setHome(e.target.value)} placeholder="City, Country" />
                </Field>
              </div>
            </div>
            <div className="mt-5 flex justify-end">
              <Button onClick={saveProfile}><CheckIcon size={15} /> Save profile</Button>
            </div>
          </section>
        </Reveal>

        {/* preferences */}
        <Reveal className="mt-6">
          <section className="rounded-xl border border-line bg-bone p-6 shadow-card sm:p-7" aria-labelledby="prefs-h">
            <div className="flex items-center gap-3.5">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-mist text-moss"><GearIcon size={19} /></span>
              <div>
                <h2 id="prefs-h" className="font-display text-[22px] font-semibold text-ink">Preferences</h2>
                <p className="text-[13px] text-moss">How numbers read across the canvas.</p>
              </div>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <Field label="Currency" hint="demo rates applied">
                <Select value={currency} onChange={(e) => setCurrency(e.target.value as Currency)}>
                  <option value="EUR">EUR — Euro (€)</option>
                  <option value="USD">USD — Dollar ($)</option>
                  <option value="GBP">GBP — Pound (£)</option>
                </Select>
              </Field>
              <Field label="Distance unit">
                <Select value={unit} onChange={(e) => setUnit(e.target.value as DistanceUnit)}>
                  <option value="km">Kilometres</option>
                  <option value="mi">Miles</option>
                </Select>
              </Field>
            </div>
            <div className="mt-5 flex justify-end">
              <Button onClick={savePrefs}><CheckIcon size={15} /> Save preferences</Button>
            </div>
          </section>
        </Reveal>

        {/* data */}
        <Reveal className="mt-6">
          <section className="rounded-xl border border-line bg-bone p-6 shadow-card sm:p-7" aria-labelledby="data-h">
            <div className="flex items-center gap-3.5">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-mist text-moss"><WalletIcon size={19} /></span>
              <div>
                <h2 id="data-h" className="font-display text-[22px] font-semibold text-ink">Your data</h2>
                <p className="text-[13px] text-moss">Everything lives in your browser — take it with you or start fresh.</p>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button variant="outline" onClick={exportData}><DownloadIcon size={15} /> Export JSON</Button>
              <Button variant="outline" className="border-persimmon/40 text-persimmon hover:border-persimmon hover:bg-persimmon/5" onClick={() => setConfirmingReset(true)}>
                <XIcon size={15} /> Reset demo data
              </Button>
            </div>
            {confirmingReset && (
              <div className="rise-in mt-5 rounded-lg border border-persimmon/30 bg-persimmon/5 p-4">
                <p className="text-[13.5px] font-semibold text-ink">Wipe every change and restore the demo atlas?</p>
                <div className="mt-3 flex gap-2.5">
                  <Button size="sm" onClick={() => { resetAll(); setConfirmingReset(false); push('success', 'Demo data restored'); }}>Yes, reset</Button>
                  <Button size="sm" variant="ghost" onClick={() => setConfirmingReset(false)}>Cancel</Button>
                </div>
              </div>
            )}
          </section>
        </Reveal>

        {/* about */}
        <Reveal className="mt-6">
          <section className="paper-grain flex items-center gap-4 rounded-xl border border-dashed border-line bg-chalk p-6">
            <CompassIcon size={26} className="shrink-0 text-persimmon" />
            <p className="text-[13.5px] leading-relaxed text-moss">
              <strong className="font-display text-[15px] text-ink">TripCanvas</strong> — a frontend concept built with React, TypeScript and a hand-drawn design
              system. Maps are stylized canvases projected from real coordinates; routing uses nearest-neighbour + 2-opt. No servers, no accounts — your browser is the atlas.
            </p>
          </section>
        </Reveal>
      </div>
    </AppShell>
  );
}
