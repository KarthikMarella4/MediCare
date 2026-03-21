import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX } from 'react-icons/fi';
import Button from './Button';
import { ComparedMedicine } from '@/lib/types';
import styles from './EditMedicineModal.module.css';

interface EditMedicineModalProps {
  medicine: ComparedMedicine;
  onClose: () => void;
  onSave: (updatedMedicine: ComparedMedicine) => void;
}

export default function EditMedicineModal({ medicine, onClose, onSave }: EditMedicineModalProps) {
  const [editedMed, setEditedMed] = useState<ComparedMedicine>({ ...medicine });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditedMed(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    onSave(editedMed);
  };

  return (
    <AnimatePresence>
      <div className={styles.overlay} onClick={onClose}>
        <motion.div 
          className={styles.modal}
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className={styles.header}>
            <h2 className={styles.title}>Edit Medicine</h2>
            <button className={styles.closeBtn} onClick={onClose}><FiX /></button>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Name</label>
            <input name="name" className={styles.input} value={editedMed.name} onChange={handleChange} />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Dosage</label>
            <input name="dosage" className={styles.input} value={editedMed.dosage} onChange={handleChange} />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Timing</label>
            <select name="timing" className={styles.select} value={editedMed.timing} onChange={handleChange}>
              <option value="Morning">Morning</option>
              <option value="Afternoon">Afternoon</option>
              <option value="Night">Night</option>
              <option value="Multiple">Multiple</option>
              <option value="Unknown">Unknown</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Instructions</label>
            <select name="foodInstruction" className={styles.select} value={editedMed.foodInstruction} onChange={handleChange}>
              <option value="Before Food">Before Food</option>
              <option value="After Food">After Food</option>
              <option value="Anytime">Anytime</option>
              <option value="Unknown">Unknown</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Uses</label>
            <input name="uses" className={styles.input} value={editedMed.uses} onChange={handleChange} />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Side Effects (optional)</label>
            <input name="sideEffects" className={styles.input} value={editedMed.sideEffects || ''} onChange={handleChange} placeholder="e.g. May cause nausea, dizziness" />
          </div>

          <div className={styles.footer}>
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSave}>Save Changes</Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
