import { useState, useEffect } from 'react';

export default function Home() {
  const [walletAddress, setWalletAddress] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const currencyMap = {
    "d897904c-6dfb-4b43-a036-4938f96e7b51": "Keys",
    "575d32ce-3b1f-469f-a08f-392e3d3b0812": "Boxes",
    "fea6109c-8549-45d2-a974-d8531f64994d": "Points"
  };

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/getTransactions?walletAddress=${walletAddress}`);
      const data = await res.json();
      console.log(data);
      setTransactions(data.data || []);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const calculatePointsSum = (transactions) => {
    let totalPointsCredits = 0;
    let totalPointsDebits = 0;

    transactions.forEach((tx) => {
      const amount = parseInt(tx.amount, 10);
      if (tx.loyaltyCurrencyId === "fea6109c-8549-45d2-a974-d8531f64994d") {
        if (tx.direction === 'credit') {
          totalPointsCredits += amount;
        } else if (tx.direction === 'debit') {
          totalPointsDebits += amount;
        }
      }
    });

    return totalPointsCredits - totalPointsDebits;
  };

  const totalPoints = calculatePointsSum(transactions);

  const exportToCSV = () => {
    if (!transactions || transactions.length === 0) return;

    const headers = [
      'Timestamp',
      'Loyalty Rule Name',
      'Loyalty Rule Description',
      'Amount',
      'Direction',
      'Currency'
    ];

    const rows = transactions.map((tx) => {
      const currencyName = currencyMap[tx.loyaltyCurrencyId] || 'Unknown Currency';
      const loyaltyRule = tx.loyaltyTransaction.loyaltyRule || {};
      return [
        new Date(tx.createdAt).toISOString(),
        loyaltyRule.name || '',
        loyaltyRule.description || '',
        tx.amount,
        tx.direction,
        currencyName
      ];
    });

    const csvContent = [headers, ...rows]
      .map((e) => e.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${walletAddress}_transactions.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const backgroundColor = darkMode ? '#1e1e1e' : '#ffffff';
  const textColor = darkMode ? '#ffffff' : '#000000';

  return (
    <div style={{ padding: '2rem', backgroundColor, color: textColor, minHeight: '100vh' }}>
      {/* Top Section Centered */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{
          textAlign: 'center',
          fontFamily: 'Epilogue, sans-serif'
        }}>
          Flow Rewards Transaction Viewer
        </h1>

        <div>
          <input
            type="text"
            placeholder="Enter wallet address"
            value={walletAddress}
            onChange={(e) => setWalletAddress(e.target.value)}
            style={{
              width: '325px',
              padding: '0.5rem',
              marginRight: '1rem',
              backgroundColor: darkMode ? '#333' : '#fff',
              color: darkMode ? '#fff' : '#000',
              border: '1px solid #ccc',
              borderRadius: '5px',
            }}
          />
          <button onClick={fetchTransactions} style={{
            padding: '0.5rem 1rem',
            backgroundColor: darkMode ? '#555' : '#eee',
            color: darkMode ? '#fff' : '#000',
            border: '1px solid #999',
            borderRadius: '5px',
            cursor: 'pointer',
          }}>
            Fetch Transactions
          </button>
        </div>
      </div>

      {loading && <p style={{ textAlign: 'center' }}>Loading...</p>}

      {transactions && transactions.length > 0 && (
        <>
          <div style={{
            marginBottom: '2rem',
            backgroundColor: darkMode ? '#2d2d2d' : '#f0f8ff',
            padding: '1.5rem',
            borderRadius: '5px',
            textAlign: 'center'
          }}>
            <strong style={{ fontSize: '1.5rem', color: '#2d8b38', fontWeight: 'bold' }}>
              Total Points: {totalPoints}
            </strong>
          </div>

          <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
            <button
              onClick={exportToCSV}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: darkMode ? '#333' : '#ddd',
                color: darkMode ? '#fff' : '#000',
                border: '1px solid #aaa',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Export to CSV
            </button>
          </div>
        </>
      )}

      {/* Results Section Left-Aligned */}
      <div>
        {transactions && transactions.length > 0 ? (
          <ul>
            {transactions.map((tx) => {
              const currencyName = currencyMap[tx.loyaltyCurrencyId] || "Unknown Currency";
              const amountColor = tx.direction === 'credit' ? 'green' : 'red';
              const loyaltyRule = tx.loyaltyTransaction.loyaltyRule;
              const loyaltyRuleName = loyaltyRule ? loyaltyRule.name : 'No loyalty rule';
              const loyaltyRuleDescription = loyaltyRule ? loyaltyRule.description : '';

              return (
                <li key={tx.id} style={{ marginBottom: '1rem' }}>
                  <strong>Timestamp:</strong> {new Date(tx.createdAt).toLocaleString()} <br />
                  <strong>Loyalty Rule:</strong> {loyaltyRuleName}
                  {loyaltyRuleDescription && ` (${loyaltyRuleDescription})`}
                  <br />
                  <strong>Amount: </strong>
                  <span style={{ color: amountColor }}>
                    {tx.amount} {currencyName}
                  </span>
                  <br />
                  <hr />
                </li>
              );
            })}
          </ul>
        ) : (
          !loading && <p style={{ textAlign: 'center' }}>No transactions found</p>
        )}
      </div>
    </div>
  );
}
