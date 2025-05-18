import { useState } from 'react';

export default function Home() {
  const [walletAddress, setWalletAddress] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  // Currency ID to Name mapping
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
      console.log(data); // Log to check the structure
      setTransactions(data.data || []);  // Make sure you're using data.data
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  // Calculate the total credits, debits, and total for Points currency
  const calculatePointsSum = (transactions) => {
    let totalPointsCredits = 0;
    let totalPointsDebits = 0;

    transactions.forEach((tx) => {
      const amount = parseInt(tx.amount, 10);

      // Process Points currency only
      if (tx.loyaltyCurrencyId === "fea6109c-8549-45d2-a974-d8531f64994d") {
        if (tx.direction === 'credit') {
          totalPointsCredits += amount;  // Add credit amount
        } else if (tx.direction === 'debit') {
          totalPointsDebits += amount;   // Add debit amount
        }
      }
    });

    // Subtract Debits from Credits for Points currency
    const totalPoints = totalPointsCredits - totalPointsDebits;
    return totalPoints;
  };

  const totalPoints = calculatePointsSum(transactions);

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Flow Rewards Transaction Viewer</h1>
      <input
        type="text"
        placeholder="Enter wallet address"
        value={walletAddress}
        onChange={(e) => setWalletAddress(e.target.value)}
        style={{ width: '300px', padding: '0.5rem', marginRight: '1rem' }}
      />
      <button onClick={fetchTransactions}>Fetch Transactions</button>

      {loading && <p>Loading...</p>}

      {/* Custom Summary Line - Total Points styled for emphasis */}
      {transactions && transactions.length > 0 && (
        <div style={{ marginBottom: '1rem', backgroundColor: '#f0f8ff', padding: '1rem', borderRadius: '5px' }}>
          <strong style={{ fontSize: '1.5rem', color: '#2d8b38', fontWeight: 'bold' }}>
            Total Points: {totalPoints}
          </strong>
        </div>
      )}

      {transactions && transactions.length > 0 ? (
        <ul>
          {transactions.map((tx) => {
            // Get the human-readable currency name from the currencyMap
            const currencyName = currencyMap[tx.loyaltyCurrencyId] || "Unknown Currency";
            const amountColor = tx.direction === 'credit' ? 'green' : 'red';

            // Check if loyaltyRule exists before accessing its properties
            const loyaltyRule = tx.loyaltyTransaction.loyaltyRule;
            const loyaltyRuleName = loyaltyRule ? loyaltyRule.name : 'No loyalty rule';
            const loyaltyRuleDescription = loyaltyRule ? loyaltyRule.description : '';

            return (
              <li key={tx.id} style={{ marginBottom: '1rem' }}>
                <strong>Timestamp:</strong> {new Date(tx.createdAt).toLocaleString()} <br />

                {/* Loyalty Transaction Name and Description combined */}
                <strong>Loyalty Rule:</strong> {loyaltyRuleName}
                {loyaltyRuleDescription && ` (${loyaltyRuleDescription})`}
                <br />

                {/* Amount with conditional color and a space added after Amount */}
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
        <p>No transactions found</p>
      )}
    </div>
  );
}
