const fs = require('fs');
const path = require('path');
const ExcelJS = require(path.join(__dirname, '../website/node_modules/exceljs'));

const unzippedDir = path.join(__dirname, 'unzipped_reports');
const files = fs.readdirSync(unzippedDir).filter(f => f.endsWith('.xlsx') && !f.startsWith('~$'));

console.log('--- INSPECTING TEST REPORT EXCEL FILES FOR FAILURES ---');

async function inspectAll() {
  for (const file of files) {
    const filePath = path.join(unzippedDir, file);
    try {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.readFile(filePath);
      
      let totalRows = 0;
      let failCount = 0;
      let passCount = 0;
      const failDetails = [];

      workbook.worksheets.forEach(sheet => {
        let headers = [];
        sheet.eachRow((row, rowNumber) => {
          if (rowNumber === 1) {
            headers = row.values.map(v => (v ? v.toString().trim() : ''));
            return;
          }
          totalRows++;
          const rowObj = {};
          row.values.forEach((val, idx) => {
            if (headers[idx]) {
              rowObj[headers[idx]] = val ? val.toString().trim() : '';
            }
          });

          const status = (rowObj['Status'] || rowObj['STATUS'] || rowObj['Result'] || rowObj['Execution Status'] || '').toUpperCase();
          if (status.includes('FAIL')) {
            failCount++;
            if (failDetails.length < 10) {
              failDetails.push({
                sheet: sheet.name,
                row: rowNumber,
                id: rowObj['Test Case ID'] || rowObj['ID'] || rowObj['Test ID'] || 'N/A',
                title: rowObj['Test Case Name'] || rowObj['Title'] || rowObj['Scenario'] || 'N/A',
                reason: rowObj['Failure Reason'] || rowObj['Actual Result'] || rowObj['Notes'] || rowObj['Error'] || 'N/A'
              });
            }
          } else if (status.includes('PASS')) {
            passCount++;
          }
        });
      });

      console.log(`\nFile: ${file}`);
      console.log(`Total Rows: ${totalRows} | PASS: ${passCount} | FAIL: ${failCount}`);
      if (failCount > 0) {
        console.log('Sample Failures:');
        console.dir(failDetails, { depth: null });
      }
    } catch (err) {
      console.error(`Error reading ${file}: ${err.message}`);
    }
  }
}

inspectAll();
