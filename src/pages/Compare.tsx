import { useEffect, useState, Suspense } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import MedicineList from '@/components/ui/MedicineList';
import EditMedicineModal from '@/components/ui/EditMedicineModal';
import MedicineDetailsModal from '@/components/ui/MedicineDetailsModal';
import { ComparedMedicine, ComparisonStatus, ExtractedMedicine } from '@/lib/types';
import { comparePrescriptions } from '@/lib/compare';
import styles from './Compare.module.css';

// Mock data generator removed per user request

function CompareContent() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode') || 'single'; // Default to single if not specified

  const [medicines, setMedicines] = useState<ComparedMedicine[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMedicine, setSelectedMedicine] = useState<ComparedMedicine | null>(null);
  const [editingMedicine, setEditingMedicine] = useState<ComparedMedicine | null>(null);

  const handleEditSave = (updated: ComparedMedicine) => {
    const updatedMedicines = medicines.map(m => m.id === updated.id ? updated : m);
    setMedicines(updatedMedicines);
    sessionStorage.setItem('medicom_new', JSON.stringify(updatedMedicines));
    setEditingMedicine(null);
  };

  const handleDelete = (medicine: ComparedMedicine) => {
    const updatedMedicines = medicines.filter(m => m.id !== medicine.id);
    setMedicines(updatedMedicines);
    sessionStorage.setItem('medicom_new', JSON.stringify(updatedMedicines));
  };

  const handleReset = () => {
    sessionStorage.removeItem('medicom_new');
    sessionStorage.removeItem('medicom_old');
    navigate('/upload');
  };

  useEffect(() => {
    // Try to read real data from session storage after upload
    const timer = setTimeout(() => {
      let finalMedicines: ComparedMedicine[] = [];

      try {
        const newRaw = sessionStorage.getItem('medicom_new');
        const oldRaw = sessionStorage.getItem('medicom_old');

        if (newRaw) {
          // Assign UUIDs if not assigned
          const newMeds: any[] = JSON.parse(newRaw).map((m: any, i: number) => ({
            ...m,
            id: m.id || `new-${i}`,
          }));

          if (mode === 'compare' && oldRaw) {
            const oldMeds: any[] = JSON.parse(oldRaw).map((m: any, i: number) => ({
              ...m,
              id: m.id || `old-${i}`,
            }));
            finalMedicines = comparePrescriptions(oldMeds, newMeds);
          } else {
            finalMedicines = newMeds.map(m => ({
              ...m,
              status: 'Unchanged' as ComparisonStatus
            }));
          }
        }
      } catch (e) {
        console.error('Failed to parse session storage data', e);
      }

      setMedicines(finalMedicines);
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [mode]);

  if (isLoading) {
    return (
      <div className={styles.page} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)' }}>Analyzing prescriptions...</p>
      </div>
    );
  }

  // Filter medicines by status
  const added = medicines.filter(m => m.status === 'Added');
  const removed = medicines.filter(m => m.status === 'Removed');
  const modified = medicines.filter(m => m.status === 'Modified');
  const unchanged = medicines.filter(m => m.status === 'Unchanged');

  if (medicines.length === 0) {
    return (
      <div className={styles.page}>
        <div className={styles.emptyState}>
          <h2 className={styles.emptyTitle}>No comparison data found</h2>
          <p className={styles.emptyText}>Please upload your prescriptions first to see the comparison.</p>
          <Button onClick={() => navigate('/upload')}>Go to Upload</Button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className={styles.title}>
            {mode === 'compare' ? 'Prescription Analysis' : 'Your Prescriptions'}
          </h1>
          <p className={styles.subtitle}>
            {mode === 'compare'
              ? 'Here is what changed between your prescriptions.'
              : 'Here are the medicines found in your prescription.'}
          </p>
        </motion.div>

        <motion.div
          className={styles.actions}
          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
        >
          <Button variant="outline" onClick={() => navigate('/upload')}>Edit Uploads</Button>
          <Button onClick={() => navigate('/schedule')}>Generate Schedule</Button>
          <Button variant="outline" onClick={handleReset}>Reset</Button>
        </motion.div>
      </div>

      {mode === 'compare' && (
        <motion.div
          className={styles.summaryCards}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className={styles.summaryCard}>
            <div className={styles.summaryValue} style={{ color: 'var(--status-added)' }}>{added.length}</div>
            <div className={styles.summaryLabel}>Newly Added</div>
          </Card>
          <Card className={styles.summaryCard}>
            <div className={styles.summaryValue} style={{ color: 'var(--status-removed)' }}>{removed.length}</div>
            <div className={styles.summaryLabel}>Removed</div>
          </Card>
          <Card className={styles.summaryCard}>
            <div className={styles.summaryValue} style={{ color: 'var(--status-modified)' }}>{modified.length}</div>
            <div className={styles.summaryLabel}>Modified</div>
          </Card>
          <Card className={styles.summaryCard}>
            <div className={styles.summaryValue} style={{ color: 'var(--status-unchanged)' }}>{unchanged.length}</div>
            <div className={styles.summaryLabel}>Unchanged</div>
          </Card>
        </motion.div>
      )}

      <motion.div
        className={styles.listsContainer}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        {mode === 'compare' ? (
          <>
            <MedicineList title="Added Medicines" medicines={added} onMedicineClick={setSelectedMedicine} />
            <MedicineList title="Modified Medicines" medicines={modified} onMedicineClick={setSelectedMedicine} />
            <MedicineList title="Removed Medicines" medicines={removed} onMedicineClick={setSelectedMedicine} />
            <MedicineList title="Unchanged Medicines" medicines={unchanged} onMedicineClick={setSelectedMedicine} />
          </>
        ) : (
          <MedicineList
            title="Your Medicines"
            medicines={medicines}
            onMedicineClick={setSelectedMedicine}
            onEdit={setEditingMedicine}
            onDelete={handleDelete}
          />
        )}
      </motion.div>

      {/* AI Details Modal */}
      {selectedMedicine && (
        <MedicineDetailsModal
          medicine={selectedMedicine}
          onClose={() => setSelectedMedicine(null)}
        />
      )}

      {/* Edit Modal */}
      {editingMedicine && (
        <EditMedicineModal
          medicine={editingMedicine}
          onClose={() => setEditingMedicine(null)}
          onSave={handleEditSave}
        />
      )}
    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense fallback={
      <div className={styles.page} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)' }}>Loading analysis...</p>
      </div>
    }>
      <CompareContent />
    </Suspense>
  );
}
