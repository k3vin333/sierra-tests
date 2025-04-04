const axios = require('axios');
const fs = require('fs');
const path = require('path');

const apiEndpoint = 'https://gh4vkppgue.execute-api.us-east-1.amazonaws.com/prod/api';

// Helper function to write results
function writeResult(testName, time, status) {
    const result = `${new Date().toISOString()} - ${testName}: ${time}ms (${status})\n`;
    fs.appendFileSync(path.join(__dirname, 'test-results.txt'), result);
}

describe('ESG API Performance Tests', () => {
  beforeAll(() => {
    // Clear previous results
    fs.writeFileSync(path.join(__dirname, 'test-results.txt'), '');
  });

  // John's endpoint - Get all ESG data
  test('Get all ESG data performance', async () => {
    const start = performance.now();
    const response = await axios.get(`${apiEndpoint}/all`);
    const end = performance.now();
    const time = end - start;
    console.log(`Get all ESG data took ${time}ms (Status: ${response.status})`);
    writeResult('Get all ESG data', time, response.status);
  });

  // Kevin's endpoint - Get ESG data for specific company
  test('Get Disney ESG data performance', async () => {
    const start = performance.now();
    const response = await axios.get(`${apiEndpoint}/esg/DIS`);
    const end = performance.now();
    const time = end - start;
    console.log(`Get Disney ESG data took ${time}ms (Status: ${response.status})`);
    writeResult('Get Disney ESG data', time, response.status);
  });

  // Annie's endpoint - Search by score range
  test('Search by total score range performance', async () => {
    const start = performance.now();
    const response = await axios.get(`${apiEndpoint}/search/score/total_score/0/10`);
    const end = performance.now();
    const time = end - start;
    console.log(`Search by total score range took ${time}ms (Status: ${response.status})`);
    writeResult('Search by total score range', time, response.status);
  });

  // Kosar's endpoint - Search by level
  test('Search by total level performance', async () => {
    const start = performance.now();
    const response = await axios.get(`${apiEndpoint}/search/level/total_level/A`);
    const end = performance.now();
    const time = end - start;
    console.log(`Search by total level took ${time}ms (Status: ${response.status})`);
    writeResult('Search by total level', time, response.status);
  });

  // Adi's endpoint - Search by company name
  test('Search by company name performance', async () => {
    const start = performance.now();
    const response = await axios.get(`${apiEndpoint}/search/company/mcdonald`);
    const end = performance.now();
    const time = end - start;
    console.log(`Search by company name took ${time}ms (Status: ${response.status})`);
    writeResult('Search by company name', time, response.status);
  });

  // Test concurrent requests
  test('Concurrent requests performance', async () => {
    const endpoints = [
      `${apiEndpoint}/all`,
      `${apiEndpoint}/esg/DIS`,
      `${apiEndpoint}/search/score/total_score/0/10`,
      `${apiEndpoint}/search/level/total_level/A`,
      `${apiEndpoint}/search/company/mcdonald`
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

describe('Integration Testing', () => {
  beforeAll(() => {
    // Clear previous results
    fs.writeFileSync(path.join(__dirname, 'test-results.txt'), '');
  });

  test('Check the link between company-search and finding all the ESG data for that company', async () => {    
    const response1 = await axios.get(`${apiEndpoint}/search/company/disney`);
    // Check to see the correct response is found from the database
    expect(response1.status).toBe(200);
    expect(response1.data.companies[0].company_name).toStrictEqual('The Walt Disney Company');

    const ticker = response1.data.companies[0].ticker;
    const response2 = await axios.get(`${apiEndpoint}/esg/${ticker}`);
    expect(response2.status).toBe(200);
    expect(response2.data).toBeInstanceOf(Object);
  });

  test('Check rating translates to scores correctly', async () => {    
    const rating = 'C';
    const min = 20;
    const max = 30;

    const response1 = await axios.get(`${apiEndpoint}/search/level/total_level/${rating}`);
    expect(response1.status).toBe(200);

    // Finds one of the expected objects to be in the score search
    const company = {};
    company.ticker = response1.data.companies[0].ticker;
    company.company_name = response1.data.companies[0].company_name;
    company.score = response1.data.companies[0].total_score;
    company.timestamp = response1.data.companies[0].timestamp;

    // Ensures the rating correlates to the correct score range
    expect(company.score).toBeGreaterThanOrEqual(min);
    expect(company.score).toBeLessThanOrEqual(max);

    const response2 = await axios.get(`${apiEndpoint}/search/score/total_score/${min}/${max}`);
    expect(response2.status).toBe(200);
    
    // Checks that the returned array contains the company found by the rating search
    expect(response2.data.validCompanies).toEqual(
      expect.arrayContaining([
        expect.objectContaining(
          company
        )
      ])
    );
  });
});