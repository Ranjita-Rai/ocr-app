import { useState, useRef } from 'react';
import axios from 'axios';
import {
  Upload,
  FileText,
  Copy,
  Download,
  Trash2,
  Zap,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = 'http://localhost:5000';

function App() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      processFile(selectedFile);
    }
  };

  const processFile = (selectedFile) => {
    setError('');
    setText('');

    // Check file type
    const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!validTypes.includes(selectedFile.type)) {
      setError('Please upload a JPG, PNG, or PDF file.');
      return;
    }

    setFile(selectedFile);

    // Create preview for images
    if (selectedFile.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setPreview(null); // No preview for PDF yet
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      processFile(droppedFile);
    }
  };

  const handleSubmit = async () => {
    if (!file) return;

    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(`${API_URL}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setText(response.data.text);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to process the file. Is the server running?');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const fileBlob = new Blob([text], { type: 'text/plain' });
    element.href = URL.createObjectURL(fileBlob);
    element.download = `extracted_text_${Date.now()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const reset = () => {
    setFile(null);
    setPreview(null);
    setText('');
    setError('');
  };

  return (
    <div className="app">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1>OCR</h1>
        <p className="subtitle">Transform images and PDFs into editable text.</p>
      </motion.div>

      <div className="container">
        {/* Left Side: Upload & Preview */}
        <motion.div
          className="card"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="status-badge">
            <Zap size={14} style={{ marginRight: '6px' }} />
            Powered by Tesseract.js
          </div>

          {!file ? (
            <div
              className={`upload-area ${dragging ? 'dragging' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current.click()}
            >
              <Upload size={48} color="var(--primary)" />
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontWeight: 600, margin: '0.5rem 0' }}>Drop your file here</p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>or click to browse (JPG, PNG, PDF)</p>
              </div>
              <input
                type="file"
                hidden
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".jpg,.jpeg,.png,.pdf"
              />
            </div>
          ) : (
            <div style={{ position: 'relative' }}>
              <div className="preview-container" style={{ margin: '1rem 0' }}>
                {preview ? (
                  <img src={preview} alt="Preview" className="preview-img" />
                ) : (
                  <div className="upload-area" style={{ borderStyle: 'solid' }}>
                    <FileText size={48} />
                    <p>{file.name}</p>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button
                  className="btn"
                  style={{ flex: 1 }}
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {loading ? <div className="loader"></div> : 'Extract Text'}
                </button>
                <button
                  className="btn btn-outline"
                  onClick={reset}
                  disabled={loading}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ color: '#ef4444', marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}
            >
              <AlertCircle size={16} />
              {error}
            </motion.div>
          )}
        </motion.div>

        {/* Right Side: Results */}
        <motion.div
          className="card"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileText size={20} color="var(--primary)" />
              Extracted Results
            </h3>
            {text && (
              <div className="status-badge success-badge">
                <CheckCircle2 size={14} style={{ marginRight: '6px' }} />
                Processed
              </div>
            )}
          </div>

          <textarea
            className="text-area"
            placeholder="The extracted text will appear here..."
            value={text}
            readOnly
          />

          <AnimatePresence>
            {text && (
              <motion.div
                className="actions"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <button className="btn btn-outline" onClick={handleCopy}>
                  {copied ? <CheckCircle2 size={18} color="#4ade80" /> : <Copy size={18} />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
                <button className="btn btn-outline" onClick={handleDownload}>
                  <Download size={18} />
                  Download .txt
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}

export default App;
