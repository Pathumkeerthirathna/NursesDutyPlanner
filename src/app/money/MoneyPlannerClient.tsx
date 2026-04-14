"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  BellRing,
  Landmark,
  PiggyBank,
  PlusCircle,
  RefreshCw,
  Repeat,
  ShieldCheck,
  Tags,
  Trash2,
  Users,
  Wallet,
} from "lucide-react";

type Notice = {
  type: "success" | "error";
  message: string;
} | null;

type HealthCheck = {
  status: string;
  service: string;
  database: string;
  checkedAt: string;
};

type DashboardSummary = {
  accountCount: number;
  categoryCount: number;
  transactionCount: number;
  totalBalance: number;
  totalIncome: number;
  totalExpense: number;
  netCashFlow: number;
};

type MoneyUser = {
  id: string;
  fullName: string;
  email: string;
  mobileNo?: string | null;
  isActive: boolean;
  createdAt: string;
  profile?: {
    occupation?: string | null;
    employerName?: string | null;
    defaultCurrencyCode?: string;
  } | null;
};

type MoneyCategory = {
  id: string;
  type: "INCOME" | "EXPENSE";
  name: string;
  colorCode?: string | null;
  icon?: string | null;
  isActive: boolean;
  sortOrder: number;
};

type Merchant = {
  id: string;
  name: string;
  merchantType?: string | null;
  contactNo?: string | null;
  notes?: string | null;
};

type TagItem = {
  id: string;
  name: string;
};

type FinancialAccount = {
  id: string;
  name: string;
  type: string;
  currencyCode: string;
  currentBalance: number | string;
  institutionName?: string | null;
  isArchived: boolean;
};

type MoneyTransaction = {
  id: string;
  transactionNo: string;
  transactionDate: string;
  kind: string;
  status: string;
  amount: number | string;
  currencyCode: string;
  notes?: string | null;
  fromAccount?: FinancialAccount | null;
  toAccount?: FinancialAccount | null;
  category?: MoneyCategory | null;
  merchant?: Merchant | null;
  tags?: Array<{ tag: TagItem }>;
};

type Budget = {
  id: string;
  name: string;
  budgetAmount: number | string;
  currencyCode: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  categories: Array<{
    id: string;
    allocatedAmount: number | string;
    category?: MoneyCategory | null;
  }>;
};

type RecurringTemplate = {
  id: string;
  templateName: string;
  kind: string;
  amount: number | string;
  frequencyType: string;
  frequencyInterval: number;
  nextRunDate: string;
  autoPost: boolean;
  isActive: boolean;
  category?: MoneyCategory | null;
};

type Reminder = {
  id: string;
  reminderTitle: string;
  dueDate: string;
  amountExpected?: number | string | null;
  status: string;
  isPaid: boolean;
  category?: MoneyCategory | null;
};

function formatDateInput(date: Date) {
  return date.toISOString().split("T")[0];
}

function formatDateLabel(value?: string | null) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString();
}

function formatMoneyValue(value?: number | string | null, currency = "LKR") {
  const amount = Number(value ?? 0);

  return new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(amount) ? amount : 0);
}

function toNumberOrUndefined(value: string) {
  if (value.trim() === "") {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { cache: "no-store" });
  const json = (await response.json()) as T & { error?: string };

  if (!response.ok) {
    throw new Error(json.error ?? `Request failed with status ${response.status}`);
  }

  return json as T;
}

async function sendJson<T>(url: string, method: string, body?: unknown): Promise<T> {
  const response = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

  const json = (await response.json()) as T & { error?: string };

  if (!response.ok) {
    throw new Error(json.error ?? `Request failed with status ${response.status}`);
  }

  return json as T;
}

export default function MoneyPlannerClient() {
  const today = useMemo(() => new Date(), []);
  const monthStart = useMemo(
    () => new Date(today.getFullYear(), today.getMonth(), 1),
    [today]
  );
  const monthEnd = useMemo(
    () => new Date(today.getFullYear(), today.getMonth() + 1, 0),
    [today]
  );

  const [notice, setNotice] = useState<Notice>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [health, setHealth] = useState<HealthCheck | null>(null);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);

  const [users, setUsers] = useState<MoneyUser[]>([]);
  const [categories, setCategories] = useState<MoneyCategory[]>([]);
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [tags, setTags] = useState<TagItem[]>([]);
  const [accounts, setAccounts] = useState<FinancialAccount[]>([]);
  const [transactions, setTransactions] = useState<MoneyTransaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [recurringTemplates, setRecurringTemplates] = useState<RecurringTemplate[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);

  const [selectedUserId, setSelectedUserId] = useState("");
  const [dateRange, setDateRange] = useState({
    fromDate: formatDateInput(monthStart),
    toDate: formatDateInput(monthEnd),
  });

  const [userForm, setUserForm] = useState({
    fullName: "",
    email: "",
    mobileNo: "",
    passwordHash: "demo-password-hash",
    occupation: "",
    employerName: "",
    currencyCode: "LKR",
  });

  const [categoryForm, setCategoryForm] = useState({
    type: "EXPENSE",
    name: "",
    icon: "",
    colorCode: "#0ea5e9",
  });

  const [merchantForm, setMerchantForm] = useState({
    name: "",
    merchantType: "",
    contactNo: "",
    notes: "",
  });

  const [tagForm, setTagForm] = useState({
    name: "",
  });

  const [accountForm, setAccountForm] = useState({
    type: "BANK",
    name: "",
    institutionName: "",
    accountNumberMasked: "",
    openingBalance: "0",
    currentBalance: "0",
    openedDate: formatDateInput(today),
  });

  const [transactionForm, setTransactionForm] = useState({
    transactionNo: `TXN-${Date.now()}`,
    transactionDate: `${formatDateInput(today)}T08:00:00.000Z`,
    kind: "EXPENSE",
    status: "POSTED",
    amount: "0",
    fromAccountId: "",
    toAccountId: "",
    categoryId: "",
    merchantId: "",
    paymentMethod: "Cash",
    notes: "",
    tagIds: [] as string[],
  });

  const [budgetForm, setBudgetForm] = useState({
    name: "",
    startDate: formatDateInput(monthStart),
    endDate: formatDateInput(monthEnd),
    budgetAmount: "0",
    alertThresholdPercent: "80",
    categoryId: "",
    allocatedAmount: "0",
  });

  const [recurringForm, setRecurringForm] = useState({
    templateName: "",
    kind: "INCOME",
    amount: "0",
    frequencyType: "MONTHLY",
    frequencyInterval: "1",
    nextRunDate: formatDateInput(monthEnd),
    fromAccountId: "",
    toAccountId: "",
    categoryId: "",
    merchantId: "",
  });

  const [reminderForm, setReminderForm] = useState({
    reminderTitle: "",
    dueDate: formatDateInput(monthEnd),
    amountExpected: "0",
    reminderDaysBefore: "1",
    categoryId: "",
    status: "PENDING",
  });

  const selectedUser = users.find((user) => user.id === selectedUserId) ?? null;
  const activeAccounts = accounts.filter((account) => !account.isArchived);
  const expenseCategories = categories.filter((category) => category.type === "EXPENSE");

  const loadHealth = useCallback(async () => {
    const data = await fetchJson<HealthCheck>("/api/money/health");
    setHealth(data);
  }, []);

  const loadUsers = useCallback(async () => {
    const data = await fetchJson<MoneyUser[]>("/api/money/users");
    setUsers(data);
    return data;
  }, []);

  const loadMoneyData = useCallback(
    async (userId: string) => {
      const query = `?userId=${encodeURIComponent(userId)}`;
      const rangeQuery = `${query}&fromDate=${dateRange.fromDate}&toDate=${dateRange.toDate}`;

      const [categoriesData, merchantsData, tagsData, accountsData, transactionsData, budgetsData, recurringData, remindersData, dashboardData] =
        await Promise.all([
          fetchJson<MoneyCategory[]>(`/api/money/categories${query}`),
          fetchJson<Merchant[]>(`/api/money/merchants${query}`),
          fetchJson<TagItem[]>(`/api/money/tags${query}`),
          fetchJson<FinancialAccount[]>(`/api/money/accounts${query}`),
          fetchJson<MoneyTransaction[]>(`/api/money/transactions${rangeQuery}`),
          fetchJson<Budget[]>(`/api/money/budgets${query}`),
          fetchJson<RecurringTemplate[]>(`/api/money/recurring${query}`),
          fetchJson<Reminder[]>(`/api/money/reminders${query}`),
          fetchJson<DashboardSummary>(`/api/money/dashboard${rangeQuery}`),
        ]);

      setCategories(categoriesData);
      setMerchants(merchantsData);
      setTags(tagsData);
      setAccounts(accountsData);
      setTransactions(transactionsData);
      setBudgets(budgetsData);
      setRecurringTemplates(recurringData);
      setReminders(remindersData);
      setSummary(dashboardData);
    },
    [dateRange.fromDate, dateRange.toDate]
  );

  const refreshAll = useCallback(async () => {
    try {
      setIsRefreshing(true);
      await loadHealth();
      const loadedUsers = await loadUsers();
      const currentUserId = selectedUserId || loadedUsers[0]?.id;

      if (currentUserId) {
        await loadMoneyData(currentUserId);
      }

      setNotice({ type: "success", message: "Money planner data refreshed." });
    } catch (error) {
      setNotice({
        type: "error",
        message: error instanceof Error ? error.message : "Failed to refresh data.",
      });
    } finally {
      setIsRefreshing(false);
    }
  }, [loadHealth, loadMoneyData, loadUsers, selectedUserId]);

  useEffect(() => {
    void refreshAll();
  }, [refreshAll]);

  useEffect(() => {
    if (users.length > 0 && !users.some((user) => user.id === selectedUserId)) {
      setSelectedUserId(users[0].id);
    }

    if (users.length === 0) {
      setSelectedUserId("");
    }
  }, [selectedUserId, users]);

  useEffect(() => {
    if (!selectedUserId) {
      return;
    }

    void loadMoneyData(selectedUserId).catch((error) => {
      setNotice({
        type: "error",
        message: error instanceof Error ? error.message : "Failed to load money data.",
      });
    });
  }, [loadMoneyData, selectedUserId]);

  async function handleDelete(resource: string, id: string, label: string) {
    const confirmed = window.confirm(`Delete ${label}?`);
    if (!confirmed) {
      return;
    }

    try {
      await sendJson(`/api/money/${resource}/${id}`, "DELETE");

      if (resource === "users") {
        const updatedUsers = await loadUsers();
        if (id === selectedUserId) {
          setSelectedUserId(updatedUsers[0]?.id ?? "");
        }
      } else if (selectedUserId) {
        await loadMoneyData(selectedUserId);
      }

      setNotice({ type: "success", message: `${label} deleted.` });
    } catch (error) {
      setNotice({
        type: "error",
        message: error instanceof Error ? error.message : `Failed to delete ${label}.`,
      });
    }
  }

  async function handleUserSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      const created = await sendJson<MoneyUser>("/api/money/users", "POST", {
        fullName: userForm.fullName,
        email: userForm.email,
        mobileNo: userForm.mobileNo || undefined,
        passwordHash: userForm.passwordHash,
        profile: {
          defaultCurrencyCode: userForm.currencyCode || "LKR",
          occupation: userForm.occupation || undefined,
          employerName: userForm.employerName || undefined,
        },
      });

      await loadUsers();
      setSelectedUserId(created.id);
      setUserForm({
        fullName: "",
        email: "",
        mobileNo: "",
        passwordHash: "demo-password-hash",
        occupation: "",
        employerName: "",
        currencyCode: "LKR",
      });
      setNotice({ type: "success", message: "Money user created." });
    } catch (error) {
      setNotice({
        type: "error",
        message: error instanceof Error ? error.message : "Failed to create user.",
      });
    }
  }

  async function handleCategorySubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedUserId) return;

    try {
      await sendJson("/api/money/categories", "POST", {
        userId: selectedUserId,
        type: categoryForm.type,
        name: categoryForm.name,
        icon: categoryForm.icon || undefined,
        colorCode: categoryForm.colorCode || undefined,
        isActive: true,
      });

      await loadMoneyData(selectedUserId);
      setCategoryForm({ type: "EXPENSE", name: "", icon: "", colorCode: "#0ea5e9" });
      setNotice({ type: "success", message: "Category added." });
    } catch (error) {
      setNotice({
        type: "error",
        message: error instanceof Error ? error.message : "Failed to create category.",
      });
    }
  }

  async function handleMerchantSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedUserId) return;

    try {
      await sendJson("/api/money/merchants", "POST", {
        userId: selectedUserId,
        name: merchantForm.name,
        merchantType: merchantForm.merchantType || undefined,
        contactNo: merchantForm.contactNo || undefined,
        notes: merchantForm.notes || undefined,
      });

      await loadMoneyData(selectedUserId);
      setMerchantForm({ name: "", merchantType: "", contactNo: "", notes: "" });
      setNotice({ type: "success", message: "Merchant added." });
    } catch (error) {
      setNotice({
        type: "error",
        message: error instanceof Error ? error.message : "Failed to create merchant.",
      });
    }
  }

  async function handleTagSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedUserId) return;

    try {
      await sendJson("/api/money/tags", "POST", {
        userId: selectedUserId,
        name: tagForm.name,
      });

      await loadMoneyData(selectedUserId);
      setTagForm({ name: "" });
      setNotice({ type: "success", message: "Tag added." });
    } catch (error) {
      setNotice({
        type: "error",
        message: error instanceof Error ? error.message : "Failed to create tag.",
      });
    }
  }

  async function handleAccountSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedUserId) return;

    try {
      await sendJson("/api/money/accounts", "POST", {
        userId: selectedUserId,
        type: accountForm.type,
        name: accountForm.name,
        institutionName: accountForm.institutionName || undefined,
        accountNumberMasked: accountForm.accountNumberMasked || undefined,
        openingBalance: toNumberOrUndefined(accountForm.openingBalance) ?? 0,
        currentBalance: toNumberOrUndefined(accountForm.currentBalance) ?? 0,
        openedDate: accountForm.openedDate || undefined,
      });

      await loadMoneyData(selectedUserId);
      setAccountForm({
        type: "BANK",
        name: "",
        institutionName: "",
        accountNumberMasked: "",
        openingBalance: "0",
        currentBalance: "0",
        openedDate: formatDateInput(today),
      });
      setNotice({ type: "success", message: "Account added." });
    } catch (error) {
      setNotice({
        type: "error",
        message: error instanceof Error ? error.message : "Failed to create account.",
      });
    }
  }

  async function handleTransactionSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedUserId) return;

    try {
      await sendJson("/api/money/transactions", "POST", {
        userId: selectedUserId,
        transactionNo: transactionForm.transactionNo,
        transactionDate: transactionForm.transactionDate,
        kind: transactionForm.kind,
        status: transactionForm.status,
        amount: toNumberOrUndefined(transactionForm.amount) ?? 0,
        fromAccountId: transactionForm.fromAccountId || undefined,
        toAccountId: transactionForm.toAccountId || undefined,
        categoryId: transactionForm.categoryId || undefined,
        merchantId: transactionForm.merchantId || undefined,
        paymentMethod: transactionForm.paymentMethod || undefined,
        notes: transactionForm.notes || undefined,
        tagIds: transactionForm.tagIds,
      });

      await loadMoneyData(selectedUserId);
      setTransactionForm({
        transactionNo: `TXN-${Date.now()}`,
        transactionDate: `${formatDateInput(today)}T08:00:00.000Z`,
        kind: "EXPENSE",
        status: "POSTED",
        amount: "0",
        fromAccountId: "",
        toAccountId: "",
        categoryId: "",
        merchantId: "",
        paymentMethod: "Cash",
        notes: "",
        tagIds: [],
      });
      setNotice({ type: "success", message: "Transaction added." });
    } catch (error) {
      setNotice({
        type: "error",
        message: error instanceof Error ? error.message : "Failed to create transaction.",
      });
    }
  }

  async function handleBudgetSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedUserId) return;

    try {
      await sendJson("/api/money/budgets", "POST", {
        userId: selectedUserId,
        name: budgetForm.name,
        startDate: budgetForm.startDate,
        endDate: budgetForm.endDate,
        budgetAmount: toNumberOrUndefined(budgetForm.budgetAmount) ?? 0,
        alertThresholdPercent: toNumberOrUndefined(budgetForm.alertThresholdPercent),
        categories: budgetForm.categoryId
          ? [
              {
                categoryId: budgetForm.categoryId,
                allocatedAmount: toNumberOrUndefined(budgetForm.allocatedAmount) ?? 0,
                warningPercent: toNumberOrUndefined(budgetForm.alertThresholdPercent),
              },
            ]
          : [],
      });

      await loadMoneyData(selectedUserId);
      setBudgetForm({
        name: "",
        startDate: formatDateInput(monthStart),
        endDate: formatDateInput(monthEnd),
        budgetAmount: "0",
        alertThresholdPercent: "80",
        categoryId: "",
        allocatedAmount: "0",
      });
      setNotice({ type: "success", message: "Budget saved." });
    } catch (error) {
      setNotice({
        type: "error",
        message: error instanceof Error ? error.message : "Failed to create budget.",
      });
    }
  }

  async function handleRecurringSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedUserId) return;

    try {
      await sendJson("/api/money/recurring", "POST", {
        userId: selectedUserId,
        templateName: recurringForm.templateName,
        kind: recurringForm.kind,
        amount: toNumberOrUndefined(recurringForm.amount) ?? 0,
        frequencyType: recurringForm.frequencyType,
        frequencyInterval: toNumberOrUndefined(recurringForm.frequencyInterval) ?? 1,
        nextRunDate: recurringForm.nextRunDate,
        fromAccountId: recurringForm.fromAccountId || undefined,
        toAccountId: recurringForm.toAccountId || undefined,
        categoryId: recurringForm.categoryId || undefined,
        merchantId: recurringForm.merchantId || undefined,
        autoPost: true,
      });

      await loadMoneyData(selectedUserId);
      setRecurringForm({
        templateName: "",
        kind: "INCOME",
        amount: "0",
        frequencyType: "MONTHLY",
        frequencyInterval: "1",
        nextRunDate: formatDateInput(monthEnd),
        fromAccountId: "",
        toAccountId: "",
        categoryId: "",
        merchantId: "",
      });
      setNotice({ type: "success", message: "Recurring template added." });
    } catch (error) {
      setNotice({
        type: "error",
        message: error instanceof Error ? error.message : "Failed to create recurring template.",
      });
    }
  }

  async function handleReminderSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedUserId) return;

    try {
      await sendJson("/api/money/reminders", "POST", {
        userId: selectedUserId,
        reminderTitle: reminderForm.reminderTitle,
        dueDate: reminderForm.dueDate,
        amountExpected: toNumberOrUndefined(reminderForm.amountExpected),
        reminderDaysBefore: toNumberOrUndefined(reminderForm.reminderDaysBefore) ?? 1,
        categoryId: reminderForm.categoryId || undefined,
        status: reminderForm.status,
      });

      await loadMoneyData(selectedUserId);
      setReminderForm({
        reminderTitle: "",
        dueDate: formatDateInput(monthEnd),
        amountExpected: "0",
        reminderDaysBefore: "1",
        categoryId: "",
        status: "PENDING",
      });
      setNotice({ type: "success", message: "Bill reminder added." });
    } catch (error) {
      setNotice({
        type: "error",
        message: error instanceof Error ? error.message : "Failed to create reminder.",
      });
    }
  }

  return (
    <div className="page-shell space-y-6">
      <section className="hero-card hero-card--emerald overflow-hidden">
        <div className="page-header">
          <div>
            <span className="soft-badge soft-badge--light mb-3 inline-flex">
              <Wallet size={14} /> Cloud finance workspace
            </span>
            <h1 className="page-title">Money Planner</h1>
            <p className="page-subtitle mt-2 max-w-3xl">
              Manage nurse income, expenses, accounts, budgets, reminders, and recurring items from one
              screen backed by the Prisma money APIs.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => void refreshAll()}
              className="primary-btn rounded-xl px-4 py-2 text-sm"
              disabled={isRefreshing}
            >
              <RefreshCw size={16} className={isRefreshing ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <div className="stat-card bg-white/15 text-white">
            <p className="text-xs uppercase tracking-wide text-white/75">Users</p>
            <p className="mt-1 text-2xl font-bold">{users.length}</p>
          </div>
          <div className="stat-card bg-white/15 text-white">
            <p className="text-xs uppercase tracking-wide text-white/75">Accounts</p>
            <p className="mt-1 text-2xl font-bold">{summary?.accountCount ?? 0}</p>
          </div>
          <div className="stat-card bg-white/15 text-white">
            <p className="text-xs uppercase tracking-wide text-white/75">Transactions</p>
            <p className="mt-1 text-2xl font-bold">{summary?.transactionCount ?? 0}</p>
          </div>
          <div className="stat-card bg-white/15 text-white">
            <p className="text-xs uppercase tracking-wide text-white/75">Net cash flow</p>
            <p className="mt-1 text-2xl font-bold">{formatMoneyValue(summary?.netCashFlow)}</p>
          </div>
        </div>
      </section>

      {notice ? (
        <div
          className={`section-card border ${
            notice.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-rose-200 bg-rose-50 text-rose-700"
          }`}
        >
          {notice.message}
        </div>
      ) : null}

      <section className="section-card">
        <div className="page-header">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Module status & filters</h2>
            <p className="text-sm text-slate-500">Switch users and date ranges to drive every money API section.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Active user</label>
            <select
              value={selectedUserId}
              onChange={(event) => setSelectedUserId(event.target.value)}
              className="w-full px-3 py-2"
            >
              <option value="">Select user</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.fullName} · {user.email}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">From date</label>
            <input
              type="date"
              value={dateRange.fromDate}
              onChange={(event) =>
                setDateRange((current) => ({ ...current, fromDate: event.target.value }))
              }
              className="w-full px-3 py-2"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">To date</label>
            <input
              type="date"
              value={dateRange.toDate}
              onChange={(event) =>
                setDateRange((current) => ({ ...current, toDate: event.target.value }))
              }
              className="w-full px-3 py-2"
            />
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
              <ShieldCheck size={16} className="text-emerald-600" />
              Health
            </div>
            <p className="mt-2 text-sm text-slate-600">
              {health?.database === "connected" ? "Database connected" : "Checking..."}
            </p>
            <p className="text-xs text-slate-500">{health?.checkedAt ? formatDateLabel(health.checkedAt) : "—"}</p>
          </div>
        </div>
      </section>

      <section id="users" className="section-card">
        <div className="page-header">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Users & profiles</h2>
            <p className="text-sm text-slate-500">Create and select the nurse profile used by the finance workspace.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.1fr_0.9fr]">
          <form onSubmit={handleUserSubmit} className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <input
              placeholder="Full name"
              value={userForm.fullName}
              onChange={(event) => setUserForm((current) => ({ ...current, fullName: event.target.value }))}
              className="px-3 py-2"
              required
            />
            <input
              placeholder="Email"
              type="email"
              value={userForm.email}
              onChange={(event) => setUserForm((current) => ({ ...current, email: event.target.value }))}
              className="px-3 py-2"
              required
            />
            <input
              placeholder="Mobile number"
              value={userForm.mobileNo}
              onChange={(event) => setUserForm((current) => ({ ...current, mobileNo: event.target.value }))}
              className="px-3 py-2"
            />
            <input
              placeholder="Password hash"
              value={userForm.passwordHash}
              onChange={(event) => setUserForm((current) => ({ ...current, passwordHash: event.target.value }))}
              className="px-3 py-2"
              required
            />
            <input
              placeholder="Occupation"
              value={userForm.occupation}
              onChange={(event) => setUserForm((current) => ({ ...current, occupation: event.target.value }))}
              className="px-3 py-2"
            />
            <input
              placeholder="Employer"
              value={userForm.employerName}
              onChange={(event) => setUserForm((current) => ({ ...current, employerName: event.target.value }))}
              className="px-3 py-2"
            />
            <input
              placeholder="Currency"
              value={userForm.currencyCode}
              onChange={(event) => setUserForm((current) => ({ ...current, currencyCode: event.target.value }))}
              className="px-3 py-2 md:col-span-2"
            />
            <button type="submit" className="primary-btn rounded-xl px-4 py-2 md:col-span-2">
              <PlusCircle size={16} /> Add user
            </button>
          </form>

          <div className="space-y-3">
            {users.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 px-4 py-5 text-sm text-slate-500">
                No money users yet. Create one to activate the rest of the planner.
              </div>
            ) : (
              users.map((user) => (
                <div key={user.id} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900">{user.fullName}</p>
                      <p className="text-sm text-slate-500">{user.email}</p>
                      <p className="text-xs text-slate-500">
                        {user.profile?.occupation || "No role"} · {user.profile?.employerName || "No employer"}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedUserId(user.id)}
                        className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                          selectedUserId === user.id
                            ? "bg-blue-600 text-white"
                            : "bg-slate-200 text-slate-700"
                        }`}
                      >
                        {selectedUserId === user.id ? "Selected" : "Use"}
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleDelete("users", user.id, user.fullName)}
                        className="rounded-lg bg-rose-100 px-3 py-1.5 text-xs font-semibold text-rose-700"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <div className="section-card">
          <div className="mb-3 flex items-center gap-2 text-slate-900">
            <Tags size={17} className="text-cyan-600" />
            <h2 className="text-lg font-semibold">Categories</h2>
          </div>

          <form onSubmit={handleCategorySubmit} className="space-y-3" aria-label="Create category">
            <fieldset disabled={!selectedUserId} className="space-y-3 disabled:opacity-60">
              <select
                value={categoryForm.type}
                onChange={(event) => setCategoryForm((current) => ({ ...current, type: event.target.value }))}
                className="w-full px-3 py-2"
              >
                <option value="INCOME">Income</option>
                <option value="EXPENSE">Expense</option>
              </select>
              <input
                placeholder="Category name"
                value={categoryForm.name}
                onChange={(event) => setCategoryForm((current) => ({ ...current, name: event.target.value }))}
                className="w-full px-3 py-2"
                required
              />
              <input
                placeholder="Icon"
                value={categoryForm.icon}
                onChange={(event) => setCategoryForm((current) => ({ ...current, icon: event.target.value }))}
                className="w-full px-3 py-2"
              />
              <input
                type="color"
                value={categoryForm.colorCode}
                onChange={(event) => setCategoryForm((current) => ({ ...current, colorCode: event.target.value }))}
                className="h-11 w-full px-2 py-1"
              />
              <button type="submit" className="primary-btn w-full rounded-xl px-4 py-2">
                <PlusCircle size={16} /> Add category
              </button>
            </fieldset>
          </form>

          <div className="mt-4 space-y-2">
            {categories.slice(0, 6).map((category) => (
              <div key={category.id} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
                <div>
                  <p className="font-medium text-slate-800">{category.name}</p>
                  <p className="text-xs text-slate-500">{category.type}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full" style={{ backgroundColor: category.colorCode ?? "#0ea5e9" }} />
                  <button
                    type="button"
                    onClick={() => void handleDelete("categories", category.id, category.name)}
                    className="rounded-lg bg-rose-100 px-2 py-1 text-rose-700"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="section-card">
          <div className="mb-3 flex items-center gap-2 text-slate-900">
            <Users size={17} className="text-violet-600" />
            <h2 className="text-lg font-semibold">Merchants</h2>
          </div>

          <form onSubmit={handleMerchantSubmit} className="space-y-3">
            <fieldset disabled={!selectedUserId} className="space-y-3 disabled:opacity-60">
              <input
                placeholder="Merchant name"
                value={merchantForm.name}
                onChange={(event) => setMerchantForm((current) => ({ ...current, name: event.target.value }))}
                className="w-full px-3 py-2"
                required
              />
              <input
                placeholder="Merchant type"
                value={merchantForm.merchantType}
                onChange={(event) =>
                  setMerchantForm((current) => ({ ...current, merchantType: event.target.value }))
                }
                className="w-full px-3 py-2"
              />
              <input
                placeholder="Contact number"
                value={merchantForm.contactNo}
                onChange={(event) => setMerchantForm((current) => ({ ...current, contactNo: event.target.value }))}
                className="w-full px-3 py-2"
              />
              <textarea
                placeholder="Notes"
                value={merchantForm.notes}
                onChange={(event) => setMerchantForm((current) => ({ ...current, notes: event.target.value }))}
                className="w-full px-3 py-2"
                rows={3}
              />
              <button type="submit" className="primary-btn w-full rounded-xl px-4 py-2">
                <PlusCircle size={16} /> Add merchant
              </button>
            </fieldset>
          </form>

          <div className="mt-4 space-y-2">
            {merchants.slice(0, 6).map((merchant) => (
              <div key={merchant.id} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
                <div>
                  <p className="font-medium text-slate-800">{merchant.name}</p>
                  <p className="text-xs text-slate-500">{merchant.merchantType || "General"}</p>
                </div>
                <button
                  type="button"
                  onClick={() => void handleDelete("merchants", merchant.id, merchant.name)}
                  className="rounded-lg bg-rose-100 px-2 py-1 text-rose-700"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="section-card">
          <div className="mb-3 flex items-center gap-2 text-slate-900">
            <Tags size={17} className="text-amber-600" />
            <h2 className="text-lg font-semibold">Tags</h2>
          </div>

          <form onSubmit={handleTagSubmit} className="space-y-3">
            <fieldset disabled={!selectedUserId} className="space-y-3 disabled:opacity-60">
              <input
                placeholder="Tag name"
                value={tagForm.name}
                onChange={(event) => setTagForm({ name: event.target.value })}
                className="w-full px-3 py-2"
                required
              />
              <button type="submit" className="primary-btn w-full rounded-xl px-4 py-2">
                <PlusCircle size={16} /> Add tag
              </button>
            </fieldset>
          </form>

          <div className="mt-4 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span key={tag.id} className="soft-badge">
                #{tag.name}
                <button type="button" onClick={() => void handleDelete("tags", tag.id, tag.name)}>
                  <Trash2 size={12} />
                </button>
              </span>
            ))}
          </div>
        </div>
      </section>

      <section id="accounts" className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_1.1fr]">
        <div className="section-card">
          <div className="mb-3 flex items-center gap-2 text-slate-900">
            <Landmark size={17} className="text-blue-600" />
            <h2 className="text-lg font-semibold">Accounts</h2>
          </div>

          <form onSubmit={handleAccountSubmit} className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <fieldset disabled={!selectedUserId} className="contents disabled:opacity-60">
              <select
                value={accountForm.type}
                onChange={(event) => setAccountForm((current) => ({ ...current, type: event.target.value }))}
                className="px-3 py-2"
              >
                <option value="BANK">Bank</option>
                <option value="CASH">Cash</option>
                <option value="E_WALLET">E-Wallet</option>
                <option value="SAVINGS">Savings</option>
                <option value="CREDIT_CARD">Credit card</option>
              </select>
              <input
                placeholder="Account name"
                value={accountForm.name}
                onChange={(event) => setAccountForm((current) => ({ ...current, name: event.target.value }))}
                className="px-3 py-2"
                required
              />
              <input
                placeholder="Institution"
                value={accountForm.institutionName}
                onChange={(event) =>
                  setAccountForm((current) => ({ ...current, institutionName: event.target.value }))
                }
                className="px-3 py-2"
              />
              <input
                placeholder="Masked account no"
                value={accountForm.accountNumberMasked}
                onChange={(event) =>
                  setAccountForm((current) => ({ ...current, accountNumberMasked: event.target.value }))
                }
                className="px-3 py-2"
              />
              <input
                type="number"
                placeholder="Opening balance"
                value={accountForm.openingBalance}
                onChange={(event) =>
                  setAccountForm((current) => ({ ...current, openingBalance: event.target.value }))
                }
                className="px-3 py-2"
              />
              <input
                type="number"
                placeholder="Current balance"
                value={accountForm.currentBalance}
                onChange={(event) =>
                  setAccountForm((current) => ({ ...current, currentBalance: event.target.value }))
                }
                className="px-3 py-2"
              />
              <input
                type="date"
                value={accountForm.openedDate}
                onChange={(event) =>
                  setAccountForm((current) => ({ ...current, openedDate: event.target.value }))
                }
                className="px-3 py-2 md:col-span-2"
              />
              <button type="submit" className="primary-btn rounded-xl px-4 py-2 md:col-span-2">
                <PlusCircle size={16} /> Add account
              </button>
            </fieldset>
          </form>
        </div>

        <div className="section-card">
          <div className="mb-3 flex items-center gap-2 text-slate-900">
            <Activity size={17} className="text-emerald-600" />
            <h2 className="text-lg font-semibold">Account balances</h2>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {activeAccounts.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 px-4 py-5 text-sm text-slate-500 md:col-span-2">
                No accounts yet for the selected user.
              </div>
            ) : (
              activeAccounts.map((account) => (
                <div key={account.id} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-slate-900">{account.name}</p>
                      <p className="text-xs text-slate-500">
                        {account.type} {account.institutionName ? `· ${account.institutionName}` : ""}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => void handleDelete("accounts", account.id, account.name)}
                      className="rounded-lg bg-rose-100 px-2 py-1 text-rose-700"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <p className="mt-3 text-lg font-bold text-slate-900">
                    {formatMoneyValue(account.currentBalance, account.currencyCode)}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      <section id="transactions" className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_1.2fr]">
        <div className="section-card">
          <div className="mb-3 flex items-center gap-2 text-slate-900">
            <Wallet size={17} className="text-violet-600" />
            <h2 className="text-lg font-semibold">Transaction entry</h2>
          </div>

          <form onSubmit={handleTransactionSubmit} className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <fieldset disabled={!selectedUserId} className="contents disabled:opacity-60">
              <input
                placeholder="Transaction no"
                value={transactionForm.transactionNo}
                onChange={(event) =>
                  setTransactionForm((current) => ({ ...current, transactionNo: event.target.value }))
                }
                className="px-3 py-2"
                required
              />
              <input
                type="datetime-local"
                value={transactionForm.transactionDate.replace(".000Z", "")}
                onChange={(event) =>
                  setTransactionForm((current) => ({
                    ...current,
                    transactionDate: `${event.target.value}:00.000Z`,
                  }))
                }
                className="px-3 py-2"
                required
              />
              <select
                value={transactionForm.kind}
                onChange={(event) => setTransactionForm((current) => ({ ...current, kind: event.target.value }))}
                className="px-3 py-2"
              >
                <option value="EXPENSE">Expense</option>
                <option value="INCOME">Income</option>
                <option value="TRANSFER">Transfer</option>
              </select>
              <input
                type="number"
                placeholder="Amount"
                value={transactionForm.amount}
                onChange={(event) => setTransactionForm((current) => ({ ...current, amount: event.target.value }))}
                className="px-3 py-2"
                required
              />
              <select
                value={transactionForm.fromAccountId}
                onChange={(event) =>
                  setTransactionForm((current) => ({ ...current, fromAccountId: event.target.value }))
                }
                className="px-3 py-2"
              >
                <option value="">From account</option>
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name}
                  </option>
                ))}
              </select>
              <select
                value={transactionForm.toAccountId}
                onChange={(event) =>
                  setTransactionForm((current) => ({ ...current, toAccountId: event.target.value }))
                }
                className="px-3 py-2"
              >
                <option value="">To account</option>
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name}
                  </option>
                ))}
              </select>
              <select
                value={transactionForm.categoryId}
                onChange={(event) =>
                  setTransactionForm((current) => ({ ...current, categoryId: event.target.value }))
                }
                className="px-3 py-2"
              >
                <option value="">Category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <select
                value={transactionForm.merchantId}
                onChange={(event) =>
                  setTransactionForm((current) => ({ ...current, merchantId: event.target.value }))
                }
                className="px-3 py-2"
              >
                <option value="">Merchant</option>
                {merchants.map((merchant) => (
                  <option key={merchant.id} value={merchant.id}>
                    {merchant.name}
                  </option>
                ))}
              </select>
              <select
                value={transactionForm.paymentMethod}
                onChange={(event) =>
                  setTransactionForm((current) => ({ ...current, paymentMethod: event.target.value }))
                }
                className="px-3 py-2"
              >
                <option value="Cash">Cash</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Card">Card</option>
                <option value="Internal Transfer">Internal Transfer</option>
              </select>
              <select
                value={transactionForm.tagIds[0] ?? ""}
                onChange={(event) =>
                  setTransactionForm((current) => ({
                    ...current,
                    tagIds: event.target.value ? [event.target.value] : [],
                  }))
                }
                className="px-3 py-2"
              >
                <option value="">Tag</option>
                {tags.map((tag) => (
                  <option key={tag.id} value={tag.id}>
                    {tag.name}
                  </option>
                ))}
              </select>
              <textarea
                placeholder="Notes"
                value={transactionForm.notes}
                onChange={(event) => setTransactionForm((current) => ({ ...current, notes: event.target.value }))}
                className="px-3 py-2 md:col-span-2"
                rows={3}
              />
              <button type="submit" className="primary-btn rounded-xl px-4 py-2 md:col-span-2">
                <PlusCircle size={16} /> Add transaction
              </button>
            </fieldset>
          </form>
        </div>

        <div className="section-card">
          <div className="mb-3 flex items-center gap-2 text-slate-900">
            <Activity size={17} className="text-amber-600" />
            <h2 className="text-lg font-semibold">Recent transactions</h2>
          </div>

          <div className="space-y-3">
            {transactions.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 px-4 py-5 text-sm text-slate-500">
                No transactions in the selected range.
              </div>
            ) : (
              transactions.slice(0, 8).map((transaction) => (
                <div key={transaction.id} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900">{transaction.transactionNo}</p>
                      <p className="text-xs text-slate-500">
                        {transaction.kind} · {formatDateLabel(transaction.transactionDate)}
                      </p>
                      <p className="text-xs text-slate-500">
                        {transaction.category?.name || "No category"}
                        {transaction.merchant?.name ? ` · ${transaction.merchant.name}` : ""}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => void handleDelete("transactions", transaction.id, transaction.transactionNo)}
                      className="rounded-lg bg-rose-100 px-2 py-1 text-rose-700"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <p className="text-lg font-bold text-slate-900">
                      {formatMoneyValue(transaction.amount, transaction.currencyCode)}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {transaction.tags?.map((entry) => (
                        <span key={entry.tag.id} className="soft-badge">
                          #{entry.tag.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <div className="section-card">
          <div className="mb-3 flex items-center gap-2 text-slate-900">
            <PiggyBank size={17} className="text-emerald-600" />
            <h2 className="text-lg font-semibold">Budgets</h2>
          </div>

          <form onSubmit={handleBudgetSubmit} className="space-y-3">
            <fieldset disabled={!selectedUserId} className="space-y-3 disabled:opacity-60">
              <input
                placeholder="Budget name"
                value={budgetForm.name}
                onChange={(event) => setBudgetForm((current) => ({ ...current, name: event.target.value }))}
                className="w-full px-3 py-2"
                required
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="date"
                  value={budgetForm.startDate}
                  onChange={(event) => setBudgetForm((current) => ({ ...current, startDate: event.target.value }))}
                  className="px-3 py-2"
                />
                <input
                  type="date"
                  value={budgetForm.endDate}
                  onChange={(event) => setBudgetForm((current) => ({ ...current, endDate: event.target.value }))}
                  className="px-3 py-2"
                />
              </div>
              <input
                type="number"
                placeholder="Budget amount"
                value={budgetForm.budgetAmount}
                onChange={(event) => setBudgetForm((current) => ({ ...current, budgetAmount: event.target.value }))}
                className="w-full px-3 py-2"
              />
              <select
                value={budgetForm.categoryId}
                onChange={(event) => setBudgetForm((current) => ({ ...current, categoryId: event.target.value }))}
                className="w-full px-3 py-2"
              >
                <option value="">Link expense category</option>
                {expenseCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Allocated amount"
                value={budgetForm.allocatedAmount}
                onChange={(event) => setBudgetForm((current) => ({ ...current, allocatedAmount: event.target.value }))}
                className="w-full px-3 py-2"
              />
              <button type="submit" className="primary-btn w-full rounded-xl px-4 py-2">
                <PlusCircle size={16} /> Add budget
              </button>
            </fieldset>
          </form>

          <div className="mt-4 space-y-2">
            {budgets.slice(0, 4).map((budget) => (
              <div key={budget.id} className="rounded-xl bg-slate-50 px-3 py-2">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium text-slate-800">{budget.name}</p>
                  <button
                    type="button"
                    onClick={() => void handleDelete("budgets", budget.id, budget.name)}
                    className="rounded-lg bg-rose-100 px-2 py-1 text-rose-700"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <p className="text-xs text-slate-500">
                  {formatMoneyValue(budget.budgetAmount, budget.currencyCode)} · {formatDateLabel(budget.startDate)} - {formatDateLabel(budget.endDate)}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="section-card">
          <div className="mb-3 flex items-center gap-2 text-slate-900">
            <Repeat size={17} className="text-violet-600" />
            <h2 className="text-lg font-semibold">Recurring templates</h2>
          </div>

          <form onSubmit={handleRecurringSubmit} className="space-y-3">
            <fieldset disabled={!selectedUserId} className="space-y-3 disabled:opacity-60">
              <input
                placeholder="Template name"
                value={recurringForm.templateName}
                onChange={(event) =>
                  setRecurringForm((current) => ({ ...current, templateName: event.target.value }))
                }
                className="w-full px-3 py-2"
                required
              />
              <div className="grid grid-cols-2 gap-3">
                <select
                  value={recurringForm.kind}
                  onChange={(event) => setRecurringForm((current) => ({ ...current, kind: event.target.value }))}
                  className="px-3 py-2"
                >
                  <option value="INCOME">Income</option>
                  <option value="EXPENSE">Expense</option>
                  <option value="TRANSFER">Transfer</option>
                </select>
                <input
                  type="number"
                  placeholder="Amount"
                  value={recurringForm.amount}
                  onChange={(event) => setRecurringForm((current) => ({ ...current, amount: event.target.value }))}
                  className="px-3 py-2"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <select
                  value={recurringForm.frequencyType}
                  onChange={(event) =>
                    setRecurringForm((current) => ({ ...current, frequencyType: event.target.value }))
                  }
                  className="px-3 py-2"
                >
                  <option value="DAILY">Daily</option>
                  <option value="WEEKLY">Weekly</option>
                  <option value="MONTHLY">Monthly</option>
                  <option value="YEARLY">Yearly</option>
                </select>
                <input
                  type="number"
                  placeholder="Interval"
                  value={recurringForm.frequencyInterval}
                  onChange={(event) =>
                    setRecurringForm((current) => ({ ...current, frequencyInterval: event.target.value }))
                  }
                  className="px-3 py-2"
                />
              </div>
              <input
                type="date"
                value={recurringForm.nextRunDate}
                onChange={(event) =>
                  setRecurringForm((current) => ({ ...current, nextRunDate: event.target.value }))
                }
                className="w-full px-3 py-2"
              />
              <select
                value={recurringForm.categoryId}
                onChange={(event) =>
                  setRecurringForm((current) => ({ ...current, categoryId: event.target.value }))
                }
                className="w-full px-3 py-2"
              >
                <option value="">Category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <button type="submit" className="primary-btn w-full rounded-xl px-4 py-2">
                <PlusCircle size={16} /> Add recurring item
              </button>
            </fieldset>
          </form>

          <div className="mt-4 space-y-2">
            {recurringTemplates.slice(0, 4).map((template) => (
              <div key={template.id} className="rounded-xl bg-slate-50 px-3 py-2">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium text-slate-800">{template.templateName}</p>
                  <button
                    type="button"
                    onClick={() => void handleDelete("recurring", template.id, template.templateName)}
                    className="rounded-lg bg-rose-100 px-2 py-1 text-rose-700"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <p className="text-xs text-slate-500">
                  {template.frequencyType} · {formatMoneyValue(template.amount)} · next {formatDateLabel(template.nextRunDate)}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="section-card">
          <div className="mb-3 flex items-center gap-2 text-slate-900">
            <BellRing size={17} className="text-rose-600" />
            <h2 className="text-lg font-semibold">Bill reminders</h2>
          </div>

          <form onSubmit={handleReminderSubmit} className="space-y-3">
            <fieldset disabled={!selectedUserId} className="space-y-3 disabled:opacity-60">
              <input
                placeholder="Reminder title"
                value={reminderForm.reminderTitle}
                onChange={(event) =>
                  setReminderForm((current) => ({ ...current, reminderTitle: event.target.value }))
                }
                className="w-full px-3 py-2"
                required
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="date"
                  value={reminderForm.dueDate}
                  onChange={(event) => setReminderForm((current) => ({ ...current, dueDate: event.target.value }))}
                  className="px-3 py-2"
                />
                <input
                  type="number"
                  placeholder="Expected amount"
                  value={reminderForm.amountExpected}
                  onChange={(event) =>
                    setReminderForm((current) => ({ ...current, amountExpected: event.target.value }))
                  }
                  className="px-3 py-2"
                />
              </div>
              <select
                value={reminderForm.categoryId}
                onChange={(event) => setReminderForm((current) => ({ ...current, categoryId: event.target.value }))}
                className="w-full px-3 py-2"
              >
                <option value="">Category</option>
                {expenseCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <button type="submit" className="primary-btn w-full rounded-xl px-4 py-2">
                <PlusCircle size={16} /> Add reminder
              </button>
            </fieldset>
          </form>

          <div className="mt-4 space-y-2">
            {reminders.slice(0, 5).map((reminder) => (
              <div key={reminder.id} className="rounded-xl bg-slate-50 px-3 py-2">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium text-slate-800">{reminder.reminderTitle}</p>
                  <button
                    type="button"
                    onClick={() => void handleDelete("reminders", reminder.id, reminder.reminderTitle)}
                    className="rounded-lg bg-rose-100 px-2 py-1 text-rose-700"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <p className="text-xs text-slate-500">
                  Due {formatDateLabel(reminder.dueDate)} · {formatMoneyValue(reminder.amountExpected)} · {reminder.status}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-card">
        <div className="page-header">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">API coverage</h2>
            <p className="text-sm text-slate-500">These UI sections are connected to the Prisma money APIs in the app.</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {[
            "/api/money",
            "/api/money/health",
            "/api/money/users",
            "/api/money/categories",
            "/api/money/merchants",
            "/api/money/tags",
            "/api/money/accounts",
            "/api/money/transactions",
            "/api/money/budgets",
            "/api/money/recurring",
            "/api/money/reminders",
            "/api/money/dashboard",
          ].map((endpoint) => (
            <code key={endpoint} className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700">
              {endpoint}
            </code>
          ))}
        </div>

        {selectedUser ? (
          <div className="mt-4 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
            Active workspace: <span className="font-semibold text-slate-900">{selectedUser.fullName}</span>
            {summary ? (
              <span>
                {" "}· Balance {formatMoneyValue(summary.totalBalance)} · Income {formatMoneyValue(summary.totalIncome)} · Expense {formatMoneyValue(summary.totalExpense)}
              </span>
            ) : null}
          </div>
        ) : null}
      </section>
    </div>
  );
}
