const fs = require('fs');
const path = require('path');
const ExcelJS = require(path.join(__dirname, '../website/node_modules/exceljs'));

const reportsDir = path.join(__dirname, '../website/test-reports');
const files = ['Appium_300_Test_Cases.xlsx', 'Selenium_300_Test_Cases.xlsx', 'Unit_300_Test_Cases.xlsx', 'Load_300_Test_Cases.xlsx', 'Vulnerability_300_Test_Cases.xlsx', 'Smart_Skin_Analysis_Complete_1500_RealTime_Test_Suite.xlsx', 'Smart_Skin_Analysis_Complete_1500_Test_Suite.xlsx'];

async function verifyAllPass() {
  console.log('--- VERIFYING 100% PASS RATE ACROSS ALL GENERATED EXCEL REPORTS ---');

  for (const file of files) {
    const filePath = path.join(reportsDir, file);
    if (!fs.existsSync(filePath)) continue;

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);
    
    let totalRows = 0;
    let failCount = 0;
    let passCount = 0;

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
        } else if (status.includes('PASS')) {
          passCount++;
        }
      });
    });

    console.log(`File: ${file} | Total Cases: ${totalRows} | PASS: ${passCount} | FAIL: ${failCount} | Pass Rate: ${((passCount/totalRows)*100).toFixed(2)}%`);
  }
}

verifyAllPass();
