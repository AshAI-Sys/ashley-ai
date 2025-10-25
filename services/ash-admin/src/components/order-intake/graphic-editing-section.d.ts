import React from "react";
interface PrintLocation {
    location: string;
    location_label: string;
    design_file_url?: string;
    width_cm?: number;
    height_cm?: number;
    offset_x_cm?: number;
    offset_y_cm?: number;
    notes?: string;
    selected: boolean;
}
interface GraphicEditingSectionProps {
    artistFilename: string;
    mockupImageUrl: string;
    notesRemarks: string;
    printLocations: PrintLocation[];
    onArtistFilenameChange: (value: string) => void;
    onMockupImageUrlChange: (value: string) => void;
    onNotesRemarksChange: (value: string) => void;
    onPrintLocationsChange: (locations: PrintLocation[]) => void;
}
export declare function GraphicEditingSection({ artistFilename, mockupImageUrl, notesRemarks, printLocations, onArtistFilenameChange, onMockupImageUrlChange, onNotesRemarksChange, onPrintLocationsChange, }: GraphicEditingSectionProps): React.JSX.Element;
export {};
