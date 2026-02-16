import { createWorker } from 'tesseract.js';

let workerInstance = null;

export const getOCRWorker = async () => {
  if (!workerInstance) {
    workerInstance = await createWorker('eng');
    console.log("✅ OCR Worker created and ready!");
  }
  return workerInstance;
};
