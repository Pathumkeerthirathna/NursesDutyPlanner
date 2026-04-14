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
  type: "CASH" | "BANK" | "CREDIT_CARD" | "E_WALLET" | "SAVINGS";
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
