export type CreateMoneyUserInput = {
  fullName: string;
  email: string;
  passwordHash: string;
  mobileNo?: string | null;
  isActive?: boolean;
  profile?: {
    defaultCurrencyCode?: string;
    country?: string | null;
    salaryDay?: number | null;
    financialMonthStartDay?: number | null;
    timeZone?: string | null;
    occupation?: string | null;
    employerName?: string | null;
  };
};

export type UpdateMoneyUserInput = Partial<CreateMoneyUserInput>;

export type CreateCategoryInput = {
  userId: string;
  type: "INCOME" | "EXPENSE";
  name: string;
  parentCategoryId?: string | null;
  icon?: string | null;
  colorCode?: string | null;
  sortOrder?: number;
  isSystemDefined?: boolean;
  isActive?: boolean;
};

export type UpdateCategoryInput = Partial<CreateCategoryInput>;

export type CreateFinancialAccountInput = {
  userId: string;
  type:
    | "CASH"
    | "BANK"
    | "CREDIT_CARD"
    | "E_WALLET"
    | "SAVINGS"
    | "FIXED_DEPOSIT"
    | "RETIREMENT"
    | "INVESTMENT";
  name: string;
  currencyCode?: string;
  institutionName?: string | null;
  accountNumberMasked?: string | null;
  openingBalance?: number;
  currentBalance?: number;
  creditLimit?: number | null;
  statementDay?: number | null;
  paymentDueDay?: number | null;
  isIncludedInNetWorth?: boolean;
  isArchived?: boolean;
  openedDate?: string | null;
  closedDate?: string | null;
};

export type UpdateFinancialAccountInput = Partial<CreateFinancialAccountInput>;

export type CreateTransactionInput = {
  userId: string;
  transactionNo: string;
  transactionDate: string;
  postedDate?: string | null;
  kind: "INCOME" | "EXPENSE" | "TRANSFER";
  status?: "DRAFT" | "POSTED" | "VOID";
  fromAccountId?: string | null;
  toAccountId?: string | null;
  categoryId?: string | null;
  merchantId?: string | null;
  amount: number;
  currencyCode?: string;
  exchangeRate?: number;
  referenceNo?: string | null;
  notes?: string | null;
  paymentMethod?: string | null;
  location?: string | null;
  isRecurringGenerated?: boolean;
  recurringTemplateId?: string | null;
  tagIds?: string[];
};

export type UpdateTransactionInput = Partial<CreateTransactionInput>;

export type CreateMerchantInput = {
  userId: string;
  name: string;
  merchantType?: string | null;
  contactNo?: string | null;
  notes?: string | null;
  isActive?: boolean;
};

export type UpdateMerchantInput = Partial<CreateMerchantInput>;

export type CreateTagInput = {
  userId: string;
  name: string;
};

export type UpdateTagInput = Partial<CreateTagInput>;

export type CreateBudgetInput = {
  userId: string;
  name: string;
  startDate: string;
  endDate: string;
  currencyCode?: string;
  budgetAmount: number;
  alertThresholdPercent?: number | null;
  isActive?: boolean;
  categories?: Array<{
    categoryId: string;
    allocatedAmount: number;
    warningPercent?: number | null;
  }>;
};

export type UpdateBudgetInput = Partial<CreateBudgetInput>;

export type CreateRecurringTemplateInput = {
  userId: string;
  templateName: string;
  kind: "INCOME" | "EXPENSE" | "TRANSFER";
  fromAccountId?: string | null;
  toAccountId?: string | null;
  categoryId?: string | null;
  merchantId?: string | null;
  amount: number;
  frequencyType: "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";
  frequencyInterval?: number;
  nextRunDate: string;
  endDate?: string | null;
  autoPost?: boolean;
  isActive?: boolean;
};

export type UpdateRecurringTemplateInput = Partial<CreateRecurringTemplateInput>;

export type CreateBillReminderInput = {
  userId: string;
  categoryId?: string | null;
  linkedTransactionId?: string | null;
  reminderTitle: string;
  amountExpected?: number | null;
  dueDate: string;
  reminderDaysBefore?: number;
  isPaid?: boolean;
  status?: "PENDING" | "PAID" | "MISSED" | "CANCELLED";
};

export type UpdateBillReminderInput = Partial<CreateBillReminderInput>;

export type CreateSavingsGoalInput = {
  userId: string;
  goalName: string;
  targetAmount: number;
  currentAmount?: number;
  currencyCode?: string;
  targetDate?: string | null;
  status?: "ACTIVE" | "ACHIEVED" | "PAUSED" | "CANCELLED";
  notes?: string | null;
  isActive?: boolean;
};

export type UpdateSavingsGoalInput = Partial<CreateSavingsGoalInput>;

export type CreateIncomeSourceInput = {
  userId: string;
  sourceName: string;
  sourceType?: string | null;
  employerName?: string | null;
  defaultAmount?: number | null;
  payDay?: number | null;
  defaultCategoryId?: string | null;
  isTaxable?: boolean;
  isActive?: boolean;
  notes?: string | null;
};

export type UpdateIncomeSourceInput = Partial<CreateIncomeSourceInput>;

export type CreateSalaryPaymentInput = {
  userId: string;
  incomeSourceId?: string | null;
  linkedTransactionId?: string | null;
  salaryMonth: string;
  payDate: string;
  basicAmount?: number;
  grossAmount?: number;
  deductionAmount?: number;
  netAmount?: number;
  currencyCode?: string;
  status?: "DRAFT" | "POSTED" | "VOID";
  notes?: string | null;
  components?: Array<{
    componentType:
      | "BASIC"
      | "ALLOWANCE"
      | "BONUS"
      | "OVERTIME"
      | "REIMBURSEMENT"
      | "DEDUCTION"
      | "TAX"
      | "OTHER";
    componentName: string;
    amount: number;
    isTaxable?: boolean;
    displayOrder?: number;
    notes?: string | null;
  }>;
};

export type UpdateSalaryPaymentInput = Partial<CreateSalaryPaymentInput>;

export type CreateReimbursementClaimInput = {
  userId: string;
  claimNo: string;
  title: string;
  categoryId?: string | null;
  linkedTransactionId?: string | null;
  description?: string | null;
  claimDate: string;
  amountClaimed: number;
  amountReceived?: number;
  receivedDate?: string | null;
  employerName?: string | null;
  isTaxDeductible?: boolean;
  status?: "PENDING" | "APPROVED" | "RECEIVED" | "REJECTED" | "CANCELLED";
  notes?: string | null;
};

export type UpdateReimbursementClaimInput = Partial<CreateReimbursementClaimInput>;

export type CreateLiabilityAccountInput = {
  userId: string;
  accountName: string;
  liabilityType: "LOAN" | "EMI" | "CREDIT_CARD" | "MORTGAGE" | "LEASE" | "OTHER";
  lenderName?: string | null;
  accountNumberMasked?: string | null;
  principalAmount: number;
  outstandingAmount: number;
  interestRate?: number | null;
  emiAmount?: number | null;
  currencyCode?: string;
  startDate?: string | null;
  endDate?: string | null;
  dueDay?: number | null;
  status?: "ACTIVE" | "CLOSED" | "DEFAULTED";
  isActive?: boolean;
  notes?: string | null;
};

export type UpdateLiabilityAccountInput = Partial<CreateLiabilityAccountInput>;

export type CreateLiabilityInstallmentInput = {
  liabilityAccountId: string;
  linkedTransactionId?: string | null;
  installmentNo: number;
  dueDate: string;
  principalDue?: number;
  interestDue?: number;
  totalDue: number;
  amountPaid?: number;
  paidDate?: string | null;
  status?: "PENDING" | "PARTIAL" | "PAID" | "MISSED" | "CANCELLED";
  notes?: string | null;
};

export type UpdateLiabilityInstallmentInput = Partial<CreateLiabilityInstallmentInput>;

export type CreateMonthlyFinancialSnapshotInput = {
  userId: string;
  snapshotMonth: string;
  currencyCode?: string;
  totalIncome?: number;
  totalExpense?: number;
  totalSavings?: number;
  totalAssets?: number;
  totalLiabilities?: number;
  netWorth?: number;
  reimbursementPending?: number;
  upcomingBills?: number;
  healthScore?: number | null;
  status?: "OPEN" | "LOCKED" | "ARCHIVED";
  notes?: string | null;
};

export type UpdateMonthlyFinancialSnapshotInput = Partial<CreateMonthlyFinancialSnapshotInput>;

export type CreateAuditLogInput = {
  userId?: string | null;
  entityName: string;
  entityId?: string | null;
  action: "CREATE" | "UPDATE" | "DELETE" | "ARCHIVE" | "RESTORE" | "IMPORT";
  description?: string | null;
  beforeData?: unknown;
  afterData?: unknown;
  createdBy?: string | null;
};

export type CreateImportJobInput = {
  userId: string;
  jobType: string;
  sourceName?: string | null;
  fileName?: string | null;
  status?: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED" | "PARTIAL";
  totalRows?: number;
  successRows?: number;
  failedRows?: number;
  startedAt?: string | null;
  completedAt?: string | null;
  errorLog?: string | null;
};

export type UpdateImportJobInput = Partial<CreateImportJobInput>;
