'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { FiUploadCloud, FiFile, FiX } from 'react-icons/fi';
import styles from './FileUpload.module.css';

interface FileUploadProps {
  onFileAccepted: (file: File) => void;
  label?: string;
  accept?: Record<string, string[]>;
}

export default function FileUpload({ 
  onFileAccepted, 
  label = "Upload Prescription",
  accept = {
    'image/*': ['.jpeg', '.jpg', '.png'],
    'application/pdf': ['.pdf']
  }
}: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const selected = acceptedFiles[0];
      setFile(selected);
      onFileAccepted(selected);
    }
  }, [onFileAccepted]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept,
    maxFiles: 1
  });

  const removeFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFile(null);
  };

  return (
    <div className={styles.wrapper}>
      <label className={styles.label}>{label}</label>
      
      {!file ? (
        <div 
          {...getRootProps()} 
          className={`${styles.dropzone} ${isDragActive ? styles.active : ''}`}
        >
          <input {...getInputProps()} />
          <div className={styles.iconWrapper}>
            <FiUploadCloud className={styles.icon} />
          </div>
          <p className={styles.text}>
            {isDragActive
              ? "Drop the file here..."
              : "Drag & drop an image or PDF here, or click to select"}
          </p>
          <p className={styles.subtext}>Supports JPG, PNG, PDF up to 10MB</p>
        </div>
      ) : (
        <div className={styles.filePreview}>
          <div className={styles.fileInfo}>
            <div className={styles.fileIcon}>
              <FiFile />
            </div>
            <div className={styles.fileDetails}>
              <p className={styles.fileName}>{file.name}</p>
              <p className={styles.fileSize}>{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          </div>
          <button onClick={removeFile} className={styles.removeBtn} aria-label="Remove file">
            <FiX />
          </button>
        </div>
      )}
    </div>
  );
}
