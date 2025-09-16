export declare const emailService: {
    sendEmail(data: {
        to: string;
        subject: string;
        html: string;
    }): Promise<boolean>;
};
