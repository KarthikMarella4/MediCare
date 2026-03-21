import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiZap, FiShield, FiCalendar } from 'react-icons/fi';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import styles from './Home.module.css';

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
          Your Personal <span className="gradient-text">Medical Dashboard</span>
        </motion.h1>
        
        <motion.p 
          className={styles.subtitle}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          Easily digitize, track, and compare your medical prescriptions. We automatically extract medicine details to generate personalized daily timetables and highlight any changes.
        </motion.p>
        
        <motion.div 
          className={styles.actions}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Link to="/upload">
            <Button size="lg">Start Analyzing</Button>
          </Link>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className={styles.features}>
        <div className={styles.featuresGrid}>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <Card className={styles.featureCard}>
              <div className={`${styles.featureIcon}`}>
                <FiZap />
              </div>
              <h3 className={styles.featureTitle}>Instant AI Extraction</h3>
              <p className={styles.featureText}>
                Our Gemini-powered AI reads your prescription image in seconds — no typing needed. It extracts every medicine, dosage, and timing automatically.
              </p>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}>
            <Card className={styles.featureCard}>
              <div className={`${styles.featureIcon} ${styles.compare}`}>
                <FiShield />
              </div>
              <h3 className={styles.featureTitle}>Smart Change Detection</h3>
              <p className={styles.featureText}>
                Compare new and old prescriptions side-by-side. We clearly highlight every added, modified, or discontinued medicine so nothing slips through.
              </p>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
            <Card className={styles.featureCard}>
              <div className={`${styles.featureIcon} ${styles.schedule}`}>
                <FiCalendar />
              </div>
              <h3 className={styles.featureTitle}>Personalized Schedule & PDF</h3>
              <p className={styles.featureText}>
                Automatically generate a daily Morning / Afternoon / Night timetable for your medicines. Download it as a polished PDF to share with family or your doctor.
              </p>
            </Card>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
