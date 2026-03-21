import { ReactNode } from 'react';
import styles from './Card.module.css';

interface CardProps {
  children: ReactNode;
  className?: string;
  glass?: boolean;
}

export default function Card({ children, className = '', glass = false }: CardProps) {
  const cn = [
    styles.card,
    glass ? 'glass-panel' : '',
    className
  ].join(' ').trim();

  return (
    <div className={cn}>
      {children}
    </div>
  );
}
