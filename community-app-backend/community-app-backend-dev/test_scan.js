const { scanCommunityForMatches } = require('./src/services/familyMatcherService');

async function testScan() {
  try {
    const result = await scanCommunityForMatches(1);
    console.log("Scan Result:", result);
  } catch (error) {
    console.error("Scan Error:", error);
  }
  process.exit(0);
}

// We need to compile the TS files or run via ts-node.
// Since we are in the backend directory, let's just make an API call to the server!
