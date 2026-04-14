"use client";

import { useEffect, useState } from "react";
import {
  Activity,
  BriefcaseMedical,
  CalendarDays,
  Clock3,
  Filter,
  TrendingUp,
} from "lucide-react";

type DutyTypeCount = { name: string; count: number };
type ShiftSummary = { shiftName: string; count: number; dutyTypes: DutyTypeCount[] };

export default function DutyDashboard() {
  const [data, setData] = useState<ShiftSummary[]>([]);
  const [filter, setFilter] = useState("This Month");

  const today = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(today.getDate() - 30);

  function formatDate(date: Date) {
    return date.toISOString().split("T")[0];
  }

  const [fromDate, setFromDate] = useState(formatDate(thirtyDaysAgo));
  const [toDate, setToDate] = useState(formatDate(today));

  const [, setWeekStart] = useState("");
  const [, setWeekEnd] = useState("");

  useEffect(() => {
    SetWeekStartEnd();
    fetchData();
  }, [fromDate, toDate]);

  useEffect(() => {
    const init = async () => {
      const res = await fetch(`/api/dutySettings`);
      const json = await res.json();

      console.log(json);

      setWeekStart(json.weekStart);
      setWeekEnd(json.weekEnd);

      calculateDateRange(filter, json.weekStart, json.weekEnd);
    };

    init();
  }, [filter]);

  const getWeekRange = (
    weekStart: string,
    weekEnd: string,
    reference: Date,
    lastWeek = false
  ) => {
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const startDay = dayNames.indexOf(weekStart);
    const endDay = dayNames.indexOf(weekEnd);

    const today = new Date(reference);
    const currentDay = today.getDay();

    let diffToStart = currentDay - startDay;
    if (diffToStart < 0) diffToStart += 7;
    if (lastWeek) diffToStart += 7;

    const startDate = new Date(today);
    startDate.setDate(today.getDate() - diffToStart);

    let diffToEnd = endDay - startDay;
    if (diffToEnd < 0) diffToEnd += 7;

    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + diffToEnd);

    return { startDate, endDate };
  };

  const calculateDateRange = (filterOption: string, weekStart: string, weekEnd: string) => {
    let start: Date;
    let end: Date;
    const now = new Date();

    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const startDayIndex = dayNames.indexOf(weekStart);
    const endDayIndex = dayNames.indexOf(weekEnd);

    switch (filterOption) {
      case "This Week": {
        const { startDate, endDate } = getWeekRange(weekStart, weekEnd, new Date());
        start = startDate;
        end = endDate;
        break;
      }
      case "Last Week": {
        const { startDate, endDate } = getWeekRange(weekStart, weekEnd, new Date(), true);
        start = startDate;
        end = endDate;
        break;
      }
      case "This Month": {
        const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        console.log(startDayIndex);
        console.log(endDayIndex);

        const startOfMonth = new Date(firstOfMonth.getFullYear(), firstOfMonth.getMonth(), firstOfMonth.getDate(), 0, 0, 0);
        const endOfMonth = new Date(lastOfMonth.getFullYear(), lastOfMonth.getMonth(), lastOfMonth.getDate(), 0, 0, 0);

        console.log(startOfMonth);
        console.log(endOfMonth);

        const diffStart = (startDayIndex - startOfMonth.getDay() + 7) % 7;
        const startDate = new Date(startOfMonth);
        startDate.setDate(startOfMonth.getDate() + diffStart);

        const diffEnd = (endDayIndex - endOfMonth.getDay() + 7) % 7;
        const endDate = new Date(endOfMonth);
        endDate.setDate(endOfMonth.getDate() + diffEnd);

        start = startDate;
        end = endDate;

        console.log("Start Date:", start);
        console.log("End Date:", end);
        break;
      }
      case "Last Month": {
        const firstOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

        const startDayLastIndex = dayNames.indexOf(weekStart);
        const endDayLastIndex = dayNames.indexOf(weekEnd);

        console.log(startDayLastIndex);
        console.log(endDayLastIndex);

        const startOfLastMonth = new Date(firstOfLastMonth.getFullYear(), firstOfLastMonth.getMonth(), firstOfLastMonth.getDate(), 0, 0, 0);
        const endOfLastMonth = new Date(lastOfLastMonth.getFullYear(), lastOfLastMonth.getMonth(), lastOfLastMonth.getDate(), 0, 0, 0);

        const diffLastStart = (startDayLastIndex - startOfLastMonth.getDay() + 7) % 7;
        const startLastDate = new Date(startOfLastMonth);
        startLastDate.setDate(startOfLastMonth.getDate() + diffLastStart);

        const diffLastEnd = (endDayLastIndex - endOfLastMonth.getDay() + 7) % 7;
        const endLastDate = new Date(endOfLastMonth);
        endLastDate.setDate(endOfLastMonth.getDate() + diffLastEnd);

        start = startLastDate;
        end = endLastDate;

        console.log("Start Date:", start);
        console.log("End Date:", end);
        break;
      }
      case "All":
        start = new Date(2000, 0, 1);
        end = now;
        break;
      default:
        start = new Date();
        start.setDate(start.getDate() - 30);
        end = now;
    }

    setFromDate(format(start));
    setToDate(format(end));
  };

  const format = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const SetWeekStartEnd = async () => {
    const res = await fetch(`/api/dutySettings`);
    const json = await res.json();

    setWeekStart(json.weekStart);
    setWeekEnd(json.weekEnd);

    console.log(json);
  };

  const fetchData = async () => {
    try {
      console.log(fromDate);
      console.log(toDate);

      const res = await fetch(`/api/dashboard?fromDate=${fromDate}&toDate=${toDate}`);
      const json = await res.json();

      console.log(json);
      setData(json);
    } catch (err) {
      console.error("Failed to load summary", err);
    }
  };

  const totalEntries = data.reduce((sum, shift) => sum + shift.count, 0);
  const totalDutyTypes = data.reduce((sum, shift) => sum + shift.dutyTypes.length, 0);

  return (
    <div className="page-shell">
      <section className="hero-card hero-card--primary mb-6 overflow-hidden">
        <div className="relative flex flex-col gap-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <span className="soft-badge soft-badge--light mb-3">
                <BriefcaseMedical size={14} /> Care team overview
              </span>
              <h1 className="page-title">Nurse Duty Dashboard</h1>
              <p className="page-subtitle mt-2 max-w-2xl">
                View assignments, trends and workload distribution in a cleaner, more colorful mobile dashboard.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div className="stat-card tinted-card-blue min-w-[110px] text-slate-900">
                <CalendarDays className="mb-2 text-blue-600" size={18} />
                <p className="text-2xl font-bold text-slate-900">{totalEntries}</p>
                <p className="text-xs text-slate-500">Total duties</p>
              </div>
              <div className="stat-card tinted-card-emerald min-w-[110px] text-slate-900">
                <Clock3 className="mb-2 text-teal-600" size={18} />
                <p className="text-2xl font-bold text-slate-900">{data.length}</p>
                <p className="text-xs text-slate-500">Shift groups</p>
              </div>
              <div className="stat-card tinted-card-violet min-w-[110px] col-span-2 text-slate-900 sm:col-span-1">
                <Activity className="mb-2 text-violet-600" size={18} />
                <p className="text-2xl font-bold text-slate-900">{totalDutyTypes}</p>
                <p className="text-xs text-slate-500">Duty types</p>
              </div>
            </div>
          </div>

          <div className="soft-badge soft-badge--light w-fit">
            <TrendingUp size={14} /> Active range: {fromDate} to {toDate}
          </div>
        </div>
      </section>

      <section className="section-card mb-6 border border-cyan-100/80 bg-white/85">
        <div className="mb-4 flex items-center gap-2 text-slate-700">
          <Filter size={18} className="text-blue-600" />
          <h2 className="text-base font-semibold">Quick filters</h2>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 xl:grid-cols-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Filter</label>
            <select
              className="input-field"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option>This Week</option>
              <option>Last Week</option>
              <option>This Month</option>
              <option>Last Month</option>
              <option>All</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">From Date</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="input-field"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">To Date</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="input-field"
            />
          </div>

          <div className="flex items-end">
            <div className="stat-card tinted-card-amber w-full">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Selected window</p>
              <p className="mt-1 text-sm font-semibold text-slate-800">{filter}</p>
              <p className="text-xs text-slate-500">Refreshed automatically</p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="section-card tinted-card-amber border-l-4 border-l-amber-400 lg:col-span-1">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="text-lg font-semibold text-slate-800">Overtime</h2>
            <span className="soft-badge">Total: 7</span>
          </div>
          <p className="text-sm text-slate-500">
            Highlighted summary card reserved for overtime tracking and quick review.
          </p>
        </div>

        {data.map((shift, i) => (
          <div key={i} className="section-card border border-sky-100/80 bg-white/90 lg:col-span-1">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-slate-800">{shift.shiftName}</h2>
                <p className="text-sm text-slate-500">Duty breakdown by category</p>
              </div>
              <span className="soft-badge">{shift.count} total</span>
            </div>

            <div className="space-y-2">
              {shift.dutyTypes.map((dt, j) => (
                <div
                  key={j}
                  className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-700"
                >
                  <span>{dt.name}</span>
                  <span className="font-semibold text-slate-900">{dt.count}</span>
                </div>
              ))}
            </div>
          </div>
        ))}

        {data.length === 0 && (
          <div className="section-card col-span-full text-center text-slate-500">
            No data for the selected date range.
          </div>
        )}
      </div>
    </div>
  );
}
