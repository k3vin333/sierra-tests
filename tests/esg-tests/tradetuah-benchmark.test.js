const axios = require('axios');

const apiEndpoint = 'https://8a38hm2y70.execute-api.ap-southeast-2.amazonaws.com/v1/stocks';

// Helper function to add sleep
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

describe('Stock API Performance Tests', () => {
  const testSymbol = 'AAPL';

  test('Overview endpoint performance', async () => {
    await sleep(1000); 
    const start = performance.now();
    await axios.get(`${apiEndpoint}/overview/${testSymbol}`);
    const end = performance.now();
    console.log(`Overview endpoint took ${end - start}ms`);
  });

  test('Price endpoint performance', async () => {
    await sleep(1000); 
    const start = performance.now();
    await axios.get(`${apiEndpoint}/price/${testSymbol}`);
    const end = performance.now();
    console.log(`Price endpoint took ${end - start}ms`);
  });

  test('Options endpoint performance', async () => {
    await sleep(1000); 
    const start = performance.now();
    await axios.get(`${apiEndpoint}/options/${testSymbol}`);
    const end = performance.now();
    console.log(`Options endpoint took ${end - start}ms`);
  });

  test('Fundamentals endpoint performance', async () => {
    await sleep(1000); 
    const start = performance.now();
    await axios.get(`${apiEndpoint}/fundamentals/${testSymbol}`);
    const end = performance.now();
    console.log(`Fundamentals endpoint took ${end - start}ms`);
  });

  test('Historical data endpoint performance', async () => {
    await sleep(1000); 
    const start = performance.now();
    await axios.get(`${apiEndpoint}/historical/${encodeURIComponent(testSymbol)}`);
    const end = performance.now();
    console.log(`Historical data endpoint took ${end - start}ms`);
  });

  test('Earnings endpoint performance', async () => {
    await sleep(1000); 
    const start = performance.now();
    await axios.post(`${apiEndpoint}/earnings/${testSymbol}`, null, {
      params: {
        quarters: '4'
      }
    });
    const end = performance.now();
    console.log(`Earnings endpoint took ${end - start}ms`);
  });

  // Test concurrent requests with sleep between batches
  test('Concurrent requests performance', async () => {
    await sleep(2000);
    const endpoints = [
      `${apiEndpoint}/overview/${testSymbol}`,
      `${apiEndpoint}/price/${testSymbol}`,
      `${apiEndpoint}/fundamentals/${testSymbol}`
    ];

    const start = performance.now();
    await Promise.all(endpoints.map(endpoint => axios.get(endpoint)));
    const end = performance.now();
    console.log(`Concurrent requests took ${end - start}ms`);
  });
}); 