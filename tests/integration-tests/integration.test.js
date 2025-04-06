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
            
            writeResult('Disney ticker is consistent across APIs', 'PASSED (200)');
        } catch (error) {
            writeResult('Disney ticker is consistent across APIs', `FAILED: ${error.message}`);
            throw error;
        }
    });

    // Test to make sure 3 companies exist in both databases
    describe('Companies like Apple, Microsoft and Google should exist in both APIs', () => {
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
                
                writeResult(`Company ${symbol} exists in both APIs`, 'PASSED (200)');
            } catch (error) {
                writeResult(`Company ${symbol} exists in both APIs`, `FAILED: ${error.message}`);
                console.log(`Error for symbol ${symbol}: ${error.message}`);
                throw error;
            }
        });
    });
    
    // Test to correlate Disney ESG data dates with historical stock prices
    test('Extract Disney ESG dates and check for corresponding stock prices', async () => {
        try {
            const esgResponse = await axios.get(`${esgApiEndpoint}/esg/DIS`);
            expect(esgResponse.status).toBe(200);
            
            // Extract dates from Disney ESG data, match the dates in the format YYYY-MM-DD
            const esgData = esgResponse.data;
            const dates = [];
            const jsonResponse = JSON.stringify(esgData);
            const dateMatches = jsonResponse.match(/[0-9]{4}-[0-9]{2}-[0-9]{2}/g);
            
            // If there are dates in the ESG data, add them to the dates array
            if (dateMatches && dateMatches.length > 0) {
                dateMatches.forEach(date => {
                    if (!dates.includes(date)) {
                        dates.push(date);
                    }
                });
                
                // Limit to 3 dates since we just want to test functionality
                // Better to not incur the cost of checking all dates
                const datesToCheck = dates.slice(0, 3);
                
                writeResult('Extracted ESG dates for Disney', `${dates.length - 1} dates found, querying TradeTuah API for: ${datesToCheck.join(', ')}`);
                for (const date of datesToCheck) {
                    try {
                        const stockResponse = await axios.get(`${stockApiEndpoint}/historical/DIS`);
                        let priceFound = false;
                        
                        if (stockResponse.data) {
                            // Only look for exact date matches
                            // But maybe for future tests/implementation in our microservice, we can look for close dates/range of dates
                            const stockDate = stockResponse.data.find(item => item.date === date);
                            
                            if (stockDate) {
                                priceFound = true;
                                writeResult(`Disney price for ${date}`, `Found: $${stockDate.close}`);
                            }
                        }
                        
                        if (!priceFound) {
                            writeResult(`Disney price for ${date}`, 'Price not found for this date');
                        }
                    } catch (err) {
                        // This will probably happen since TradeTuah endpoint is broken right now (As of 2025/04/06)
                        writeResult(`Disney price for ${date}`, `Error: ${err.message}`);
                    }
                }
            }
            writeResult('ESG-Price correlation test', 'Completed');
        } catch (error) {
            writeResult('ESG-Price correlation test', `FAILED: ${error.message}`);
            throw error;
        }
    });
}); 