const xlsx = require('xlsx');

const file1 = 'C:/Users/HP/Downloads/Kuwait_Printing_Prospects.xlsx';
const file2 = 'C:/Users/HP/Downloads/Kuwait_Commercial_Printing_Prospects.xlsx';

function readHeadersAndSample(filePath) {
    try {
        console.log('--- ' + filePath + ' ---');
        const workbook = xlsx.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const json = xlsx.utils.sheet_to_json(sheet, { header: 1 });
        if (json.length > 0) {
            console.log('Headers:', json[0]);
        }
        if (json.length > 1) {
            console.log('Row 1:', json[1]);
        }
    } catch (e) {
        console.error('Error reading', filePath, e.message);
    }
}

readHeadersAndSample(file1);
readHeadersAndSample(file2);
