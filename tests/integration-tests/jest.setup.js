jest.setTimeout(60000);

beforeAll(() => {
  console.log('Starting API integration tests...');
});

afterAll(() => {
  console.log('API integration tests completed.');
}); 