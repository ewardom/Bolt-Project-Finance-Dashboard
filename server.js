import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static('public'));

// Parse JSON bodies
app.use(express.json());

// Mock data
const accountData = {
  accountNumber: '**** **** **** 1234',
  availableFunds: 5000,
  totalBalance: 10000,
  totalSpending: 2000,
  totalSaved: 3000,
  cards: [
    { number: '**** **** **** 5678', funds: 2000, expiration: '12/25', cvv: '***' },
    { number: '**** **** **** 9012', funds: 1500, expiration: '06/24', cvv: '***' }
  ],
  cashflow: {
    daily: { income: 200, expenses: 150 },
    weekly: { income: 1400, expenses: 1050 },
    monthly: { income: 6000, expenses: 4500 }
  },
  transactions: [
    { date: '2023-04-01', type: 'Food', method: 'Card payment', amount: -50 },
    { date: '2023-04-02', type: 'Salary', method: 'Transfer', amount: 3000 },
    { date: '2023-04-03', type: 'Clothes', method: 'Card payment', amount: -150 },
    { date: '2023-04-04', type: 'Utilities', method: 'Transfer', amount: -200 }
  ]
};

// API routes
app.get('/api/account', (req, res) => {
  res.json(accountData);
});

app.post('/api/add-money', (req, res) => {
  const { amount } = req.body;
  if (typeof amount !== 'number' || amount <= 0) {
    return res.status(400).json({ error: 'Invalid amount' });
  }
  accountData.availableFunds += amount;
  accountData.totalBalance += amount;
  res.json({ success: true, newBalance: accountData.availableFunds });
});

// Serve the main HTML file for all routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});