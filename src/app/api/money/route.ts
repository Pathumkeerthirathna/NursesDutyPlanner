import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    module: "money-management",
    status: "ready",
    endpoints: {
      health: "/api/money/health",
      users: "/api/money/users",
      categories: "/api/money/categories",
      merchants: "/api/money/merchants",
      tags: "/api/money/tags",
      accounts: "/api/money/accounts",
      transactions: "/api/money/transactions",
      budgets: "/api/money/budgets",
      recurring: "/api/money/recurring",
      reminders: "/api/money/reminders",
      savingsGoals: "/api/money/savings-goals",
      incomeSources: "/api/money/income-sources",
      salaryPayments: "/api/money/salary-payments",
      reimbursements: "/api/money/reimbursements",
      liabilities: "/api/money/liabilities",
      investmentAccounts: "/api/money/investment-accounts",
      snapshots: "/api/money/snapshots",
      auditLogs: "/api/money/audit-logs",
      importJobs: "/api/money/import-jobs",
      dashboard: "/api/money/dashboard",
    },
  });
}
