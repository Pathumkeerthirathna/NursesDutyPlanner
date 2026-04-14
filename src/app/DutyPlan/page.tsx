

"use client";

import { useEffect, useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Filter,
  PlusCircle,
  Trash2,
  X,
} from "lucide-react";

type DutyPlan = {
  id: number;
  dutyDate: string;
  shiftId: number;
  shiftName: string;
  shiftColor?: string; // optional
  hours: number;
  startTime: string;
  endTime: string;
  dutyTypeId: number;
  dutyName: string;
  dutyColor?: string; // optional
};

type Shift = { id: number; shiftName: string,startAt: string;endAt: string; };
type DutyType = { id: number; dutyName: string };

export default function DutyPlanPage() {
  const [duties, setDuties] = useState<DutyPlan[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [dutyTypes, setDutyTypes] = useState<DutyType[]>([]);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false); // Filter Panel

  const [page, setPage] = useState(1);          // current page
  const [pageSize] = useState(30);              // items per page
  const [totalPages, setTotalPages] = useState(1); // total pages from API

  const [filter, setFilter] = useState({
    fromDate: "",
    toDate: "",
    shiftIds: [] as number[],
    dutyTypeIds: [] as number[],
  });

  const handlePrevious = () => {
  const newTo = new Date(currentFromDate);
  newTo.setDate(newTo.getDate() - 1);

  const newFrom = new Date(newTo);
  newFrom.setDate(newFrom.getDate() - 29);

  setCurrentFromDate(newFrom.toISOString().split("T")[0]);
  setCurrentToDate(newTo.toISOString().split("T")[0]);

  setFilter((f) => ({ ...f, fromDate: newFrom.toISOString().split("T")[0], toDate: newTo.toISOString().split("T")[0] }));
};

const handleNext = () => {
  const newFrom = new Date(currentToDate);
  newFrom.setDate(newFrom.getDate() + 1);

  let newTo = new Date(newFrom);
  newTo.setDate(newTo.getDate() + 29);

  const today = new Date();
  if (newTo > today) newTo = today;

  setCurrentFromDate(newFrom.toISOString().split("T")[0]);
  setCurrentToDate(newTo.toISOString().split("T")[0]);

  setFilter((f) => ({ ...f, fromDate: newFrom.toISOString().split("T")[0], toDate: newTo.toISOString().split("T")[0] }));
};

  const [form, setForm] = useState<Omit<DutyPlan, "id" | "shiftName" | "dutyName">>({
    dutyDate: "",
    shiftId: 0,
    hours: 6,
    startTime: "07:00",
    endTime: "15:00",
    dutyTypeId: 0,
  });

  const fetchDuties = async (currentPage = 1) => {
    const params = new URLSearchParams();
    if (filter.fromDate) params.append("fromDate", filter.fromDate);
    if (filter.toDate) params.append("toDate", filter.toDate);
    filter.shiftIds.forEach(id => params.append("shiftIds", id.toString()));
    filter.dutyTypeIds.forEach(id => params.append("dutyTypeIds", id.toString()));

    // const data = await fetch(`/api/dutyplan?${params.toString()}`).then(res => res.json());

    // console.log(data);

    // setDuties(data.data);

    params.append("page", currentPage.toString());
    params.append("pageSize", pageSize.toString());

    const data = await fetch(`/api/dutyplan?${params.toString()}`).then(res => res.json());
    console.log(data);

    setDuties(data.data);
    setTotalPages(data.totalPages);
    setPage(data.page);


  };

  const [editingId, setEditingId] = useState<number | null>(null);

  const [currentFromDate, setCurrentFromDate] = useState("");
  const [currentToDate, setCurrentToDate] = useState("");

  useEffect(() => {
    // First load: last 30 days
    const today = new Date();
    const toDate = today.toISOString().split("T")[0];

    const past30 = new Date();
    past30.setDate(today.getDate() - 29);
    const fromDate = past30.toISOString().split("T")[0];

    setCurrentFromDate(fromDate);
    setCurrentToDate(toDate);
  }, []);

  useEffect(() => {
    fetchDuties(1);
    fetchShifts();
    fetchDutyTypes();
  },[filter.fromDate, filter.toDate, filter.shiftIds.join(','), filter.dutyTypeIds.join(',')]);


  const resetFilters = () => {
    setFilter({
      fromDate: "",
      toDate: "",
      shiftIds: [],
      dutyTypeIds: [],
    });
  };



  const fetchShifts = async () => {
    const data = await fetch("/api/shifts").then((res) => res.json());
    setShifts(data);
  };

  const fetchDutyTypes = async () => {
    const data = await fetch("/api/dutytypes").then((res) => res.json());
    setDutyTypes(data);
  };

  const resetForm = () => {
    setForm({
      dutyDate: "",
      shiftId: 0,
      hours: 8,
      startTime: "07:00",
      endTime: "15:00",
      dutyTypeId: 0,
    });
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingId) {
      await fetch(`/api/dutyplan/${editingId}`, {
        method: "PUT",
        body: JSON.stringify(form),
      });
    } else {
      await fetch("/api/dutyplan", {
        method: "POST",
        body: JSON.stringify(form),
      });
    }

    resetForm();
    setIsPanelOpen(false);
    fetchDuties();
  };

  const handleEdit = (duty: DutyPlan) => {
    setForm({
      dutyDate: duty.dutyDate,
      shiftId: duty.shiftId,
      hours: duty.hours,
      startTime: duty.startTime,
      endTime: duty.endTime,
      dutyTypeId: duty.dutyTypeId,
    });
    setEditingId(duty.id);
    setIsPanelOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this duty?")) return;
    await fetch(`/api/dutyPlan/${id}`, { method: "DELETE" });
    fetchDuties();
  };

  const openAddPanel = () => {
    resetForm();
    setIsPanelOpen(true);
  };

  const calculateHours = (start: string, end: string) => {
  const [startH, startM] = start.split(":").map(Number);
  const [endH, endM] = end.split(":").map(Number);

  let diff = (endH * 60 + endM) - (startH * 60 + startM);

  // If end is past midnight
  if (diff < 0) diff += 24 * 60;

  return diff / 60;
};

  return (
    <div className="page-shell">
      <section className="hero-card hero-card--violet mb-5">
        <div className="page-header mb-4">
          <div>
            <span className="soft-badge soft-badge--light mb-3">
              <ClipboardList size={14} /> Daily roster management
            </span>
            <h1 className="page-title">Duty Plans</h1>
            <p className="page-subtitle">
              Add, review and update nursing duties with a more refined and colorful professional layout.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="soft-badge soft-badge--light">Page {page} of {totalPages}</span>
            <button onClick={openAddPanel} className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-lg">
              <PlusCircle size={18} /> Add Duty
            </button>
            <button
              onClick={() => setIsFilterPanelOpen(true)}
              className="rounded-xl border border-white/25 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur"
            >
              <Filter size={18} /> Filters
            </button>
            <button onClick={resetFilters} className="rounded-xl border border-white/25 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur">
              Refresh
            </button>
          </div>
        </div>
      </section>

      <section className="section-card mb-5 border border-violet-100/80 bg-white/85">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="stat-card tinted-card-blue">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">From</p>
            <p className="mt-1 text-sm font-semibold text-slate-800">{filter.fromDate || currentFromDate || "Not set"}</p>
          </div>
          <div className="stat-card tinted-card-violet">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">To</p>
            <p className="mt-1 text-sm font-semibold text-slate-800">{filter.toDate || currentToDate || "Not set"}</p>
          </div>
          <div className="stat-card tinted-card-emerald">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Selected shifts</p>
            <p className="mt-1 text-sm font-semibold text-slate-800">{filter.shiftIds.length} applied</p>
          </div>
          <div className="stat-card tinted-card-amber">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Duty types</p>
            <p className="mt-1 text-sm font-semibold text-slate-800">{filter.dutyTypeIds.length} applied</p>
          </div>
        </div>
      </section>

      <div className="space-y-4">
        {duties.map((d) => (
          <div
            key={d.id}
            onClick={() => handleEdit(d)}
            className="section-card cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl"
            style={{ borderLeft: `4px solid ${d.shiftColor || "#2563eb"}` }}
          >
            <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="text-base font-semibold text-slate-900">
                  {new Date(d.dutyDate).toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
                <p className="text-xs text-slate-500">Tap the card to edit this duty entry.</p>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(d.id);
                }}
                className="icon-btn text-rose-600 hover:bg-rose-50"
                title="Delete duty"
              >
                <Trash2 size={18} />
              </button>
            </div>

            <div className="mb-4 flex flex-wrap gap-2">
              <span
                className="rounded-full px-3 py-1 text-xs font-semibold text-white shadow-sm"
                style={{ backgroundColor: d.shiftColor || "#a72727ff" }}
              >
                {d.shiftName}
              </span>
              <span
                className="rounded-full px-3 py-1 text-xs font-semibold text-white shadow-sm"
                style={{ backgroundColor: d.dutyColor || "#666" }}
              >
                {d.dutyName}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3 rounded-2xl bg-slate-50 p-3 text-sm text-slate-600 sm:grid-cols-3">
              <div>
                <p className="font-semibold text-slate-800">Start</p>
                <p>{d.startTime}</p>
              </div>
              <div>
                <p className="font-semibold text-slate-800">End</p>
                <p>{d.endTime}</p>
              </div>
              <div>
                <p className="font-semibold text-slate-800">Hours</p>
                <p className="text-base font-semibold text-blue-600">{d.hours}</p>
              </div>
            </div>
          </div>
        ))}

        {duties.length === 0 && (
          <div className="section-card text-center text-slate-500">
            No duty plans found for the selected filters.
          </div>
        )}
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-500">Browse 30-day windows without changing your stored scheduling logic.</p>

        <div className="flex flex-wrap gap-2">
          <button onClick={handlePrevious} className="secondary-btn px-4 py-2 text-sm">
            <ChevronLeft size={16} /> Previous 30 Days
          </button>
          <button onClick={handleNext} className="secondary-btn px-4 py-2 text-sm">
            Next 30 Days <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {isFilterPanelOpen && (
        <div className="fixed inset-0 z-40 flex justify-end bg-slate-950/30">
          <div className="drawer-panel relative overflow-y-auto p-6">
            <button
              onClick={() => setIsFilterPanelOpen(false)}
              className="icon-btn absolute right-3 top-3 text-slate-500 hover:bg-slate-100"
            >
              <X size={20} />
            </button>

            <div className="mb-4 pr-10">
              <h2 className="text-lg font-semibold text-slate-900">Filter Duty Plans</h2>
              <p className="text-sm text-slate-500">Selections apply instantly as you update the fields.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1 flex items-center gap-2 text-sm font-medium text-slate-700">
                  <CalendarDays size={16} className="text-blue-600" /> From Date
                </label>
                <input
                  type="date"
                  value={filter.fromDate}
                  onChange={(e) => setFilter({ ...filter, fromDate: e.target.value })}
                  className="input-field"
                />
              </div>

              <div>
                <label className="mb-1 flex items-center gap-2 text-sm font-medium text-slate-700">
                  <CalendarDays size={16} className="text-blue-600" /> To Date
                </label>
                <input
                  type="date"
                  value={filter.toDate}
                  onChange={(e) => setFilter({ ...filter, toDate: e.target.value })}
                  className="input-field"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Shifts</label>
                <div className="max-h-32 space-y-2 overflow-auto rounded-2xl border border-slate-200 bg-slate-50 p-3">
                  {shifts.map((s) => (
                    <label key={s.id} className="flex items-center gap-2 text-sm text-slate-700">
                      <input
                        type="checkbox"
                        checked={filter.shiftIds.includes(s.id)}
                        onChange={(e) =>
                          setFilter({
                            ...filter,
                            shiftIds: e.target.checked
                              ? [...filter.shiftIds, s.id]
                              : filter.shiftIds.filter((id) => id !== s.id),
                          })
                        }
                      />
                      {s.shiftName}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Duty Types</label>
                <div className="max-h-32 space-y-2 overflow-auto rounded-2xl border border-slate-200 bg-slate-50 p-3">
                  {dutyTypes.map((d) => (
                    <label key={d.id} className="flex items-center gap-2 text-sm text-slate-700">
                      <input
                        type="checkbox"
                        checked={filter.dutyTypeIds.includes(d.id)}
                        onChange={(e) =>
                          setFilter({
                            ...filter,
                            dutyTypeIds: e.target.checked
                              ? [...filter.dutyTypeIds, d.id]
                              : filter.dutyTypeIds.filter((id) => id !== d.id),
                          })
                        }
                      />
                      {d.dutyName}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {isPanelOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/30">
          <div className="drawer-panel relative overflow-y-auto p-6">
            <button
              onClick={() => setIsPanelOpen(false)}
              className="icon-btn absolute right-3 top-3 text-slate-500 hover:bg-slate-100"
            >
              <X size={20} />
            </button>

            <div className="mb-4 pr-10">
              <h2 className="text-lg font-semibold text-slate-900">
                {editingId ? "Edit Duty Plan" : "Add New Duty Plan"}
              </h2>
              <p className="text-sm text-slate-500">Keep the same workflow with a more polished form layout.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Duty Date</label>
                <input
                  type="date"
                  value={form.dutyDate}
                  onChange={(e) => setForm({ ...form, dutyDate: e.target.value })}
                  className="input-field"
                  required
                />
              </div>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Shift</label>
                  <select
                    value={form.shiftId}
                    onChange={(e) => {
                      const selectedShiftId = Number(e.target.value);
                      const selectedShift = shifts.find((s) => s.id === selectedShiftId);

                      setForm({
                        ...form,
                        shiftId: selectedShiftId,
                        startTime: selectedShift ? selectedShift.startAt : "07:00",
                        endTime: selectedShift ? selectedShift.endAt : "15:00",
                      });
                    }}
                    className="input-field"
                    required
                  >
                    <option value={0}>Select Shift</option>
                    {shifts.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.shiftName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Duty Type</label>
                  <select
                    value={form.dutyTypeId}
                    onChange={(e) => setForm({ ...form, dutyTypeId: Number(e.target.value) })}
                    className="input-field"
                    required
                  >
                    <option value={0}>Select Duty Type</option>
                    {dutyTypes.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.dutyName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Start Time</label>
                  <input
                    type="time"
                    value={form.startTime}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        startTime: e.target.value,
                        hours: calculateHours(e.target.value, form.endTime),
                      })
                    }
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">End Time</label>
                  <input
                    type="time"
                    value={form.endTime}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        endTime: e.target.value,
                        hours: calculateHours(form.startTime, e.target.value),
                      })
                    }
                    className="input-field"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Hours</label>
                <input
                  type="number"
                  value={form.hours}
                  onChange={(e) => setForm({ ...form, hours: Number(e.target.value) })}
                  className="input-field"
                  required
                  readOnly
                />
              </div>

              <button type="submit" className="primary-btn w-full px-4 py-3">
                {editingId ? "Update Duty" : "Add Duty"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

