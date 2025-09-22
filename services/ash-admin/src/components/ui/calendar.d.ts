import * as React from "react";
interface CalendarProps {
    mode?: "single";
    selected?: Date;
    onSelect?: (date: Date | undefined) => void;
    disabled?: (date: Date) => boolean;
    initialFocus?: boolean;
    className?: string;
}
declare function Calendar({ mode, selected, onSelect, disabled, initialFocus, className, ...props }: CalendarProps): React.JSX.Element;
declare namespace Calendar {
    var displayName: string;
}
export { Calendar };
