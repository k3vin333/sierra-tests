const axios = require('axios');
const fs = require('fs');
const path = require('path');

const apiEndpoint = 'https://8a38hm2y70.execute-api.ap-southeast-2.amazonaws.com/v1/stocks';

// Helper function to write results
function writeResult(testName, time, status) {
    const result = `${new Date().toISOString()} - ${testName}: ${time}ms (${status})\n`;
    fs.appendFileSync(path.join(__dirname, 'test-results.txt'), result);
}

describe('Stock API Performance Tests', () => {
  const testSymbol = 'AAPL';

  beforeAll(() => {
    // Clear previous results
    fs.writeFileSync(path.join(__dirname, 'test-results.txt'), '');
  });

  test('Overview endpoint performance', async () => {
    const start = performance.now();
    const response = await axios.get(`${apiEndpoint}/overview/${testSymbol}`);
    const end = performance.now();
    const time = end - start;
    console.log(`Overview endpoint took ${time}ms (Status: ${response.status})`);
    writeResult('Overview endpoint', time, response.status);
  });

  test('Price endpoint performance', async () => {
    const start = performance.now();
    const response = await axios.get(`${apiEndpoint}/price/${testSymbol}`);
    const end = performance.now();
    const time = end - start;
    console.log(`Price endpoint took ${time}ms (Status: ${response.status})`);
    writeResult('Price endpoint', time, response.status);
  });

  test('Options endpoint performance', async () => {
    const start = performance.now();
    const response = await axios.get(`${apiEndpoint}/options/${testSymbol}`);
    const end = performance.now();
    const time = end - start;
    console.log(`Options endpoint took ${time}ms (Status: ${response.status})`);
    writeResult('Options endpoint', time, response.status);
  });

  test('Fundamentals endpoint performance', async () => {
    const start = performance.now();
    const response = await axios.get(`${apiEndpoint}/fundamentals/${testSymbol}`);
    const end = performance.now();
    const time = end - start;
    console.log(`Fundamentals endpoint took ${time}ms (Status: ${response.status})`);
    writeResult('Fundamentals endpoint', time, response.status);
  });

  test('Historical data endpoint performance', async () => {
    const start = performance.now();
    const response = await axios.get(`${apiEndpoint}/historical/${encodeURIComponent(testSymbol)}`);
    const end = performance.now();
    const time = end - start;
    console.log(`Historical data endpoint took ${time}ms (Status: ${response.status})`);
    writeResult('Historical data endpoint', time, response.status);
  });

  test('Earnings endpoint performance', async () => {
    const start = performance.now();
    const response = await axios.post(`${apiEndpoint}/earnings/${testSymbol}`, null, {
      params: {
        quarters: '4'
      }
    });
    const end = performance.now();
    const time = end - start;
    console.log(`Earnings endpoint took ${time}ms (Status: ${response.status})`);
    writeResult('Earnings endpoint', time, response.status);
  });

  // Test concurrent requests
  test('Concurrent requests performance', async () => {
    const endpoints = [
      `${apiEndpoint}/overview/${testSymbol}`,
      `${apiEndpoint}/price/${testSymbol}`,
      `${apiEndpoint}/fundamentals/${testSymbol}`
    ];

    const start = performance.now();
    const responses = await Promise.all(endpoints.map(endpoint => axios.get(endpoint)));
    const end = performance.now();
    const totalTime = end - start;
    const times = responses.map((_, index) => {
      const responseStart = start + (index * (end - start) / endpoints.length);
      return end - responseStart;
    });
    const avgTime = times.reduce((sum, t) => sum + t, 0) / times.length;
    
    console.log(`Concurrent requests took ${totalTime}ms (Average: ${avgTime.toFixed(2)}ms)`);
    writeResult('Concurrent requests', totalTime, `Avg: ${avgTime.toFixed(2)}ms`);
  });
}); 