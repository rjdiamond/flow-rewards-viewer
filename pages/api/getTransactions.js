export default async function handler(req, res) {
  const { walletAddress } = req.query;

  if (!walletAddress) {
    return res.status(400).json({ error: 'walletAddress is required' });
  }

  const transactionsUrl = `https://store.flow.com/api/loyalty/transaction_entries?limit=1000&orderBy=createdAt&websiteId=8f6b91d5-985d-4da7-b253-68681eb4e4f0&walletAddress=${walletAddress}&organizationId=ebc23e35-e19a-4113-8951-dfff40192c5c&excludeDeletedCurrency=true`;

  const assetsUrl = `https://store.flow.com/api/minting/assets?limit=100&mintingContractIds=a33764e4-e993-4e64-aef3-6ea823afa991&websiteId=8f6b91d5-985d-4da7-b253-68681eb4e4f0&organizationId=ebc23e35-e19a-4113-8951-dfff40192c5c&isListed=true`;

  try {
    const [txRes, assetsRes] = await Promise.all([
      fetch(transactionsUrl, {
        headers: { 'x-api-key': process.env.FLOW_API_KEY },
      }),
      fetch(assetsUrl, {
        headers: { 'x-api-key': process.env.FLOW_API_KEY },
      }),
    ]);

    const txData = await txRes.json();
    const assetData = await assetsRes.json();

    const transactions = txData.data || [];
    const assets = assetData.data || [];

    // Create a map of assets by ID for quick lookup
    const assetMap = Object.fromEntries(assets.map((a) => [a.id, a]));

    // Enrich transactions with matched asset data
    const enrichedTransactions = transactions.map((tx) => {
  const assetId = tx.loyaltyTransaction?.metadata?.mintingContractAssetId;
  const matchedAsset = assetId ? assetMap[assetId] : null;

  return {
    ...tx,
    matchedAsset: matchedAsset || null,
  };
});

    return res.status(200).json({
      transactions: enrichedTransactions,
      assets, // Optional: include all assets
    });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
