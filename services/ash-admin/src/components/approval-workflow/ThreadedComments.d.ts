import React from "react";
interface ThreadedCommentsProps {
    designId: string;
    version?: number;
    currentUserId: string;
    className?: string;
}
export declare function ThreadedComments({ designId, version, currentUserId, className, }: ThreadedCommentsProps): React.JSX.Element;
export {};
