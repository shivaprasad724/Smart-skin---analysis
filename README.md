# Smart Skin Analysis Workspace

This repository has been organized into separate directories for the React Web App and the Native Mobile App wrapper:

1. **`website/`**: The frontend React/Vite web application.
2. **`App/`**: The native mobile wrapper configuration (Capacitor & native Android files).

---

## Getting Started

### 1. Web Development & Local Server
To run the website locally on localhost:
```bash
# Navigate to the website folder
cd website

# Start the local development server (Vite)
npm run dev
```

To run E2E tests:
```bash
cd website
# Headless mode
npm run test:e2e
# Headed mode (opens Chrome browser live)
$env:HEADLESS="false"; npm run test:e2e
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

