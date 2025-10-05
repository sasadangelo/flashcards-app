# WordBuddy – English Vocabulary Builder App

WordBuddy is an English vocabulary learning app focused on the **650 most frequent and useful English words**. It helps learners build a solid vocabulary foundation through images, sounds, and repeated practice.

- **Not a translation app:** WordBuddy prioritizes **correct pronunciation** and auditory memory over direct translation.
- Uses **images and sounds** to stimulate memory and aid recall.
- Implements **Spaced Repetition System (SRS)** — a scientifically proven method to help transfer vocabulary from short-term to long-term memory by reviewing words at optimal intervals.

You can install the app on your phone [using this link.](https://expo.dev/accounts/sasadangelo/projects/word-buddy/builds/63441488-1ded-4af4-9057-9f789d31e02b) or using the following QR Code:

![Word Buddy QR Code](docs/img/WordBuddy-QR-Code.png)

## Key Features

- Learn and practice the 650 most common English words
- Enhance your listening and pronunciation skills
- Visual and auditory association to improve retention
- Smart repetition scheduling via SRS to maximize memory consolidation

## Running WordBuddy Locally

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI (optional, you can use `npx`)

[Check out here how](docs/Pre-Requisites.md) to install them.

### Setup and Run WordBuddy Locally

1. Clone the repository:

```bash
git clone https://github.com/sasadangelo/flashcards-app.git
cd flashcards-app
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Start the app:

```bash
npx expo start
```

### Run WordBuddy on a Phone

1. On your phone (Android or iOS), install the Expo Go app.
2. Scan the QR code displayed in the terminal or browser to open WordBuddy on your device.

**Notes**:
- Your phone and computer must be on the same local network to connect.
- This mode is intended for development and testing, with live reload enabled.
- For production or standalone app installs, use EAS Build to generate APK/AAB files.

### Build WordBuddy APK (Official)

To generate an official Android APK that can be installed on any device:

1. Login to Expo:

```bash
eas login
```

2. Configure EAS Build (only if you haven't yet) to generate the `eas.jons` file:

```bash
eas build:configure
```

**Note**: this must be done only the first time you build the APK.

3. Build the APK using the production profile from eas.json:

```bash
eas build --platform android --profile production
```

4. Monitor the build:
After running the command, EAS will provide a URL to track the build status, for example:

```bash
https://expo.dev/accounts/<your-account>/projects/word-buddy/builds/<build-id>
```

5. Download the APK:
Once the build completes, open the URL provided by EAS and download the APK. You can then install it on your Android device.

**Notes**:

Make sure your device allows installation from unknown sources.
