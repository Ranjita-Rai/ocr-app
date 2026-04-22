const express = require('express');
const multer = require('multer');
const Tesseract = require('tesseract.js');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, `ocr-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({ storage });

/**
 * @api {post} /upload Upload file for OCR using Tesseract.js
 * @apiName UploadOCR
 * @apiGroup OCR
 */
app.post('/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const filePath = req.file.path;
        console.log(`🚀 Starting OCR for: ${filePath}`);

        // Perform OCR using Tesseract.js
        // We use 'eng' for English, you can add more like 'eng+fra'
        const result = await Tesseract.recognize(
            filePath,
            'eng',
            { 
                logger: m => {
                    if (m.status === 'recognizing text') {
                        console.log(`[OCR Progress] ${(m.progress * 100).toFixed(2)}%`);
                    }
                } 
            }
        );

        const extractedText = result.data.text;

        if (!extractedText || extractedText.trim() === '') {
            fs.unlinkSync(filePath);
            return res.json({ text: 'No text detected in the image.' });
        }

        console.log(`✅ OCR Completed for: ${req.file.originalname}`);

        // Delete local file after processing to save space
        fs.unlinkSync(filePath);

        res.json({ 
            text: extractedText,
            fileName: req.file.originalname,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('❌ OCR Error:', error);
        
        // Cleanup file if it exists and error occurred
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        res.status(500).json({ 
            error: 'Failed to process image', 
            details: error.message 
        });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📁 Uploads directory: ${uploadDir}`);
    console.log(`📦 OCR Engine: Tesseract.js (Offline Ready)`);
});
