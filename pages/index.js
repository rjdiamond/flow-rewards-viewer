import { useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function Home() {
  const [walletAddress, setWalletAddress] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('All Transactions');
  const [assets, setAssets] = useState([]);

  const currencyMap = {
    "d897904c-6dfb-4b43-a036-4938f96e7b51": "Keys",
    "575d32ce-3b1f-469f-a08f-392e3d3b0812": "Boxes",
    "fea6109c-8549-45d2-a974-d8531f64994d": "Points"
  };

  // Define filters (FILTERS constant remains the same as original)
  const FILTERS = {
    'Bridging': [
      "4e0e6225-65dd-4280-8683-3e2dbbad9697",
      "b32a87fc-0a63-4a16-be16-05026e001859"
    ],
    'Protocol: Beezie': [
      "e4001ba6-7cc2-426e-812c-767818ff4e65",
      "6d41fb3c-f80f-4034-b97c-44651dac203b",
      "fceb1c4b-b3f2-4fa7-a7c5-2cdf2d074831",
      "7c6545b3-374e-4d9a-819f-7c523aec5666"
    ],
    'Protocol: CryptoKitties': [
      "974b173f-fd2c-42e7-a3b9-51662f97dd29",
    ],
    'Protocol: Kittypunch': [
      "c016432f-dbbf-4b7d-9df4-ad82e4682ba6"
    ],
    'Protocol: NBA Top Shot': [
      "e206194f-b9a8-4161-aee2-254ca65be54c",
    ],
    'Protocol: Sturdy': [
      "3e3f78cf-0d3b-42ea-9e7a-2236a8c2b73a",
      "d251d32d-e100-4ecb-8461-8a9cb8ae3192",
    ],
    'Flow Rewards: Check-Ins': [
      "a54954ef-158b-496c-8999-5402210604a2",
      "ca6e55a5-38f7-4215-b673-b69ce0e04000"
    ],
    'Flow Rewards: Discord': [
      "097c46f9-6406-4aac-a568-924556a47c35",
      "d513bb5c-47c7-412a-b023-33cc886a7410"
    ],
    'Flow Rewards: Learnings': [
      "653d6fca-8bd7-4e4f-8f44-1ee2035a0658",
    ],
    'Flow Rewards: Twitter': [
      "f775bf47-785b-4623-a890-a43bb7e1fb9b",
    ],
    'Flow Rewards: Twitter Follows': [
      "d16381cd-69ed-4682-84ce-18963df6e8dc",
      "08918c28-1e80-4126-875b-13eb21e2db8e",
      "b06e4791-927a-4381-9fec-2d639f9c6bbd",
      "dff0cf73-04d2-43b6-9a60-a7dca3b18d17",
      "fcae04a1-ee5f-4cfc-9134-7d77832b4b11",
      "7210d440-d6db-41ea-b316-a9336acf7f21",
      "28b403b7-77e1-4de4-9319-dfabc1f66f04",
      "c8b96fed-12c2-4dc5-840c-5a4f470c43fd",
      "7336d04d-8021-4cae-b000-420a7fb25efc",
      "6c492874-f75f-46bb-a350-e01dc748ed8b",
      "5214dfb7-9549-4ef0-80f4-1215ef5bfe49",
      "33cc9be9-d004-43a5-83a7-1854cbd18be4",
      "7fb9c131-e150-421b-be85-d7493585051a",
      "0824bf98-c8c5-4b23-87b5-974e5f157bca",
      "23f3135b-efc1-43d2-83cc-d9f02c71f34d",
      "d2eae75f-69ae-4bab-97a8-c3ef042590a1",
      "f4e723c3-87ff-4e0c-89eb-1a9e1ce42241",
      "51c9717b-345f-48a9-94dd-ae841869b538",
      "3b9429c4-e7c7-4650-8a18-a42c5f523d3c",
      "054a9cf5-8192-4bd2-990c-f2f5cf51e101",
      "40004f38-7947-4ab3-a491-ab9e011e3553",
      "80908a34-ced3-4a5e-90ee-f5edcc50b4df",
      "5749fc00-c533-48ed-8054-604d1b756adc",
      "894bd195-eff0-4651-85e6-68158fed9409",
      "1639600b-afb6-438b-8fe0-e04e5897777a",
      "2d207fdb-5a87-41d0-9f1a-3f59896878f2",
      "b2f745dc-7612-4739-afbd-b508dd47a66e",
      "3e133fe9-feca-457b-9c96-65998354ec39",
      "9ab801b0-4180-4bc4-acc3-9ab22bc1cbc3",
      "1937f3c5-48d2-4676-807b-3c8c179ab303",
      "70b3f8e5-d7c2-44de-aa6e-16272904ddb3",
      "e86adf06-fc09-447f-b151-bb48a125b457",
      "1409fb2d-3cc6-458f-ae0c-b0d8492a43d3"
    ],
    'Flow Rewards: Visit Protocol': [
      "65c0f7c9-7192-4126-9c16-653f59977346",
      "01a04a9d-5b04-4f65-91cf-41326ace585d",
      "a6e1872d-d37f-4684-840a-2d88d5e00e1a",
      "da352c89-a975-43cd-94b4-38f42a8c96e3",
      "e76b318e-39a9-41a3-b4a8-4ebf3877523e",
      "d2de67ab-e52c-4be1-ac00-85ff54a2593f",
      "42a27f8c-7537-45ff-8ae6-248c9a970ba9",
      "8b32edaf-7cd2-48b0-bbf9-a4eaba6a749b",
      "11b56d16-6434-4671-b8fa-631055c4daa7",
      "de32f1e3-a9e6-4b1b-8bb7-de588f08ecf9",
      "50185481-5fc5-4f3a-85fe-8c4f3b67ee71",
      "62c12456-2395-4fee-ba41-779b9f2598b4",
      "61ad8138-e007-40d2-ab61-0bbcbf73e648",
      "93a3424f-64a6-47f2-8de3-b4b2b768348a",
      "89bf88a1-48cf-4fda-8b70-2b5ec987bf05",
      "bd38cf3d-42ad-4055-b092-38022fe35de7",
      "1b8c67d2-9cc7-4076-859d-af1639215ed5",
      "58cced75-7245-40c5-b770-5f908ccbc2b8",
      "c0707432-4123-413c-b1df-3358a2af2d77",
      "c9c26516-3253-435e-9c9f-5bd684719a0d",
      "6ed75179-338d-40a9-a13f-2faeca0663fe",
      "1bb1bbdf-a7de-4d6a-af49-cdc92fd138d1",
      "53a881c2-1cd5-4232-88f4-540cbacdc0bc",
      "884b6d83-2cdf-41ff-b85a-623fa72d38cc",
      "244da1b6-95e5-48bd-8c66-854737438c7d",
      "ed3c265f-00f8-4387-8d87-46f6a84e703e",
      "f40ebc85-7a7e-4c10-92f0-e3b9a0cc2f8d",
      "f46f5216-c45a-4ccf-aecd-60ac2f367028"
    ],
  };


  const allFilteredIds = Object.values(FILTERS).flat();
  const allFilterNames = Object.keys(FILTERS);

  const activeFilters = allFilterNames.filter(filterName =>
    transactions.some(tx => FILTERS[filterName].includes(tx.loyaltyTransaction?.loyaltyRule?.id))
  );

  const includesBoxesUnlocked = transactions.some(tx =>
    tx.loyaltyTransaction?.description?.toLowerCase().includes(walletAddress.toLowerCase())
  );

  if (includesBoxesUnlocked) {
    activeFilters.push('Boxes Unlocked');
  }

  const includesAssetClaimed = transactions.some(tx => tx.matchedAsset);

  if (includesAssetClaimed) {
    activeFilters.push('Asset Claimed');
  }

  const uniqueFilterOptions = [
    'All Transactions',
    'Asset Claimed',
    'Boxes Unlocked',
    ...activeFilters.filter(f => f !== 'Boxes Unlocked' && f !== 'All Transactions' && f !== 'Asset Claimed'),
    'Other',
  ];

  const boxesUnlockedIds = new Set(
    transactions
      .filter(tx =>
        tx.loyaltyTransaction?.description?.toLowerCase().includes(walletAddress.toLowerCase())
      )
      .map(tx => tx.loyaltyTransaction?.loyaltyRule?.id)
  );

  const filteredTransactions = (() => {
    if (filter === 'All Transactions') return transactions;
    if (filter === 'Other') {
      return transactions.filter(tx => {
        const id = tx.loyaltyTransaction?.loyaltyRule?.id;
        return !allFilteredIds.includes(id) && !boxesUnlockedIds.has(id) && !tx.matchedAsset;
      });
    }
    if (filter === 'Boxes Unlocked') {
      return transactions.filter(tx =>
        tx.loyaltyTransaction?.description?.toLowerCase().includes(walletAddress.toLowerCase())
      );
    }
    if (filter === 'Asset Claimed') {
      return transactions.filter(tx => tx.matchedAsset);
    }
    return transactions.filter(tx =>
      FILTERS[filter]?.includes(tx.loyaltyTransaction?.loyaltyRule?.id)
    );
  })();

  const transactionsWithAssetName = transactions.map(tx => {
    const mintingAssetId = tx.loyaltyTransaction?.metadata?.mintingContractAssetId;
    const matchedAsset = mintingAssetId
      ? assets.find(asset => String(asset.id) === String(mintingAssetId))
      : null;
    return {
      ...tx,
      assetName: matchedAsset ? matchedAsset.name : null,
      hasAssetClaim: Boolean(mintingAssetId),
    };
  });

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/getTransactions?walletAddress=${walletAddress}`);
      const data = await res.json();
      setTransactions(data.transactions || []);
      setAssets(data.assets || []);
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

  const prepareChartData = (transactions) => {
    if (!transactions || transactions.length === 0) {
      return { labels: [], data: [] };
    }
    const countsByDate = {};
    transactions.forEach(tx => {
      if (tx.createdAt) {
        const date = new Date(tx.createdAt).toISOString().split('T')[0];
        countsByDate[date] = (countsByDate[date] || 0) + 1;
      }
    });
    const sortedDates = Object.keys(countsByDate).sort((a, b) => new Date(a) - new Date(b));
    const chartLabels = sortedDates;
    const chartDataValues = sortedDates.map(date => countsByDate[date]);
    return {
      labels: chartLabels,
      data: chartDataValues,
    };
  };

  const chartData = prepareChartData(transactions);

  const barChartData = {
    labels: chartData.labels,
    datasets: [
      {
        label: 'Transactions per Day',
        data: chartData.data,
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Daily Transaction Volume',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Number of Transactions',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Date',
        },
      },
    },
  };

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

  return (
    <div style={{ padding: '2rem', backgroundColor: '#ffffff', color: '#000000', minHeight: '100vh' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ textAlign: 'center', fontFamily: 'Epilogue, sans-serif' }}>
          Flow Rewards Transaction Viewer
        </h1>
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
          <input
            type="text"
            placeholder="Enter wallet address"
            value={walletAddress}
            onChange={(e) => setWalletAddress(e.target.value)}
            style={{
              width: '325px',
              padding: '0.5rem',
              backgroundColor: '#fff',
              color: '#000',
              border: '1px solid #ccc',
              borderRadius: '5px',
            }}
          />
          <button onClick={fetchTransactions} style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#eee',
            color: '#000',
            border: '1px solid #999',
            borderRadius: '5px',
            cursor: 'pointer',
          }}>
            Fetch Transactions
          </button>
          <button
            onClick={exportToCSV}
            disabled={transactions.length === 0}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: transactions.length === 0 ? '#ddd' : '#eee',
              color: transactions.length === 0 ? '#666' : '#000',
              border: '1px solid #999',
              borderRadius: '5px',
              cursor: transactions.length === 0 ? 'not-allowed' : 'pointer',
              opacity: transactions.length === 0 ? 0.6 : 1,
            }}
          >
            Export to CSV
          </button>
        </div>
      </div>

      {loading && <p style={{ textAlign: 'center' }}>Loading...</p>}

      {transactions.length > 0 && (
        <>
          <div style={{
            marginBottom: '2rem',
            backgroundColor: '#f0f8ff',
            padding: '1.5rem',
            borderRadius: '5px',
            textAlign: 'center'
          }}>
            <strong style={{ fontSize: '1.5rem', color: '#2d8b38', fontWeight: 'bold' }}>
              Total Points: {totalPoints}
            </strong>
          </div>

          {chartData.labels && chartData.labels.length > 0 && (
            <div style={{ marginTop: '2rem', marginBottom: '2rem', padding: '1rem', backgroundColor: '#f9f9f9', borderRadius: '5px', width: '100%', maxWidth: '800px', margin: 'auto' }}>
              <Bar options={barChartOptions} data={barChartData} />
            </div>
          )}

          <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              style={{
                padding: '0.5rem',
                borderRadius: '5px',
                border: '1px solid #ccc'
              }}
            >
              {uniqueFilterOptions.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        </>
      )}

      <div>
        {filteredTransactions.length > 0 ? (
          <ul>
            {filteredTransactions.map((tx) => {
              const currencyName = currencyMap[tx.loyaltyCurrencyId] || "Unknown Currency";
              const amountColor = tx.direction === 'credit' ? 'green' : 'red';
              const loyaltyRule = tx.loyaltyTransaction.loyaltyRule;
              const loyaltyRuleName = loyaltyRule ? loyaltyRule.name : 'No loyalty rule';
              const loyaltyRuleDescription = loyaltyRule ? loyaltyRule.description : '';
              const assetName = tx.matchedAsset ? tx.matchedAsset.name : 'Unknown Asset';

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
                  {assetName !== 'Unknown Asset' && (
                    <>
                      <br />
                      <strong>Asset Claimed! </strong> {assetName}
                    </>
                  )}
                  <hr />
                </li>
              );
            })}
          </ul>
        ) : (
          !loading && transactions.length > 0 && <p style={{textAlign: 'center'}}>No transactions match the current filter.</p>
        )}
        {!loading && transactions.length === 0 && <p style={{ textAlign: 'center' }}>No transactions found</p>}
      </div>
    </div>
  );
}
