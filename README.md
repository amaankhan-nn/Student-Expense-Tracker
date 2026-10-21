# Campus Ledger

A beginner-friendly student expense tracker built with plain HTML, CSS, and JavaScript. No package installation or build step is needed.

## Run in VS Code

1. Open VS Code and choose **File > Open Folder...**. Select the `Student-Expense-Tracker` folder.
2. Open `index.html` in the editor.
3. Right-click the page and choose **Open with Live Server** if you have the Live Server extension installed. Otherwise, use **File > Open File...** in your browser to open `index.html` directly.
4. Choose **Add expense** to record an item. Use the pencil and × buttons to edit or delete it. Changes are saved in your browser's local storage.

You can also install the **Live Server** extension from the Extensions view (`Ctrl+Shift+X`), then click **Go Live** in VS Code's status bar. Live Server refreshes the page when you edit files.

## What is included

- Add, edit, delete, search, and filter student expenses by category and inclusive date range.
- Categories: Food, Travel, Books, Fees, and Other.
- All-time total, current-month spending, a monthly budget, and entry count.
- Six-month spending trend, all-time category breakdown, and a progress indicator for the current monthly budget.
- Local rule-based analytics: highest category and share, a clearly labeled month-end estimate, a daily allowance with safe/tight/over-budget states, category guide thresholds, recurring-pattern estimates, unusual-expense checks, and a what-if savings slider. These are transparent calculations, not machine learning or generative AI; no API key or backend is used.
- Download expense data as CSV or a JSON backup. Import a JSON backup after validation and confirmation; backups include the monthly budget.
- A new installation starts empty; no spending history is invented. The app ignores invalid saved dates and discards old built-in `sample-*` demo entries. Your valid expenses and budget are stored in this browser, not shared across browsers or devices.

## Demonstrate the analytics

1. Start with a clean ledger, then add four Food expenses such as $10, $12, $14, and $80, plus a $20 Travel expense. Use dates in the current month.
2. Show Food as the highest category and its share of the all-time $136 total (about 85.3%). The $80 Food purchase should be flagged because it is at least twice the average of the other three Food expenses.
3. Point out the month-end estimate and daily allowance. On the slider, select Food and try a 50% reduction; the projected savings should update immediately. The category guide marks spending at 70% as “Watch” and 100% as “Over guide.”
4. For recurring detection, add three identically named $40 Food expenses exactly seven days apart. The card should estimate their monthly commitment from the observed interval; it needs at least two dated entries and stable amounts.
5. Change or delete expenses and show the calculations update. Set a small monthly budget with **Edit**, then use **↓ JSON** and **↑ Import** to demonstrate backup and restore. Import replaces the current ledger only after confirmation.

The currency is currently US dollars and can be changed in `app.js` by updating the `Intl.NumberFormat` currency setting.
