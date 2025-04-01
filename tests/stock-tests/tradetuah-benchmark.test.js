const axios = require('axios');
const fs = require('fs');
const path = require('path');

const apiEndpoint = 'https://8a38hm2y70.execute-api.ap-southeast-2.amazonaws.com/v1/stocks';

// Helper function to write results
function writeResult(testName, time, status) {
    const result = `${new Date().toISOString()} - ${testName}: ${time}ms (${status})\n`;
    fs.appendFileSync(path.join(__dirname, 'test-results.txt'), result);
}

// Helper function to make request with retry
async function makeRequest(method, url, data = null, config = {}) {
    const maxRetries = 3;
    let lastError;
    
    for (let i = 0; i < maxRetries; i++) {
        try {
            const start = performance.now();
            const response = await axios({
                method,
                url,
                data,
                ...config
            });
            const end = performance.now();
            return {
                time: end - start,
                status: response.status,
                data: response.data
            };
        } catch (error) {
            lastError = error;
            if (i < maxRetries - 1) {
                await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
            }
        }
    }
    throw lastError;
}

describe('Stock API Performance Tests', () => {
  const testSymbol = 'AAPL';

  beforeAll(() => {
    // Clear previous results
    fs.writeFileSync(path.join(__dirname, 'test-results.txt'), '');
  });

  test('Overview endpoint performance', async () => {
    const result = await makeRequest('get', `${apiEndpoint}/overview/${testSymbol}`);
    console.log(`Overview endpoint took ${result.time}ms (Status: ${result.status})`);
    writeResult('Overview endpoint', result.time, result.status);
  });

  test('Price endpoint performance', async () => {
    const result = await makeRequest('get', `${apiEndpoint}/price/${testSymbol}`);
    console.log(`Price endpoint took ${result.time}ms (Status: ${result.status})`);
    writeResult('Price endpoint', result.time, result.status);
  });

  test('Options endpoint performance', async () => {
    const result = await makeRequest('get', `${apiEndpoint}/options/${testSymbol}`);
    console.log(`Options endpoint took ${result.time}ms (Status: ${result.status})`);
    writeResult('Options endpoint', result.time, result.status);
  });

  test('Fundamentals endpoint performance', async () => {
    const result = await makeRequest('get', `${apiEndpoint}/fundamentals/${testSymbol}`);
    console.log(`Fundamentals endpoint took ${result.time}ms (Status: ${result.status})`);
    writeResult('Fundamentals endpoint', result.time, result.status);
  });

  test('Historical data endpoint performance', async () => {
    const result = await makeRequest('get', `${apiEndpoint}/historical/${encodeURIComponent(testSymbol)}`);
    console.log(`Historical data endpoint took ${result.time}ms (Status: ${result.status})`);
    writeResult('Historical data endpoint', result.time, result.status);
  });

  test('Earnings endpoint performance', async () => {
    const result = await makeRequest('post', `${apiEndpoint}/earnings/${testSymbol}`, null, {
      params: {
        quarters: '4'
      }
    });
    console.log(`Earnings endpoint took ${result.time}ms (Status: ${result.status})`);
    writeResult('Earnings endpoint', result.time, result.status);
  });

  // Test concurrent requests
  test('Concurrent requests performance', async () => {
    const endpoints = [
      `${apiEndpoint}/overview/${testSymbol}`,
      `${apiEndpoint}/price/${testSymbol}`,
      `${apiEndpoint}/fundamentals/${testSymbol}`
    ];

    const start = performance.now();
    const results = await Promise.all(endpoints.map(endpoint => makeRequest('get', endpoint)));
    const end = performance.now();
    const totalTime = end - start;
    const avgTime = results.reduce((sum, r) => sum + r.time, 0) / results.length;
    
    console.log(`Concurrent requests took ${totalTime}ms (Average: ${avgTime.toFixed(2)}ms)`);
    writeResult('Concurrent requests', totalTime, `Avg: ${avgTime.toFixed(2)}ms`);
  });
}); 