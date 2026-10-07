const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

let results = [];
let logs = [];

module.exports = {
  init(force = false) {
    if (results.length > 0 && !force) {
      this.log('reportGenerator.init() called, keeping existing results for consolidated report...');
      return;
    }
    results = [];
    logs = [];
    const reportsDir = path.join(__dirname, '../test-reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }
  },

  log(message, level = 'INFO') {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const logLine = `[${timestamp}] [${level}] ${message}`;
    console.log(logLine);
    logs.push({ timestamp, level, message });
  },

  addResult(category, testName, passed, error = '') {
    results.push({
      category,
      testName,
      status: passed ? 'Passed' : 'Failed',
      error: error || '',
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19)
    });
  },

  async generateAndPrint() {
    const total = results.length;
    const passed = results.filter(r => r.status === 'Passed').length;
    const failed = total - passed;
    const rate = total > 0 ? (passed / total) * 100 : 0;

    this.log('==================================================', 'SUMMARY');
    this.log(`TEST RUN SUMMARY:`, 'SUMMARY');
    this.log(`Total Test Cases: ${total}`, 'SUMMARY');
    this.log(`Passed: ${passed}`, 'SUMMARY');
    this.log(`Failed: ${failed}`, 'SUMMARY');
    this.log(`Overall Pass Rate: ${rate.toFixed(2)}%`, 'SUMMARY');
    this.log('==================================================', 'SUMMARY');

    try {
      const wb = XLSX.utils.book_new();

      // Create Summary Sheet Data
      const summaryRows = [
        ['Smart Skin Analysis E2E Test Suite Summary'],
        ['Generated At:', new Date().toString()],
        [],
        ['Metric Summary', ''],
        ['Total Test Cases', total],
        ['Passed Test Cases', passed],
        ['Failed Test Cases', failed],
        ['Pass Rate', `${rate.toFixed(2)}%`],
        [],
        ['Category-wise Performance Breakdown', '', '', ''],
        ['Category', 'Total Tests', 'Passed', 'Failed', 'Pass Rate']
      ];

      // Extract unique categories in insertion order
      const categories = [...new Set(results.map(r => r.category))];
      
      categories.forEach(cat => {
        const catResults = results.filter(r => r.category === cat);
        const catTotal = catResults.length;
        const catPassed = catResults.filter(r => r.status === 'Passed').length;
        const catFailed = catTotal - catPassed;
        const catRate = catTotal > 0 ? (catPassed / catTotal) * 100 : 0;
        
        summaryRows.push([
          cat,
          catTotal,
          catPassed,
          catFailed,
          `${catRate.toFixed(2)}%`
        ]);
      });

      const wsSummary = XLSX.utils.aoa_to_sheet(summaryRows);
      
      // Formatting and column widths for Summary
      wsSummary['!cols'] = [
        { wch: 35 }, // Category / Metric Name
        { wch: 15 }, // Value / Total
        { wch: 12 }, // Passed
        { wch: 12 }, // Failed
        { wch: 15 }  // Pass Rate
      ];
      
      XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');

      // Create Details Sheet Data
      const detailRows = [
        ['Category', 'Test Case Description', 'Status', 'Error / Log Details', 'Timestamp']
      ];

      results.forEach(r => {
        detailRows.push([
          r.category,
          r.testName,
          r.status,
          r.error || 'N/A (Passed)',
          r.timestamp
        ]);
      });

      const wsDetails = XLSX.utils.aoa_to_sheet(detailRows);
      
      // Column widths for Details
      wsDetails['!cols'] = [
        { wch: 20 }, // Category
        { wch: 45 }, // Test Case
        { wch: 12 }, // Status
        { wch: 60 }, // Error Details
        { wch: 25 }  // Timestamp
      ];

      XLSX.utils.book_append_sheet(wb, wsDetails, 'Test Details');

      // Save the workbook
      const timestamp = Date.now();
      const reportFile = path.join(__dirname, `../test-reports/test-report-${timestamp}.xlsx`);
      XLSX.writeFile(wb, reportFile);
      this.log(`Excel report saved successfully to: ${reportFile}`, 'SUCCESS');

      // Also save a static latest copy for easier exploration
      const latestReportFile = path.join(__dirname, '../test-reports/latest-test-report.xlsx');
      XLSX.writeFile(wb, latestReportFile);
      this.log(`Static copy saved to: ${latestReportFile}`, 'SUCCESS');

      return { total, passed, failed, rate, reportFile };
    } catch (err) {
      this.log(`Failed to generate Excel report: ${err.message}`, 'ERROR');
      return { total, passed, failed, rate, error: err.message };
    }
  }
};
