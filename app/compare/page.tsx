'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import MedicineList from '@/components/ui/MedicineList';
import MedicineDetailsModal from '@/components/ui/MedicineDetailsModal';
import { ComparedMedicine, ComparisonStatus } from '@/lib/types';
import { comparePrescriptions } from '@/lib/compare';
import { ExtractedMedicine } from '@/app/api/extract/route';
import styles from './page.module.css';

// Mock data generator for the prototype
const generateMockData = (): { old: ExtractedMedicine[], new: ExtractedMedicine[] } => {
  return {
    old: [
      { id: '1', name: 'Metformin', dosage: '500mg', timing: 'Morning', foodInstruction: 'After Food', uses: 'Diabetes management' },
      { id: '2', name: 'Lisinopril', dosage: '10mg', timing: 'Morning', foodInstruction: 'Before Food', uses: 'Blood pressure control' },
      { id: '3', name: 'Atorvastatin', dosage: '20mg', timing: 'Night', foodInstruction: 'After Food', uses: 'Cholesterol management' }
    ],
    new: [
      { id: '4', name: 'Metformin', dosage: '1000mg', timing: 'Morning', foodInstruction: 'After Food', uses: 'Diabetes management' }, // Modified dose
      { id: '5', name: 'Lisinopril', dosage: '10mg', timing: 'Morning', foodInstruction: 'Before Food', uses: 'Blood pressure control' }, // Unchanged
      { id: '6', name: 'Amlodipine', dosage: '5mg', timing: 'Night', foodInstruction: 'Anytime', uses: 'Blood pressure control' }, // Added
      // Atorvastatin removed
    ]
  };
};

function CompareContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode') || 'single'; // Default to single if not specified
  
  const [medicines, setMedicines] = useState<ComparedMedicine[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMedicine, setSelectedMedicine] = useState<ComparedMedicine | null>(null);

  useEffect(() => {
    // Try to read real data from session storage after upload
    // Fall back to mock data if not available (for direct navigation)
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
        } else {
          // No session data — use mock so page still works for direct navigation
          const mockData = generateMockData();
          if (mode === 'compare') {
            finalMedicines = comparePrescriptions(mockData.old, mockData.new);
          } else {
            finalMedicines = mockData.new.map(m => ({
              ...m,
              status: 'Unchanged' as ComparisonStatus
            }));
          }
        }
      } catch {
        // Parse error: fall back to mock
        const mockData = generateMockData();
        finalMedicines = mockData.new.map(m => ({ ...m, status: 'Unchanged' as ComparisonStatus }));
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
          <Button onClick={() => router.push('/upload')}>Go to Upload</Button>
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
          <Button variant="outline" onClick={() => router.push('/upload')}>Edit Uploads</Button>
          <Button onClick={() => router.push('/schedule')}>Generate Schedule</Button>
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
          <MedicineList title="Your Medicines" medicines={medicines} onMedicineClick={setSelectedMedicine} />
        )}
      </motion.div>

      {/* AI Details Modal */}
      {selectedMedicine && (
        <MedicineDetailsModal 
          medicine={selectedMedicine} 
          onClose={() => setSelectedMedicine(null)} 
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
