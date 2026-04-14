require("dotenv/config");

const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool } = require("pg");

const connectionString =
  process.env.DATABASE_URL ||
  process.env.MONEY_DATABASE_DIRECT_URL ||
  process.env.MONEY_DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL or MONEY_DATABASE_URL is not set.");
}

const ids = {
  user: "11111111-1111-4111-8111-111111111111",
  profile: "11111111-1111-4111-8111-222222222222",
  categorySalary: "22222222-2222-4222-8222-111111111111",
  categoryOvertime: "22222222-2222-4222-8222-222222222222",
  categoryGroceries: "33333333-3333-4333-8333-111111111111",
  categoryTransport: "33333333-3333-4333-8333-222222222222",
  merchantPharmacy: "44444444-4444-4444-8444-111111111111",
  merchantFuel: "44444444-4444-4444-8444-222222222222",
  tagEssential: "55555555-5555-4555-8555-111111111111",
  tagMonthly: "55555555-5555-4555-8555-222222222222",
  accountCash: "66666666-6666-4666-8666-111111111111",
  accountBank: "66666666-6666-4666-8666-222222222222",
  accountWallet: "66666666-6666-4666-8666-333333333333",
  transactionSalary: "77777777-7777-4777-8777-111111111111",
  transactionGroceries: "77777777-7777-4777-8777-222222222222",
  transactionTransfer: "77777777-7777-4777-8777-333333333333",
  budget: "88888888-8888-4888-8888-111111111111",
  reminder: "99999999-9999-4999-8999-111111111111",
  recurring: "aaaaaaaa-aaaa-4aaa-8aaa-111111111111",
};

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({
  adapter,
  log: ["warn", "error"],
});

async function main() {
  console.log("🌱 Seeding money-management sample data...");

  await prisma.user.upsert({
    where: { email: "nurse.demo@example.com" },
    update: {
      fullName: "Demo Nurse",
      mobileNo: "+94 77 123 4567",
      passwordHash: "demo-password-hash",
      isActive: true,
      profile: {
        upsert: {
          create: {
            id: ids.profile,
            defaultCurrencyCode: "LKR",
            country: "Sri Lanka",
            salaryDay: 25,
            financialMonthStartDay: 1,
            timeZone: "Asia/Colombo",
            occupation: "Registered Nurse",
            employerName: "City Hospital",
          },
          update: {
            defaultCurrencyCode: "LKR",
            country: "Sri Lanka",
            salaryDay: 25,
            financialMonthStartDay: 1,
            timeZone: "Asia/Colombo",
            occupation: "Registered Nurse",
            employerName: "City Hospital",
          },
        },
      },
    },
    create: {
      id: ids.user,
      fullName: "Demo Nurse",
      email: "nurse.demo@example.com",
      mobileNo: "+94 77 123 4567",
      passwordHash: "demo-password-hash",
      isActive: true,
      profile: {
        create: {
          id: ids.profile,
          defaultCurrencyCode: "LKR",
          country: "Sri Lanka",
          salaryDay: 25,
          financialMonthStartDay: 1,
          timeZone: "Asia/Colombo",
          occupation: "Registered Nurse",
          employerName: "City Hospital",
        },
      },
    },
  });

  await prisma.category.upsert({
    where: {
      userId_type_name: {
        userId: ids.user,
        type: "INCOME",
        name: "Salary",
      },
    },
    update: { colorCode: "#22c55e", sortOrder: 1, isActive: true },
    create: {
      id: ids.categorySalary,
      user: { connect: { id: ids.user } },
      type: "INCOME",
      name: "Salary",
      icon: "wallet",
      colorCode: "#22c55e",
      sortOrder: 1,
      isSystemDefined: false,
      isActive: true,
    },
  });

  await prisma.category.upsert({
    where: {
      userId_type_name: {
        userId: ids.user,
        type: "INCOME",
        name: "Overtime",
      },
    },
    update: { colorCode: "#16a34a", sortOrder: 2, isActive: true },
    create: {
      id: ids.categoryOvertime,
      user: { connect: { id: ids.user } },
      type: "INCOME",
      name: "Overtime",
      icon: "briefcase",
      colorCode: "#16a34a",
      sortOrder: 2,
      isSystemDefined: false,
      isActive: true,
    },
  });

  await prisma.category.upsert({
    where: {
      userId_type_name: {
        userId: ids.user,
        type: "EXPENSE",
        name: "Groceries",
      },
    },
    update: { colorCode: "#f59e0b", sortOrder: 1, isActive: true },
    create: {
      id: ids.categoryGroceries,
      user: { connect: { id: ids.user } },
      type: "EXPENSE",
      name: "Groceries",
      icon: "shopping-cart",
      colorCode: "#f59e0b",
      sortOrder: 1,
      isSystemDefined: false,
      isActive: true,
    },
  });

  await prisma.category.upsert({
    where: {
      userId_type_name: {
        userId: ids.user,
        type: "EXPENSE",
        name: "Transport",
      },
    },
    update: { colorCode: "#ef4444", sortOrder: 2, isActive: true },
    create: {
      id: ids.categoryTransport,
      user: { connect: { id: ids.user } },
      type: "EXPENSE",
      name: "Transport",
      icon: "bus",
      colorCode: "#ef4444",
      sortOrder: 2,
      isSystemDefined: false,
      isActive: true,
    },
  });

  await prisma.merchant.upsert({
    where: {
      userId_name: {
        userId: ids.user,
        name: "City Care Pharmacy",
      },
    },
    update: { merchantType: "PHARMACY", contactNo: "+94 11 234 5678" },
    create: {
      id: ids.merchantPharmacy,
      user: { connect: { id: ids.user } },
      name: "City Care Pharmacy",
      merchantType: "PHARMACY",
      contactNo: "+94 11 234 5678",
      notes: "Used for monthly supplies",
    },
  });

  await prisma.merchant.upsert({
    where: {
      userId_name: {
        userId: ids.user,
        name: "Quick Fuel Station",
      },
    },
    update: { merchantType: "FUEL" },
    create: {
      id: ids.merchantFuel,
      user: { connect: { id: ids.user } },
      name: "Quick Fuel Station",
      merchantType: "FUEL",
      contactNo: "+94 11 222 0000",
      notes: "Fuel top-ups",
    },
  });

  await prisma.tag.upsert({
    where: {
      userId_name: {
        userId: ids.user,
        name: "Essential",
      },
    },
    update: {},
    create: {
      id: ids.tagEssential,
      user: { connect: { id: ids.user } },
      name: "Essential",
    },
  });

  await prisma.tag.upsert({
    where: {
      userId_name: {
        userId: ids.user,
        name: "Monthly",
      },
    },
    update: {},
    create: {
      id: ids.tagMonthly,
      user: { connect: { id: ids.user } },
      name: "Monthly",
    },
  });

  await prisma.financialAccount.upsert({
    where: {
      userId_name: {
        userId: ids.user,
        name: "Cash Wallet",
      },
    },
    update: { currentBalance: 8500, isArchived: false },
    create: {
      id: ids.accountCash,
      user: { connect: { id: ids.user } },
      type: "CASH",
      name: "Cash Wallet",
      currencyCode: "LKR",
      openingBalance: 5000,
      currentBalance: 8500,
      isIncludedInNetWorth: true,
      isArchived: false,
      openedDate: new Date("2026-01-01"),
    },
  });

  await prisma.financialAccount.upsert({
    where: {
      userId_name: {
        userId: ids.user,
        name: "BOC Salary Account",
      },
    },
    update: { currentBalance: 125000, isArchived: false },
    create: {
      id: ids.accountBank,
      user: { connect: { id: ids.user } },
      type: "BANK",
      name: "BOC Salary Account",
      institutionName: "Bank of Ceylon",
      accountNumberMasked: "****4567",
      currencyCode: "LKR",
      openingBalance: 100000,
      currentBalance: 125000,
      isIncludedInNetWorth: true,
      isArchived: false,
      openedDate: new Date("2026-01-01"),
    },
  });

  await prisma.financialAccount.upsert({
    where: {
      userId_name: {
        userId: ids.user,
        name: "eZ Cash Wallet",
      },
    },
    update: { currentBalance: 3000, isArchived: false },
    create: {
      id: ids.accountWallet,
      user: { connect: { id: ids.user } },
      type: "E_WALLET",
      name: "eZ Cash Wallet",
      currencyCode: "LKR",
      openingBalance: 1500,
      currentBalance: 3000,
      isIncludedInNetWorth: true,
      isArchived: false,
      openedDate: new Date("2026-02-01"),
    },
  });

  await prisma.transaction.upsert({
    where: { transactionNo: "TXN-SAL-1001" },
    update: {
      transactionDate: new Date("2026-04-01T08:00:00.000Z"),
      postedDate: new Date("2026-04-01T08:30:00.000Z"),
      kind: "INCOME",
      status: "POSTED",
      amount: 120000,
      currencyCode: "LKR",
      exchangeRate: 1,
      notes: "Monthly salary credit",
      paymentMethod: "Bank Transfer",
      category: { connect: { id: ids.categorySalary } },
      toAccount: { connect: { id: ids.accountBank } },
      tags: {
        deleteMany: {},
        create: [
          { tag: { connect: { id: ids.tagMonthly } } },
        ],
      },
    },
    create: {
      id: ids.transactionSalary,
      user: { connect: { id: ids.user } },
      transactionNo: "TXN-SAL-1001",
      transactionDate: new Date("2026-04-01T08:00:00.000Z"),
      postedDate: new Date("2026-04-01T08:30:00.000Z"),
      kind: "INCOME",
      status: "POSTED",
      amount: 120000,
      currencyCode: "LKR",
      exchangeRate: 1,
      notes: "Monthly salary credit",
      paymentMethod: "Bank Transfer",
      category: { connect: { id: ids.categorySalary } },
      toAccount: { connect: { id: ids.accountBank } },
      tags: {
        create: [
          { tag: { connect: { id: ids.tagMonthly } } },
        ],
      },
    },
  });

  await prisma.transaction.upsert({
    where: { transactionNo: "TXN-EXP-1002" },
    update: {
      transactionDate: new Date("2026-04-02T11:15:00.000Z"),
      postedDate: new Date("2026-04-02T11:20:00.000Z"),
      kind: "EXPENSE",
      status: "POSTED",
      amount: 6500,
      currencyCode: "LKR",
      exchangeRate: 1,
      notes: "Weekly grocery run",
      paymentMethod: "Cash",
      merchant: { connect: { id: ids.merchantPharmacy } },
      category: { connect: { id: ids.categoryGroceries } },
      fromAccount: { connect: { id: ids.accountCash } },
      tags: {
        deleteMany: {},
        create: [
          { tag: { connect: { id: ids.tagEssential } } },
        ],
      },
    },
    create: {
      id: ids.transactionGroceries,
      user: { connect: { id: ids.user } },
      transactionNo: "TXN-EXP-1002",
      transactionDate: new Date("2026-04-02T11:15:00.000Z"),
      postedDate: new Date("2026-04-02T11:20:00.000Z"),
      kind: "EXPENSE",
      status: "POSTED",
      amount: 6500,
      currencyCode: "LKR",
      exchangeRate: 1,
      notes: "Weekly grocery run",
      paymentMethod: "Cash",
      merchant: { connect: { id: ids.merchantPharmacy } },
      category: { connect: { id: ids.categoryGroceries } },
      fromAccount: { connect: { id: ids.accountCash } },
      tags: {
        create: [
          { tag: { connect: { id: ids.tagEssential } } },
        ],
      },
    },
  });

  await prisma.transaction.upsert({
    where: { transactionNo: "TXN-TRF-1003" },
    update: {
      transactionDate: new Date("2026-04-03T17:00:00.000Z"),
      postedDate: new Date("2026-04-03T17:02:00.000Z"),
      kind: "TRANSFER",
      status: "POSTED",
      amount: 5000,
      currencyCode: "LKR",
      exchangeRate: 1,
      notes: "Top up wallet for transport",
      fromAccount: { connect: { id: ids.accountBank } },
      toAccount: { connect: { id: ids.accountWallet } },
      tags: {
        deleteMany: {},
        create: [
          { tag: { connect: { id: ids.tagMonthly } } },
        ],
      },
    },
    create: {
      id: ids.transactionTransfer,
      user: { connect: { id: ids.user } },
      transactionNo: "TXN-TRF-1003",
      transactionDate: new Date("2026-04-03T17:00:00.000Z"),
      postedDate: new Date("2026-04-03T17:02:00.000Z"),
      kind: "TRANSFER",
      status: "POSTED",
      amount: 5000,
      currencyCode: "LKR",
      exchangeRate: 1,
      notes: "Top up wallet for transport",
      fromAccount: { connect: { id: ids.accountBank } },
      toAccount: { connect: { id: ids.accountWallet } },
      tags: {
        create: [
          { tag: { connect: { id: ids.tagMonthly } } },
        ],
      },
    },
  });

  await prisma.budget.upsert({
    where: { id: ids.budget },
    update: {
      name: "April Home Budget",
      startDate: new Date("2026-04-01"),
      endDate: new Date("2026-04-30"),
      currencyCode: "LKR",
      budgetAmount: 30000,
      alertThresholdPercent: 80,
      isActive: true,
      categories: {
        deleteMany: {},
        create: [
          {
            allocatedAmount: 20000,
            warningPercent: 80,
            category: { connect: { id: ids.categoryGroceries } },
          },
          {
            allocatedAmount: 10000,
            warningPercent: 90,
            category: { connect: { id: ids.categoryTransport } },
          },
        ],
      },
    },
    create: {
      id: ids.budget,
      user: { connect: { id: ids.user } },
      name: "April Home Budget",
      startDate: new Date("2026-04-01"),
      endDate: new Date("2026-04-30"),
      currencyCode: "LKR",
      budgetAmount: 30000,
      alertThresholdPercent: 80,
      isActive: true,
      categories: {
        create: [
          {
            allocatedAmount: 20000,
            warningPercent: 80,
            category: { connect: { id: ids.categoryGroceries } },
          },
          {
            allocatedAmount: 10000,
            warningPercent: 90,
            category: { connect: { id: ids.categoryTransport } },
          },
        ],
      },
    },
  });

  await prisma.recurringTransactionTemplate.upsert({
    where: { id: ids.recurring },
    update: {
      templateName: "Monthly Salary",
      kind: "INCOME",
      amount: 120000,
      frequencyType: "MONTHLY",
      frequencyInterval: 1,
      nextRunDate: new Date("2026-05-01"),
      autoPost: true,
      isActive: true,
      toAccount: { connect: { id: ids.accountBank } },
      category: { connect: { id: ids.categorySalary } },
    },
    create: {
      id: ids.recurring,
      user: { connect: { id: ids.user } },
      templateName: "Monthly Salary",
      kind: "INCOME",
      amount: 120000,
      frequencyType: "MONTHLY",
      frequencyInterval: 1,
      nextRunDate: new Date("2026-05-01"),
      autoPost: true,
      isActive: true,
      toAccount: { connect: { id: ids.accountBank } },
      category: { connect: { id: ids.categorySalary } },
    },
  });

  await prisma.billReminder.upsert({
    where: { id: ids.reminder },
    update: {
      reminderTitle: "Electricity Bill",
      amountExpected: 4500,
      dueDate: new Date("2026-04-10"),
      reminderDaysBefore: 2,
      isPaid: false,
      status: "PENDING",
      category: { connect: { id: ids.categoryTransport } },
    },
    create: {
      id: ids.reminder,
      user: { connect: { id: ids.user } },
      reminderTitle: "Electricity Bill",
      amountExpected: 4500,
      dueDate: new Date("2026-04-10"),
      reminderDaysBefore: 2,
      isPaid: false,
      status: "PENDING",
      category: { connect: { id: ids.categoryTransport } },
    },
  });

  console.log("✅ Seed complete.");
  console.log("Demo user email: nurse.demo@example.com");
  console.log("Demo user id:", ids.user);
}

main()
  .catch((error) => {
    console.error("❌ Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
