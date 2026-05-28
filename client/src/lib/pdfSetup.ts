// Single source of truth for pdfjs worker configuration.
// Worker is copied from react-pdf/node_modules/pdfjs-dist to ensure version match.
import { pdfjs } from 'react-pdf'

// Use a static public path — avoids all Vite module-resolution version mismatches.
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs'

export { pdfjs }
