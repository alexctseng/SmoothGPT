import Papa from 'papaparse';
import * as XLSX from 'xlsx';

function parseCSV(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      complete: (results) => {
        const rowCount = results.data.length;
        const columnCount = results.data[0]?.length || 0;
        const sampleData = results.data.slice(0, 5).map(row => row.join(', ')).join('\n');
        
        resolve(`The user uploaded a CSV file named "${file.name}". It contains ${rowCount} rows and ${columnCount} columns. Here's a sample of the first 5 rows:\n\n${sampleData}`);
      },
      error: (error) => {
        reject(`Failed to parse CSV file: ${error.message}`);
      }
    });
  });
}

function parseXLSX(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        const sheetNames = workbook.SheetNames;
        let summary = `The user uploaded an XLSX file named "${file.name}". It contains ${sheetNames.length} sheet(s): ${sheetNames.join(', ')}.\n\n`;
        
        sheetNames.forEach(sheetName => {
          const sheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
          const rowCount = jsonData.length;
          const columnCount = jsonData[0]?.length || 0;
          const sampleData = jsonData.slice(0, 5).map(row => row.join(', ')).join('\n');
          
          summary += `Sheet "${sheetName}" contains ${rowCount} rows and ${columnCount} columns. Here's a sample of the first 5 rows:\n${sampleData}\n\n`;
        });
        
        resolve(summary);
      } catch (error) {
        reject(`Failed to parse XLSX file: ${error.message}`);
      }
    };
    reader.onerror = () => reject('Failed to read the file');
    reader.readAsArrayBuffer(file);
  });
}

export async function processSpreadsheet(file: File): Promise<string> {
  try {
    if (file.name.endsWith('.csv')) {
      return await parseCSV(file);
    } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
      return await parseXLSX(file);
    } else {
      throw new Error('Unsupported file type. Please upload a CSV or XLSX file.');
    }
  } catch (error) {
    console.error('Error processing spreadsheet:', error);
    return Promise.reject('Failed to process the spreadsheet file.');
  }
}
