/**
 * Text Chunker for RAG Pipeline
 * Splits documents into overlapping chunks preserving sentence and paragraph boundaries.
 */

const specLoader = require('../utils/specLoader');

class Chunker {
  /**
   * Split text into overlapping chunks.
   * @param {string} text - The raw text to split.
   * @param {object} options - Configuration overrides (chunkSize, overlap).
   * @returns {Array<{ text: string, chunkIndex: number }>}
   */
  static splitText(text, options = {}) {
    if (!text || typeof text !== 'string') {
      return [];
    }

    const cleanedText = text.replace(/\r\n/g, '\n').replace(/\t/g, ' ').trim();
    if (!cleanedText) return [];

    let ragSettings = {};
    try {
      ragSettings = specLoader.loadRagSettings();
    } catch {
      // Fallback if spec load fails
      ragSettings = {};
    }

    const chunkSize = options.chunkSize || ragSettings.chunking?.resume_chunk_size || 500;
    const overlap = options.overlap !== undefined ? options.overlap : (ragSettings.chunking?.chunk_overlap || 100);

    // If entire text fits inside one chunk, return directly
    if (cleanedText.length <= chunkSize) {
      return [{ text: cleanedText, chunkIndex: 0 }];
    }

    // Split text into paragraphs or sentences
    const paragraphs = cleanedText.split(/\n\s*\n/);
    const chunks = [];
    let currentChunk = '';
    let chunkIndex = 0;

    for (const paragraph of paragraphs) {
      const trimmedPara = paragraph.trim();
      if (!trimmedPara) continue;

      if ((currentChunk.length + trimmedPara.length + 1) <= chunkSize) {
        currentChunk = currentChunk ? `${currentChunk}\n\n${trimmedPara}` : trimmedPara;
      } else {
        // Need to flush current chunk if not empty
        if (currentChunk) {
          chunks.push({ text: currentChunk, chunkIndex: chunkIndex++ });
          // Handle overlap by retaining trailing characters
          const sliceStart = Math.max(0, currentChunk.length - overlap);
          const overlapText = currentChunk.slice(sliceStart).trim();
          currentChunk = overlapText ? `${overlapText}\n\n${trimmedPara}` : trimmedPara;
        } else {
          // A single paragraph is larger than chunkSize: split by sentences
          const sentences = trimmedPara.match(/[^.!?]+[.!?]+(\s|$)|[^.!?]+$/g) || [trimmedPara];
          for (const sentence of sentences) {
            const trimmedSentence = sentence.trim();
            if (!trimmedSentence) continue;

            if ((currentChunk.length + trimmedSentence.length + 1) <= chunkSize) {
              currentChunk = currentChunk ? `${currentChunk} ${trimmedSentence}` : trimmedSentence;
            } else {
              if (currentChunk) {
                chunks.push({ text: currentChunk, chunkIndex: chunkIndex++ });
                const sliceStart = Math.max(0, currentChunk.length - overlap);
                const overlapText = currentChunk.slice(sliceStart).trim();
                currentChunk = overlapText ? `${overlapText} ${trimmedSentence}` : trimmedSentence;
              } else {
                // If single sentence exceeds chunkSize, slice forcefully
                let start = 0;
                while (start < trimmedSentence.length) {
                  const piece = trimmedSentence.slice(start, start + chunkSize);
                  chunks.push({ text: piece, chunkIndex: chunkIndex++ });
                  start += (chunkSize - overlap);
                }
                currentChunk = '';
              }
            }
          }
        }
      }
    }

    if (currentChunk.trim().length > 0) {
      chunks.push({ text: currentChunk.trim(), chunkIndex: chunkIndex++ });
    }

    return chunks;
  }
}

module.exports = Chunker;

