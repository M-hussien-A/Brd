import fs from 'fs';
import path from 'path';

export async function parseFile(filePath, mimetype) {
  const ext = path.extname(filePath).toLowerCase();

  if (ext === '.pdf' || mimetype === 'application/pdf') {
    return parsePdf(filePath);
  } else if (ext === '.docx' || mimetype?.includes('wordprocessingml')) {
    return parseDocx(filePath);
  } else if (ext === '.xlsx' || ext === '.xls' || mimetype?.includes('spreadsheetml') || mimetype?.includes('ms-excel')) {
    return parseXlsx(filePath);
  } else {
    return parseText(filePath);
  }
}

async function parsePdf(filePath) {
  const pdfParse = (await import('pdf-parse')).default;
  const buffer = fs.readFileSync(filePath);
  const data = await pdfParse(buffer);
  return {
    text: data.text,
    pageCount: data.numpages,
    wordCount: countWords(data.text),
  };
}

async function parseDocx(filePath) {
  const mammoth = await import('mammoth');
  const buffer = fs.readFileSync(filePath);
  const result = await mammoth.extractRawText({ buffer });
  return {
    text: result.value,
    wordCount: countWords(result.value),
  };
}

async function parseXlsx(filePath) {
  const XLSX = await import('xlsx');
  const workbook = XLSX.read(fs.readFileSync(filePath));
  const texts = [];
  for (const name of workbook.SheetNames) {
    const sheet = workbook.Sheets[name];
    texts.push(`=== Sheet: ${name} ===\n${XLSX.utils.sheet_to_csv(sheet)}`);
  }
  const text = texts.join('\n\n');
  return { text, wordCount: countWords(text) };
}

async function parseText(filePath) {
  const text = fs.readFileSync(filePath, 'utf-8');
  return { text, wordCount: countWords(text) };
}

function countWords(text) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}
