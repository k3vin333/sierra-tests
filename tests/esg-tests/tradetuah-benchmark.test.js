const axios = require('axios');
const fs = require('fs');
const path = require('path');

const apiEndpoint = 'https://8a38hm2y70.execute-api.ap-southeast-2.amazonaws.com/v1/stocks';

// Helper function to add sleep
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Helper function to write results
function writeResult(testName, time) {
    const result = `${new Date().toISOString()} - ${testName}: ${time}ms\n`;
    fs.appendFileSync(path.join(__dirname, 'test-results.txt'), result);
}

describe('Stock API Performance Tests', () => {
  const testSymbol = 'AAPL';

  beforeAll(() => {
    // Clear previous results
    fs.writeFileSync(path.join(__dirname, 'test-results.txt'), '');
  });

  test('Overview endpoint performance', async () => {
    await sleep(1000); 
    const start = performance.now();
    await axios.get(`${apiEndpoint}/overview/${testSymbol}`);
    const end = performance.now();
    const time = end - start;
    console.log(`Overview endpoint took ${time}ms`);
    writeResult('Overview endpoint', time);
  });

  test('Price endpoint performance', async () => {
    await sleep(1000); 
    const start = performance.now();
    await axios.get(`${apiEndpoint}/price/${testSymbol}`);
    const end = performance.now();
    const time = end - start;
    console.log(`Price endpoint took ${time}ms`);
    writeResult('Price endpoint', time);
  });

  test('Options endpoint performance', async () => {
    await sleep(1000); 
    const start = performance.now();
    await axios.get(`${apiEndpoint}/options/${testSymbol}`);
    const end = performance.now();
    const time = end - start;
    console.log(`Options endpoint took ${time}ms`);
    writeResult('Options endpoint', time);
  });

  test('Fundamentals endpoint performance', async () => {
    await sleep(1000); 
    const start = performance.now();
    await axios.get(`${apiEndpoint}/fundamentals/${testSymbol}`);
    const end = performance.now();
    const time = end - start;
    console.log(`Fundamentals endpoint took ${time}ms`);
    writeResult('Fundamentals endpoint', time);
  });

  test('Historical data endpoint performance', async () => {
    await sleep(1000); 
    const start = performance.now();
    await axios.get(`${apiEndpoint}/historical/${encodeURIComponent(testSymbol)}`);
    const end = performance.now();
    const time = end - start;
    console.log(`Historical data endpoint took ${time}ms`);
    writeResult('Historical data endpoint', time);
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
    const time = end - start;
    console.log(`Earnings endpoint took ${time}ms`);
    writeResult('Earnings endpoint', time);
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
    const time = end - start;
    console.log(`Concurrent requests took ${time}ms`);
    writeResult('Concurrent requests', time);
  });
}); 