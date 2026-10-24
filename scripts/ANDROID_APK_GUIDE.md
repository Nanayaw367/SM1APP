# EduTab Fleet - Android APK Build & Deployment Guide

This guide describes all verified methods to produce and install the offline Android APK for **EduTab Fleet**.

---

## 1. Automated GitHub Actions (Cloud APK Build)
A fully configured workflow is located at `.github/workflows/build-apk.yml`.

### How to obtain the APK via GitHub:
1. Push your repository to GitHub:
   ```bash
   git add .
   git commit -m "Add Android offline fleet app"
   git push origin main
   ```
2. Navigate to your repository on GitHub.
3. Click the **"Actions"** tab.
4. Select the **"Build Android APK"** workflow (or trigger it via "Run workflow").
5. The cloud runner (with JDK 17 and Android SDK) compiles the release debug APK.
6. Under **Artifacts**, download **`edutab-fleet-debug-apk.zip`**.
7. Extract the ZIP to obtain `app-debug.apk`.

---

## 2. Instant Online APK with PWABuilder (No Code/Tools)
1. Go to [PWABuilder.com](https://www.pwabuilder.com/).
2. Enter your EduTab Fleet web app URL.
3. Click **"Build My PWA"** → Select **Android**.
4. Click **"Generate Package"** to download the signed/unsigned APK and AAB packages in under 1 minute.

---

## 3. Direct WebAPK Installation (Chrome Native on Android)
1. Open this application in Chrome on any Android tablet.
2. Tap the **"Install App"** prompt (or tap the 3 dots `⋮` → "Install app").
3. Android's OS package installer (`PackageInstaller`) generates a native **WebAPK** package and registers it in `/data/app/`.
4. It appears with its own app launcher icon and runs 100% offline with full IndexedDB persistence.

---

## 4. Local One-Command Build Script
If you have Android Studio or the Android command-line tools installed:
```bash
# Make script executable
chmod +x ./scripts/build-apk.sh

# Run builder
./scripts/build-apk.sh
```

The resulting binary will be located at:
```
android/app/build/outputs/apk/debug/app-debug.apk
```

---

## 5. Installing the APK on School Tablets

### Method A: USB Sideload
1. Connect the tablet to your computer with a USB cable.
2. Copy `app-debug.apk` into the tablet's `Downloads` or internal storage.
3. On the tablet, open the **Files** app.
4. Tap `app-debug.apk`. If prompted, enable **"Install unknown apps"**.
5. Tap **Install**.

### Method B: ADB Command Line
```bash
adb install -r app-debug.apk
```

### Method C: School MDM (Fleet-Wide Deployment)
Upload `app-debug.apk` as a private enterprise app in:
- Google Workspace Admin (Android Enterprise)
- Samsung Knox Manage
- Microsoft Intune / Workspace ONE
