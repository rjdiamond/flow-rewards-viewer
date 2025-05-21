// Mock or define prepareChartData for testing as it's not directly exportable from pages/index.js
const prepareChartData = (transactions) => {
    if (!transactions || transactions.length === 0) {
      return { labels: [], data: [] };
    }
    const countsByDate = {};
    transactions.forEach(tx => {
      // Ensure createdAt is valid before parsing
      if (tx && tx.createdAt) { 
        const date = new Date(tx.createdAt).toISOString().split('T')[0]; // 'YYYY-MM-DD'
        countsByDate[date] = (countsByDate[date] || 0) + 1;
      }
    });

    // Sort dates chronologically
    const sortedDates = Object.keys(countsByDate).sort((a, b) => new Date(a) - new Date(b));
    
    const chartLabels = sortedDates;
    const chartDataValues = sortedDates.map(date => countsByDate[date]);

    return {
      labels: chartLabels,
      data: chartDataValues,
    };
  };

describe('prepareChartData', () => {
  it('should return empty labels and data for no transactions (empty array, null, undefined)', () => {
    expect(prepareChartData([])).toEqual({ labels: [], data: [] });
    expect(prepareChartData(null)).toEqual({ labels: [], data: [] });
    expect(prepareChartData(undefined)).toEqual({ labels: [], data: [] });
  });

  it('should correctly process a single transaction', () => {
    const transactions = [
      { createdAt: '2023-01-15T10:00:00.000Z', amount: 10 },
    ];
    expect(prepareChartData(transactions)).toEqual({
      labels: ['2023-01-15'],
      data: [1],
    });
  });

  it('should correctly process multiple transactions on the same day', () => {
    const transactions = [
      { createdAt: '2023-03-20T10:00:00.000Z', amount: 10 },
      { createdAt: '2023-03-20T14:30:00.000Z', amount: 5 },
      { createdAt: '2023-03-20T18:45:00.000Z', amount: 20 },
    ];
    expect(prepareChartData(transactions)).toEqual({
      labels: ['2023-03-20'],
      data: [3],
    });
  });

  it('should correctly process transactions on different days and sort them', () => {
    const transactions = [
      { createdAt: '2023-02-10T10:00:00.000Z', amount: 10 },
      { createdAt: '2023-01-20T14:30:00.000Z', amount: 5 }, // Earlier date
      { createdAt: '2023-03-05T18:45:00.000Z', amount: 20 }, // Later date
    ];
    expect(prepareChartData(transactions)).toEqual({
      labels: ['2023-01-20', '2023-02-10', '2023-03-05'],
      data: [1, 1, 1],
    });
  });

  it('should correctly process a mix of transactions (same day and different days)', () => {
    const transactions = [
      { createdAt: '2023-04-10T09:00:00.000Z', amount: 15 },
      { createdAt: '2023-04-12T10:00:00.000Z', amount: 10 },
      { createdAt: '2023-04-10T15:00:00.000Z', amount: 5 }, // Same day as first
      { createdAt: '2023-04-11T14:30:00.000Z', amount: 7 },
      { createdAt: '2023-04-12T18:45:00.000Z', amount: 20 }, // Same day as second
      { createdAt: '2023-04-10T23:00:00.000Z', amount: 2 },  // Same day as first
    ];
    expect(prepareChartData(transactions)).toEqual({
      labels: ['2023-04-10', '2023-04-11', '2023-04-12'],
      data: [3, 1, 2],
    });
  });

  it('should ignore transactions with missing or nullish createdAt field', () => {
    const transactions = [
      { createdAt: '2023-05-01T10:00:00.000Z', amount: 10 },
      { amount: 5 }, // Missing createdAt
      { createdAt: null, amount: 12 }, // Null createdAt
      { createdAt: '2023-05-01T12:00:00.000Z', amount: 3 },
      { createdAt: '2023-05-02T10:00:00.000Z', amount: 7 },
      {}, // Empty object
    ];
    expect(prepareChartData(transactions)).toEqual({
      labels: ['2023-05-01', '2023-05-02'],
      data: [2, 1],
    });
  });

  it('should handle transactions spanning across month/year boundaries correctly', () => {
    const transactions = [
      { createdAt: '2022-12-31T23:00:00.000Z', amount: 50 },
      { createdAt: '2023-01-01T01:00:00.000Z', amount: 25 },
      { createdAt: '2022-12-31T10:00:00.000Z', amount: 10 },
    ];
    expect(prepareChartData(transactions)).toEqual({
      labels: ['2022-12-31', '2023-01-01'],
      data: [2, 1],
    });
  });

  it('should handle an array with non-object or invalid transaction entries', () => {
    const transactions = [
      { createdAt: '2023-06-01T10:00:00.000Z', amount: 10 },
      null, // Null entry in array
      { createdAt: '2023-06-02T10:00:00.000Z', amount: 5 },
      undefined, // Undefined entry
      "not a transaction", // String entry
      { createdAt: '2023-06-01T12:00:00.000Z', amount: 3 },
    ];
    expect(prepareChartData(transactions)).toEqual({
      labels: ['2023-06-01', '2023-06-02'],
      data: [2, 1],
    });
  });
});
