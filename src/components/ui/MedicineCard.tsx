import { ComparedMedicine } from '@/lib/types';
import { FiEdit2, FiTrash2, FiClock, FiSun, FiMoon, FiCloudRain, FiZap } from 'react-icons/fi';
import styles from './MedicineCard.module.css';

interface MedicineCardProps {
  medicine: ComparedMedicine;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  showStatus?: boolean;
}

const getTimingIcon = (timing: string) => {
  switch (timing) {
    case 'Morning': return <FiSun className={styles.timingIcon} style={{ color: '#F59E0B' }} />;
    case 'Afternoon': return <FiCloudRain className={styles.timingIcon} style={{ color: '#F97316' }} />;
    case 'Night': return <FiMoon className={styles.timingIcon} style={{ color: '#6366F1' }} />;
    case 'Multiple': return <FiZap className={styles.timingIcon} style={{ color: '#8B5CF6' }} />;
    default: return <FiClock className={styles.timingIcon} style={{ color: '#9CA3AF' }} />;
  }
};

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
      case 'Added': return '+ Newly Added';
      case 'Removed': return '✕ Removed';
      case 'Modified': return '⟳ Modified';
      case 'Unchanged': return '✓ Unchanged';
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
      {/* Top accent bar */}
      <div className={`${styles.accentBar} ${getStatusClass()}`} />

      {/* Header row */}
      <div className={styles.header}>
        <div className={styles.nameGroup}>
          <div className={`${styles.medicineAvatar} ${getStatusClass()}`}>
            {medicine.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className={styles.name}>{medicine.name}</h3>
            <p className={styles.usesInline}>{medicine.uses}</p>
          </div>
        </div>
        <div className={styles.headerRight}>
          {showStatus && medicine.status !== 'Unchanged' && (
            <span className={`${styles.badge} ${getStatusClass()}`}>
              {getStatusLabel()}
            </span>
          )}
          <div className={styles.actions}>
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
      </div>

      {/* Pill chips row */}
      <div className={styles.chipsRow}>
        {/* Dosage chip */}
        <span className={`${styles.chip} ${styles.dosageChip}`}>
          {medicine.changes?.dosage ? (
            <>
              <span className={styles.chipOld}>{medicine.changes.dosage.old}</span>
              <span className={styles.chipArrow}>→</span>
              <span className={styles.chipNew}>{medicine.changes.dosage.new}</span>
            </>
          ) : (
            <>💊 {medicine.dosage}</>
          )}
        </span>

        {/* Timing chip */}
        <span className={`${styles.chip} ${styles.timingChip}`}>
          {getTimingIcon(medicine.changes?.timing?.new || medicine.timing)}
          {medicine.changes?.timing ? (
            <>
              <span className={styles.chipOld}>{medicine.changes.timing.old}</span>
              <span className={styles.chipArrow}>→</span>
              <span className={styles.chipNew}>{medicine.changes.timing.new}</span>
            </>
          ) : (
            medicine.timing
          )}
        </span>

        {/* Food chip */}
        <span className={`${styles.chip} ${styles.foodChip}`}>
          {medicine.changes?.foodInstruction ? (
            <>
              <span className={styles.chipOld}>{medicine.changes.foodInstruction.old}</span>
              <span className={styles.chipArrow}>→</span>
              <span className={styles.chipNew}>{medicine.changes.foodInstruction.new}</span>
            </>
          ) : (
            <>🍽️ {medicine.foodInstruction}</>
          )}
        </span>
      </div>

      {/* Click hint */}
      {onClick && (
        <div className={styles.clickHint}>Tap for AI explanation →</div>
      )}
    </div>
  );
}
