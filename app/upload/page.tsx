'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiMinus, FiAlertCircle } from 'react-icons/fi';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import FileUpload from '@/components/ui/FileUpload';
import styles from './page.module.css';

type ProcessingStep = 'idle' | 'scanning' | 'done' | 'error';

export default function UploadPage() {
  const router = useRouter();
  const [newFile, setNewFile] = useState<File | null>(null);
  const [oldFile, setOldFile] = useState<File | null>(null);
  const [showOptional, setShowOptional] = useState(false);
  const [step, setStep] = useState<ProcessingStep>('idle');
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Unified scan: sends image directly to GPT-4 Vision — no slow Tesseract!
  const scanPrescription = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('/api/scan', { method: 'POST', body: formData });
    const data = await res.json();
    if (!data.success) throw new Error('Could not extract medicines. Please use a clear, well-lit prescription image.');
    if (!data.medicines || data.medicines.length === 0) {
      throw new Error('No medicines were detected. Please upload a clearer prescription image.');
    }
    return data.medicines;
  };

  const handleProcess = async () => {
    if (!newFile) return;
    setStep('scanning');
    setErrorMsg('');

    try {
      const newMedicines = await scanPrescription(newFile);

      let oldMedicines = null;
      if (showOptional && oldFile) {
        oldMedicines = await scanPrescription(oldFile);
      }

      setStep('done');

      sessionStorage.setItem('medicom_new', JSON.stringify(newMedicines));
      if (oldMedicines) sessionStorage.setItem('medicom_old', JSON.stringify(oldMedicines));
      else sessionStorage.removeItem('medicom_old');

      const mode = (showOptional && oldFile) ? 'compare' : 'single';
      router.push(`/compare?mode=${mode}`);
    } catch (err: any) {
      setStep('error');
      setErrorMsg(err.message || 'An unknown error occurred.');
    }
  };

  const getStatusText = () => {
    switch (step) {
      case 'scanning': return 'AI is reading your prescription...';
      case 'done': return 'Done! Redirecting...';
      default: return '';
    }
  };

  const isProcessing = step === 'scanning' || step === 'done';

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <motion.h1 
          className={styles.title}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Analyze Prescription
        </motion.h1>
        <motion.p 
          className={styles.subtitle}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          Upload your prescription image or PDF for smart analysis
        </motion.p>
      </div>

      <div className={styles.uploadContainer}>
        {/* Primary Prescription */}
        <motion.div 
          className={styles.primaryUpload}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className={styles.cardContent}>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', textAlign: 'center' }}>
              Upload your latest prescription — our AI will extract all medicines automatically.
            </p>
            <FileUpload 
              label="New Prescription" 
              onFileAccepted={(file) => { setNewFile(file); setStep('idle'); }} 
            />
          </Card>
        </motion.div>

        {/* Optional Comparison Toggle */}
        <motion.div
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           transition={{ delay: 0.3 }}
        >
          <div className={styles.optionalHeader}>
            <div className={styles.optionalTitle}>
              Compare with older version? <span className={styles.badge}>Optional</span>
            </div>
            <button 
              className={styles.optionalToggle}
              onClick={() => setShowOptional(!showOptional)}
              type="button"
            >
              {showOptional ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><FiMinus/> Hide</span>
              ) : (
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><FiPlus/> Add Old Prescription</span>
              )}
            </button>
          </div>

          <AnimatePresence>
            {showOptional && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: 'auto', marginTop: '1rem' }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                style={{ overflow: 'hidden' }}
              >
                <Card className={styles.cardContent}>
                  <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
                    Upload your previous prescription to highlight what was added, removed, or modified.
                  </p>
                  <FileUpload 
                    label="Old Prescription (Optional)" 
                    onFileAccepted={(file) => setOldFile(file)} 
                  />
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Status / Error Messages */}
      <AnimatePresence>
        {isProcessing && (
          <motion.div 
            className={styles.statusBox}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <div className={styles.loadingSpinner} />
            <span>{getStatusText()}</span>
          </motion.div>
        )}
        {step === 'error' && (
          <motion.div 
            className={styles.errorBox}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <FiAlertCircle />
            <span>{errorMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div 
        className={styles.actions}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Button 
          size="lg" 
          disabled={!newFile || isProcessing}
          onClick={handleProcess}
          style={{ width: '100%', maxWidth: '340px' }}
        >
          {isProcessing ? getStatusText() : (showOptional && oldFile ? 'Compare Prescriptions' : 'Analyze Prescription')}
        </Button>
      </motion.div>
    </div>
  );
}
