// DOM Elements
const accountNumber = document.getElementById('accountNumber');
const availableFunds = document.getElementById('availableFunds');
const income = document.getElementById('income');
const expenses = document.getElementById('expenses');
const totalBalance = document.getElementById('totalBalance');
const totalSpending = document.getElementById('totalSpending');
const totalSaved = document.getElementById('totalSaved');
const cardsGrid = document.getElementById('cardsGrid');
const dailyIncome = document.getElementById('dailyIncome');
const dailyExpenses = document.getElementById('dailyExpenses');
const weeklyIncome = document.getElementById('weeklyIncome');
const weeklyExpenses = document.getElementById('weeklyExpenses');
const monthlyIncome = document.getElementById('monthlyIncome');
const monthlyExpenses = document.getElementById('monthlyExpenses');
const transactionsTable = document.getElementById('transactionsTable').getElementsByTagName('tbody')[0];
const addMoneyBtn = document.getElementById('addMoneyBtn');
const addMoneyCardBtn = document.getElementById('addMoneyCardBtn');
const addMoneyModal = document.getElementById('addMoneyModal');
const addMoneyForm = document.getElementById('addMoneyForm');
const cashflowChart = document.getElementById('cashflowChart');

// Fetch account data
async function fetchAccountData() {
  try {
    const response = await fetch('/api/account');
    const data = await response.json();
    updateDashboard(data);
  } catch (error) {
    console.error('Error fetching account data:', error);
  }
}

// Update dashboard with account data
function updateDashboard(data) {
  accountNumber.textContent = data.accountNumber;
  availableFunds.textContent = formatCurrency(data.availableFunds);
  income.textContent = formatCurrency(data.cashflow.monthly.income);
  expenses.textContent = formatCurrency(data.cashflow.monthly.expenses);
  totalBalance.textContent = formatCurrency(data.totalBalance);
  totalSpending.textContent = formatCurrency(data.totalSpending);
  totalSaved.textContent = formatCurrency(data.totalSaved);

  // Update cards
  cardsGrid.innerHTML = '';
  data.cards.forEach(card => {
    const cardElement = document.createElement('div');
    cardElement.className = 'card';
    cardElement.innerHTML = `
      <h3>Card ${card.number}</h3>
      <p>Available: ${formatCurrency(card.funds)}</p>
      <p>Expires: ${card.expiration}</p>
      <p>CVV: ${card.cvv}</p>
    `;
    cardsGrid.appendChild(cardElement);
  });

  // Update cashflow
  dailyIncome.textContent = formatCurrency(data.cashflow.daily.income);
  dailyExpenses.textContent = formatCurrency(data.cashflow.daily.expenses);
  weeklyIncome.textContent = formatCurrency(data.cashflow.weekly.income);
  weeklyExpenses.textContent = formatCurrency(data.cashflow.weekly.expenses);
  monthlyIncome.textContent = formatCurrency(data.cashflow.monthly.income);
  monthlyExpenses.textContent = formatCurrency(data.cashflow.monthly.expenses);

  // Update transactions
  transactionsTable.innerHTML = '';
  data.transactions.forEach(transaction => {
    const row = transactionsTable.insertRow();
    row.innerHTML = `
      <td>${transaction.date}</td>
      <td>${transaction.type}</td>
      <td>${transaction.method}</td>
      <td class="${transaction.amount >= 0 ? 'positive' : 'negative'}">${formatCurrency(transaction.amount)}</td>
    `;
  });

  // Update cashflow chart
  updateCashflowChart(data.cashflow);
}

// Format currency
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

// Update cashflow chart
function updateCashflowChart(cashflow) {
  const ctx = cashflowChart.getContext('2d');
  const income = [cashflow.daily.income, cashflow.weekly.income, cashflow.monthly.income];
  const expenses = [cashflow.daily.expenses, cashflow.weekly.expenses, cashflow.monthly.expenses];

  // Clear previous chart
  ctx.clearRect(0, 0, cashflowChart.width, cashflowChart.height);

  // Set chart properties
  const chartWidth = cashflowChart.width;
  const chartHeight = cashflowChart.height;
  const barWidth = chartWidth / 7;
  const maxValue = Math.max(...income, ...expenses);

  // Draw bars
  for (let i = 0; i < 3; i++) {
    const x = i * (barWidth * 2) + barWidth;
    
    // Income bar
    ctx.fillStyle = '#4CAF50';
    const incomeHeight = (income[i] / maxValue) * chartHeight;
    ctx.fillRect(x, chartHeight - incomeHeight, barWidth / 2, incomeHeight);

    // Expenses bar
    ctx.fillStyle = '#ff6b6b';
    const expensesHeight = (expenses[i] / maxValue) * chartHeight;
    ctx.fillRect(x + barWidth / 2, chartHeight - expensesHeight, barWidth / 2, expensesHeight);

    // Labels
    ctx.fillStyle = '#ffffff';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(['Daily', 'Weekly', 'Monthly'][i], x + barWidth / 2, chartHeight - 10);
  }
}

// Add money modal
addMoneyBtn.addEventListener('click', () => addMoneyModal.style.display = 'block');
addMoneyCardBtn.addEventListener('click', () => addMoneyModal.style.display = 'block');

addMoneyForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const amount = parseFloat(document.getElementById('amount').value);
  
  try {
    const response = await fetch('/api/add-money', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ amount }),
    });
    
    const result = await response.json();
    
    if (result.success) {
      addMoneyModal.style.display = 'none';
      addMoneyForm.reset();
      fetchAccountData();
    } else {
      alert('Failed to add money. Please try again.');
    }
  } catch (error) {
    console.error('Error adding money:', error);
    alert('An error occurred. Please try again.');
  }
});

// Close modal when clicking outside
window.addEventListener('click', (e) => {
  if (e.target === addMoneyModal) {
    addMoneyModal.style.display = 'none';
  }
});

// Initial fetch
fetchAccountData();