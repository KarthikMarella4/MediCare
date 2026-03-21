'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiUploadCloud, FiFileText, FiCalendar } from 'react-icons/fi';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import styles from './page.module.css';

export default function Home() {
  return (
    <div>
      {/* Hero Section */}
      <section className={styles.hero}>
        <motion.h1 
          className={styles.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Compare Your Prescriptions <span className="gradient-text">Smartly</span>
        </motion.h1>
        
        <motion.p 
          className={styles.subtitle}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          Upload your old and new medical prescriptions. We use AI to extract, compare medicines, and generate a daily schedule instantly.
        </motion.p>
        
        <motion.div 
          className={styles.actions}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Link href="/upload">
            <Button size="lg">Start Analyzing</Button>
          </Link>
          <Link href="/demo">
            <Button variant="outline" size="lg">View Demo</Button>
          </Link>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className={styles.features}>
        <div className={styles.featuresGrid}>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <Card className={styles.featureCard}>
              <div className={`${styles.featureIcon}`}>
                <FiUploadCloud />
              </div>
              <h3 className={styles.featureTitle}>Smart OCR Extraction</h3>
              <p className={styles.featureText}>
                Simply upload images or PDFs of your prescriptions. Our system automatically extracts the medicine names, dosages, and instructions.
              </p>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}>
            <Card className={styles.featureCard}>
              <div className={`${styles.featureIcon} ${styles.compare}`}>
                <FiFileText />
              </div>
              <h3 className={styles.featureTitle}>Instant Comparison</h3>
              <p className={styles.featureText}>
                See exactly what changed between visits. We highlight added, removed, and modified prescriptions clearly.
              </p>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
            <Card className={styles.featureCard}>
              <div className={`${styles.featureIcon} ${styles.schedule}`}>
                <FiCalendar />
              </div>
              <h3 className={styles.featureTitle}>Daily Schedule & PDF Export</h3>
              <p className={styles.featureText}>
                Get a beautifully formatted daily timetable for your medicines. Export it as a PDF or share it instantly with caregivers.
              </p>
            </Card>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
