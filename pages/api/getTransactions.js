export default async function handler(req, res) {
  const { walletAddress, startingAfter } = req.query;

  if (!walletAddress) {
    return res.status(400).json({ error: 'walletAddress is required' });
  }

  let transactionsUrl = `https://store.flow.com/api/loyalty/transaction_entries?limit=100&orderBy=createdAt&websiteId=8f6b91d5-985d-4da7-b253-68681eb4e4f0&walletAddress=${walletAddress}&organizationId=ebc23e35-e19a-4113-8951-dfff40192c5c&excludeDeletedCurrency=true`;

  // 👇 Add cursor if provided
  if (startingAfter) {
    transactionsUrl += `&startingAfter=${startingAfter}`;
  }

  const assetsUrl = `https://store.flow.com/api/minting/assets?limit=100&mintingContractIds=a33764e4-e993-4e64-aef3-6ea823afa991&websiteId=8f6b91d5-985d-4da7-b253-68681eb4e4f0&organizationId=ebc23e35-e19a-4113-8951-dfff40192c5c&isListed=true`;

  const accountsUrl = `https://store.flow.com/api/loyalty/accounts?orderBy=createdAt&websiteId=8f6b91d5-985d-4da7-b253-68681eb4e4f0&walletAddress=${walletAddress}&organizationId=ebc23e35-e19a-4113-8951-dfff40192c5c&excludeDeletedCurrency=true`;

  try {
    const [txRes, assetsRes, accountsRes] = await Promise.all([
      fetch(transactionsUrl, { headers: { 'x-api-key': process.env.FLOW_API_KEY } }),
      fetch(assetsUrl, { headers: { 'x-api-key': process.env.FLOW_API_KEY } }),
      fetch(accountsUrl, { headers: { 'x-api-key': process.env.FLOW_API_KEY } }),
    ]);

    const txData = await txRes.json();
    const assetData = await assetsRes.json();
    const accountsData = await accountsRes.json();

    const transactions = txData.data || [];
    const assets = assetData.data || [];
    const accounts = accountsData.data || [];

    // Map balances
    const currencyMap = {
      "d897904c-6dfb-4b43-a036-4938f96e7b51": "keys",
      "575d32ce-3b1f-469f-a08f-392e3d3b0812": "boxes",
      "fea6109c-8549-45d2-a974-d8531f64994d": "points"
    };

    const balances = { points: 0, boxes: 0, keys: 0 };
    accounts.forEach(account => {
      const currencyType = currencyMap[account.loyaltyCurrencyId];
      if (currencyType) {
        balances[currencyType] = parseInt(account.amount, 10) || 0;
      }
    });

    // Create a map of assets
    const assetMap = Object.fromEntries(assets.map((a) => [a.id, a]));

    // Enrich transactions
    const enrichedTransactions = transactions.map((tx) => {
      const assetId = tx.loyaltyTransaction?.metadata?.mintingContractAssetId;
      const matchedAsset = assetId ? assetMap[assetId] : null;
      return { ...tx, matchedAsset: matchedAsset || null };
    });

    // 👇 Send back the last transaction ID so frontend can use it as cursor
    const lastTxId = enrichedTransactions.length > 0 ? enrichedTransactions[enrichedTransactions.length - 1].id : null;

    return res.status(200).json({
      transactions: enrichedTransactions,
      assets,
      balances,
      nextCursor: lastTxId,
    });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
