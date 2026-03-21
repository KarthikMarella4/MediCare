import { ComparedMedicine } from '@/lib/types';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';
import styles from './MedicineCard.module.css';

interface MedicineCardProps {
  medicine: ComparedMedicine;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  showStatus?: boolean;
}

export default function MedicineCard({ medicine, onClick, onEdit, onDelete, showStatus = true }: MedicineCardProps) {
  const getStatusClass = () => {
    switch (medicine.status) {
      case 'Added': return styles.added;
      case 'Removed': return styles.removed;
      case 'Modified': return styles.modified;
      case 'Unchanged': return styles.unchanged;
      default: return '';
    }
  };

  const getStatusLabel = () => {
    switch (medicine.status) {
      case 'Added': return 'Newly Added';
      case 'Removed': return 'Removed';
      case 'Modified': return 'Modified Dose/Time';
      case 'Unchanged': return 'Unchanged';
      default: return '';
    }
  };

  return (
    <div 
      className={`${styles.card} ${getStatusClass()} ${onClick ? styles.clickable : ''}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className={styles.header}>
        <h3 className={styles.name}>{medicine.name}</h3>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {showStatus && medicine.status !== 'Unchanged' && (
            <span className={`${styles.badge} ${getStatusClass()}`}>
              {getStatusLabel()}
            </span>
          )}
          {onEdit && (
            <button 
              className={styles.editBtn} 
              onClick={(e) => { e.stopPropagation(); onEdit(); }}
              aria-label="Edit Medicine"
            >
              <FiEdit2 />
            </button>
          )}
          {onDelete && (
            <button
              className={styles.deleteBtn}
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              aria-label="Delete Medicine"
            >
              <FiTrash2 />
            </button>
          )}
        </div>
      </div>

      <div className={styles.details}>
        <div className={styles.detailRow}>
          <span className={styles.label}>Dosage:</span>
          <span className={styles.value}>
            {medicine.changes?.dosage ? (
              <>
                <span className={styles.oldValue}>{medicine.changes.dosage.old}</span>
                <span className={styles.arrow}>→</span>
                <span className={styles.newValue}>{medicine.changes.dosage.new}</span>
              </>
            ) : (
              medicine.dosage
            )}
          </span>
        </div>

        <div className={styles.detailRow}>
          <span className={styles.label}>Timing:</span>
          <span className={styles.value}>
            {medicine.changes?.timing ? (
              <>
                <span className={styles.oldValue}>{medicine.changes.timing.old}</span>
                <span className={styles.arrow}>→</span>
                <span className={styles.newValue}>{medicine.changes.timing.new}</span>
              </>
            ) : (
              medicine.timing
            )}
          </span>
        </div>

        <div className={styles.detailRow}>
          <span className={styles.label}>Instructions:</span>
          <span className={styles.value}>
            {medicine.changes?.foodInstruction ? (
              <>
                <span className={styles.oldValue}>{medicine.changes.foodInstruction.old}</span>
                <span className={styles.arrow}>→</span>
                <span className={styles.newValue}>{medicine.changes.foodInstruction.new}</span>
              </>
            ) : (
              medicine.foodInstruction
            )}
          </span>
        </div>

        <div className={styles.usesRow}>
          <span className={styles.label}>Uses:</span>
          <p className={styles.uses}>{medicine.uses}</p>
        </div>

        {medicine.sideEffects && (
          <div className={styles.usesRow} style={{ borderTop: '1px dashed rgba(239,68,68,0.15)', paddingTop: '0.75rem' }}>
            <span className={styles.label} style={{ color: 'var(--status-removed)' }}>⚠️ Side Effects:</span>
            <p className={styles.uses} style={{ color: 'var(--text-muted)', fontStyle: 'normal' }}>{medicine.sideEffects}</p>
          </div>
        )}
      </div>
    </div>
  );
}
