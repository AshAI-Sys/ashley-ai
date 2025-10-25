/**
 * Email queue management
 * Provides reliable email delivery with retry logic
 */
export declare class EmailQueue {
    private static instance;
    private processing;
    private processingInterval;
    private constructor();
    static getInstance(): EmailQueue;
    /**
     * Add email to queue
     */
    enqueue(type: string, to: string, data: any, options?: {
        scheduledFor?: Date;
        maxAttempts?: number;
    }): Promise<string>;
    /**
     * Add to sorted set (fallback implementation)
     */
    private addToSortedSet;
    /**
     * Get from sorted set
     */
    private getFromSortedSet;
    /**
     * Process pending emails
     */
    private processPendingEmails;
    /**
     * Process single email job
     */
    private processJob;
    /**
     * Send email based on job type
     */
    private sendEmailByType;
    /**
     * Start background processing
     */
    private startProcessing;
    /**
     * Stop background processing
     */
    stopProcessing(): void;
    /**
     * Get queue statistics
     */
    getStats(): Promise<{
        pending: number;
        processing: number;
        completed: number;
        failed: number;
    }>;
    /**
     * Retry failed job
     */
    retryFailedJob(jobId: string): Promise<void>;
}
export declare const emailQueue: EmailQueue;
