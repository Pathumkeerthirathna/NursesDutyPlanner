// "use client";

// import { PlusCircle, Trash2 } from "lucide-react";
// import { useEffect, useState } from "react";

// type DutyType = {
//   id: number;
//   dutyName: string;
//   color: string;
//   status: number;
// };

// export default function DutyTypesPage() {
//   const [dutyTypes, setDutyTypes] = useState<DutyType[]>([]);
//   const [form, setForm] = useState({
//     id: 0,
//     dutyName: "",
//     color: "#ffffff",
//     status: 0,
//   });

//   // Fetch duty types
//   useEffect(() => {
//     fetch("/api/dutytypes")
//       .then((res) => res.json())
//       .then(setDutyTypes);
//   }, []);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     if (form.id) {
//       // update
//       await fetch(`/api/dutytypes/${form.id}`, {
//         method: "PUT",
//         body: JSON.stringify(form),
//       });
//     } else {
//       // create
//       await fetch("/api/dutytypes", {
//         method: "POST",
//         body: JSON.stringify(form),
//       });
//     }

//     resetForm();
//     refreshData();
//   };

//   const handleDelete = async (id: number) => {
//     const confirmed = window.confirm("Are you sure you want to delete?");
//     if (!confirmed) return;

//     alert(id);

//     await fetch(`/api/dutytypes/${id}`, { method: "DELETE" });
//     setDutyTypes(dutyTypes.filter((d) => d.id !== id));
//   };

//   const refreshData = async () => {
//     const updated = await fetch("/api/dutytypes").then((res) => res.json());
//     setDutyTypes(updated);
//   };

//   const resetForm = () => {
//     setForm({ id: 0, dutyName: "", color: "#ffffff", status: 0 });
//   };

//   return (
//     <div className="p-4 max-w-2xl mx-auto">
//       <h1 className="text-xl font-bold mb-4">Duty Types</h1>

//       {/* Add/Edit Form */}
//       <form
//         onSubmit={handleSubmit}
//         className="mb-6 space-y-2 bg-white p-4 rounded shadow"
//       >
//         <input
//           type="text"
//           placeholder="Duty Name"
//           value={form.dutyName}
//           onChange={(e) => setForm({ ...form, dutyName: e.target.value })}
//           className="border p-2 w-full rounded"
//           required
//         />
//         <div className="flex gap-2">
//           <input
//             type="color"
//             value={form.color}
//             onChange={(e) => setForm({ ...form, color: e.target.value })}
//             className="w-16 h-10 border rounded cursor-pointer"
//           />
//           <select
//             value={form.status}
//             onChange={(e) => setForm({ ...form, status: Number(e.target.value) })}
//             className="border p-2 w-full rounded"
//           >
//             <option value={1}>Inactive</option>
//             <option value={0}>Active</option>
//           </select>
//         </div>

//         <button
//           type="submit"
//           className="bg-blue-600 text-white px-4 py-2 rounded w-full"
//         >
//           {form.id ? "Update Duty Type" : "Add Duty Type"}
//         </button>
//       </form>

//       {/* Legend + Reset */}


//       {/* Duty Types Table */}
//       <table className="w-full border-collapse bg-white rounded shadow">
//         <thead>
//           <tr className="bg-gray-100 text-left">
//             <th className="p-2 border">Name</th>

//             <th className="p-2 border"></th>
//           </tr>
//         </thead>
//         <tbody>
//           {dutyTypes.map((d) => (
//             <tr
//               key={d.id}
//               onClick={() => setForm(d)}
//               className={`cursor-pointer hover:bg-gray-100 ${
//                 d.status === 0 ? "bg-green-100" : "bg-red-100"
//               }`}
//             >
//               <td className={`p-2 border font-medium ${d.color}`} style={{backgroundColor:d.color}}>{d.dutyName}</td>
 
//               <td className="p-2 border">
//                 <button
//                   onClick={(e) => {
//                     e.stopPropagation(); // prevent row click
//                     handleDelete(d.id);
//                   }}
//                   className="bg-red-600 text-white px-2 py-1 rounded"
//                 >
//                   <Trash2 size={16} />
//                 </button>
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// }


"use client";

import { Palette, PlusCircle, ShieldCheck, ShieldOff, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";

type DutyType = {
  id: number;
  dutyName: string;
  color: string;
  status: number;
};

export default function DutyTypesPage() {
  const [dutyTypes, setDutyTypes] = useState<DutyType[]>([]);
  const [form, setForm] = useState({
    id: 0,
    dutyName: "",
    color: "#ffffff",
    status: 0,
  });
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  // Fetch duty types
  useEffect(() => {
    fetch("/api/dutytypes")
      .then((res) => res.json())
      .then(setDutyTypes);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.id) {
      // update
      await fetch(`/api/dutytypes/${form.id}`, {
        method: "PUT",
        body: JSON.stringify(form),
      });
    } else {
      // create
      await fetch("/api/dutytypes", {
        method: "POST",
        body: JSON.stringify(form),
      });
    }

    resetForm();
    setIsPanelOpen(false);
    refreshData();
  };

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm("Are you sure you want to delete?");
    if (!confirmed) return;

    await fetch(`/api/dutytypes/${id}`, { method: "DELETE" });
    setDutyTypes(dutyTypes.filter((d) => d.id !== id));
  };

  const refreshData = async () => {
    const updated = await fetch("/api/dutytypes").then((res) => res.json());
    setDutyTypes(updated);
  };

  const resetForm = () => {
    setForm({ id: 0, dutyName: "", color: "#ffffff", status: 0 });
  };

  const openPanelForNew = () => {
    resetForm();
    setIsPanelOpen(true);
  };

  const openPanelForEdit = (d: DutyType) => {
    setForm(d);
    setIsPanelOpen(true);
  };

  return (
    <div className="page-shell">
      <section className="hero-card hero-card--violet mb-5">
        <div className="page-header mb-0">
          <div>
            <span className="soft-badge soft-badge--light mb-3">
              <Palette size={14} /> Color coded categories
            </span>
            <h1 className="page-title">Duty Types</h1>
            <p className="page-subtitle">
              Organize nursing duties with clear colors and active status labels.
            </p>
          </div>

          <button
            onClick={() => {
              resetForm();
              openPanelForNew();
            }}
            className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-lg"
          >
            <PlusCircle size={18} /> Add Duty Type
          </button>
        </div>
      </section>

      <section className="section-card border border-violet-100/80 bg-white/85">
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
                <th>Status</th>
                <th className="w-24 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {dutyTypes.map((d) => (
                <tr
                  key={d.id}
                  onClick={() => openPanelForEdit(d)}
                  className={`cursor-pointer transition-colors ${
                    d.status === 0 ? "bg-emerald-50/60 hover:bg-emerald-50" : "bg-rose-50/60 hover:bg-rose-50"
                  }`}
                >
                  <td className="font-medium">
                    <div className="flex items-center gap-3">
                      <span
                        className="h-3 w-3 rounded-full border border-slate-300"
                        style={{ backgroundColor: d.color }}
                      />
                      <span
                        className="rounded-full px-3 py-1 text-slate-800"
                        style={{ backgroundColor: `${d.color}22` }}
                      >
                        {d.dutyName}
                      </span>
                    </div>
                  </td>
                  <td>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        d.status === 0 ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                      }`}
                    >
                      {d.status === 0 ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="text-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(d.id);
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
        <div
          className="fixed inset-0 z-40 bg-slate-950/30"
          onClick={() => setIsPanelOpen(false)}
        />
      )}

      <div
        className={`fixed top-0 right-0 z-50 h-full transform transition-transform duration-300 ${
          isPanelOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="drawer-panel p-6">
          <div className="mb-4 flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                {form.id ? "Edit Duty Type" : "Add Duty Type"}
              </h2>
              <p className="text-sm text-slate-500">Update labels without changing the core logic.</p>
            </div>
            <button
              onClick={() => setIsPanelOpen(false)}
              className="icon-btn text-slate-500 hover:bg-slate-100"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Duty Name</label>
              <input
                type="text"
                placeholder="Duty Name"
                value={form.dutyName}
                onChange={(e) => setForm({ ...form, dutyName: e.target.value })}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Color</label>
              <input
                type="color"
                value={form.color}
                onChange={(e) => setForm({ ...form, color: e.target.value })}
                className="h-11 w-20 cursor-pointer rounded-xl border border-slate-200 bg-white"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Status</label>
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
              {form.id ? "Update Duty Type" : "Add Duty Type"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
