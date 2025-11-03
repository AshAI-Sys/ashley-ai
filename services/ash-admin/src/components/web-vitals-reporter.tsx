'use client';

import { useEffect } from 'react';
import { initWebVitals } from '@/lib/web-vitals';

/**
 * Web Vitals Reporter Component
 * Add this to your root layout to automatically track performance metrics
 */
export default function WebVitalsReporter() {
  useEffect(() => {
    // Initialize Web Vitals tracking when component mounts
    initWebVitals();
  }, []);

  // This component doesn't render anything
  return null;
}
