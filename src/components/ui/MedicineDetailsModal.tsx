import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX } from 'react-icons/fi';
import Button from './Button';
import { ComparedMedicine } from '@/lib/types';
import { explainMedicine } from '@/lib/api';
import styles from './MedicineDetailsModal.module.css';

interface MedicineDetailsModalProps {
  medicine: ComparedMedicine;
  onClose: () => void;
}

export default function MedicineDetailsModal({ medicine, onClose }: MedicineDetailsModalProps) {
  const [explanation, setExplanation] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExplanation = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await explainMedicine(medicine.name, medicine.uses);
        setExplanation(result);
      } catch (err: any) {
        console.error('Explanation Error:', err);
        setError(err.message || 'Failed to connect to AI. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchExplanation();
  }, [medicine.name, medicine.uses]);

  return (
    <AnimatePresence>
      <div className={styles.overlay} onClick={onClose}>
        <motion.div 
          className={styles.modal}
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className={styles.header}>
            <h2 className={styles.title}>{medicine.name}</h2>
            <button className={styles.closeBtn} onClick={onClose}>
              <FiX />
            </button>
          </div>
          
          <div className={styles.content}>
            <div className={styles.detailGroup}>
              <div className={styles.label}>Dosage</div>
              <div className={styles.value}>{medicine.dosage}</div>
            </div>
            
            <div className={styles.detailGroup}>
              <div className={styles.label}>Timing</div>
              <div className={styles.value}>{medicine.timing}</div>
            </div>
            
            <div className={styles.detailGroup}>
              <div className={styles.label}>Instructions</div>
              <div className={styles.value}>{medicine.foodInstruction}</div>
            </div>

            <div className={styles.detailGroup}>
              <div className={styles.label}>Used For</div>
              <div className={styles.value}>{medicine.uses}</div>
            </div>

            <div className={styles.aiExplanationBox}>
              <div className={styles.aiHeader}>
                <span className={styles.aiSparkle}>✨</span> 
                <strong>AI Explanation</strong>
              </div>
              {isLoading ? (
                <div className={styles.loadingDots}>
                  <span></span><span></span><span></span>
                </div>
              ) : error ? (
                <p className={styles.aiText} style={{ color: 'var(--status-removed)' }}>{error}</p>
              ) : (
                <motion.p  
                  className={styles.aiText}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4 }}
                >
                  {explanation}
                </motion.p>
              )}
            </div>
          </div>

          <div className={styles.footer}>
            <Button onClick={onClose} fullWidth>Close</Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
