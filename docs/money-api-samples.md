# Money API sample requests

Use these samples with Postman or any REST client after starting the app with `npm run dev`.

## 1) Seed demo data

```bash
npm run prisma:seed
```

This creates a demo nurse profile and linked finance records.

## 2) Seeded demo IDs

| Item | Value |
|---|---|
| `userId` | `11111111-1111-4111-8111-111111111111` |
| `salaryCategoryId` | `22222222-2222-4222-8222-111111111111` |
| `groceriesCategoryId` | `33333333-3333-4333-8333-111111111111` |
| `cashAccountId` | `66666666-6666-4666-8666-111111111111` |
| `bankAccountId` | `66666666-6666-4666-8666-222222222222` |
| `walletAccountId` | `66666666-6666-4666-8666-333333333333` |
| `essentialTagId` | `55555555-5555-4555-8555-111111111111` |
| `monthlyTagId` | `55555555-5555-4555-8555-222222222222` |

Base URL:

```text
http://localhost:3000/api/money
```

---

## Health check

### `GET /api/money/health`
No body required.

---

## Create user

### `POST /api/money/users`
```json
{
  "fullName": "Nimali Perera",
  "email": "nimali.perera@example.com",
  "mobileNo": "+94 77 555 0101",
  "passwordHash": "demo-password-hash",
  "isActive": true,
  "profile": {
    "defaultCurrencyCode": "LKR",
    "country": "Sri Lanka",
    "salaryDay": 25,
    "financialMonthStartDay": 1,
    "timeZone": "Asia/Colombo",
    "occupation": "Staff Nurse",
    "employerName": "National Hospital"
  }
}
```

---

## Create income category

### `POST /api/money/categories`
```json
{
  "userId": "11111111-1111-4111-8111-111111111111",
  "type": "INCOME",
  "name": "Night Shift Bonus",
  "icon": "moon",
  "colorCode": "#16a34a",
  "sortOrder": 3,
  "isSystemDefined": false,
  "isActive": true
}
```

## Create expense category

### `POST /api/money/categories`
```json
{
  "userId": "11111111-1111-4111-8111-111111111111",
  "type": "EXPENSE",
  "name": "Uniforms",
  "icon": "shirt",
  "colorCode": "#ef4444",
  "sortOrder": 4,
  "isSystemDefined": false,
  "isActive": true
}
```

---

## Create account

### `POST /api/money/accounts`
```json
{
  "userId": "11111111-1111-4111-8111-111111111111",
  "type": "BANK",
  "name": "Peoples Bank Savings",
  "currencyCode": "LKR",
  "institutionName": "Peoples Bank",
  "accountNumberMasked": "****9988",
  "openingBalance": 50000,
  "currentBalance": 50000,
  "isIncludedInNetWorth": true,
  "isArchived": false,
  "openedDate": "2026-04-01"
}
```

---

## Create income transaction

### `POST /api/money/transactions`
```json
{
  "userId": "11111111-1111-4111-8111-111111111111",
  "transactionNo": "TXN-SAL-2001",
  "transactionDate": "2026-04-05T08:00:00.000Z",
  "postedDate": "2026-04-05T08:10:00.000Z",
  "kind": "INCOME",
  "status": "POSTED",
  "toAccountId": "66666666-6666-4666-8666-222222222222",
  "categoryId": "22222222-2222-4222-8222-111111111111",
  "amount": 95000,
  "currencyCode": "LKR",
  "exchangeRate": 1,
  "referenceNo": "SAL-APR-05",
  "notes": "April salary payment",
  "paymentMethod": "Bank Transfer",
  "tagIds": [
    "55555555-5555-4555-8555-222222222222"
  ]
}
```

## Create expense transaction

### `POST /api/money/transactions`
```json
{
  "userId": "11111111-1111-4111-8111-111111111111",
  "transactionNo": "TXN-EXP-2002",
  "transactionDate": "2026-04-06T16:30:00.000Z",
  "postedDate": "2026-04-06T16:35:00.000Z",
  "kind": "EXPENSE",
  "status": "POSTED",
  "fromAccountId": "66666666-6666-4666-8666-111111111111",
  "categoryId": "33333333-3333-4333-8333-111111111111",
  "merchantId": "44444444-4444-4444-8444-111111111111",
  "amount": 4200,
  "currencyCode": "LKR",
  "exchangeRate": 1,
  "referenceNo": "GRC-APR-06",
  "notes": "Groceries after shift",
  "paymentMethod": "Cash",
  "tagIds": [
    "55555555-5555-4555-8555-111111111111"
  ]
}
```

## Create transfer transaction

### `POST /api/money/transactions`
```json
{
  "userId": "11111111-1111-4111-8111-111111111111",
  "transactionNo": "TXN-TRF-2003",
  "transactionDate": "2026-04-07T09:00:00.000Z",
  "postedDate": "2026-04-07T09:05:00.000Z",
  "kind": "TRANSFER",
  "status": "POSTED",
  "fromAccountId": "66666666-6666-4666-8666-222222222222",
  "toAccountId": "66666666-6666-4666-8666-333333333333",
  "amount": 3000,
  "currencyCode": "LKR",
  "exchangeRate": 1,
  "notes": "Move cash for travel expenses",
  "paymentMethod": "Internal Transfer"
}
```

---

## Useful GET requests

### List users
```text
GET /api/money/users
```

### List categories for the seeded user
```text
GET /api/money/categories?userId=11111111-1111-4111-8111-111111111111
```

### List accounts for the seeded user
```text
GET /api/money/accounts?userId=11111111-1111-4111-8111-111111111111
```

### List transactions for April
```text
GET /api/money/transactions?userId=11111111-1111-4111-8111-111111111111&fromDate=2026-04-01&toDate=2026-04-30
```

### Dashboard summary
```text
GET /api/money/dashboard?userId=11111111-1111-4111-8111-111111111111&fromDate=2026-04-01&toDate=2026-04-30
```
