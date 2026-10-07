/**
 * Consolidated Test Runner
 * Coordinates and executes:
 * 1. Vulnerability Test Suite (200 checks)
 * 2. Load Test Suite (200 requests)
 * 3. Appium Mobile UI Test Suite (200 checks)
 * 4. Existing E2E Test Suite
 * 
 * Aggregates all results into a single comprehensive Excel report.
 */

const path = require('path');
const Mocha = require('mocha');
const reportGenerator = require('./reportGenerator.cjs');
const { runVulnTests } = require('./vuln.test.cjs');
const { runLoadTest } = require('./load.test.cjs');

const log = (message, level) => reportGenerator.log(message, level);

async function executeAll() {
  log('==================================================');
  log('STARTING CONSOLIDATED TEST SUITE RUNNER');
  log('==================================================');

  // Initialize report generator and clear previous runs
  reportGenerator.init(true);

  // 1. Run Vulnerability compliance tests
  try {
    await runVulnTests();
  } catch (err) {
    log(`Vulnerability tests failed to execute: ${err.message}`, 'ERROR');
  }

  // 2. Run Load tests
  try {
    await runLoadTest();
  } catch (err) {
    log(`Load tests failed to execute: ${err.message}`, 'ERROR');
  }

  // 3. Run Mocha UI tests (E2E and Appium)
  log('Initializing Mocha programmatic runner...');
  const mocha = new Mocha({
    timeout: 600000,
    reporter: 'spec'
  });

  // Add tests
  mocha.addFile(path.resolve(__dirname, 'appium.test.cjs'));
  mocha.addFile(path.resolve(__dirname, 'e2e.test.cjs'));

  log('Executing Mocha UI suites (Appium Mobile and E2E)...');
  await new Promise((resolve) => {
    mocha.run((failures) => {
      if (failures) {
        log(`Mocha suites completed with ${failures} assertion failures.`, 'WARNING');
      } else {
        log('Mocha suites completed with zero failures.');
      }
      resolve();
    });
  });

  log('==================================================');
  log('CONSOLIDATED TESTS COMPLETED. WRITING FINAL REPORT...');
  log('==================================================');

  // Final consolidated report generation
  const summary = await reportGenerator.generateAndPrint();
  if (summary && summary.reportFile) {
    log(`SUCCESS: Consolidated report compiled to: ${summary.reportFile}`, 'SUCCESS');
  } else {
    log('WARNING: Consolidated report could not be compiled.', 'WARNING');
  }
}

executeAll().catch((err) => {
  console.error('Fatal execution error in test coordinator:', err);
  process.exit(1);
});
