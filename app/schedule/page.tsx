'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FiDownload, FiSun, FiSunset, FiMoon } from 'react-icons/fi';
// @ts-ignore
import html2canvas from 'html2canvas';
// @ts-ignore
import { jsPDF } from 'jspdf';
import Button from '@/components/ui/Button';
import { ComparedMedicine } from '@/lib/types';
import { generateSchedule, ScheduleItem } from '@/lib/schedule';
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

export default function SchedulePage() {
  const router = useRouter();
  const scheduleRef = useRef<HTMLDivElement>(null);
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    // In a real app we'd fetch the parsed results from state/context/server here
    // For the prototype we use mock data
    const mockData = generateMockData();
    // Simplified comparison just for demonstration of active meds
    const comparePrescriptions = (oldList: any[], newList: any[]) => {
      return newList.map(m => ({
        ...m,
        status: oldList.find(o => o.name === m.name) ? 'Unchanged' : 'Added'
      })) as ComparedMedicine[];
    };
    const compared = comparePrescriptions(mockData.old, mockData.new);
    const generated = generateSchedule(compared);
    setSchedule(generated);
  }, []);

  const exportPDF = async () => {
    if (!scheduleRef.current) return;
    setIsExporting(true);
    
    try {
      const canvas = await html2canvas(scheduleRef.current, {
        scale: 2,
        useCORS: true,
        logging: false
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });
      
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`MediCom-Schedule-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const getIcon = (period: string) => {
    switch (period) {
      case 'Morning': return <FiSun style={{ color: '#F59E0B' }} />;
      case 'Afternoon': return <FiSunset style={{ color: '#F97316' }} />;
      case 'Night': return <FiMoon style={{ color: '#3B82F6' }} />;
      default: return null;
    }
  };

  if (schedule.length === 0) {
    return (
      <div className={styles.page}>
         <div className={styles.emptyState}>Loading schedule...</div>
      </div>
    );
  }

  const renderMedCategory = (title: string, meds: ComparedMedicine[]) => {
    if (meds.length === 0) return null;
    return (
      <div className={styles.categoryGroup}>
        <h4 className={styles.categoryTitle}>{title}</h4>
        <div className={styles.medList}>
          {meds.map((med) => (
            <div key={med.id} className={styles.medItem}>
              <div>
                <div className={styles.medName}>{med.name}</div>
                <div className={styles.medUses}>{med.uses}</div>
              </div>
              <div className={styles.medDose}>{med.dosage}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className={styles.title}>Daily Timetable</h1>
          <p className={styles.subtitle}>Your smart schedule for active prescriptions.</p>
        </motion.div>
        
        <motion.div 
          className={styles.actions}
          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
        >
          <Button variant="outline" onClick={() => router.push('/compare')}>Back to Analysis</Button>
          <Button onClick={exportPDF} disabled={isExporting}>
            {isExporting ? 'Exporting...' : <><FiDownload style={{ marginRight: '8px' }} /> Export to PDF</>}
          </Button>
        </motion.div>
      </div>

      <motion.div 
        ref={scheduleRef}
        className={styles.scheduleContainer}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div style={{ paddingBottom: '1rem', borderBottom: '2px dashed #E2E8F0', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)' }}>MediCom</h2>
          <p style={{ color: 'var(--text-muted)' }}>Daily Prescription Schedule • {new Date().toLocaleDateString()}</p>
        </div>

        {schedule.map((period) => {
          const hasMeds = period.beforeFood.length > 0 || period.afterFood.length > 0 || period.anytime.length > 0;
          if (!hasMeds) return null;

          return (
            <div key={period.timeOfDay} className={styles.periodCard}>
              <div className={styles.periodHeader}>
                {getIcon(period.timeOfDay)} {period.timeOfDay}
              </div>
              <div className={styles.periodContent}>
                {renderMedCategory('Before Food', period.beforeFood)}
                {renderMedCategory('After Food', period.afterFood)}
                {renderMedCategory('Anytime', period.anytime)}
              </div>
            </div>
          );
        })}
      </motion.div>
    </div>
  );
}
