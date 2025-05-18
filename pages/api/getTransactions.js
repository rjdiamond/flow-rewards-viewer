export default async function handler(req, res) {
  const { walletAddress } = req.query;

  if (!walletAddress) {
    return res.status(400).json({ error: 'walletAddress is required' });
  }

  const url = `https://store.flow.com/api/loyalty/transaction_entries?limit=1000&orderBy=createdAt&websiteId=8f6b91d5-985d-4da7-b253-68681eb4e4f0&walletAddress=${walletAddress}&organizationId=ebc23e35-e19a-4113-8951-dfff40192c5c&excludeDeletedCurrency=true`;

  try {
    const response = await fetch(url, {
      headers: {
        'x-api-key': process.env.FLOW_API_KEY,
      },
    });

    const data = await response.json();
    console.log(data);  // Log the data here
    return res.status(200).json(data);
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
