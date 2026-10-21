const CATEGORIES = ['Food', 'Travel', 'Books', 'Fees', 'Other'];
const CATEGORY_COLORS = {
  Food: '#e17e62',
  Travel: '#7a9ec0',
  Books: '#e4b754',
  Fees: '#62967d',
  Other: '#a9b5a9',
};
const CATEGORY_TIPS = {
  Food: 'Food is your biggest category. Try setting a weekly meal budget, planning a few meals ahead, or checking campus dining options.',
  Travel: 'Travel is your biggest category. Compare a transit pass with single fares, or coordinate rides for trips you make regularly.',
  Books: 'Books are your biggest category. Check the library, used-book exchanges, and course reserve shelves before buying new.',
  Fees: 'Fees are your biggest category. Ask your student finance office about payment plans, fee waivers, or aid deadlines.',
  Other: 'Other is your biggest category. Add a short note to future entries so you can spot which small purchases are adding up.',
};
const STORAGE_KEY = 'campus-ledger-expenses-v1';
const BUDGET_KEY = 'campus-ledger-budget-v1';
const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
const today = new Date();
const dateInputValue = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
const monthKey = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

function loadExpenses() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === null) return [];
    const parsed = JSON.parse(saved);
    const validExpenses = Array.isArray(parsed)
      ? parsed.filter((expense) => isValidExpense(expense) && !expense.id.startsWith('sample-'))
      : [];
    if (validExpenses.length !== (Array.isArray(parsed) ? parsed.length : 0)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(validExpenses));
    }
    return validExpenses;
  } catch {
    return [];
  }
}

function isValidExpense(expense) {
  if (!expense || typeof expense.id !== 'string' || typeof expense.name !== 'string' || !CATEGORIES.includes(expense.category)) return false;
  if (expense.amount === null || String(expense.amount).trim() === '') return false;
  const date = typeof expense.date === 'string' ? new Date(`${expense.date}T00:00:00`) : null;
  const amount = Number(expense.amount);
  return Number.isFinite(amount) && amount >= 0 && date !== null && Number.isFinite(date.getTime()) && dateInputValue(date) === expense.date;
}

let expenses = loadExpenses();
const storedBudget = localStorage.getItem(BUDGET_KEY);
let budget = storedBudget === null ? 650 : Number(storedBudget);
if (!Number.isFinite(budget) || budget < 0) budget = 650;
let editingId = null;

const elements = {
  todayLabel: document.querySelector('#today-label'),
  totalSpent: document.querySelector('#total-spent'),
  monthlySpent: document.querySelector('#monthly-spent'),
  monthlyCount: document.querySelector('#monthly-count'),
  budgetCaption: document.querySelector('#budget-caption'),
  budgetFill: document.querySelector('#budget-fill'),
  budgetProgress: document.querySelector('#budget-progress'),
  budgetForm: document.querySelector('#budget-form'),
  budgetInput: document.querySelector('#budget-input'),
  trendChart: document.querySelector('#trend-chart'),
  categoryChart: document.querySelector('#category-chart'),
  categoryTotal: document.querySelector('#category-total'),
  categoryLegend: document.querySelector('#category-legend'),
  insightTitle: document.querySelector('#insight-title'),
  insightShare: document.querySelector('#insight-share'),
  insightSummary: document.querySelector('#insight-summary'),
  insightSuggestion: document.querySelector('#insight-suggestion'),
  categoryShareProgress: document.querySelector('#category-share-progress'),
  categoryShareFill: document.querySelector('#category-share-fill'),
  forecastValue: document.querySelector('#forecast-value'),
  forecastSummary: document.querySelector('#forecast-summary'),
  unusualTitle: document.querySelector('#unusual-title'),
  unusualDetail: document.querySelector('#unusual-detail'),
  budgetRemaining: document.querySelector('#budget-remaining'),
  dailyAllowanceValue: document.querySelector('#daily-allowance-value'),
  dailyAllowanceStatus: document.querySelector('#daily-allowance-status'),
  dailyAllowanceDetail: document.querySelector('#daily-allowance-detail'),
  categoryHealthList: document.querySelector('#category-health-list'),
  recurringTotal: document.querySelector('#recurring-total'),
  recurringList: document.querySelector('#recurring-list'),
  simulatorCategory: document.querySelector('#simulator-category'),
  simulatorReduction: document.querySelector('#simulator-reduction'),
  simulatorReductionValue: document.querySelector('#simulator-reduction-value'),
  simulatorSavings: document.querySelector('#simulator-savings'),
  simulatorCurrentAmount: document.querySelector('#simulator-current-amount'),
  simulatorProjectedAmount: document.querySelector('#simulator-projected-amount'),
  simulatorCurrentBar: document.querySelector('#simulator-current-bar'),
  simulatorProjectedBar: document.querySelector('#simulator-projected-bar'),
  simulatorSummary: document.querySelector('#simulator-summary'),
  expenseCount: document.querySelector('#expense-count'),
  expenseList: document.querySelector('#expense-list'),
  emptyState: document.querySelector('#empty-state'),
  categoryFilter: document.querySelector('#category-filter'),
  searchInput: document.querySelector('#search-input'),
  dateFrom: document.querySelector('#date-from'),
  dateTo: document.querySelector('#date-to'),
  dataStatus: document.querySelector('#data-status'),
  importFile: document.querySelector('#import-file'),
  dialog: document.querySelector('#expense-dialog'),
  form: document.querySelector('#expense-form'),
  dialogTitle: document.querySelector('#dialog-title'),
  saveButton: document.querySelector('#save-expense'),
  nameInput: document.querySelector('#expense-name'),
  amountInput: document.querySelector('#expense-amount'),
  categoryInput: document.querySelector('#expense-category'),
  dateInput: document.querySelector('#expense-date'),
};

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
}

function expensesForMonth(date) {
  const targetMonth = monthKey(date);
  return expenses.filter((expense) => isValidExpense(expense) && monthKey(new Date(`${expense.date}T00:00:00`)) === targetMonth);
}

function renderOverview() {
  const monthExpenses = expensesForMonth(today);
  const total = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
  const monthlyTotal = monthExpenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
  elements.totalSpent.textContent = money.format(total);
  elements.monthlySpent.textContent = money.format(monthlyTotal);
  elements.monthlyCount.textContent = String(monthExpenses.length);
  elements.budgetCaption.textContent = `of ${money.format(budget)} budget`;
  const percentage = budget > 0 ? Math.min((monthlyTotal / budget) * 100, 100) : monthlyTotal > 0 ? 100 : 0;
  elements.budgetFill.style.width = `${percentage}%`;
  elements.budgetProgress.setAttribute('aria-valuenow', String(Math.round(percentage)));
  elements.budgetProgress.setAttribute('aria-valuetext', `${Math.round(percentage)}% of monthly budget used`);
  elements.budgetProgress.dataset.status = monthlyTotal > budget ? 'over' : monthlyTotal >= budget * 0.85 && budget > 0 ? 'tight' : 'safe';
}

function renderTrend() {
  const months = Array.from({ length: 6 }, (_, index) => new Date(today.getFullYear(), today.getMonth() - 5 + index, 1));
  const totals = months.map((month) => expenses
    .filter((expense) => monthKey(new Date(`${expense.date}T00:00:00`)) === monthKey(month))
    .reduce((sum, expense) => sum + Number(expense.amount), 0));
  const width = 600;
  const height = 180;
  const left = 32;
  const right = 586;
  const top = 15;
  const bottom = 142;
  const max = Math.max(...totals, 100);
  const points = totals.map((value, index) => ({
    x: left + ((right - left) / (months.length - 1)) * index,
    y: bottom - ((bottom - top) * value) / max,
    value,
  }));
  const pointString = points.map((point) => `${point.x},${point.y}`).join(' ');
  const areaString = `${left},${bottom} ${pointString} ${right},${bottom}`;
  const guideLines = [0, 1, 2].map((step) => {
    const y = top + ((bottom - top) / 2) * step;
    return `<line class="grid-line" x1="${left}" y1="${y}" x2="${right}" y2="${y}" />`;
  }).join('');
  const labels = points.map((point, index) => `<text class="chart-label" x="${point.x}" y="169" text-anchor="middle">${months[index].toLocaleDateString('en-US', { month: 'short' })}</text><text class="chart-value" x="${point.x}" y="${Math.max(point.y - 10, 9)}" text-anchor="middle">${point.value > 0 ? money.format(point.value) : ''}</text>`).join('');
  const dots = points.map((point) => `<circle class="chart-point" cx="${point.x}" cy="${point.y}" r="4" />`).join('');
  elements.trendChart.innerHTML = `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Monthly spending for the last six months"><defs><linearGradient id="trendFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stop-color="#80aa8f" stop-opacity=".23"/><stop offset="100%" stop-color="#80aa8f" stop-opacity=".01"/></linearGradient></defs>${guideLines}<polygon class="chart-area" points="${areaString}"/><polyline class="chart-line" points="${pointString}"/>${dots}${labels}</svg>`;
}

function renderCategories() {
  const totals = Object.fromEntries(CATEGORIES.map((category) => [category, expenses
    .filter((expense) => expense.category === category)
    .reduce((sum, expense) => sum + Number(expense.amount), 0)]));
  const total = Object.values(totals).reduce((sum, value) => sum + value, 0);
  let angle = 0;
  const slices = CATEGORIES.map((category) => {
    const value = totals[category];
    if (value === 0 || total === 0) return null;
    const start = angle;
    angle += (value / total) * 100;
    return `${CATEGORY_COLORS[category]} ${start}% ${angle}%`;
  }).filter(Boolean);
  elements.categoryChart.style.background = slices.length ? `conic-gradient(${slices.join(', ')})` : 'conic-gradient(#e5e9e1 0 100%)';
  elements.categoryTotal.textContent = money.format(total);
  elements.categoryLegend.innerHTML = CATEGORIES.map((category) => `<li><span class="legend-dot" style="background:${CATEGORY_COLORS[category]}"></span><span>${category}</span><strong>${money.format(totals[category])}</strong></li>`).join('');
}

function renderInsights() {
  const validExpenses = expenses.filter(isValidExpense);
  const total = validExpenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
  const categoryTotals = Object.fromEntries(CATEGORIES.map((category) => [category, validExpenses
    .filter((expense) => expense.category === category)
    .reduce((sum, expense) => sum + Number(expense.amount), 0)]));
  const [topCategory, topAmount] = Object.entries(categoryTotals).sort((first, second) => second[1] - first[1])[0];
  const share = total > 0 ? (topAmount / total) * 100 : 0;

  if (total === 0) {
    elements.insightTitle.textContent = 'No recorded spending yet';
    elements.insightShare.textContent = '0%';
    elements.insightSummary.textContent = 'Add expenses with an amount above $0 to see the leading category.';
  } else {
    elements.insightTitle.textContent = `${topCategory} is highest`;
    elements.insightShare.textContent = `${share.toFixed(1)}%`;
    elements.insightSummary.textContent = `${money.format(topAmount)} of ${money.format(total)} across all valid recorded expenses.`;
  }
  elements.categoryShareFill.style.width = `${share}%`;
  elements.categoryShareProgress.setAttribute('aria-valuenow', String(Math.round(share)));

  const monthExpenses = expensesForMonth(today).filter((expense) => expense.date <= dateInputValue(today));
  const monthTotal = monthExpenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
  const daysElapsed = today.getDate();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  if (monthTotal > 0 && daysElapsed > 0) {
    const estimate = monthTotal / daysElapsed * daysInMonth;
    const dailyAverage = monthTotal / daysElapsed;
    elements.forecastValue.textContent = money.format(estimate);
    elements.forecastSummary.textContent = `${money.format(monthTotal)} recorded through day ${daysElapsed}; ${money.format(dailyAverage)} per elapsed day across ${daysInMonth} days.`;
  } else {
    elements.forecastValue.textContent = '—';
    elements.forecastSummary.textContent = 'No positive current-month spending to estimate from yet.';
  }

  const unusual = validExpenses.map((expense) => {
    const comparisonAmounts = validExpenses
      .filter((other) => other.id !== expense.id && other.category === expense.category)
      .map((other) => Number(other.amount));
    if (comparisonAmounts.length < 3) return null;
    const average = comparisonAmounts.reduce((sum, amount) => sum + amount, 0) / comparisonAmounts.length;
    return average > 0 && Number(expense.amount) >= average * 2
      ? { expense, average, ratio: Number(expense.amount) / average }
      : null;
  }).filter(Boolean).sort((first, second) => second.ratio - first.ratio)[0];
  if (unusual) {
    elements.unusualTitle.textContent = `${unusual.expense.category} expense stands out`;
    elements.unusualDetail.textContent = `${unusual.expense.name} was ${money.format(Number(unusual.expense.amount))}, ${unusual.ratio.toFixed(1)}× the ${money.format(unusual.average)} average of ${unusual.expense.category} comparisons.`;
  } else if (validExpenses.length === 0) {
    elements.unusualTitle.textContent = 'No expenses to compare';
    elements.unusualDetail.textContent = 'Record expenses to enable category comparisons.';
  } else {
    elements.unusualTitle.textContent = 'No unusual expenses found';
    elements.unusualDetail.textContent = 'Each alert requires three other valid expenses in the same category and at least twice their average.';
  }

  const remaining = budget - monthTotal;
  elements.budgetRemaining.textContent = remaining >= 0
    ? `${money.format(remaining)} of this month's budget remains.`
    : `${money.format(Math.abs(remaining))} over this month's budget.`;
  if (validExpenses.length === 0) {
    elements.insightSuggestion.textContent = `Start by recording everyday spending. Your full ${money.format(budget)} monthly budget remains.`;
  } else if (monthTotal === 0) {
    elements.insightSuggestion.textContent = `No positive spending is recorded this month. Keep logging purchases to get a category-specific suggestion; ${money.format(budget)} remains.`;
  } else {
    const monthCategoryTotals = Object.fromEntries(CATEGORIES.map((category) => [category, monthExpenses
      .reduce((sum, expense) => sum + (expense.category === category ? Number(expense.amount) : 0), 0)]));
    const [monthTopCategory] = Object.entries(monthCategoryTotals).sort((first, second) => second[1] - first[1])[0];
    const budgetMessage = remaining < 0
      ? `You are ${money.format(Math.abs(remaining))} over budget. `
      : `${money.format(remaining)} remains in your budget. `;
    elements.insightSuggestion.textContent = `${budgetMessage}${CATEGORY_TIPS[monthTopCategory]}`;
  }
}

function currentMonthExpenses() {
  const todayKey = dateInputValue(today);
  return expensesForMonth(today).filter((expense) => expense.date <= todayKey);
}

function renderDailyAllowance() {
  const monthTotal = currentMonthExpenses().reduce((sum, expense) => sum + Number(expense.amount), 0);
  const remaining = budget - monthTotal;
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const daysLeft = Math.max(1, daysInMonth - today.getDate() + 1);
  const dailyAllowance = Math.max(0, remaining) / daysLeft;
  let status = 'safe';
  let statusText = 'Safe';
  if (remaining < 0) {
    status = 'over';
    statusText = 'Over budget';
  } else if (budget === 0 || remaining <= budget * 0.15) {
    status = 'tight';
    statusText = 'Tight';
  }
  elements.dailyAllowanceValue.textContent = money.format(dailyAllowance);
  elements.dailyAllowanceStatus.className = `status-pill status-${status}`;
  elements.dailyAllowanceStatus.textContent = statusText;
  elements.dailyAllowanceDetail.textContent = remaining < 0
    ? `${money.format(Math.abs(remaining))} over budget; ${daysLeft} day${daysLeft === 1 ? '' : 's'} left including today.`
    : `${money.format(Math.max(0, remaining))} remaining across ${daysLeft} day${daysLeft === 1 ? '' : 's'} including today.`;
}

function renderCategoryHealth() {
  const monthExpenses = currentMonthExpenses();
  const categoryTotals = Object.fromEntries(CATEGORIES.map((category) => [category, monthExpenses
    .filter((expense) => expense.category === category)
    .reduce((sum, expense) => sum + Number(expense.amount), 0)]));
  const categoryBudget = budget / CATEGORIES.length;
  elements.categoryHealthList.innerHTML = [...CATEGORIES]
    .sort((first, second) => categoryTotals[second] - categoryTotals[first])
    .map((category) => {
      const amount = categoryTotals[category];
      const usage = categoryBudget > 0 ? (amount / categoryBudget) * 100 : amount > 0 ? 100 : 0;
      const state = categoryBudget === 0
        ? amount > 0 ? 'over' : 'none'
        : usage >= 100 ? 'over' : usage >= 70 ? 'tight' : 'safe';
      const status = state === 'over' ? 'Over guide' : state === 'tight' ? 'Watch' : state === 'none' ? 'No allocation' : 'On track';
      const guideText = categoryBudget > 0
        ? `${Math.round(usage)}% of ${money.format(categoryBudget)} guide`
        : amount > 0 ? 'Any spend exceeds the $0 guide' : 'No budget allocated';
      return `<div class="health-row health-${state}">
        <div class="health-row-heading"><strong><span class="health-dot" style="--category-color:${CATEGORY_COLORS[category]}"></span>${category}</strong><span>${money.format(amount)}</span></div>
        <div class="health-track" role="progressbar" aria-label="${category} category guide usage" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.min(100, Math.round(usage))}"><i style="width:${Math.min(100, usage)}%"></i></div>
        <div class="health-row-foot"><span>${guideText}</span><b>${status}</b></div>
      </div>`;
    }).join('');
  const share = Math.round(100 / CATEGORIES.length);
  document.querySelector('.category-health-note').textContent = budget > 0
    ? `Each category is compared with ${share}% (${money.format(categoryBudget)}) of your monthly budget.`
    : 'Your monthly budget is $0, so any category spending is above its guide.';
}

function daysBetween(firstDate, secondDate) {
  const [firstYear, firstMonth, firstDay] = firstDate.split('-').map(Number);
  const [secondYear, secondMonth, secondDay] = secondDate.split('-').map(Number);
  return Math.abs(Date.UTC(secondYear, secondMonth - 1, secondDay) - Date.UTC(firstYear, firstMonth - 1, firstDay)) / 86400000;
}

function recurringPattern(group, label, minimumCount) {
  const ordered = [...group].sort((first, second) => first.date.localeCompare(second.date));
  const uniqueDates = [...new Set(ordered.map((expense) => expense.date))];
  if (ordered.length < minimumCount || uniqueDates.length < 2) return null;
  const amounts = ordered.map((expense) => Number(expense.amount));
  const averageAmount = amounts.reduce((sum, amount) => sum + amount, 0) / amounts.length;
  if (averageAmount <= 0 || Math.max(...amounts) - Math.min(...amounts) > averageAmount * 0.1) return null;
  const intervals = uniqueDates.slice(1).map((date, index) => daysBetween(uniqueDates[index], date));
  const averageInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
  if (averageInterval < 7 || averageInterval > 62) return null;
  return {
    label,
    count: ordered.length,
    averageAmount,
    monthlyEstimate: averageAmount * (30.4375 / averageInterval),
    interval: averageInterval,
    ids: ordered.map((expense) => expense.id),
  };
}

function renderRecurring() {
  const validExpenses = expenses.filter(isValidExpense);
  const namedGroups = new Map();
  validExpenses.forEach((expense) => {
    const normalizedName = expense.name.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
    if (!normalizedName) return;
    const key = `${expense.category}:${normalizedName}`;
    if (!namedGroups.has(key)) namedGroups.set(key, []);
    namedGroups.get(key).push(expense);
  });
  const patterns = [...namedGroups.values()]
    .map((group) => recurringPattern(group, group[0].name, 2))
    .filter(Boolean);
  const matchedIds = new Set(patterns.flatMap((pattern) => pattern.ids));
  const categoryGroups = new Map();
  validExpenses.filter((expense) => !matchedIds.has(expense.id)).forEach((expense) => {
    if (!categoryGroups.has(expense.category)) categoryGroups.set(expense.category, []);
    categoryGroups.get(expense.category).push(expense);
  });
  categoryGroups.forEach((group, category) => {
    const pattern = recurringPattern(group, `${category} · similar costs`, 3);
    if (pattern) patterns.push(pattern);
  });
  patterns.sort((first, second) => second.monthlyEstimate - first.monthlyEstimate);
  const monthlyTotal = patterns.reduce((sum, pattern) => sum + pattern.monthlyEstimate, 0);
  elements.recurringTotal.textContent = `${money.format(monthlyTotal)} estimated monthly`;
  elements.recurringList.innerHTML = patterns.length
    ? patterns.map((pattern) => `<li><span><strong>${escapeHTML(pattern.label)}</strong><small>${pattern.count} similar entries · about every ${Math.round(pattern.interval)} days</small></span><b>${money.format(pattern.monthlyEstimate)}/mo</b></li>`).join('')
    : '<li class="recurring-empty">No recurring pattern found yet. Repeated, similarly priced entries are needed.</li>';
}

function renderSimulator() {
  const category = elements.simulatorCategory.value;
  const reduction = Number(elements.simulatorReduction.value);
  const current = currentMonthExpenses()
    .filter((expense) => expense.category === category)
    .reduce((sum, expense) => sum + Number(expense.amount), 0);
  const savings = current * reduction / 100;
  const projected = current - savings;
  elements.simulatorReductionValue.value = `${reduction}%`;
  elements.simulatorReductionValue.textContent = `${reduction}%`;
  elements.simulatorSavings.textContent = money.format(savings);
  elements.simulatorCurrentAmount.textContent = money.format(current);
  elements.simulatorProjectedAmount.textContent = money.format(projected);
  elements.simulatorCurrentBar.style.width = current > 0 ? '100%' : '0%';
  elements.simulatorProjectedBar.style.width = current > 0 ? `${100 - reduction}%` : '0%';
  elements.simulatorSummary.textContent = current > 0
    ? `A ${reduction}% reduction from ${category} would leave ${money.format(projected)} in this month's recorded spend.`
    : `No ${category} spending is recorded this month, so this scenario saves $0.00.`;
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
}

function renderExpenses() {
  const filter = elements.categoryFilter.value;
  const query = elements.searchInput.value.trim().toLowerCase();
  const startDate = elements.dateFrom.value;
  const endDate = elements.dateTo.value;
  const visible = [...expenses]
    .filter((expense) => filter === 'all' || expense.category === filter)
    .filter((expense) => `${expense.name} ${expense.category}`.toLowerCase().includes(query))
    .filter((expense) => (!startDate || expense.date >= startDate) && (!endDate || expense.date <= endDate))
    .sort((first, second) => second.date.localeCompare(first.date) || second.id.localeCompare(first.id));
  elements.expenseCount.textContent = String(visible.length);
  elements.emptyState.hidden = visible.length > 0;
  elements.expenseList.innerHTML = visible.map((expense) => `<tr>
    <td class="expense-name">${escapeHTML(expense.name)}</td>
    <td><span class="expense-category" style="--category-color:${CATEGORY_COLORS[expense.category]}">${expense.category}</span></td>
    <td>${new Date(`${expense.date}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
    <td class="amount-cell">${money.format(Number(expense.amount))}</td>
    <td><div class="row-actions"><button class="icon-button" type="button" data-action="edit" data-id="${escapeHTML(expense.id)}" aria-label="Edit ${escapeHTML(expense.name)}" title="Edit">✎</button><button class="icon-button delete-button" type="button" data-action="delete" data-id="${escapeHTML(expense.id)}" aria-label="Delete ${escapeHTML(expense.name)}" title="Delete">×</button></div></td>
  </tr>`).join('');
}

function render() {
  renderOverview();
  renderTrend();
  renderCategories();
  renderInsights();
  renderDailyAllowance();
  renderCategoryHealth();
  renderRecurring();
  renderSimulator();
  renderExpenses();
}

function downloadFile(filename, content, type) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.hidden = true;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function exportJSON() {
  const backup = {
    format: 'campus-ledger-backup-v1',
    exportedAt: new Date().toISOString(),
    budget,
    expenses: expenses.filter(isValidExpense),
  };
  downloadFile('campus-ledger-backup.json', JSON.stringify(backup, null, 2), 'application/json');
  elements.dataStatus.textContent = 'JSON backup downloaded.';
}

function exportCSV() {
  const quote = (value) => `"${String(value).replace(/"/g, '""')}"`;
  const rows = [
    ['id', 'name', 'category', 'amount', 'date'],
    ...expenses.filter(isValidExpense).map(({ id, name, category, amount, date }) => [id, name, category, amount, date]),
  ];
  const csv = rows.map((row) => row.map(quote).join(',')).join('\r\n');
  downloadFile('campus-ledger-expenses.csv', `\uFEFF${csv}`, 'text/csv;charset=utf-8');
  elements.dataStatus.textContent = 'CSV export downloaded.';
}

function importJSONFile(file) {
  const reader = new FileReader();
  reader.addEventListener('load', () => {
    try {
      const payload = JSON.parse(String(reader.result));
      const source = Array.isArray(payload) ? payload : payload && Array.isArray(payload.expenses) ? payload.expenses : null;
      if (!source) throw new Error('Choose an expense array or a Campus Ledger JSON backup.');
      if (source.some((expense) => !isValidExpense(expense) || !expense.name.trim())) {
        throw new Error('The JSON contains an invalid expense. No data was changed.');
      }
      const importedExpenses = source.filter((expense) => !expense.id.startsWith('sample-'))
        .map((expense) => ({ ...expense, amount: Number(expense.amount) }));
      if (new Set(importedExpenses.map((expense) => expense.id)).size !== importedExpenses.length) {
        throw new Error('The JSON contains duplicate expense IDs. No data was changed.');
      }
      const importsBudget = !Array.isArray(payload) && Object.hasOwn(payload, 'budget');
      const importedBudget = importsBudget ? Number(payload.budget) : budget;
      if (importsBudget && (!Number.isFinite(importedBudget) || importedBudget < 0)) {
        throw new Error('The JSON budget must be a valid non-negative number.');
      }
      if (!window.confirm(`Replace your current ledger with ${importedExpenses.length} expense${importedExpenses.length === 1 ? '' : 's'}${importsBudget ? ' and the backup budget' : ''}?`)) return;
      expenses = importedExpenses;
      budget = importedBudget;
      persist();
      localStorage.setItem(BUDGET_KEY, String(budget));
      elements.dataStatus.textContent = `Imported ${expenses.length} expense${expenses.length === 1 ? '' : 's'}.`;
      render();
    } catch (error) {
      elements.dataStatus.textContent = error instanceof Error ? error.message : 'Could not read this JSON file.';
    }
  });
  reader.addEventListener('error', () => {
    elements.dataStatus.textContent = 'Could not read this JSON file.';
  });
  reader.readAsText(file);
}

function openExpenseDialog(expense = null) {
  editingId = expense?.id ?? null;
  elements.form.reset();
  elements.dialogTitle.textContent = expense ? 'Edit expense' : 'Add an expense';
  elements.saveButton.textContent = expense ? 'Save changes' : 'Save expense';
  elements.nameInput.value = expense?.name ?? '';
  elements.amountInput.value = expense?.amount ?? '';
  elements.categoryInput.value = expense?.category ?? 'Food';
  elements.dateInput.value = expense?.date ?? dateInputValue(today);
  elements.dialog.showModal();
  elements.nameInput.focus();
}

document.querySelector('#add-expense').addEventListener('click', () => openExpenseDialog());
document.querySelectorAll('.close-dialog').forEach((button) => button.addEventListener('click', () => elements.dialog.close()));
elements.dialog.addEventListener('click', (event) => {
  if (event.target === elements.dialog) elements.dialog.close();
});
elements.form.addEventListener('submit', (event) => {
  event.preventDefault();
  const expense = {
    id: editingId ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    name: elements.nameInput.value.trim(),
    amount: Math.round(Number(elements.amountInput.value) * 100) / 100,
    category: elements.categoryInput.value,
    date: elements.dateInput.value,
  };
  if (!expense.name || !Number.isFinite(expense.amount) || expense.amount <= 0 || !expense.date) return;
  if (editingId) expenses = expenses.map((item) => item.id === editingId ? expense : item);
  else expenses.push(expense);
  persist();
  elements.dialog.close();
  render();
});
elements.expenseList.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-action]');
  if (!button) return;
  const expense = expenses.find((item) => item.id === button.dataset.id);
  if (!expense) return;
  if (button.dataset.action === 'edit') openExpenseDialog(expense);
  if (button.dataset.action === 'delete' && window.confirm(`Delete "${expense.name}"?`)) {
    expenses = expenses.filter((item) => item.id !== expense.id);
    persist();
    render();
  }
});
elements.categoryFilter.addEventListener('change', renderExpenses);
elements.searchInput.addEventListener('input', renderExpenses);
elements.dateFrom.addEventListener('change', renderExpenses);
elements.dateTo.addEventListener('change', renderExpenses);
document.querySelector('#clear-filters').addEventListener('click', () => {
  elements.categoryFilter.value = 'all';
  elements.searchInput.value = '';
  elements.dateFrom.value = '';
  elements.dateTo.value = '';
  renderExpenses();
});
elements.simulatorCategory.addEventListener('change', renderSimulator);
elements.simulatorReduction.addEventListener('input', renderSimulator);
document.querySelector('#export-csv').addEventListener('click', exportCSV);
document.querySelector('#export-json').addEventListener('click', exportJSON);
document.querySelector('#import-json').addEventListener('click', () => elements.importFile.click());
elements.importFile.addEventListener('change', () => {
  if (elements.importFile.files?.[0]) importJSONFile(elements.importFile.files[0]);
  elements.importFile.value = '';
});
document.querySelector('#edit-budget').addEventListener('click', () => {
  elements.budgetInput.value = String(budget);
  elements.budgetForm.hidden = !elements.budgetForm.hidden;
  if (!elements.budgetForm.hidden) elements.budgetInput.focus();
});
elements.budgetForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const value = Number(elements.budgetInput.value);
  if (!Number.isFinite(value) || value < 0) return;
  budget = value;
  localStorage.setItem(BUDGET_KEY, String(budget));
  elements.budgetForm.hidden = true;
  render();
});

elements.todayLabel.textContent = today.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
if (localStorage.getItem(STORAGE_KEY) === null) persist();
render();
