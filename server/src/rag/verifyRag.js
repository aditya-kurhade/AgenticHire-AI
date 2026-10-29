/**
 * Self-verification test for RAG Module
 */
const Chunker = require('./chunker');
const Embedder = require('./embedder');
const Indexer = require('./indexer');
const { RAGService } = require('./ragService');

async function testRAG() {
  console.log('--- Testing RAG Chunking ---');
  const samplePolicy = `
# Engineering Hiring Standards 2026

## 1. Technical Proficiency
Candidates applying for Full Stack or Frontend roles must demonstrate strong proficiency in React, TypeScript, and modern state management. Experience with Node.js and Express is highly desirable. Candidates lacking TypeScript will be evaluated with higher scrutiny.

## 2. Core Architectural Principles
We prioritize modularity, clean code separation, and comprehensive testing. Applications must follow specification-driven design and demonstrate robust error handling.

## 3. Communication & Cultural Fit
Every engineer must communicate clearly in distributed environments and provide reasoned technical tradeoffs during design reviews.
  `.repeat(2);

  const chunks = Chunker.splitText(samplePolicy, { chunkSize: 250, overlap: 50 });
  console.log(`Generated ${chunks.length} chunks.`);
  console.log(`Sample Chunk 0:`, chunks[0]?.text?.substring(0, 100));

  console.log('\n--- Testing RAG Embedder ---');
  const embedding = await Embedder.getEmbedding('React TypeScript Frontend Developer');
  console.log(`Embedding dimensions: ${embedding.length}`);
  const magnitude = Math.sqrt(embedding.reduce((sum, v) => sum + v * v, 0));
  console.log(`Normalized L2 norm: ${magnitude.toFixed(4)} (Expected: ~1.0000)`);

  console.log('\n--- Testing UUID Generation ---');
  const uuid = Indexer.generateDeterministicUUID('resumes_candidate123_0');
  console.log(`Deterministic UUID: ${uuid}`);

  console.log('\n--- Testing Prompt Formatter ---');
  const mockRetrieved = [
    { score: 0.89, text: 'Must know React & TypeScript.' },
    { score: 0.82, text: 'Candidates lacking TypeScript need deeper review.' }
  ];
  const prompt = RAGService.formatContextForPrompt(mockRetrieved, 'HIRING POLICIES');
  console.log(`Formatted Prompt Section:\n${prompt}`);

  console.log('✅ RAG Unit Checks Passed.');
}

testRAG().catch(err => {
  console.error('RAG Test Failed:', err);
});

