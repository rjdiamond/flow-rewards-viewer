import { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function Home() {
  const [walletAddress, setWalletAddress] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [assets, setAssets] = useState([]);
  const [balances, setBalances] = useState({ points: 0, boxes: 0, keys: 0 });
  const [filter, setFilter] = useState('All Transactions');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [subFilter, setSubFilter] = useState('');
  const [filterStats, setFilterStats] = useState({ boxes: 0, keys: 0, points: 0 });

  const FETCH_LIMIT = 100;
  const currencyMap = {
    "d897904c-6dfb-4b43-a036-4938f96e7b51": "keys",
    "575d32ce-3b1f-469f-a08f-392e3d3b0812": "boxes",
    "fea6109c-8549-45d2-a974-d8531f64994d": "points"
  };

  // Define filters and their corresponding loyaltyRule IDs
  const FILTERS = {
    'Bridging': [
      "4e0e6225-65dd-4280-8683-3e2dbbad9697",
      "b32a87fc-0a63-4a16-be16-05026e001859",
      "742cac21-d348-43da-af25-cb3c8aad68a3",
      "97557bdd-488a-4fdf-aadd-d208aa3d8f3c"
    ],
    'Protocol: Beezie': [
      "e4001ba6-7cc2-426e-812c-767818ff4e65",
      "6d41fb3c-f80f-4034-b97c-44651dac203b",
      "fceb1c4b-b3f2-4fa7-a7c5-2cdf2d074831",
      "7c6545b3-374e-4d9a-819f-7c523aec5666",
      "972ad1c2-925b-46c0-8926-b514c9592aac"
    ],
    'Protocol: Flowty': [
      "792df2f0-db88-4ca5-867f-6e955d85e8eb",
      "5da94685-4a9e-43df-a7f1-606ff8effabe",
      "f8c0368a-675b-480a-ab0c-33d6d1deebb1",
      "cff71d59-beaa-445c-8786-5e456be424de",
      "5a91eead-70ff-4e80-a999-69eec0ea0ee0",
      "b560954b-d6bf-49cd-8110-6a4a92423482",
      "39d35731-0782-4744-bb29-48450c865f8f",
      "58c769fa-09ec-42a1-8456-7891669e11b8",
      "b81cc79a-e3f5-4a5e-b0ff-1ecde5c8dd88"
    ],
    'Protocol: Hitdex': [
      "894a3f44-89a3-4c3c-b972-0866f115cee9",
    ],
    'Protocol: Kittypunch': [
      "c016432f-dbbf-4b7d-9df4-ad82e4682ba6",
      "f5292c86-1e79-416a-8026-e57f5e6a088d",
      "02ad00f0-1047-4e11-82de-006e5ee1df0c",
      "4830f701-81de-4dc2-a31a-f3c985f471d3",
      "901d4247-2cbe-4769-ad51-068478803291",
      "ab71a131-26a1-4908-af82-c33e7685ce8c",
      "d6cd0fe7-d9fc-485b-9163-31584194a5d7",
      "974b173f-fd2c-42e7-a3b9-51662f97dd29"
    ],
    'Protocol: More.Markets': [
      "3e1b6dc0-8962-4e8d-bbd1-b58bda5ca6e1",
      "726e499a-de34-46df-bcdb-dc9ead042b21",
      "d6bb2e62-3af2-4d3d-9581-d6d6f4ff44f8",
      "36cf0f25-cd03-4975-b5fe-d95bafc4c645",
      "c84970d4-43a3-4432-81f9-aac8bf6c3d82"
    ],
    'Protocol: NBA Top Shot': [
      "e206194f-b9a8-4161-aee2-254ca65be54c",
      "f463deec-02d0-4276-bfe8-9d6539261ca0",
      "4e38f7aa-d973-44c9-94ff-c924cab4e73e"
    ],
    'Protocol: Pumpflow': [
      "5f83e6fe-f0a0-4f11-9574-6d686b95eb3b",
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
    'Flow Rewards: Referrals': [
      "c7a2ab8a-8d82-46ac-b4d5-29bafae0dfc5",
      "6824cd98-338e-4212-8fbf-8aa973e8b622",
      "0d44db65-7948-41af-aa83-b16577be707d"
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
      "1409fb2d-3cc6-458f-ae0c-b0d8492a43d3",
      "2c408c94-0c6f-44c8-9498-3fcaca3d6766",
      "1850e58f-9d30-4702-90a2-9798c5d37586",
      "6bfecef2-d1bf-454e-af63-e4414defbba4",
      "16c946fd-f872-4520-9a8a-2638ce9fdb36",
      "84c2c9a4-8bb8-4b4e-b374-bdc77b0b6914",
      "e983d5b6-0525-482c-bf43-ab72998736a8",
      "320d7153-a625-45a4-8be9-fd7cef498625",
      "515333b2-b0fb-436f-92ea-e4427eeb9680",
      "1148f38f-19ad-4f7d-9b36-84b87ae7786a"
    ],
      'Flow Rewards: Twitter Shares': [
      "7185f996-35e4-4a24-b6a5-79ef3e74f083",
      "074b0b42-3c88-41d2-a5b7-9c758ad33ef9",
      "03a4b5ee-3d95-4663-ba2f-4b382c24ae1c",
      "a82e7d41-ca3a-4243-a1d8-e588ea1da3d3",
      "122561da-8039-46c6-8f5c-46289f5b193a",
      "ff62fc8a-c7da-4eea-8c3b-fcd8c67af00d"
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
      "f46f5216-c45a-4ccf-aecd-60ac2f367028",
      "ae376e3c-e24c-4a05-b838-48e49a8b7a48",
      "23184626-ee48-46f8-ad3a-87730a3304c4",
      "131cce14-422c-4fbd-94f8-2bb218fd754b"
    ],
  };

const allFilteredIds = Object.values(FILTERS).flat();

const allFilterNames = Object.keys(FILTERS);

const activeFilters = allFilterNames.filter(filterName =>
  transactions.some(tx => FILTERS[filterName].includes(tx.loyaltyTransaction?.loyaltyRule?.id))
);

  const fetchTransactions = async (startingAfter = null, reset = false) => {
    setLoading(true);

    const url = `/api/getTransactions?walletAddress=${walletAddress}`
      + (startingAfter ? `&startingAfter=${startingAfter}` : "");

    try {
      const res = await fetch(url);
      const data = await res.json();

      if (reset) {
        setTransactions(data.transactions || []);
      } else {
        setTransactions(prev => [...prev, ...(data.transactions || [])]);
      }

      setAssets(data.assets || []);
      setBalances(data.balances || { points: 0, boxes: 0, keys: 0 });

      if (data.nextCursor) {
        setCursor(data.nextCursor);
        setHasMore(true);
      } else {
        setCursor(null);
        setHasMore(false);
      }
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setTransactions([]);
    setCursor(null);
    setHasMore(false);
    fetchTransactions(null, true);
  };
  
// Add "Boxes Unlocked" filter if the wallet is in any description
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

const filterLabelMap = {
  'All Transactions': 'Current Account Holdings',
  'Asset Claimed': 'Points Spent',
  'Boxes Unlocked': 'Boxes Unlocked (1 Key + 1 Box = 5 Points)',
  'Flow Rewards': 'Flow Community Reward Earnings',
  'Protocols': 'Protocol Earnings',
  'Bridging': 'Bridging Earnings',
  'Other': 'Other',
};

const uniqueFilterOptions = [
  'All Transactions',
  'Asset Claimed',
  'Boxes Unlocked',
  'Flow Rewards',
  'Protocols',
  'Bridging',
  ...activeFilters.filter(f =>
    !f.startsWith('Flow Rewards:') &&
    !f.startsWith('Protocol:') &&
    f !== 'Bridging' &&
    f !== 'Boxes Unlocked' &&
    f !== 'All Transactions' &&
    f !== 'Asset Claimed'
  ),
  'Other',
];

const boxesUnlockedIds = new Set(
  transactions
    .filter(tx =>
      tx.loyaltyTransaction?.description?.toLowerCase().includes(walletAddress.toLowerCase())
    )
    .map(tx => tx.loyaltyTransaction?.loyaltyRule?.id)
);

  
// Filtering logic
const isFlowRewardsFilter = filter === 'Flow Rewards';
const isProtocolsFilter = filter === 'Protocols';
const isBridgingFilter = filter === 'Bridging';

const flowRewardsCategories = Object.keys(FILTERS).filter(f => f.startsWith('Flow Rewards:'));
const protocolCategories = Object.keys(FILTERS).filter(f => f.startsWith('Protocol:'));
const bridgingCategories = ['Bridging'];

const flowRewardsIds = flowRewardsCategories.map(f => FILTERS[f]).flat();
const protocolIds = protocolCategories.map(f => FILTERS[f]).flat();
const bridgingIds = bridgingCategories.map(f => FILTERS[f]).flat();

let categoryOptions = [];
let loyaltyRuleOptions = [];
if (isFlowRewardsFilter) {
  categoryOptions = flowRewardsCategories.map(cat => cat.replace('Flow Rewards: ', ''));
  if (categoryFilter) {
    const categoryKey = 'Flow Rewards: ' + categoryFilter;
    const ids = FILTERS[categoryKey] || [];
    loyaltyRuleOptions = ids
      .map(id => {
        const tx = transactions.find(t => t.loyaltyTransaction?.loyaltyRule?.id === id);
        return tx?.loyaltyTransaction?.loyaltyRule?.name || null;
      })
      .filter((name, idx, arr) => name && arr.indexOf(name) === idx)
      .map(name => ({ category: categoryKey, name, display: `${categoryFilter}: ${name}` }));
  }
}
if (isProtocolsFilter) {
  categoryOptions = protocolCategories.map(cat => cat.replace('Protocol: ', ''));
  if (categoryFilter) {
    const categoryKey = 'Protocol: ' + categoryFilter;
    const ids = FILTERS[categoryKey] || [];
    loyaltyRuleOptions = ids
      .map(id => {
        const tx = transactions.find(t => t.loyaltyTransaction?.loyaltyRule?.id === id);
        return tx?.loyaltyTransaction?.loyaltyRule?.name || null;
      })
      .filter((name, idx, arr) => name && arr.indexOf(name) === idx)
      .map(name => ({ category: categoryKey, name, display: `${categoryFilter}: ${name}` }));
  }
}
if (isBridgingFilter) {
  categoryOptions = bridgingCategories;
  if (categoryFilter) {
    const categoryKey = categoryFilter;
    const ids = FILTERS[categoryKey] || [];
    loyaltyRuleOptions = ids
      .map(id => {
        const tx = transactions.find(t => t.loyaltyTransaction?.loyaltyRule?.id === id);
        return tx?.loyaltyTransaction?.loyaltyRule?.name || null;
      })
      .filter((name, idx, arr) => name && arr.indexOf(name) === idx)
      .map(name => ({ category: categoryKey, name, display: `${categoryFilter}: ${name}` }));
  }
}

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

  if ((isFlowRewardsFilter || isProtocolsFilter || isBridgingFilter) && categoryFilter && subFilter) {
    const ids = FILTERS[(isFlowRewardsFilter ? 'Flow Rewards: ' : isProtocolsFilter ? 'Protocol: ' : '') + categoryFilter] || [];
    return transactions.filter(tx =>
      ids.includes(tx.loyaltyTransaction?.loyaltyRule?.id) &&
      tx.loyaltyTransaction?.loyaltyRule?.name === subFilter
    );
  }

  if ((isFlowRewardsFilter || isProtocolsFilter || isBridgingFilter) && categoryFilter) {
    const ids = FILTERS[(isFlowRewardsFilter ? 'Flow Rewards: ' : isProtocolsFilter ? 'Protocol: ' : '') + categoryFilter] || [];
    return transactions.filter(tx => ids.includes(tx.loyaltyTransaction?.loyaltyRule?.id));
  }

  if (isFlowRewardsFilter) {
    return transactions.filter(tx => flowRewardsIds.includes(tx.loyaltyTransaction?.loyaltyRule?.id));
  }
  if (isProtocolsFilter) {
    return transactions.filter(tx => protocolIds.includes(tx.loyaltyTransaction?.loyaltyRule?.id));
  }
  if (isBridgingFilter) {
    return transactions.filter(tx => bridgingIds.includes(tx.loyaltyTransaction?.loyaltyRule?.id));
  }

  return transactions.filter(tx =>
    FILTERS[filter]?.includes(tx.loyaltyTransaction?.loyaltyRule?.id)
  );
})();

const transactionsWithAssetName = transactions.map(tx => {
  const mintingAssetId = tx.loyaltyTransaction?.metadata?.mintingContractAssetId;

  // Defensive: Convert both sides to strings to be sure
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
      setVisibleCount(100); // Reset pagination on new fetch
      console.log("API returned balances:", data.balances);
      setBalances(data.balances || { points: 0, boxes: 0, keys: 0 });
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
};

  const exportToCSV = () => {
    if (!transactions || transactions.length === 0) return;

    const headers = [
      'Timestamp',
      'Loyalty Rule Name',
      'Loyalty Rule Description',
      'Loyalty Rule ID',
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
        loyaltyRule.id || '',
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

  const claimedTxs = filteredTransactions.filter(tx => tx.matchedAsset);
  const otherTxs = filteredTransactions.filter(tx => !tx.matchedAsset);

useEffect(() => {
  let boxes = 0;
  let keys = 0;
  let points = 0;
  if (filter.startsWith('Protocol:')) {
    const ids = FILTERS[filter] || [];
    filteredTransactions.forEach(tx => {
      if (ids.includes(tx.loyaltyTransaction?.loyaltyRule?.id)) {
        if (currencyMap[tx.loyaltyCurrencyId] === 'boxes' && tx.direction === 'credit') boxes += Number(tx.amount);
        if (currencyMap[tx.loyaltyCurrencyId] === 'keys' && tx.direction === 'credit') keys += Number(tx.amount);
        if (currencyMap[tx.loyaltyCurrencyId] === 'points' && tx.direction === 'credit') points += Number(tx.amount);
      }
    });
  } else if (filter === 'Asset Claimed') {
    filteredTransactions.forEach(tx => {
      if (currencyMap[tx.loyaltyCurrencyId] === 'points') points -= Number(tx.amount);
      if (currencyMap[tx.loyaltyCurrencyId] === 'boxes') boxes += Number(tx.amount);
      if (currencyMap[tx.loyaltyCurrencyId] === 'keys') keys += Number(tx.amount);
    });
  } else if (filter === 'Boxes Unlocked') {
    filteredTransactions.forEach(tx => {
      if (currencyMap[tx.loyaltyCurrencyId] === 'boxes') boxes -= Number(tx.amount);
      if (currencyMap[tx.loyaltyCurrencyId] === 'keys') keys -= Number(tx.amount);
      if (currencyMap[tx.loyaltyCurrencyId] === 'points') points += Number(tx.amount);
    });
  } else {
    filteredTransactions.forEach(tx => {
      if (tx.direction === 'credit') {
        if (currencyMap[tx.loyaltyCurrencyId] === 'boxes') boxes += Number(tx.amount);
        if (currencyMap[tx.loyaltyCurrencyId] === 'keys') keys += Number(tx.amount);
        if (currencyMap[tx.loyaltyCurrencyId] === 'points') points += Number(tx.amount);
      }
    });
  }
  setFilterStats({ boxes, keys, points });
}, [filter, filteredTransactions]);

  return (
    <div style={{ padding: '1rem', backgroundColor: '#ffffff', color: '#000000', minHeight: '100vh' }}>
      {/* Top Section Centered */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1.5rem', marginTop: '1.5rem' }}>
        <h1 style={{ textAlign: 'center', fontFamily: 'Epilogue, sans-serif' }}>
          Flow Community Rewards Transaction Viewer
        </h1>
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem' }}>
          <input
            type="text"
            placeholder="Enter wallet address"
            value={walletAddress}
            onChange={(e) => setWalletAddress(e.target.value)}
            style={{
              width: '350px',
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
              padding: '0.5rem 0.5rem',
              backgroundColor: transactions.length === 0 ? '#ddd' : '#eee',
              color: transactions.length === 0 ? '#666' : '#000',
              border: '1px solid #999',
              borderRadius: '5px',
              cursor: transactions.length === 0 ? 'not-allowed' : 'pointer',
              opacity: transactions.length === 0 ? 0.6 : 1,
            }}
          >
            Export Transactions (CSV)
          </button>
        </div>
      </div>
      {loading && <p style={{ textAlign: 'center' }}>Loading...</p>}
      {transactions.length > 0 && (
        <>
          <div style={{ textAlign: 'center', marginBottom: '1.5rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '.5rem', marginTop: '.5rem' }}>
            <select
              value={filter}
              onChange={(e) => {
                setFilter(e.target.value);
                setCategoryFilter('');
                setSubFilter('');
              }}
              style={{
                padding: '0.5rem',
                borderRadius: '5px',
                border: '1px solid #ccc'
              }}
            >
              {uniqueFilterOptions.map((opt) => (
                <option key={opt} value={opt}>{filterLabelMap[opt] || opt}</option>
              ))}
            </select>
            {(isFlowRewardsFilter || isProtocolsFilter || isBridgingFilter) && categoryOptions.length > 0 && (
              <select
                value={categoryFilter}
                onChange={e => {
                  setCategoryFilter(e.target.value);
                  setSubFilter('');
                }}
                style={{
                  padding: '0.5rem',
                  borderRadius: '5px',
                  border: '1px solid #ccc'
                }}
              >
                <option value="">All {filter}</option>
                {categoryOptions.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            )}
            {(isFlowRewardsFilter || isProtocolsFilter || isBridgingFilter) && categoryFilter && loyaltyRuleOptions.length > 0 && (
              <select
                value={subFilter}
                onChange={e => setSubFilter(e.target.value)}
                style={{
                  padding: '0.5rem',
                  borderRadius: '5px',
                  border: '1px solid #ccc'
                }}
              >
                <option value="">All {categoryFilter}</option>
                {loyaltyRuleOptions.map(opt => (
                  <option key={opt.name} value={opt.name}>{opt.display}</option>
                ))}
              </select>
            )}
          </div>
          <div style={{
            marginBottom: '1.5rem',
            backgroundColor: '#f0f8ff',
            padding: '1.5rem',
            borderRadius: '5px',
            textAlign: 'center'
          }}>
              <h3 style={{ fontFamily: 'Epilogue, sans-serif', fontWeight: 'bold', fontSize: '1.2rem', color: '#333', marginBottom: '1rem', marginTop: '.5rem' }}>
                {(() => {
                  if (filterLabelMap[filter]) return filterLabelMap[filter];
                  if (filter.startsWith('Protocol:')) return `${filter} Credited Stats`;
                  if (filter.startsWith('Flow Rewards:')) return `${filter} Credited Stats`;
                  return filter;
                })()}
              </h3>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
              <div>
                <strong style={{ fontSize: '2rem', color: (filter === 'Asset Claimed' && filterStats.points < 0) ? '#d32f2f' : '#2d5f8b', fontWeight: 'bold' }}>
                  Points: {filter === 'All Transactions' ? balances.points : (filter === 'Asset Claimed' && filterStats.points < 0 ? `-${Math.abs(filterStats.points)}` : filterStats.points)}
                </strong>
              </div>
              <div>
                <strong style={{ fontSize: '2rem', color: (filter === 'Boxes Unlocked' && filterStats.boxes < 0) ? '#d32f2f' : '#2d8b38', fontWeight: 'bold' }}>
                  Boxes: {filter === 'All Transactions' ? balances.boxes : (filter === 'Boxes Unlocked' && filterStats.boxes < 0 ? `-${Math.abs(filterStats.boxes)}` : filterStats.boxes)}
                </strong>
              </div>
              <div>
                <strong style={{ fontSize: '2rem', color: (filter === 'Boxes Unlocked' && filterStats.keys < 0) ? '#d32f2f' : '#2d8b38', fontWeight: 'bold' }}>
                  Keys: {filter === 'All Transactions' ? balances.keys : (filter === 'Boxes Unlocked' && filterStats.keys < 0 ? `-${Math.abs(filterStats.keys)}` : filterStats.keys)}
                </strong>
              </div>
            </div>
            {/* Stats and chart: always show, protocol or totals */}
            <div style={{ marginTop: '.5rem', marginBottom: '.5rem', textAlign: 'center' }}>
              <div style={{ maxWidth: 600, height: 350, margin: '0 auto' }}>
                <Bar
                  data={{
                    labels: ['Points', 'Boxes', 'Keys'],
                    datasets: [
                      {
                        label: (() => {
                          if (filterLabelMap[filter]) return filterLabelMap[filter];
                          if (filter.startsWith('Protocol:')) return `${filter} Credited Stats`;
                          if (filter.startsWith('Flow Rewards:')) return `${filter} Credited Stats`;
                          return filter;
                        })(),
                        data: filter === 'All Transactions'
                          ? [balances.points, balances.boxes, balances.keys]
                          : [
                              filter === 'Asset Claimed' && filterStats.points < 0 ? Math.abs(filterStats.points) : filterStats.points,
                              filter === 'Boxes Unlocked' && filterStats.boxes < 0 ? Math.abs(filterStats.boxes) : filterStats.boxes,
                              filter === 'Boxes Unlocked' && filterStats.keys < 0 ? Math.abs(filterStats.keys) : filterStats.keys
                            ],
                        backgroundColor: [
                          (filter === 'Asset Claimed' && filterStats.points < 0) ? '#d32f2f' : '#2d5f8b',
                          (filter === 'Boxes Unlocked' && filterStats.boxes < 0) ? '#d32f2f' : '#2d8b38',
                          (filter === 'Boxes Unlocked' && filterStats.keys < 0) ? '#d32f2f' : '#2d8b38'
                        ],
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    aspectRatio: 16/9,
                    animation: {
                      duration: 100
                    },
                    plugins: {
                      legend: { display: false },
                      title: { display: false },
                    },
                    scales: {
                      y: { beginAtZero: true },
                    },
                  }}
                  height={350}
                  width={600}
                />
              </div>
            </div>
          </div>
        </>
      )}
      {/* Results Section Left-Aligned */}
<div>
  {filteredTransactions.length > 0 ? (
    <>
      <ul>
        {[...filteredTransactions]
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .map((tx) => {
            const currencyName = currencyMap[tx.loyaltyCurrencyId] || "Unknown Currency";
            const amountColor = tx.direction === 'credit' ? 'green' : 'red';
            const loyaltyRule = tx.loyaltyTransaction.loyaltyRule || {};
            const loyaltyRuleName = loyaltyRule.name || 'No loyalty rule';
            const loyaltyRuleDescription = loyaltyRule.description || '';
            const loyaltyRuleId = loyaltyRule.id || '';
            const matchedTx = transactionsWithAssetName.find(t => t.id === tx.id);

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
                {matchedTx?.hasAssetClaim && matchedTx?.assetName && (
                  <>
                    <br />
                    <strong>Asset Claimed!</strong> {matchedTx.assetName}
                  </>
                )}
                <hr />
              </li>
            );
          })}
      </ul>

      {hasMore && (
        <div style={{ textAlign: 'center', margin: '2rem 0' }}>
          <button
            onClick={() => fetchTransactions(cursor)}
            disabled={loading}
            style={{ padding: '0.5rem 1rem', borderRadius: '5px' }}
          >
            {loading ? "Loading..." : "Load More"}
          </button>
        </div>
      )}

      <footer style={{ textAlign: 'center', margin: '2rem 0', color: '#404040' }}>
        <p>© 2025 Flow Community Rewards Viewer.</p>
      </footer>
    </>
  ) : null}
</div>

