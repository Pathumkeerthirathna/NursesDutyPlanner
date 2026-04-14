"use client";

import { CalendarDays, Clock3, Save, Settings2, SunMedium } from "lucide-react";
import { useEffect, useState } from "react";

const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

type DutySetting = {
  id: number;
  minimumWeeklyHours: number;
  weekStart: string;
  weekEnd: string;
  overTimeRate: number;
  dayOffRate: number;
};

export default function DutySettingsPage() {
  const [setting, setSetting] = useState<DutySetting | null>(null);
  const [form, setForm] = useState<Omit<DutySetting, "id">>({
    minimumWeeklyHours: 40,
    weekStart: "Monday",
    weekEnd: "Sunday",
    overTimeRate: 15,
    dayOffRate: 10,
  });

  // Fetch current setting
  useEffect(() => {
    fetch("/api/dutySettings")
      .then((res) => res.json())
      .then((data) => {
        setSetting(data);
        setForm({
          minimumWeeklyHours: data.minimumWeeklyHours,
          weekStart: data.weekStart,
          weekEnd: data.weekEnd,
          overTimeRate: data.overTimeRate,
          dayOffRate: data.dayOffRate,
        });
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/dutySettings", {
      method: "PUT",
      body: JSON.stringify(form),
    });
    alert("Duty settings updated successfully!");
  };

  return (
    <div className="page-shell">
      <section className="hero-card hero-card--primary mb-5">
        <div className="page-header mb-0">
          <div>
            <span className="soft-badge soft-badge--light mb-3">
              <Settings2 size={14} /> Planning preferences
            </span>
            <h1 className="page-title">Duty Settings</h1>
            <p className="page-subtitle">
              Configure weekly rules and rate adjustments for a cleaner scheduling workflow.
            </p>
          </div>
        </div>
      </section>

      {setting ? (
        <form onSubmit={handleSubmit} className="section-card space-y-4 border border-blue-100/80 bg-white/85">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 flex items-center gap-2 text-sm font-medium text-slate-700">
                <Clock3 size={16} className="text-blue-600" />
                Minimum Weekly Hours
              </label>
              <input
                type="number"
                value={form.minimumWeeklyHours}
                onChange={(e) => setForm({ ...form, minimumWeeklyHours: Number(e.target.value) })}
                className="input-field"
                min={0}
                step={0.5}
              />
            </div>

            <div>
              <label className="mb-1 flex items-center gap-2 text-sm font-medium text-slate-700">
                <Clock3 size={16} className="text-cyan-600" />
                Overtime Rate
              </label>
              <input
                type="number"
                value={form.overTimeRate}
                onChange={(e) => setForm({ ...form, overTimeRate: Number(e.target.value) })}
                className="input-field"
                min={0}
                step={0.1}
              />
            </div>

            <div>
              <label className="mb-1 flex items-center gap-2 text-sm font-medium text-slate-700">
                <CalendarDays size={16} className="text-violet-600" />
                Week Start
              </label>
              <select
                value={form.weekStart}
                onChange={(e) => setForm({ ...form, weekStart: e.target.value })}
                className="input-field"
              >
                {weekdays.map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 flex items-center gap-2 text-sm font-medium text-slate-700">
                <CalendarDays size={16} className="text-violet-600" />
                Week End
              </label>
              <select
                value={form.weekEnd}
                onChange={(e) => setForm({ ...form, weekEnd: e.target.value })}
                className="input-field"
              >
                {weekdays.map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1 flex items-center gap-2 text-sm font-medium text-slate-700">
                <SunMedium size={16} className="text-amber-500" />
                Day Off Rate
              </label>
              <input
                type="number"
                value={form.dayOffRate}
                onChange={(e) => setForm({ ...form, dayOffRate: Number(e.target.value) })}
                className="input-field"
                min={0}
                step={0.1}
              />
            </div>
          </div>

          <button type="submit" className="primary-btn w-full px-4 py-3">
            <Save size={18} />
            Save Settings
          </button>
        </form>
      ) : (
        <div className="section-card text-slate-500">Loading settings...</div>
      )}
    </div>
  );
}
