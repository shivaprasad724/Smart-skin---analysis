const fs = require('fs');
const path = require('path');
const ExcelJS = require(path.join(__dirname, '../website/node_modules/exceljs'));

const targetFile = path.join(__dirname, 'unzipped_reports', 'Smart_Skin_Analysis_Complete_1500_Test_Suite.xlsx');

async function inspectFailures() {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(targetFile);

  const allFailures = [];

  workbook.worksheets.forEach(sheet => {
    let headers = [];
    sheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) {
        headers = row.values.map(v => (v ? v.toString().trim() : ''));
        return;
      }
      const rowObj = {};
      row.values.forEach((val, idx) => {
        if (headers[idx]) {
          rowObj[headers[idx]] = val ? val.toString().trim() : '';
        }
      });

      const status = (rowObj['Status'] || rowObj['STATUS'] || rowObj['Result'] || rowObj['Execution Status'] || '').toUpperCase();
      if (status.includes('FAIL')) {
        allFailures.push({
          sheet: sheet.name,
          row: rowNumber,
          id: rowObj['Test Case ID'] || rowObj['ID'] || rowObj['Test ID'] || 'N/A',
          title: rowObj['Test Case Name'] || rowObj['Title'] || rowObj['Scenario'] || 'N/A',
          reason: rowObj['Failure Reason'] || rowObj['Actual Result'] || rowObj['Notes'] || rowObj['Error'] || 'N/A'
        });
      }
    });
  });

  console.log(`Total Failures Found in Smart_Skin_Analysis_Complete_1500_Test_Suite.xlsx: ${allFailures.length}`);
  console.dir(allFailures, { maxArrayLength: null });
}

inspectFailures();
