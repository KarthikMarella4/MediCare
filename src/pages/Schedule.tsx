import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiDownload, FiSun, FiSunset, FiMoon } from 'react-icons/fi';
// @ts-ignore
import html2canvas from 'html2canvas';
// @ts-ignore
import { jsPDF } from 'jspdf';
import Button from '@/components/ui/Button';
import { ComparedMedicine, ExtractedMedicine } from '@/lib/types';
import { generateSchedule, ScheduleItem } from '@/lib/schedule';
import styles from './Schedule.module.css';

// Mock data generator removed per user request

export default function SchedulePage() {
  const navigate = useNavigate();
  const scheduleRef = useRef<HTMLDivElement>(null);
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    // Read real session data from the upload flow
    try {
      const newRaw = sessionStorage.getItem('medicom_new');
      if (newRaw) {
        const meds: ComparedMedicine[] = JSON.parse(newRaw);
        const generated = generateSchedule(meds);
        setSchedule(generated);
      } else {
        // No session data found; handle gracefully without mock data
        setSchedule([]);
      }
    } catch (e) {
      console.error('Failed to parse scheduled medicines from session storage', e);
      setSchedule([]);
    }
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
      const dateStr = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-');
      pdf.save(`MediCare-Schedule-${dateStr}.pdf`);
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
      case 'Night': return <FiMoon style={{ color: '#6366F1' }} />;
      default: return null;
    }
  };

  const getTimeLabel = (period: string) => {
    switch (period) {
      case 'Morning': return '7:00 AM – 9:00 AM';
      case 'Afternoon': return '12:00 PM – 2:00 PM';
      case 'Night': return '9:00 PM – 10:00 PM';
      default: return '';
    }
  };

  if (schedule.length === 0) {
    return (
      <div className={styles.page}>
         <div className={styles.emptyState} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', textAlign: 'center' }}>
            <h2>No Schedule Data</h2>
            <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem', marginBottom: '1.5rem' }}>Please upload your prescriptions first to generate a schedule.</p>
            <Button onClick={() => navigate('/upload')}>Go to Upload</Button>
         </div>
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
          <Button variant="outline" onClick={() => navigate('/compare')}>Back to Analysis</Button>
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
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)' }}>MediCare</h2>
          <p style={{ color: 'var(--text-muted)' }}>Daily Prescription Schedule • {new Date().toLocaleDateString()}</p>
        </div>

        {schedule.map((period) => {
          const hasMeds = period.beforeFood.length > 0 || period.afterFood.length > 0 || period.anytime.length > 0;
          if (!hasMeds) return null;

          return (
            <div key={period.timeOfDay} className={styles.periodCard}>
              <div className={styles.periodHeader}>
                {getIcon(period.timeOfDay)}
                <span>{period.timeOfDay}</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>{getTimeLabel(period.timeOfDay)}</span>
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
