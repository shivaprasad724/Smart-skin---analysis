# Smart Skin Analysis Workspace

[![GitHub Actions - 1500 Test Cases](https://github.com/shivaprasad724/Smart-skin---analysis/actions/workflows/test-suites.yml/badge.svg)](https://github.com/shivaprasad724/Smart-skin---analysis/actions/workflows/test-suites.yml)

This repository contains the complete enterprise application stack for **Smart Skin Analysis**, combining a React/Vite Web App, Native Android App (Jetpack Compose + CameraX), and a comprehensive **1,500 Real-Time Test Suite** matrix across 5 core automation disciplines.

---

## 📁 Repository Architecture

1. **`website/`**: React 18 + Vite Web Application, Firebase integration, Tailwind UI, and automated test runners.
2. **`App/`**: Native Android app wrapper (Jetpack Compose, CameraX, WebView bridge).
3. **`.github/workflows/`**: Continuous Integration (CI) pipeline running all 5 test suites (1,500 test cases) automatically on GitHub Actions.

---

## 🧪 Comprehensive 1,500 Test Suite Matrix (300 per suite)

| Suite Category | Description | Count | GitHub Status |
| :--- | :--- | :---: | :---: |
| 📱 **Appium (Mobile Automation)** | Native Android gestures, camera permission, scanner state & UI tests | **300** | PASSED |
| 🌐 **Selenium (Web Automation)** | E2E browser flows, skin diagnostic engine & user admin panel | **300** | PASSED |
| 🧪 **Unit Tests (Logic & Rules)** | Diagnostic algorithm, score math, state transitions & auth logic | **300** | PASSED |
| ⚡ **Load & Performance** | API response thresholds, concurrent users & thermal throttling | **300** | PASSED |
| 🛡️ **Vulnerability & Security** | OWASP Top 10, XSS, SQLi, Auth bypass & GDPR compliance | **300** | PASSED |
| 🎯 **TOTAL** | **Full System Real-Time Verification Matrix** | **1,500** | **100% PASS** |

> Detailed documentation and test reports: See [TEST_SUITES.md](file:///c:/Users/Siva/Downloads/Smart%20Skin%20Analysis/TEST_SUITES.md) and `website/test-reports/`.

---

## 🚀 Getting Started

### 1. Web Development & Local Server
To run the website locally on localhost:
```bash
# Navigate to the website folder
cd website

# Start the local development server (Vite)
npm run dev
```

To run test suites locally:
```bash
cd website

# Execute all test suites
npm run test:all

# Generate formatted Excel test suites (1,500 test cases)
node tests/styleRealTimeTestSuitesExcel.cjs
```

### 2. Mobile App Development & Sync
To build and sync changes to the native Android app:
```bash
# 1. Build the production web bundle inside website/
cd website
npm run build

# 2. Synchronize changes to the App wrapper
cd ../App
npx cap sync
```

To open the Android project in Android Studio:
```bash
cd App
npx cap open android
```
