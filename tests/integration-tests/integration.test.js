const axios = require('axios');
const fs = require('fs');
const path = require('path');

const stockApiEndpoint = 'https://8a38hm2y70.execute-api.ap-southeast-2.amazonaws.com/v1/stocks';
const esgApiEndpoint = 'https://gh4vkppgue.execute-api.us-east-1.amazonaws.com/prod/api';

function writeResult(testName, result) {
    const output = `${new Date().toISOString()} - ${testName}: ${result}\n`;
    fs.appendFileSync(path.join(__dirname, 'integration-results.txt'), output);
}

describe('API Integration Tests', () => {
    beforeAll(() => {
        fs.writeFileSync(path.join(__dirname, 'integration-results.txt'), '');
    });

    // Check that the ticker for disney is consistent across SIERRA Investments and TradeTuah API's
    test('Disney ticker should be consistent across Stock API and ESG API', async () => {
        try {
            // Check in TradeTuah API for Disney stock overview
            const stockResponse = await axios.get(`${stockApiEndpoint}/overview/DIS`);
            expect(stockResponse.status).toBe(200);
            expect(stockResponse.data.symbol).toBe('DIS');
            
            // Check in SIERRA Investments API for Disney ESG data
            const esgResponse = await axios.get(`${esgApiEndpoint}/esg/DIS`);
            expect(esgResponse.status).toBe(200);
            expect(esgResponse.data.ticker).toBe('DIS');
            
            // Verify that both APIs have disney as the company name
            expect(stockResponse.data.name.toLowerCase()).toContain('disney');
            
            writeResult('Disney ticker is consistent across APIs', 'PASSED');
        } catch (error) {
            writeResult('Disney ticker is consistent across APIs', `FAILED: ${error.message}`);
            throw error;
        }
    });

    // Test to make sure 3 companies exist in both databases
    describe('Common companies should exist in both APIs', () => {
        // These companies should exist in both APIs
        const commonCompanies = ['AAPL', 'MSFT', 'GOOGL'];
        
        test.each(commonCompanies)('Company %s should exist in both Stock and ESG APIs', async (symbol) => {
            try {
                // Check in TradeTuah API for company overview
                const stockResponse = await axios.get(`${stockApiEndpoint}/overview/${symbol}`);
                expect(stockResponse.status).toBe(200);
                
                // Check in SIERRA Investments API for company ESG data
                const esgResponse = await axios.get(`${esgApiEndpoint}/esg/${symbol}`);
                expect(esgResponse.status).toBe(200);
                
                // Verify that the ticker is consistent between the two APIs
                expect(stockResponse.data.symbol).toBe(symbol);
                expect(esgResponse.data.ticker).toBe(symbol);
                
                writeResult(`Company ${symbol} exists in both APIs`, 'PASSED');
            } catch (error) {
                writeResult(`Company ${symbol} exists in both APIs`, `FAILED: ${error.message}`);
                console.log(`Error for symbol ${symbol}: ${error.message}`);
                throw error;
            }
        });
    });
}); 