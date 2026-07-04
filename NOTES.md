# QA Notes — Leadline

My learning notes from setting up and running QA on the Leadline demo app.

## 1. The "bug" that wasn't

I typed `pradeep` into the Email field and got **"Invalid credentials. Use test@example.com."**
That was **not** a UI bug — the app was working correctly and telling me exactly what to do.

**Lesson:** before reporting a bug, reproduce it and read what the screen is actually saying.
An error message is often *correct behaviour*, not a defect.

- Demo login: **`test@example.com`** + **any** password.
- The login check runs entirely in the browser (no backend, nothing is stored or sent anywhere).

## 2. Manual testing vs automated testing

- **Manual** = I click through the page myself. Fine for a quick look, but slow and easy to forget cases.
- **Automated (Playwright)** = a script launches a real browser, navigates the page, clicks/types,
  and asserts pass/fail. Repeatable and fast — the same 16 checks run in ~20s every time.

Both "test by navigating the page" — the difference is *who* does the navigating.

## 3. How the automated suite is built

```
tests/login.spec.js   -> 5 login tests
tests/leads.spec.js    -> 11 dashboard tests (search, filter, add/edit/delete)
playwright.config.js   -> serves index.html on :8931, produces an HTML report
```

Run it with:

| Command | What it does |
|---|---|
| `npm test` | run all tests, pass/fail in the terminal |
| `npm run test:headed` | watch it drive a real browser |
| `npm run test:ui` | interactive UI mode |
| `npm run report` | open the HTML pass/fail report |

**Key idea — `data-testid`:** the app has attributes like `data-testid="login-email"`.
Tests target those instead of colours/positions, so they don't break when the design changes.

## 4. A test failing doesn't always mean the app is broken

One test failed on the first run:

```
Expected: "Showing 3 of 4 leads"
Received: "Showing 3 of 3 leads"
```

The **app was right** — after deleting a lead the total drops from 4 to 3.
My *test's expected value* was wrong. I fixed the assertion, not the app.

**Lesson:** when a test fails, first ask "is the app wrong, or is my expectation wrong?"

## 5. What a good pass/fail report gives you

The HTML report (`npm run report`) is the captured record:
- every test with its status and duration,
- step-by-step timeline of each action,
- on failure: an automatic screenshot + trace so I can see exactly what broke.

That's the "capture" I originally asked about — not keystrokes, but a structured record of each test run.

---

## Appendix — Test case coverage (16 cases)

### Login (`tests/login.spec.js`)

| # | Scenario | Steps | Expected result |
|---|----------|-------|-----------------|
| 1 | Both fields required | Click **Sign in** with email + password empty | Error: "Enter both email and password." |
| 2 | Reject non-demo email | Email `pradeep`, password `abc`, Sign in | Error: "Invalid credentials. Use test@example.com." |
| 3 | Valid login | Email `test@example.com`, any password, Sign in | Dashboard shows; "Showing 4 of 4 leads" |
| 4 | Email is case-insensitive | Email `TEST@Example.com`, any password, Sign in | Dashboard shows |
| 5 | Enter key submits | Fill valid creds, press **Enter** in password field | Dashboard shows |

### Leads dashboard (`tests/leads.spec.js`)

| # | Scenario | Steps | Expected result |
|---|----------|-------|-----------------|
| 6 | Seed data loads | Sign in | 4 rows; "Showing 4 of 4 leads" |
| 7 | Search by name | Type `Priya` in search | 1 row (Northwind Retail) |
| 8 | Search with no match | Type `zzzz-no-match` | Empty state; "Showing 0 of 4 leads" |
| 9 | Status filter | Click **New** chip | 2 rows (Marcus, Tomás); Priya hidden |
| 10 | Add valid lead | Add lead → name/company/email → Save | Toast "Lead added."; "Showing 5 of 5 leads" |
| 11 | Required-field + format validation | Add lead → Save empty; then bad email → Save | "Name is required.", "Email is required.", then "Enter a valid email address." |
| 12 | Duplicate email blocked | Add lead with `priya@northwind.com` → Save | Error: "A lead with this email already exists." |
| 13 | Edit lead | Edit Priya → change company → Save | Toast "Changes saved."; new company shown |
| 14 | Delete lead | Delete Marcus → confirm | Toast "Lead deleted."; "Showing 3 of 3 leads"; row gone |
| 15 | Cancel delete | Delete Marcus → Cancel | Marcus still present; "Showing 4 of 4 leads" |
| 16 | Sign out | Click **Sign out** | Back to login screen |

---
_Final result: **16 / 16 passing.**_
