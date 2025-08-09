# Pre-Requisites for Expo / React Native Development with EAS Cloud Build on Mac

This guide explains how to set up your Mac environment for developing and building Android apps using Expo with EAS cloud build.

---

## 1. Install Node.js and npm

Expo requires Node.js and npm.

### Install with Homebrew (recommended)

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
brew install node
```

### Verify installation

```bash
node -v
npm -v
```

## 2. Install Expo CLI and EAS CLI

Expo CLI is used to start and manage Expo projects. EAS CLI is used for cloud builds and submission.

```bash
npm install -g expo-cli eas-cli
```
