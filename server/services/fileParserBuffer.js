import path from 'path';

export async function parseFileFromBuffer(buffer, filename, mimetype) {
  const ext = path.extname(filename).toLowerCase();

  if (ext === '.pdf' || mimetype === 'application/pdf') {
    return parsePdfBuffer(buffer);
  } else if (ext === '.docx' || mimetype?.includes('wordprocessingml')) {
    return parseDocxBuffer(buffer);
  } else if (ext === '.xlsx' || ext === '.xls' || mimetype?.includes('spreadsheetml') || mimetype?.includes('ms-excel')) {
    return parseXlsxBuffer(buffer);
  } else {
    return parseTextBuffer(buffer);
  }
}

async function parsePdfBuffer(buffer) {
  const pdfParse = (await import('pdf-parse')).default;
  const data = await pdfParse(buffer);
  return { text: data.text, pageCount: data.numpages, wordCount: countWords(data.text) };
}

async function parseDocxBuffer(buffer) {
  const mammoth = await import('mammoth');
  const result = await mammoth.extractRawText({ buffer });
  return { text: result.value, wordCount: countWords(result.value) };
}

async function parseXlsxBuffer(buffer) {
  const XLSX = await import('xlsx');
  const workbook = XLSX.read(buffer);
  const texts = [];
  for (const name of workbook.SheetNames) {
    texts.push(`=== Sheet: ${name} ===\n${XLSX.utils.sheet_to_csv(workbook.Sheets[name])}`);
  }
  const text = texts.join('\n\n');
  return { text, wordCount: countWords(text) };
}

async function parseTextBuffer(buffer) {
  const text = buffer.toString('utf-8');
  return { text, wordCount: countWords(text) };
}

function countWords(text) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}
