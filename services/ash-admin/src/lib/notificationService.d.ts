export declare const notificationService: {
    sendNotification(params: {
        userId: string;
        type: string;
        title: string;
        message: string;
        data?: any;
    }): Promise<boolean>;
};
