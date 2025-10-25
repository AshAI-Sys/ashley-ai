import React from "react";
interface DesignFile {
    mockup_url?: string;
    prod_url?: string;
    separations?: string[];
    dst_url?: string;
}
interface DesignViewerProps {
    files: DesignFile;
    designName: string;
    version: number;
    className?: string;
}
export declare function DesignViewer({ files, designName, version, className, }: DesignViewerProps): React.JSX.Element;
export {};
