import { Link, useLocation } from 'react-router-dom';
import styles from './Navbar.module.css';

export default function Navbar() {
  const { pathname } = useLocation();

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <Link to="/" className={styles.logo}>
          <span className="gradient-text">MediCare</span>
        </Link>

        {/* Links */}
        <div className={styles.links}>
          <Link to="/" className={`${styles.link} ${pathname === '/' ? styles.active : ''}`}>Home</Link>
          <Link to="/upload" className={`${styles.link} ${pathname === '/upload' ? styles.active : ''}`}>Analyze</Link>
          <Link to="/compare" className={`${styles.link} ${pathname === '/compare' ? styles.active : ''}`}>Results</Link>
          <Link to="/schedule" className={`${styles.link} ${pathname === '/schedule' ? styles.active : ''}`}>Schedule</Link>
        </div>
      </div>
    </nav>
  );
}
