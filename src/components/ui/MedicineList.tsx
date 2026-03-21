import { ComparedMedicine } from '@/lib/types';
import MedicineCard from '@/components/ui/MedicineCard';
import { motion, Variants } from 'framer-motion';
import styles from './MedicineList.module.css';

const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const item: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

interface MedicineListProps {
  medicines: ComparedMedicine[];
  title: string;
  onMedicineClick?: (medicine: ComparedMedicine) => void;
  onEdit?: (medicine: ComparedMedicine) => void;
  onDelete?: (medicine: ComparedMedicine) => void;
}

export default function MedicineList({ medicines, title, onMedicineClick, onEdit, onDelete }: MedicineListProps) {
  if (medicines.length === 0) return null;

  return (
    <div className={styles.section}>
      <h2 className={styles.title}>{title} <span className={styles.count}>({medicines.length})</span></h2>
      <motion.div 
        className={styles.grid}
        variants={container}
        initial="hidden"
        animate="show"
      >
        {medicines.map((med) => (
          <motion.div key={med.id} variants={item}>
            <MedicineCard 
              medicine={med} 
              onClick={onMedicineClick ? () => onMedicineClick(med) : undefined} 
              onEdit={onEdit ? () => onEdit(med) : undefined}
              onDelete={onDelete ? () => onDelete(med) : undefined}
            />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
