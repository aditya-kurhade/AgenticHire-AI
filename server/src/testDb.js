const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const connectDB = require('./config/db');
const { qdrantClient, initQdrantCollections } = require('./config/qdrant');
const Job = require('./models/Job');

const runTest = async () => {
  console.log('--- Testing MongoDB connection & Mongoose models ---');
  try {
    const conn = await connectDB();
    console.log('MongoDB successfully connected!');
    
    // Create/retrieve a mock job specification to test model functionality
    const testJobData = {
      title: 'Software Engineer Test',
      description: 'A test job spec',
      required_skills: ['JavaScript', 'React'],
      min_experience: 2
    };
    
    const countBefore = await Job.countDocuments();
    console.log(`Current jobs in database: ${countBefore}`);
    
    const newJob = await Job.create(testJobData);
    console.log(`Successfully created job: ${newJob.title} (ID: ${newJob._id})`);
    
    await Job.deleteOne({ _id: newJob._id });
    console.log('Successfully cleaned up test job.');
    
    await conn.disconnect();
    console.log('Disconnected MongoDB cleanly.');
  } catch (error) {
    console.error(`MongoDB verification failed: ${error.message}`);
    console.log('Ensure MongoDB daemon or docker container is active.');
  }

  console.log('\n--- Testing Qdrant vector database connection & collections ---');
  try {
    console.log(`Qdrant URL configured: ${process.env.QDRANT_URL || 'http://localhost:6333'}`);
    await initQdrantCollections();
    
    const collectionsResponse = await qdrantClient.getCollections();
    console.log('Found collections:', collectionsResponse.collections.map(c => c.name));
    console.log('Qdrant verification complete.');
  } catch (error) {
    console.error(`Qdrant verification failed: ${error.message}`);
    console.log('Ensure Qdrant daemon or docker container is active.');
  }
};

runTest();
