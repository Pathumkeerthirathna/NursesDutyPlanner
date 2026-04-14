


"use client";

import { Clock3, PlusCircle, ShieldCheck, ShieldOff, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";

type Shift = {
  id: number;
  shiftName: string;
  startAt: string;
  endAt: string;
  status: number;
  color: string;
};

export default function ShiftsPage() {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [form, setForm] = useState({
    id: 0,
    shiftName: "",
    startAt: "",
    endAt: "",
    status: 0,
    color: "#ffffff",
  });
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  // Fetch shifts
  useEffect(() => {
    fetch("/api/shifts")
      .then((res) => res.json())
      .then(setShifts);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.id) {
      await fetch(`/api/shifts/${form.id}`, {
        method: "PUT",
        body: JSON.stringify(form),
      });
    } else {
      await fetch("/api/shifts", {
        method: "POST",
        body: JSON.stringify(form),
      });
    }

    setForm({ id: 0, shiftName: "", startAt: "", endAt: "", status: 0, color: "#ffffff" });
    const updated = await fetch("/api/shifts").then((res) => res.json());
    setShifts(updated);
    setIsPanelOpen(false);
  };

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm("Are you sure you want to delete this shift?");
    if (!confirmed) return;
    await fetch(`/api/shifts/${id}`, { method: "DELETE" });
    setShifts(shifts.filter((s) => s.id !== id));
  };

  const formatToAMPM = (time24: string) => {
    const [hourStr, minute] = time24.split(":");
    let hour = parseInt(hourStr, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    hour = hour % 12 || 12;
    return `${hour}:${minute} ${ampm}`;
  };

  const resetForm = () => {
    setForm({
      id: 0,
      shiftName: "",
      startAt: "",
      endAt: "",
      status: 0,
      color: "#ffffff",
    });
  };

  const openAddPanel = () => {
    resetForm();
    setIsPanelOpen(true);
  };

  const openEditPanel = (shift: Shift) => {
    setForm(shift);
    setIsPanelOpen(true);
  };

  return (
    <div className="page-shell">
      <section className="hero-card hero-card--emerald mb-5">
        <div className="page-header mb-0">
          <div>
            <span className="soft-badge soft-badge--light mb-3">
              <Clock3 size={14} /> Shift scheduling blocks
            </span>
            <h1 className="page-title">Shifts</h1>
            <p className="page-subtitle">
              Define available shift windows and keep them easy to manage on mobile.
            </p>
          </div>

          <button onClick={openAddPanel} className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-lg">
            <PlusCircle size={18} /> Add Shift
          </button>
        </div>
      </section>

      <section className="section-card border border-emerald-100/80 bg-white/85">
        <div className="mb-4 flex flex-wrap items-center gap-3 text-sm text-slate-600">
          <div className="flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-emerald-700">
            <ShieldCheck size={16} /> Active
          </div>
          <div className="flex items-center gap-2 rounded-full bg-rose-50 px-3 py-1.5 text-rose-700">
            <ShieldOff size={16} /> Inactive
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Time Window</th>
                <th>Status</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {shifts.map((s) => (
                <tr
                  key={s.id}
                  onClick={() => openEditPanel(s)}
                  className={`cursor-pointer transition-colors ${
                    s.status === 0 ? "bg-emerald-50/60 hover:bg-emerald-50" : "bg-rose-50/60 hover:bg-rose-50"
                  }`}
                >
                  <td className="font-medium">
                    <span
                      className="inline-flex rounded-full px-3 py-1 text-slate-900"
                      style={{ backgroundColor: `${s.color}22` }}
                    >
                      {s.shiftName}
                    </span>
                  </td>
                  <td>
                    <div className="text-sm text-slate-700">
                      {formatToAMPM(s.startAt)} - {formatToAMPM(s.endAt)}
                    </div>
                  </td>
                  <td>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        s.status === 0 ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                      }`}
                    >
                      {s.status === 0 ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="text-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(s.id);
                      }}
                      className="danger-btn px-2.5 py-2"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {isPanelOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/30 flex justify-end">
          <div className="drawer-panel relative overflow-y-auto p-6">
            <button
              onClick={() => setIsPanelOpen(false)}
              className="icon-btn absolute right-3 top-3 text-slate-500 hover:bg-slate-100"
            >
              <X size={20} />
            </button>

            <div className="mb-4 pr-10">
              <h2 className="text-lg font-semibold text-slate-900">
                {form.id ? "Edit Shift" : "Add New Shift"}
              </h2>
              <p className="text-sm text-slate-500">Configure shift hours and status with a cleaner layout.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Shift Name"
                value={form.shiftName}
                onChange={(e) => setForm({ ...form, shiftName: e.target.value })}
                className="input-field"
                required
              />

              <div className="grid grid-cols-2 gap-2">
                <input
                  type="time"
                  value={form.startAt}
                  onChange={(e) => setForm({ ...form, startAt: e.target.value })}
                  className="input-field"
                  required
                />
                <input
                  type="time"
                  value={form.endAt}
                  onChange={(e) => setForm({ ...form, endAt: e.target.value })}
                  className="input-field"
                  required
                />
              </div>

              <div className="grid grid-cols-[90px_1fr] gap-2">
                <input
                  type="color"
                  value={form.color}
                  onChange={(e) => setForm({ ...form, color: e.target.value })}
                  className="h-11 w-full cursor-pointer rounded-xl border border-slate-200 bg-white"
                />
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: Number(e.target.value) })}
                  className="input-field"
                >
                  <option value={0}>Active</option>
                  <option value={1}>Inactive</option>
                </select>
              </div>

              <button type="submit" className="primary-btn w-full px-4 py-3">
                {form.id ? "Update Shift" : "Add Shift"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

