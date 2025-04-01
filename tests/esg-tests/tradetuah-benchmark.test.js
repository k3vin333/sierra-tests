const axios = require('axios');

const apiEndpoint = 'https://8a38hm2y70.execute-api.ap-southeast-2.amazonaws.com/v1/stocks';

// Helper function to add delay
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to measure execution time
const measureExecutionTime = async (fn) => {
  const start = process.hrtime.bigint();
  const result = await fn();
  const end = process.hrtime.bigint();
  const executionTime = Number(end - start) / 1_000_000; // Convert to milliseconds
  return { result, executionTime };
};

describe('Stock API Performance Tests', () => {
  const testSymbol = 'AAPL'; // Using Apple as test symbol

  test('Overview endpoint performance', async () => {
    await delay(1000); 
    const { executionTime } = await measureExecutionTime(async () => {
      await axios.get(`${apiEndpoint}/overview/${testSymbol}`);
    });
    
    console.log(`Overview endpoint took ${executionTime}ms`);
  });

  test('Price endpoint performance', async () => {
    await delay(1000); 
    const { executionTime } = await measureExecutionTime(async () => {
      await axios.get(`${apiEndpoint}/price/${testSymbol}`);
    });
    
    console.log(`Price endpoint took ${executionTime}ms`);
  });

  test('Options endpoint performance', async () => {
    await delay(1000); 
    const { executionTime } = await measureExecutionTime(async () => {
      await axios.get(`${apiEndpoint}/options/${testSymbol}`);
    });
    
    console.log(`Options endpoint took ${executionTime}ms`);
  });

  test('Fundamentals endpoint performance', async () => {
    await delay(1000); 
    const { executionTime } = await measureExecutionTime(async () => {
      await axios.get(`${apiEndpoint}/fundamentals/${testSymbol}`);
    });
    
    console.log(`Fundamentals endpoint took ${executionTime}ms`);
  });

  test('Historical data endpoint performance', async () => {
    await delay(1000); 
    const { executionTime } = await measureExecutionTime(async () => {
      await axios.get(`${apiEndpoint}/historical/${encodeURIComponent(testSymbol)}`);
    });
    
    console.log(`Historical data endpoint took ${executionTime}ms`);
  });

  test('Earnings endpoint performance', async () => {
    await delay(1000); 
    const { executionTime } = await measureExecutionTime(async () => {
      await axios.post(`${apiEndpoint}/earnings/${testSymbol}`, null, {
        params: {
          quarters: '4'
        }
      });
    });
    
    console.log(`Earnings endpoint took ${executionTime}ms`);
  });

  // Test concurrent requests with delay between batches
  test('Concurrent requests performance', async () => {
    await delay(2000);
    const endpoints = [
      `${apiEndpoint}/overview/${testSymbol}`,
      `${apiEndpoint}/price/${testSymbol}`,
      `${apiEndpoint}/fundamentals/${testSymbol}`
    ];

    const start = process.hrtime.bigint();
    await Promise.all(endpoints.map(endpoint => axios.get(endpoint)));
    const end = process.hrtime.bigint();
    const executionTime = Number(end - start) / 1_000_000;

    console.log(`Concurrent requests took ${executionTime}ms`);
  });
}); 