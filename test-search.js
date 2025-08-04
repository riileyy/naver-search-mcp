// Test the search function directly
async function testSearch() {
  try {
    // Initialize the client first
    const { NaverSearchClient } = await import('./dist/src/clients/naver-search.client.js');
    
    const client = NaverSearchClient.getInstance();
    client.initialize({
      clientId: 'xFgVuGN4saIIvMiWOG7d',
      clientSecret: 'kYpjXci3HV'
    });
    
    console.log('Client initialized');
    
    // Create a mock request for search_webkr
    const testArgs = {
      query: 'Node.js',
      display: 5,
      start: 1
    };
    
    console.log('Test arguments:', testArgs);
    
    // Import the handler directly to test
    const { searchToolHandlers } = await import('./dist/src/handlers/search.handlers.js');
    
    if (searchToolHandlers.search_webkr) {
      console.log('Calling search_webkr handler...');
      const result = await searchToolHandlers.search_webkr(testArgs);
      console.log('Search result:', JSON.stringify(result, null, 2));
    } else {
      console.error('search_webkr handler not found');
    }
    
  } catch (error) {
    console.error('Test error:', error);
    console.error('Stack trace:', error.stack);
  }
}

testSearch();