import { Link } from 'react-router-dom';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.grid}`}>
        <div>
          <div className={styles.brandName}>Constore</div>
          <p className={styles.brandDesc}>India's trusted supplier of professional construction chemicals. Serving contractors, architects and builders for over 20 years.</p>
        </div>
        <div className={styles.col}>
          <h4>Products</h4>
          <ul>
            <li><Link to="/products?category=waterproofing">Waterproofing</Link></li>
            <li><Link to="/products?category=adhesives">Adhesives & Grouts</Link></li>
            <li><Link to="/products?category=admixtures">Concrete Admixtures</Link></li>
            <li><Link to="/products?category=coatings">Protective Coatings</Link></li>
            <li><Link to="/products?category=repair">Repair Mortars</Link></li>
          </ul>
        </div>
        <div className={styles.col}>
          <h4>Company</h4>
          <ul>
            <li><Link to="/about">About Us</Link></li>
            <li><Link to="/projects">Projects</Link></li>
            <li><Link to="/certifications">Certifications</Link></li>
            <li><Link to="/careers">Careers</Link></li>
          </ul>
        </div>
        <div className={styles.col}>
          <h4>Support</h4>
          <ul>
            <li><Link to="/datasheets">Technical Datasheets</Link></li>
            <li><Link to="/faq">FAQs</Link></li>
            <li><Link to="/shipping">Shipping Policy</Link></li>
            <li><Link to="/contact">Contact Us</Link></li>
          </ul>
        </div>
      </div>
      <div className={`container ${styles.bottom}`}>
        <span>© {new Date().getFullYear()} Constore. All rights reserved.</span>
        <div className={styles.bottomLinks}>
          <Link to="/privacy">Privacy Policy</Link>
          <Link to="/terms">Terms of Use</Link>
          <Link to="/returns">Returns</Link>
        </div>
      </div>
    </footer>
  );
}
