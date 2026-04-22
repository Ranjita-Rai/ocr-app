# OCR

A web application built with React and Node.js. It uses Tesseract.js for offline, privacy-first text extraction from images and PDFs.

## Features

- **Privacy-First**: All OCR processing happens on your machine (offline).
- **Modern UI**: Dark-mode glassmorphism design with fluid animations.
- **Drag & Drop**: Effortless file uploading.
- **Instant Preview**: View your images before processing.
- **Text Actions**: Copy results to clipboard or download as `.txt`.
- **Responsive**: Fully functional on mobile and desktop.

## Tech Stack

- **Frontend**: React (Vite), Framer Motion, Lucide Icons, Axios.
- **Backend**: Node.js, Express, Tesseract.js, Multer.

## Installation

### 1. Clone the repository
```bash
clone this repo
cd ocr-app
```

### 2. Setup Backend
```bash
cd server
npm install
```

### 3. Setup Frontend
```bash
cd client
npm install
```

## Running the App

### Start the Backend
```bash
cd server
node index.js
```

### Start the Frontend
```bash
cd client
npm run dev
```

