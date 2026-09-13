const { QdrantClient } = require('@qdrant/js-client-rest');

const qdrantUrl = process.env.QDRANT_URL || 'http://localhost:6333';
const qdrantApiKey = process.env.QDRANT_API_KEY || undefined;
const qdrantClient = new QdrantClient({ 
  url: qdrantUrl, 
  apiKey: qdrantApiKey,
  checkCompatibility: false 
});

const initQdrantCollections = async () => {
  try {
    // List existing collections
    const collectionsResponse = await qdrantClient.getCollections();
    const existingNames = collectionsResponse.collections.map(c => c.name);

    const targetCollections = ['resumes', 'policies'];

    for (const name of targetCollections) {
      if (!existingNames.includes(name)) {
        console.log(`Creating Qdrant collection: ${name}`);
        await qdrantClient.createCollection(name, {
          vectors: {
            size: 384, // BAAI/bge-small-en-v1.5 has 384 dimensions
            distance: 'Cosine'
          }
        });
        console.log(`Collection ${name} created successfully.`);
      } else {
        console.log(`Qdrant collection already exists: ${name}`);
      }
    }
  } catch (error) {
    console.error(`Error initializing Qdrant collections: ${error.message}`);
    // Do not crash the entire process if qdrant is not running during start (let it log)
  }
};

module.exports = {
  qdrantClient,
  initQdrantCollections
};
