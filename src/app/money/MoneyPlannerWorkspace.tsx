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

type TabKey = "overview" | "transactions" | "accounts" | "planning" | "professional" | "masters";

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
  investmentValue: number;
  totalLiabilities: number;
  pendingReimbursement: number;
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

type SavingsGoal = {
  id: string;
  goalName: string;
  targetAmount: number | string;
  currentAmount: number | string;
  currencyCode: string;
  targetDate?: string | null;
  status: string;
  isActive: boolean;
};

type IncomeSource = {
  id: string;
  sourceName: string;
  sourceType?: string | null;
  employerName?: string | null;
  defaultAmount?: number | string | null;
  payDay?: number | null;
  isActive: boolean;
};

type SalaryComponent = {
  id: string;
  componentType: string;
  componentName: string;
  amount: number | string;
};

type SalaryPayment = {
  id: string;
  salaryMonth: string;
  payDate: string;
  grossAmount: number | string;
  deductionAmount: number | string;
  netAmount: number | string;
  currencyCode: string;
  status: string;
  incomeSource?: IncomeSource | null;
  components: SalaryComponent[];
};

type ReimbursementClaim = {
  id: string;
  claimNo: string;
  title: string;
  claimDate: string;
  amountClaimed: number | string;
  amountReceived: number | string;
  employerName?: string | null;
  status: string;
  isTaxDeductible: boolean;
  category?: MoneyCategory | null;
};

type LiabilityInstallment = {
  id: string;
  installmentNo: number;
  dueDate: string;
  totalDue: number | string;
  amountPaid: number | string;
  status: string;
};

type LiabilityAccount = {
  id: string;
  accountName: string;
  liabilityType: string;
  lenderName?: string | null;
  outstandingAmount: number | string;
  currencyCode: string;
  emiAmount?: number | string | null;
  dueDay?: number | null;
  status: string;
  isActive: boolean;
  installments: LiabilityInstallment[];
};

type InvestmentAccount = {
  id: string;
  accountName: string;
  accountType: string;
  institutionName?: string | null;
  currentValue: number | string;
  costBasis: number | string;
  currencyCode: string;
  isArchived: boolean;
};

type MonthlyFinancialSnapshot = {
  id: string;
  snapshotMonth: string;
  totalIncome: number | string;
  totalExpense: number | string;
  totalAssets: number | string;
  totalLiabilities: number | string;
  netWorth: number | string;
  healthScore?: number | null;
  status: string;
  currencyCode: string;
};

type AuditLogItem = {
  id: string;
  entityName: string;
  entityId?: string | null;
  action: string;
  description?: string | null;
  createdAt: string;
};

type ImportJob = {
  id: string;
  jobType: string;
  sourceName?: string | null;
  fileName?: string | null;
  status: string;
  totalRows: number;
  successRows: number;
  failedRows: number;
  createdAt: string;
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

function toDateTimeLocalValue(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
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

export default function MoneyPlannerWorkspace() {
  const today = useMemo(() => new Date(), []);
  const monthStart = useMemo(
    () => new Date(today.getFullYear(), today.getMonth(), 1),
    [today]
  );
  const monthEnd = useMemo(
    () => new Date(today.getFullYear(), today.getMonth() + 1, 0),
    [today]
  );

  const [activeTab, setActiveTab] = useState<TabKey>("overview");
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
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [incomeSources, setIncomeSources] = useState<IncomeSource[]>([]);
  const [salaryPayments, setSalaryPayments] = useState<SalaryPayment[]>([]);
  const [reimbursements, setReimbursements] = useState<ReimbursementClaim[]>([]);
  const [liabilities, setLiabilities] = useState<LiabilityAccount[]>([]);
  const [investmentAccounts, setInvestmentAccounts] = useState<InvestmentAccount[]>([]);
  const [monthlySnapshots, setMonthlySnapshots] = useState<MonthlyFinancialSnapshot[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [importJobs, setImportJobs] = useState<ImportJob[]>([]);

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

  const [goalForm, setGoalForm] = useState({
    goalName: "",
    targetAmount: "0",
    currentAmount: "0",
    targetDate: formatDateInput(monthEnd),
  });

  const [incomeSourceForm, setIncomeSourceForm] = useState({
    sourceName: "",
    sourceType: "SALARY",
    employerName: "",
    defaultAmount: "0",
    payDay: "25",
  });

  const [salaryPaymentForm, setSalaryPaymentForm] = useState({
    incomeSourceId: "",
    salaryMonth: formatDateInput(monthStart),
    payDate: formatDateInput(today),
    basicAmount: "0",
    allowanceAmount: "0",
    bonusAmount: "0",
    overtimeAmount: "0",
    deductionAmount: "0",
  });

  const [reimbursementForm, setReimbursementForm] = useState({
    claimNo: `CLM-${Date.now()}`,
    title: "",
    claimDate: formatDateInput(today),
    amountClaimed: "0",
    employerName: "",
    categoryId: "",
  });

  const [liabilityForm, setLiabilityForm] = useState({
    accountName: "",
    liabilityType: "LOAN",
    lenderName: "",
    principalAmount: "0",
    outstandingAmount: "0",
    emiAmount: "0",
    dueDay: "5",
  });

  const [investmentForm, setInvestmentForm] = useState({
    accountName: "",
    accountType: "STOCK",
    institutionName: "",
    costBasis: "0",
    currentValue: "0",
  });

  const [snapshotForm, setSnapshotForm] = useState({
    snapshotMonth: formatDateInput(monthStart),
    totalIncome: "0",
    totalExpense: "0",
    totalAssets: "0",
    totalLiabilities: "0",
    netWorth: "0",
    healthScore: "80",
  });

  const selectedUser = users.find((user) => user.id === selectedUserId) ?? null;
  const activeAccounts = accounts.filter((account) => !account.isArchived);
  const expenseCategories = categories.filter((category) => category.type === "EXPENSE");
  const pendingReminders = reminders.filter((reminder) => !reminder.isPaid).length;
  const professionalCount =
    savingsGoals.length + salaryPayments.length + reimbursements.length + liabilities.length + investmentAccounts.length;

  const tabItems = [
    {
      id: "overview" as const,
      label: "Overview",
      hint: "Snapshot",
      icon: Activity,
      metric: formatMoneyValue(summary?.totalBalance),
    },
    {
      id: "transactions" as const,
      label: "Transactions",
      hint: "Ledger",
      icon: Wallet,
      metric: `${transactions.length}`,
    },
    {
      id: "accounts" as const,
      label: "Accounts",
      hint: "Assets",
      icon: Landmark,
      metric: `${activeAccounts.length}`,
    },
    {
      id: "planning" as const,
      label: "Planning",
      hint: "Budgets",
      icon: PiggyBank,
      metric: `${budgets.length + reminders.length}`,
    },
    {
      id: "professional" as const,
      label: "Pro",
      hint: "Salary & wealth",
      icon: ShieldCheck,
      metric: `${professionalCount}`,
    },
    {
      id: "masters" as const,
      label: "Masters",
      hint: "Setup",
      icon: Users,
      metric: `${users.length + categories.length + merchants.length + tags.length}`,
    },
  ];

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

      const [
        categoriesData,
        merchantsData,
        tagsData,
        accountsData,
        transactionsData,
        budgetsData,
        recurringData,
        remindersData,
        savingsGoalsData,
        incomeSourcesData,
        salaryPaymentsData,
        reimbursementsData,
        liabilitiesData,
        investmentAccountsData,
        snapshotsData,
        auditLogsData,
        importJobsData,
        dashboardData,
      ] = await Promise.all([
        fetchJson<MoneyCategory[]>(`/api/money/categories${query}`),
        fetchJson<Merchant[]>(`/api/money/merchants${query}`),
        fetchJson<TagItem[]>(`/api/money/tags${query}`),
        fetchJson<FinancialAccount[]>(`/api/money/accounts${query}`),
        fetchJson<MoneyTransaction[]>(`/api/money/transactions${rangeQuery}`),
        fetchJson<Budget[]>(`/api/money/budgets${query}`),
        fetchJson<RecurringTemplate[]>(`/api/money/recurring${query}`),
        fetchJson<Reminder[]>(`/api/money/reminders${query}`),
        fetchJson<SavingsGoal[]>(`/api/money/savings-goals${query}`),
        fetchJson<IncomeSource[]>(`/api/money/income-sources${query}`),
        fetchJson<SalaryPayment[]>(`/api/money/salary-payments${query}`),
        fetchJson<ReimbursementClaim[]>(`/api/money/reimbursements${query}`),
        fetchJson<LiabilityAccount[]>(`/api/money/liabilities${query}`),
        fetchJson<InvestmentAccount[]>(`/api/money/investment-accounts${query}`),
        fetchJson<MonthlyFinancialSnapshot[]>(`/api/money/snapshots${query}`),
        fetchJson<AuditLogItem[]>(`/api/money/audit-logs${query}`),
        fetchJson<ImportJob[]>(`/api/money/import-jobs${query}`),
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
      setSavingsGoals(savingsGoalsData);
      setIncomeSources(incomeSourcesData);
      setSalaryPayments(salaryPaymentsData);
      setReimbursements(reimbursementsData);
      setLiabilities(liabilitiesData);
      setInvestmentAccounts(investmentAccountsData);
      setMonthlySnapshots(snapshotsData);
      setAuditLogs(auditLogsData);
      setImportJobs(importJobsData);
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

  async function handleGoalSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedUserId) return;

    try {
      await sendJson("/api/money/savings-goals", "POST", {
        userId: selectedUserId,
        goalName: goalForm.goalName,
        targetAmount: toNumberOrUndefined(goalForm.targetAmount) ?? 0,
        currentAmount: toNumberOrUndefined(goalForm.currentAmount) ?? 0,
        targetDate: goalForm.targetDate || undefined,
      });

      await loadMoneyData(selectedUserId);
      setGoalForm({
        goalName: "",
        targetAmount: "0",
        currentAmount: "0",
        targetDate: formatDateInput(monthEnd),
      });
      setNotice({ type: "success", message: "Savings goal added." });
    } catch (error) {
      setNotice({
        type: "error",
        message: error instanceof Error ? error.message : "Failed to create savings goal.",
      });
    }
  }

  async function handleIncomeSourceSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedUserId) return;

    try {
      await sendJson("/api/money/income-sources", "POST", {
        userId: selectedUserId,
        sourceName: incomeSourceForm.sourceName,
        sourceType: incomeSourceForm.sourceType,
        employerName: incomeSourceForm.employerName || undefined,
        defaultAmount: toNumberOrUndefined(incomeSourceForm.defaultAmount),
        payDay: toNumberOrUndefined(incomeSourceForm.payDay),
      });

      await loadMoneyData(selectedUserId);
      setIncomeSourceForm({
        sourceName: "",
        sourceType: "SALARY",
        employerName: "",
        defaultAmount: "0",
        payDay: "25",
      });
      setNotice({ type: "success", message: "Income source added." });
    } catch (error) {
      setNotice({
        type: "error",
        message: error instanceof Error ? error.message : "Failed to create income source.",
      });
    }
  }

  async function handleSalaryPaymentSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedUserId) return;

    const components = [
      { componentType: "BASIC", componentName: "Basic Salary", amount: toNumberOrUndefined(salaryPaymentForm.basicAmount) ?? 0 },
      { componentType: "ALLOWANCE", componentName: "Allowances", amount: toNumberOrUndefined(salaryPaymentForm.allowanceAmount) ?? 0 },
      { componentType: "BONUS", componentName: "Bonus", amount: toNumberOrUndefined(salaryPaymentForm.bonusAmount) ?? 0 },
      { componentType: "OVERTIME", componentName: "Overtime", amount: toNumberOrUndefined(salaryPaymentForm.overtimeAmount) ?? 0 },
      { componentType: "DEDUCTION", componentName: "Deductions", amount: toNumberOrUndefined(salaryPaymentForm.deductionAmount) ?? 0 },
    ].filter((item) => item.amount > 0);

    try {
      await sendJson("/api/money/salary-payments", "POST", {
        userId: selectedUserId,
        incomeSourceId: salaryPaymentForm.incomeSourceId || undefined,
        salaryMonth: salaryPaymentForm.salaryMonth,
        payDate: salaryPaymentForm.payDate,
        basicAmount: toNumberOrUndefined(salaryPaymentForm.basicAmount) ?? 0,
        components,
      });

      await loadMoneyData(selectedUserId);
      setSalaryPaymentForm({
        incomeSourceId: "",
        salaryMonth: formatDateInput(monthStart),
        payDate: formatDateInput(today),
        basicAmount: "0",
        allowanceAmount: "0",
        bonusAmount: "0",
        overtimeAmount: "0",
        deductionAmount: "0",
      });
      setNotice({ type: "success", message: "Salary payment recorded." });
    } catch (error) {
      setNotice({
        type: "error",
        message: error instanceof Error ? error.message : "Failed to save salary payment.",
      });
    }
  }

  async function handleReimbursementSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedUserId) return;

    try {
      await sendJson("/api/money/reimbursements", "POST", {
        userId: selectedUserId,
        claimNo: reimbursementForm.claimNo,
        title: reimbursementForm.title,
        claimDate: reimbursementForm.claimDate,
        amountClaimed: toNumberOrUndefined(reimbursementForm.amountClaimed) ?? 0,
        employerName: reimbursementForm.employerName || undefined,
        categoryId: reimbursementForm.categoryId || undefined,
        isTaxDeductible: true,
      });

      await loadMoneyData(selectedUserId);
      setReimbursementForm({
        claimNo: `CLM-${Date.now()}`,
        title: "",
        claimDate: formatDateInput(today),
        amountClaimed: "0",
        employerName: "",
        categoryId: "",
      });
      setNotice({ type: "success", message: "Reimbursement claim added." });
    } catch (error) {
      setNotice({
        type: "error",
        message: error instanceof Error ? error.message : "Failed to create reimbursement claim.",
      });
    }
  }

  async function handleLiabilitySubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedUserId) return;

    try {
      await sendJson("/api/money/liabilities", "POST", {
        userId: selectedUserId,
        accountName: liabilityForm.accountName,
        liabilityType: liabilityForm.liabilityType,
        lenderName: liabilityForm.lenderName || undefined,
        principalAmount: toNumberOrUndefined(liabilityForm.principalAmount) ?? 0,
        outstandingAmount: toNumberOrUndefined(liabilityForm.outstandingAmount) ?? 0,
        emiAmount: toNumberOrUndefined(liabilityForm.emiAmount),
        dueDay: toNumberOrUndefined(liabilityForm.dueDay),
      });

      await loadMoneyData(selectedUserId);
      setLiabilityForm({
        accountName: "",
        liabilityType: "LOAN",
        lenderName: "",
        principalAmount: "0",
        outstandingAmount: "0",
        emiAmount: "0",
        dueDay: "5",
      });
      setNotice({ type: "success", message: "Liability account added." });
    } catch (error) {
      setNotice({
        type: "error",
        message: error instanceof Error ? error.message : "Failed to create liability account.",
      });
    }
  }

  async function handleInvestmentSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedUserId) return;

    try {
      await sendJson("/api/money/investment-accounts", "POST", {
        userId: selectedUserId,
        accountName: investmentForm.accountName,
        accountType: investmentForm.accountType,
        institutionName: investmentForm.institutionName || undefined,
        costBasis: toNumberOrUndefined(investmentForm.costBasis) ?? 0,
        currentValue: toNumberOrUndefined(investmentForm.currentValue) ?? 0,
      });

      await loadMoneyData(selectedUserId);
      setInvestmentForm({
        accountName: "",
        accountType: "STOCK",
        institutionName: "",
        costBasis: "0",
        currentValue: "0",
      });
      setNotice({ type: "success", message: "Investment account added." });
    } catch (error) {
      setNotice({
        type: "error",
        message: error instanceof Error ? error.message : "Failed to create investment account.",
      });
    }
  }

  async function handleSnapshotSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedUserId) return;

    try {
      await sendJson("/api/money/snapshots", "POST", {
        userId: selectedUserId,
        snapshotMonth: snapshotForm.snapshotMonth,
        totalIncome: toNumberOrUndefined(snapshotForm.totalIncome) ?? 0,
        totalExpense: toNumberOrUndefined(snapshotForm.totalExpense) ?? 0,
        totalAssets: toNumberOrUndefined(snapshotForm.totalAssets) ?? 0,
        totalLiabilities: toNumberOrUndefined(snapshotForm.totalLiabilities) ?? 0,
        netWorth:
          toNumberOrUndefined(snapshotForm.netWorth) ??
          (toNumberOrUndefined(snapshotForm.totalAssets) ?? 0) -
            (toNumberOrUndefined(snapshotForm.totalLiabilities) ?? 0),
        healthScore: toNumberOrUndefined(snapshotForm.healthScore),
      });

      await loadMoneyData(selectedUserId);
      setNotice({ type: "success", message: "Monthly snapshot saved." });
    } catch (error) {
      setNotice({
        type: "error",
        message: error instanceof Error ? error.message : "Failed to save monthly snapshot.",
      });
    }
  }

  return (
    <div className="page-shell space-y-6">
      <section className="hero-card hero-card--emerald overflow-hidden">
        <div className="page-header">
          <div>
            <span className="soft-badge soft-badge--light mb-3 inline-flex">
              <Wallet size={14} /> Professional finance workspace
            </span>
            <h1 className="page-title">Money Planner</h1>
            <p className="page-subtitle mt-2 max-w-3xl">
              A cleaner, tab-based workspace for money operations with masters, accounts, transactions,
              planning, and portfolio overview in one place.
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
              Refresh workspace
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
          <div className="stat-card bg-white/15 text-white">
            <p className="text-xs uppercase tracking-wide text-white/75">Portfolio balance</p>
            <p className="mt-1 text-xl font-bold">{formatMoneyValue(summary?.totalBalance)}</p>
          </div>
          <div className="stat-card bg-white/15 text-white">
            <p className="text-xs uppercase tracking-wide text-white/75">Income</p>
            <p className="mt-1 text-xl font-bold">{formatMoneyValue(summary?.totalIncome)}</p>
          </div>
          <div className="stat-card bg-white/15 text-white">
            <p className="text-xs uppercase tracking-wide text-white/75">Expense</p>
            <p className="mt-1 text-xl font-bold">{formatMoneyValue(summary?.totalExpense)}</p>
          </div>
          <div className="stat-card bg-white/15 text-white">
            <p className="text-xs uppercase tracking-wide text-white/75">Transactions</p>
            <p className="mt-1 text-xl font-bold">{summary?.transactionCount ?? 0}</p>
          </div>
          <div className="stat-card bg-white/15 text-white">
            <p className="text-xs uppercase tracking-wide text-white/75">Pending reminders</p>
            <p className="mt-1 text-xl font-bold">{pendingReminders}</p>
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
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
            <div className="flex items-center gap-2 text-slate-900">
              <Users size={17} className="text-blue-600" />
              <h2 className="text-base font-semibold">Active workspace</h2>
            </div>

            <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Money user</label>
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

              <div className="rounded-xl bg-white px-3 py-2 text-sm text-slate-600">
                <p className="font-semibold text-slate-900">
                  {selectedUser?.fullName ?? "No active user selected"}
                </p>
                <p>{selectedUser?.profile?.occupation ?? "Create a profile to activate all modules"}</p>
                <p className="text-xs text-slate-500">
                  {selectedUser?.profile?.employerName ?? "Professional personal finance workspace"}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
            <div className="flex items-center gap-2 text-slate-900">
              <ShieldCheck size={17} className="text-emerald-600" />
              <h2 className="text-base font-semibold">Range & health</h2>
            </div>

            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <input
                type="date"
                value={dateRange.fromDate}
                onChange={(event) =>
                  setDateRange((current) => ({ ...current, fromDate: event.target.value }))
                }
                className="px-3 py-2"
              />
              <input
                type="date"
                value={dateRange.toDate}
                onChange={(event) =>
                  setDateRange((current) => ({ ...current, toDate: event.target.value }))
                }
                className="px-3 py-2"
              />
            </div>

            <div className="mt-3 rounded-xl bg-white px-3 py-2 text-sm text-slate-600">
              <p className="font-semibold text-slate-900">
                {health?.database === "connected" ? "Database connected" : "Checking connection..."}
              </p>
              <p>{health?.service ?? "money-api"}</p>
              <p className="text-xs text-slate-500">Checked {health?.checkedAt ? formatDateLabel(health.checkedAt) : "—"}</p>
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-2xl bg-slate-100/90 p-2">
          <div className="grid grid-cols-2 gap-2 xl:grid-cols-6">
            {tabItems.map(({ id, label, hint, icon: Icon, metric }) => {
              const isActive = activeTab === id;

              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setActiveTab(id)}
                  className={`rounded-2xl border px-3 py-3 text-left transition-all ${
                    isActive
                      ? "border-blue-500 bg-white text-slate-900 shadow-lg"
                      : "border-transparent bg-transparent text-slate-600 hover:bg-white/80"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <Icon size={18} className={isActive ? "text-blue-600" : "text-slate-500"} />
                    <span className="text-xs font-semibold text-slate-500">{metric}</span>
                  </div>
                  <p className="mt-3 text-sm font-semibold">{label}</p>
                  <p className="text-xs text-slate-500">{hint}</p>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {activeTab === "overview" ? (
        <div className="space-y-5">
          <section className="grid grid-cols-1 gap-5 xl:grid-cols-[1.2fr_0.8fr]">
            <div className="section-card">
              <div className="mb-4 flex items-center gap-2 text-slate-900">
                <Activity size={18} className="text-emerald-600" />
                <h2 className="text-lg font-semibold">Portfolio snapshot</h2>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                <div className="stat-card tinted-card-emerald">
                  <p className="text-xs uppercase tracking-wide text-slate-500">Cash flow</p>
                  <p className="mt-1 text-2xl font-bold text-slate-900">
                    {formatMoneyValue(summary?.netCashFlow)}
                  </p>
                  <p className="text-xs text-slate-500">Net movement for the selected period</p>
                </div>
                <div className="stat-card tinted-card-blue">
                  <p className="text-xs uppercase tracking-wide text-slate-500">Categories</p>
                  <p className="mt-1 text-2xl font-bold text-slate-900">{summary?.categoryCount ?? 0}</p>
                  <p className="text-xs text-slate-500">Active income and expense buckets</p>
                </div>
                <div className="stat-card tinted-card-violet">
                  <p className="text-xs uppercase tracking-wide text-slate-500">Master data</p>
                  <p className="mt-1 text-2xl font-bold text-slate-900">
                    {users.length + categories.length + merchants.length + tags.length}
                  </p>
                  <p className="text-xs text-slate-500">Users, categories, merchants and tags</p>
                </div>
                <div className="stat-card tinted-card-amber">
                  <p className="text-xs uppercase tracking-wide text-slate-500">Planning items</p>
                  <p className="mt-1 text-2xl font-bold text-slate-900">
                    {budgets.length + recurringTemplates.length + reminders.length}
                  </p>
                  <p className="text-xs text-slate-500">Budgets, recurring schedules and reminders</p>
                </div>
                <div className="stat-card tinted-card-blue">
                  <p className="text-xs uppercase tracking-wide text-slate-500">Investment value</p>
                  <p className="mt-1 text-2xl font-bold text-slate-900">
                    {formatMoneyValue(summary?.investmentValue)}
                  </p>
                  <p className="text-xs text-slate-500">Tracked growth and wealth holdings</p>
                </div>
                <div className="stat-card tinted-card-rose">
                  <p className="text-xs uppercase tracking-wide text-slate-500">Liabilities</p>
                  <p className="mt-1 text-2xl font-bold text-slate-900">
                    {formatMoneyValue(summary?.totalLiabilities)}
                  </p>
                  <p className="text-xs text-slate-500">
                    Pending reimbursement {formatMoneyValue(summary?.pendingReimbursement)}
                  </p>
                </div>
              </div>
            </div>

            <div className="section-card">
              <div className="mb-4 flex items-center gap-2 text-slate-900">
                <BellRing size={18} className="text-rose-600" />
                <h2 className="text-lg font-semibold">Upcoming reminders</h2>
              </div>

              <div className="space-y-2">
                {reminders.slice(0, 5).map((reminder) => (
                  <div key={reminder.id} className="rounded-xl bg-slate-50 px-3 py-2">
                    <p className="font-medium text-slate-900">{reminder.reminderTitle}</p>
                    <p className="text-xs text-slate-500">
                      Due {formatDateLabel(reminder.dueDate)} · {formatMoneyValue(reminder.amountExpected)} · {reminder.status}
                    </p>
                  </div>
                ))}

                {reminders.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-300 px-3 py-4 text-sm text-slate-500">
                    No reminders available yet.
                  </div>
                ) : null}
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 gap-5 xl:grid-cols-2">
            <div className="section-card">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Recent transactions</h2>
                  <p className="text-sm text-slate-500">Latest movement in the selected period</p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab("transactions")}
                  className="rounded-xl bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700"
                >
                  Open transactions
                </button>
              </div>

              <div className="space-y-2">
                {transactions.slice(0, 6).map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
                    <div>
                      <p className="font-medium text-slate-900">{transaction.transactionNo}</p>
                      <p className="text-xs text-slate-500">
                        {transaction.category?.name || transaction.kind} · {formatDateLabel(transaction.transactionDate)}
                      </p>
                    </div>
                    <p className="font-semibold text-slate-900">
                      {formatMoneyValue(transaction.amount, transaction.currencyCode)}
                    </p>
                  </div>
                ))}

                {transactions.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-300 px-3 py-4 text-sm text-slate-500">
                    No transactions in the current range.
                  </div>
                ) : null}
              </div>
            </div>

            <div className="section-card">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Account balance board</h2>
                  <p className="text-sm text-slate-500">Quick view of available wallets and bank balances</p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab("accounts")}
                  className="rounded-xl bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700"
                >
                  Open accounts
                </button>
              </div>

              <div className="space-y-2">
                {activeAccounts.slice(0, 6).map((account) => (
                  <div key={account.id} className="rounded-xl bg-slate-50 px-3 py-2">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p className="font-medium text-slate-900">{account.name}</p>
                        <p className="text-xs text-slate-500">{account.type}</p>
                      </div>
                      <p className="font-semibold text-slate-900">
                        {formatMoneyValue(account.currentBalance, account.currencyCode)}
                      </p>
                    </div>
                  </div>
                ))}

                {activeAccounts.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-300 px-3 py-4 text-sm text-slate-500">
                    No active accounts yet.
                  </div>
                ) : null}
              </div>
            </div>
          </section>
        </div>
      ) : null}

      {activeTab === "masters" ? (
        <div className="space-y-5">
          <section id="users" className="section-card">
            <div className="page-header">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Master setup · users & profile</h2>
                <p className="text-sm text-slate-500">Use this section to onboard finance users and define their working profile.</p>
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
                  <PlusCircle size={16} /> Add user profile
                </button>
              </form>

              <div className="space-y-3">
                {users.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-300 px-4 py-5 text-sm text-slate-500">
                    No users yet. Add one to start configuring the finance app.
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

              <form onSubmit={handleCategorySubmit} className="space-y-3">
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
                    <PlusCircle size={16} /> Save category
                  </button>
                </fieldset>
              </form>

              <div className="mt-4 space-y-2">
                {categories.slice(0, 8).map((category) => (
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
                    onChange={(event) => setMerchantForm((current) => ({ ...current, merchantType: event.target.value }))}
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
                    <PlusCircle size={16} /> Save merchant
                  </button>
                </fieldset>
              </form>

              <div className="mt-4 space-y-2">
                {merchants.slice(0, 8).map((merchant) => (
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
                    <PlusCircle size={16} /> Save tag
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
        </div>
      ) : null}

      {activeTab === "accounts" ? (
        <section id="accounts" className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_1.1fr]">
          <div className="section-card">
            <div className="mb-3 flex items-center gap-2 text-slate-900">
              <Landmark size={17} className="text-blue-600" />
              <h2 className="text-lg font-semibold">Account register</h2>
            </div>
            <p className="mb-4 text-sm text-slate-500">Track bank, cash, wallet, savings, and credit accounts in a structured ledger.</p>

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
                  onChange={(event) => setAccountForm((current) => ({ ...current, institutionName: event.target.value }))}
                  className="px-3 py-2"
                />
                <input
                  placeholder="Masked account no"
                  value={accountForm.accountNumberMasked}
                  onChange={(event) => setAccountForm((current) => ({ ...current, accountNumberMasked: event.target.value }))}
                  className="px-3 py-2"
                />
                <input
                  type="number"
                  placeholder="Opening balance"
                  value={accountForm.openingBalance}
                  onChange={(event) => setAccountForm((current) => ({ ...current, openingBalance: event.target.value }))}
                  className="px-3 py-2"
                />
                <input
                  type="number"
                  placeholder="Current balance"
                  value={accountForm.currentBalance}
                  onChange={(event) => setAccountForm((current) => ({ ...current, currentBalance: event.target.value }))}
                  className="px-3 py-2"
                />
                <input
                  type="date"
                  value={accountForm.openedDate}
                  onChange={(event) => setAccountForm((current) => ({ ...current, openedDate: event.target.value }))}
                  className="px-3 py-2 md:col-span-2"
                />
                <button type="submit" className="primary-btn rounded-xl px-4 py-2 md:col-span-2">
                  <PlusCircle size={16} /> Save account
                </button>
              </fieldset>
            </form>
          </div>

          <div className="section-card">
            <div className="mb-3 flex items-center gap-2 text-slate-900">
              <Activity size={17} className="text-emerald-600" />
              <h2 className="text-lg font-semibold">Balance board</h2>
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
      ) : null}

      {activeTab === "transactions" ? (
        <section id="transactions" className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_1.2fr]">
          <div className="section-card">
            <div className="mb-3 flex items-center gap-2 text-slate-900">
              <Wallet size={17} className="text-violet-600" />
              <h2 className="text-lg font-semibold">Transaction composer</h2>
            </div>
            <p className="mb-4 text-sm text-slate-500">Record income, expenses, and transfers with linked accounts, categories, merchants, and tags.</p>

            <form onSubmit={handleTransactionSubmit} className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <fieldset disabled={!selectedUserId} className="contents disabled:opacity-60">
                <input
                  placeholder="Transaction no"
                  value={transactionForm.transactionNo}
                  onChange={(event) => setTransactionForm((current) => ({ ...current, transactionNo: event.target.value }))}
                  className="px-3 py-2"
                  required
                />
                <input
                  type="datetime-local"
                  value={toDateTimeLocalValue(transactionForm.transactionDate)}
                  onChange={(event) =>
                    setTransactionForm((current) => ({
                      ...current,
                      transactionDate: new Date(event.target.value).toISOString(),
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
                  onChange={(event) => setTransactionForm((current) => ({ ...current, fromAccountId: event.target.value }))}
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
                  onChange={(event) => setTransactionForm((current) => ({ ...current, toAccountId: event.target.value }))}
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
                  onChange={(event) => setTransactionForm((current) => ({ ...current, categoryId: event.target.value }))}
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
                  onChange={(event) => setTransactionForm((current) => ({ ...current, merchantId: event.target.value }))}
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
                  onChange={(event) => setTransactionForm((current) => ({ ...current, paymentMethod: event.target.value }))}
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
                  <PlusCircle size={16} /> Post transaction
                </button>
              </fieldset>
            </form>
          </div>

          <div className="section-card">
            <div className="mb-3 flex items-center gap-2 text-slate-900">
              <Activity size={17} className="text-amber-600" />
              <h2 className="text-lg font-semibold">Recent ledger entries</h2>
            </div>

            <div className="space-y-3">
              {transactions.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 px-4 py-5 text-sm text-slate-500">
                  No transactions in the selected range.
                </div>
              ) : (
                transactions.slice(0, 10).map((transaction) => (
                  <div key={transaction.id} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-900">{transaction.transactionNo}</p>
                        <p className="text-xs text-slate-500">
                          {transaction.kind} · {formatDateLabel(transaction.transactionDate)} · {transaction.status}
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
      ) : null}

      {activeTab === "planning" ? (
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
                  <PlusCircle size={16} /> Save budget
                </button>
              </fieldset>
            </form>

            <div className="mt-4 space-y-2">
              {budgets.slice(0, 5).map((budget) => (
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
                  onChange={(event) => setRecurringForm((current) => ({ ...current, templateName: event.target.value }))}
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
                    onChange={(event) => setRecurringForm((current) => ({ ...current, frequencyType: event.target.value }))}
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
                    onChange={(event) => setRecurringForm((current) => ({ ...current, frequencyInterval: event.target.value }))}
                    className="px-3 py-2"
                  />
                </div>
                <input
                  type="date"
                  value={recurringForm.nextRunDate}
                  onChange={(event) => setRecurringForm((current) => ({ ...current, nextRunDate: event.target.value }))}
                  className="w-full px-3 py-2"
                />
                <select
                  value={recurringForm.categoryId}
                  onChange={(event) => setRecurringForm((current) => ({ ...current, categoryId: event.target.value }))}
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
                  <PlusCircle size={16} /> Save recurring item
                </button>
              </fieldset>
            </form>

            <div className="mt-4 space-y-2">
              {recurringTemplates.slice(0, 5).map((template) => (
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
                  onChange={(event) => setReminderForm((current) => ({ ...current, reminderTitle: event.target.value }))}
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
                    onChange={(event) => setReminderForm((current) => ({ ...current, amountExpected: event.target.value }))}
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
                  <PlusCircle size={16} /> Save reminder
                </button>
              </fieldset>
            </form>

            <div className="mt-4 space-y-2">
              {reminders.slice(0, 6).map((reminder) => (
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
      ) : null}

      {activeTab === "professional" ? (
        <div className="space-y-5">
          <section className="grid grid-cols-1 gap-5 xl:grid-cols-2">
            <div className="section-card">
              <div className="mb-3 flex items-center gap-2 text-slate-900">
                <PiggyBank size={17} className="text-emerald-600" />
                <h2 className="text-lg font-semibold">Savings goals</h2>
              </div>
              <form onSubmit={handleGoalSubmit} className="space-y-3">
                <fieldset disabled={!selectedUserId} className="space-y-3 disabled:opacity-60">
                  <input placeholder="Goal name" value={goalForm.goalName} onChange={(event) => setGoalForm((current) => ({ ...current, goalName: event.target.value }))} className="w-full px-3 py-2" required />
                  <div className="grid grid-cols-2 gap-3">
                    <input type="number" placeholder="Target amount" value={goalForm.targetAmount} onChange={(event) => setGoalForm((current) => ({ ...current, targetAmount: event.target.value }))} className="px-3 py-2" />
                    <input type="number" placeholder="Current amount" value={goalForm.currentAmount} onChange={(event) => setGoalForm((current) => ({ ...current, currentAmount: event.target.value }))} className="px-3 py-2" />
                  </div>
                  <input type="date" value={goalForm.targetDate} onChange={(event) => setGoalForm((current) => ({ ...current, targetDate: event.target.value }))} className="w-full px-3 py-2" />
                  <button type="submit" className="primary-btn w-full rounded-xl px-4 py-2"><PlusCircle size={16} /> Save goal</button>
                </fieldset>
              </form>
              <div className="mt-4 space-y-2">
                {savingsGoals.slice(0, 5).map((goal) => (
                  <div key={goal.id} className="rounded-xl bg-slate-50 px-3 py-2">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium text-slate-800">{goal.goalName}</p>
                      <button type="button" onClick={() => void handleDelete("savings-goals", goal.id, goal.goalName)} className="rounded-lg bg-rose-100 px-2 py-1 text-rose-700"><Trash2 size={14} /></button>
                    </div>
                    <p className="text-xs text-slate-500">{formatMoneyValue(goal.currentAmount, goal.currencyCode)} of {formatMoneyValue(goal.targetAmount, goal.currencyCode)} · {goal.status}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="section-card">
              <div className="mb-3 flex items-center gap-2 text-slate-900">
                <Users size={17} className="text-blue-600" />
                <h2 className="text-lg font-semibold">Income sources</h2>
              </div>
              <form onSubmit={handleIncomeSourceSubmit} className="space-y-3">
                <fieldset disabled={!selectedUserId} className="space-y-3 disabled:opacity-60">
                  <input placeholder="Source name" value={incomeSourceForm.sourceName} onChange={(event) => setIncomeSourceForm((current) => ({ ...current, sourceName: event.target.value }))} className="w-full px-3 py-2" required />
                  <div className="grid grid-cols-2 gap-3">
                    <input placeholder="Type" value={incomeSourceForm.sourceType} onChange={(event) => setIncomeSourceForm((current) => ({ ...current, sourceType: event.target.value }))} className="px-3 py-2" />
                    <input placeholder="Employer" value={incomeSourceForm.employerName} onChange={(event) => setIncomeSourceForm((current) => ({ ...current, employerName: event.target.value }))} className="px-3 py-2" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <input type="number" placeholder="Default amount" value={incomeSourceForm.defaultAmount} onChange={(event) => setIncomeSourceForm((current) => ({ ...current, defaultAmount: event.target.value }))} className="px-3 py-2" />
                    <input type="number" placeholder="Pay day" value={incomeSourceForm.payDay} onChange={(event) => setIncomeSourceForm((current) => ({ ...current, payDay: event.target.value }))} className="px-3 py-2" />
                  </div>
                  <button type="submit" className="primary-btn w-full rounded-xl px-4 py-2"><PlusCircle size={16} /> Save income source</button>
                </fieldset>
              </form>
              <div className="mt-4 space-y-2">
                {incomeSources.slice(0, 5).map((source) => (
                  <div key={source.id} className="rounded-xl bg-slate-50 px-3 py-2">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium text-slate-800">{source.sourceName}</p>
                      <button type="button" onClick={() => void handleDelete("income-sources", source.id, source.sourceName)} className="rounded-lg bg-rose-100 px-2 py-1 text-rose-700"><Trash2 size={14} /></button>
                    </div>
                    <p className="text-xs text-slate-500">{source.sourceType || "General"} · payday {source.payDay ?? "—"} · {formatMoneyValue(source.defaultAmount)}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 gap-5 xl:grid-cols-2">
            <div className="section-card">
              <div className="mb-3 flex items-center gap-2 text-slate-900">
                <Wallet size={17} className="text-violet-600" />
                <h2 className="text-lg font-semibold">Salary breakdown</h2>
              </div>
              <form onSubmit={handleSalaryPaymentSubmit} className="space-y-3">
                <fieldset disabled={!selectedUserId} className="space-y-3 disabled:opacity-60">
                  <div className="grid grid-cols-2 gap-3">
                    <select value={salaryPaymentForm.incomeSourceId} onChange={(event) => setSalaryPaymentForm((current) => ({ ...current, incomeSourceId: event.target.value }))} className="px-3 py-2">
                      <option value="">Income source</option>
                      {incomeSources.map((source) => <option key={source.id} value={source.id}>{source.sourceName}</option>)}
                    </select>
                    <input type="date" value={salaryPaymentForm.payDate} onChange={(event) => setSalaryPaymentForm((current) => ({ ...current, payDate: event.target.value }))} className="px-3 py-2" />
                  </div>
                  <input type="date" value={salaryPaymentForm.salaryMonth} onChange={(event) => setSalaryPaymentForm((current) => ({ ...current, salaryMonth: event.target.value }))} className="w-full px-3 py-2" />
                  <div className="grid grid-cols-2 gap-3">
                    <input type="number" placeholder="Basic" value={salaryPaymentForm.basicAmount} onChange={(event) => setSalaryPaymentForm((current) => ({ ...current, basicAmount: event.target.value }))} className="px-3 py-2" />
                    <input type="number" placeholder="Allowance" value={salaryPaymentForm.allowanceAmount} onChange={(event) => setSalaryPaymentForm((current) => ({ ...current, allowanceAmount: event.target.value }))} className="px-3 py-2" />
                    <input type="number" placeholder="Bonus" value={salaryPaymentForm.bonusAmount} onChange={(event) => setSalaryPaymentForm((current) => ({ ...current, bonusAmount: event.target.value }))} className="px-3 py-2" />
                    <input type="number" placeholder="Overtime" value={salaryPaymentForm.overtimeAmount} onChange={(event) => setSalaryPaymentForm((current) => ({ ...current, overtimeAmount: event.target.value }))} className="px-3 py-2" />
                  </div>
                  <input type="number" placeholder="Deduction" value={salaryPaymentForm.deductionAmount} onChange={(event) => setSalaryPaymentForm((current) => ({ ...current, deductionAmount: event.target.value }))} className="w-full px-3 py-2" />
                  <button type="submit" className="primary-btn w-full rounded-xl px-4 py-2"><PlusCircle size={16} /> Save salary payment</button>
                </fieldset>
              </form>
              <div className="mt-4 space-y-2">
                {salaryPayments.slice(0, 5).map((payment) => (
                  <div key={payment.id} className="rounded-xl bg-slate-50 px-3 py-2">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium text-slate-800">{payment.incomeSource?.sourceName || "Salary payment"}</p>
                      <button type="button" onClick={() => void handleDelete("salary-payments", payment.id, "salary payment")} className="rounded-lg bg-rose-100 px-2 py-1 text-rose-700"><Trash2 size={14} /></button>
                    </div>
                    <p className="text-xs text-slate-500">Net {formatMoneyValue(payment.netAmount, payment.currencyCode)} · {formatDateLabel(payment.payDate)} · {payment.status}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="section-card">
              <div className="mb-3 flex items-center gap-2 text-slate-900">
                <BellRing size={17} className="text-amber-600" />
                <h2 className="text-lg font-semibold">Reimbursements</h2>
              </div>
              <form onSubmit={handleReimbursementSubmit} className="space-y-3">
                <fieldset disabled={!selectedUserId} className="space-y-3 disabled:opacity-60">
                  <input placeholder="Claim title" value={reimbursementForm.title} onChange={(event) => setReimbursementForm((current) => ({ ...current, title: event.target.value }))} className="w-full px-3 py-2" required />
                  <div className="grid grid-cols-2 gap-3">
                    <input placeholder="Claim no" value={reimbursementForm.claimNo} onChange={(event) => setReimbursementForm((current) => ({ ...current, claimNo: event.target.value }))} className="px-3 py-2" required />
                    <input type="date" value={reimbursementForm.claimDate} onChange={(event) => setReimbursementForm((current) => ({ ...current, claimDate: event.target.value }))} className="px-3 py-2" />
                  </div>
                  <input type="number" placeholder="Amount claimed" value={reimbursementForm.amountClaimed} onChange={(event) => setReimbursementForm((current) => ({ ...current, amountClaimed: event.target.value }))} className="w-full px-3 py-2" />
                  <input placeholder="Employer" value={reimbursementForm.employerName} onChange={(event) => setReimbursementForm((current) => ({ ...current, employerName: event.target.value }))} className="w-full px-3 py-2" />
                  <select value={reimbursementForm.categoryId} onChange={(event) => setReimbursementForm((current) => ({ ...current, categoryId: event.target.value }))} className="w-full px-3 py-2">
                    <option value="">Category</option>
                    {expenseCategories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                  </select>
                  <button type="submit" className="primary-btn w-full rounded-xl px-4 py-2"><PlusCircle size={16} /> Save reimbursement</button>
                </fieldset>
              </form>
              <div className="mt-4 space-y-2">
                {reimbursements.slice(0, 5).map((claim) => (
                  <div key={claim.id} className="rounded-xl bg-slate-50 px-3 py-2">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium text-slate-800">{claim.title}</p>
                      <button type="button" onClick={() => void handleDelete("reimbursements", claim.id, claim.title)} className="rounded-lg bg-rose-100 px-2 py-1 text-rose-700"><Trash2 size={14} /></button>
                    </div>
                    <p className="text-xs text-slate-500">{claim.claimNo} · {formatMoneyValue(claim.amountClaimed)} · {claim.status}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 gap-5 xl:grid-cols-2">
            <div className="section-card">
              <div className="mb-3 flex items-center gap-2 text-slate-900">
                <Landmark size={17} className="text-rose-600" />
                <h2 className="text-lg font-semibold">Liabilities & EMI</h2>
              </div>
              <form onSubmit={handleLiabilitySubmit} className="space-y-3">
                <fieldset disabled={!selectedUserId} className="space-y-3 disabled:opacity-60">
                  <input placeholder="Liability name" value={liabilityForm.accountName} onChange={(event) => setLiabilityForm((current) => ({ ...current, accountName: event.target.value }))} className="w-full px-3 py-2" required />
                  <div className="grid grid-cols-2 gap-3">
                    <select value={liabilityForm.liabilityType} onChange={(event) => setLiabilityForm((current) => ({ ...current, liabilityType: event.target.value }))} className="px-3 py-2">
                      <option value="LOAN">Loan</option>
                      <option value="EMI">EMI</option>
                      <option value="CREDIT_CARD">Credit Card</option>
                      <option value="MORTGAGE">Mortgage</option>
                    </select>
                    <input placeholder="Lender" value={liabilityForm.lenderName} onChange={(event) => setLiabilityForm((current) => ({ ...current, lenderName: event.target.value }))} className="px-3 py-2" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <input type="number" placeholder="Principal" value={liabilityForm.principalAmount} onChange={(event) => setLiabilityForm((current) => ({ ...current, principalAmount: event.target.value }))} className="px-3 py-2" />
                    <input type="number" placeholder="Outstanding" value={liabilityForm.outstandingAmount} onChange={(event) => setLiabilityForm((current) => ({ ...current, outstandingAmount: event.target.value }))} className="px-3 py-2" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <input type="number" placeholder="EMI amount" value={liabilityForm.emiAmount} onChange={(event) => setLiabilityForm((current) => ({ ...current, emiAmount: event.target.value }))} className="px-3 py-2" />
                    <input type="number" placeholder="Due day" value={liabilityForm.dueDay} onChange={(event) => setLiabilityForm((current) => ({ ...current, dueDay: event.target.value }))} className="px-3 py-2" />
                  </div>
                  <button type="submit" className="primary-btn w-full rounded-xl px-4 py-2"><PlusCircle size={16} /> Save liability</button>
                </fieldset>
              </form>
              <div className="mt-4 space-y-2">
                {liabilities.slice(0, 5).map((liability) => (
                  <div key={liability.id} className="rounded-xl bg-slate-50 px-3 py-2">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium text-slate-800">{liability.accountName}</p>
                      <button type="button" onClick={() => void handleDelete("liabilities", liability.id, liability.accountName)} className="rounded-lg bg-rose-100 px-2 py-1 text-rose-700"><Trash2 size={14} /></button>
                    </div>
                    <p className="text-xs text-slate-500">{liability.liabilityType} · {formatMoneyValue(liability.outstandingAmount, liability.currencyCode)} · due day {liability.dueDay ?? "—"}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="section-card">
              <div className="mb-3 flex items-center gap-2 text-slate-900">
                <Activity size={17} className="text-cyan-600" />
                <h2 className="text-lg font-semibold">Investments & wealth</h2>
              </div>
              <form onSubmit={handleInvestmentSubmit} className="space-y-3">
                <fieldset disabled={!selectedUserId} className="space-y-3 disabled:opacity-60">
                  <input placeholder="Investment name" value={investmentForm.accountName} onChange={(event) => setInvestmentForm((current) => ({ ...current, accountName: event.target.value }))} className="w-full px-3 py-2" required />
                  <div className="grid grid-cols-2 gap-3">
                    <select value={investmentForm.accountType} onChange={(event) => setInvestmentForm((current) => ({ ...current, accountType: event.target.value }))} className="px-3 py-2">
                      <option value="STOCK">Stock</option>
                      <option value="MUTUAL_FUND">Mutual Fund</option>
                      <option value="ETF">ETF</option>
                      <option value="RETIREMENT">Retirement</option>
                      <option value="FIXED_DEPOSIT">Fixed Deposit</option>
                    </select>
                    <input placeholder="Institution" value={investmentForm.institutionName} onChange={(event) => setInvestmentForm((current) => ({ ...current, institutionName: event.target.value }))} className="px-3 py-2" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <input type="number" placeholder="Cost basis" value={investmentForm.costBasis} onChange={(event) => setInvestmentForm((current) => ({ ...current, costBasis: event.target.value }))} className="px-3 py-2" />
                    <input type="number" placeholder="Current value" value={investmentForm.currentValue} onChange={(event) => setInvestmentForm((current) => ({ ...current, currentValue: event.target.value }))} className="px-3 py-2" />
                  </div>
                  <button type="submit" className="primary-btn w-full rounded-xl px-4 py-2"><PlusCircle size={16} /> Save investment</button>
                </fieldset>
              </form>
              <div className="mt-4 space-y-2">
                {investmentAccounts.slice(0, 5).map((account) => (
                  <div key={account.id} className="rounded-xl bg-slate-50 px-3 py-2">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium text-slate-800">{account.accountName}</p>
                      <button type="button" onClick={() => void handleDelete("investment-accounts", account.id, account.accountName)} className="rounded-lg bg-rose-100 px-2 py-1 text-rose-700"><Trash2 size={14} /></button>
                    </div>
                    <p className="text-xs text-slate-500">{account.accountType} · {formatMoneyValue(account.currentValue, account.currencyCode)}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 gap-5 xl:grid-cols-2">
            <div className="section-card">
              <div className="mb-3 flex items-center gap-2 text-slate-900">
                <ShieldCheck size={17} className="text-emerald-600" />
                <h2 className="text-lg font-semibold">Monthly snapshot</h2>
              </div>
              <form onSubmit={handleSnapshotSubmit} className="space-y-3">
                <fieldset disabled={!selectedUserId} className="space-y-3 disabled:opacity-60">
                  <input type="date" value={snapshotForm.snapshotMonth} onChange={(event) => setSnapshotForm((current) => ({ ...current, snapshotMonth: event.target.value }))} className="w-full px-3 py-2" />
                  <div className="grid grid-cols-2 gap-3">
                    <input type="number" placeholder="Total income" value={snapshotForm.totalIncome} onChange={(event) => setSnapshotForm((current) => ({ ...current, totalIncome: event.target.value }))} className="px-3 py-2" />
                    <input type="number" placeholder="Total expense" value={snapshotForm.totalExpense} onChange={(event) => setSnapshotForm((current) => ({ ...current, totalExpense: event.target.value }))} className="px-3 py-2" />
                    <input type="number" placeholder="Assets" value={snapshotForm.totalAssets} onChange={(event) => setSnapshotForm((current) => ({ ...current, totalAssets: event.target.value }))} className="px-3 py-2" />
                    <input type="number" placeholder="Liabilities" value={snapshotForm.totalLiabilities} onChange={(event) => setSnapshotForm((current) => ({ ...current, totalLiabilities: event.target.value }))} className="px-3 py-2" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <input type="number" placeholder="Net worth" value={snapshotForm.netWorth} onChange={(event) => setSnapshotForm((current) => ({ ...current, netWorth: event.target.value }))} className="px-3 py-2" />
                    <input type="number" placeholder="Health score" value={snapshotForm.healthScore} onChange={(event) => setSnapshotForm((current) => ({ ...current, healthScore: event.target.value }))} className="px-3 py-2" />
                  </div>
                  <button type="submit" className="primary-btn w-full rounded-xl px-4 py-2"><PlusCircle size={16} /> Save snapshot</button>
                </fieldset>
              </form>
              <div className="mt-4 space-y-2">
                {monthlySnapshots.slice(0, 4).map((snapshot) => (
                  <div key={snapshot.id} className="rounded-xl bg-slate-50 px-3 py-2">
                    <p className="font-medium text-slate-800">{formatDateLabel(snapshot.snapshotMonth)} · {snapshot.status}</p>
                    <p className="text-xs text-slate-500">Net worth {formatMoneyValue(snapshot.netWorth, snapshot.currencyCode)} · score {snapshot.healthScore ?? "—"}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="section-card">
              <div className="mb-3 flex items-center gap-2 text-slate-900">
                <Tags size={17} className="text-slate-700" />
                <h2 className="text-lg font-semibold">Audit & import logs</h2>
              </div>
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div>
                  <p className="mb-2 text-sm font-semibold text-slate-800">Recent audit logs</p>
                  <div className="space-y-2">
                    {auditLogs.slice(0, 6).map((log) => (
                      <div key={log.id} className="rounded-xl bg-slate-50 px-3 py-2">
                        <p className="text-sm font-medium text-slate-800">{log.entityName} · {log.action}</p>
                        <p className="text-xs text-slate-500">{log.description || "No description"}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-sm font-semibold text-slate-800">Import jobs</p>
                  <div className="space-y-2">
                    {importJobs.slice(0, 6).map((job) => (
                      <div key={job.id} className="rounded-xl bg-slate-50 px-3 py-2">
                        <p className="text-sm font-medium text-slate-800">{job.jobType} · {job.status}</p>
                        <p className="text-xs text-slate-500">Rows {job.successRows}/{job.totalRows} · failed {job.failedRows}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      ) : null}

      <section className="section-card">
        <div className="page-header">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Connected money APIs</h2>
            <p className="text-sm text-slate-500">The page is grouped into professional workflow tabs while still covering the full API surface.</p>
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
            "/api/money/savings-goals",
            "/api/money/income-sources",
            "/api/money/salary-payments",
            "/api/money/reimbursements",
            "/api/money/liabilities",
            "/api/money/investment-accounts",
            "/api/money/snapshots",
            "/api/money/audit-logs",
            "/api/money/import-jobs",
            "/api/money/dashboard",
          ].map((endpoint) => (
            <code key={endpoint} className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700">
              {endpoint}
            </code>
          ))}
        </div>
      </section>
    </div>
  );
}
