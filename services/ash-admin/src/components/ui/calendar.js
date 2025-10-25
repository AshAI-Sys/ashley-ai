"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Calendar = Calendar;
const React = __importStar(require("react"));
const lucide_react_1 = require("lucide-react");
const utils_1 = require("@/lib/utils");
const button_1 = require("@/components/ui/button");
function Calendar({ mode = "single", selected, onSelect, disabled, initialFocus, className, ...props }) {
    const [currentDate, setCurrentDate] = React.useState(new Date());
    const today = new Date();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const firstDayOfWeek = firstDayOfMonth.getDay();
    const daysInMonth = lastDayOfMonth.getDate();
    const monthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
    ];
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const goToPreviousMonth = () => {
        setCurrentDate(new Date(year, month - 1, 1));
    };
    const goToNextMonth = () => {
        setCurrentDate(new Date(year, month + 1, 1));
    };
    const selectDate = (day) => {
        const selectedDate = new Date(year, month, day);
        if (disabled && disabled(selectedDate))
            return;
        onSelect?.(selectedDate);
    };
    const isSelected = (day) => {
        if (!selected)
            return false;
        const date = new Date(year, month, day);
        return date.toDateString() === selected.toDateString();
    };
    const isToday = (day) => {
        const date = new Date(year, month, day);
        return date.toDateString() === today.toDateString();
    };
    const isDisabled = (day) => {
        if (!disabled)
            return false;
        const date = new Date(year, month, day);
        return disabled(date);
    };
    const renderCalendarDays = () => {
        const days = [];
        // Add empty cells for days before the first day of the month
        for (let i = 0; i < firstDayOfWeek; i++) {
            days.push(<div key={`empty-${i}`} className="h-9 w-9"/>);
        }
        // Add days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const dayIsSelected = isSelected(day);
            const dayIsToday = isToday(day);
            const dayIsDisabled = isDisabled(day);
            days.push(<button key={day} onClick={() => selectDate(day)} disabled={dayIsDisabled} className={(0, utils_1.cn)("h-9 w-9 rounded-md p-0 text-center text-sm font-normal", "hover:bg-accent hover:text-accent-foreground", "focus:bg-accent focus:text-accent-foreground focus:outline-none", dayIsSelected &&
                    "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground", dayIsToday && !dayIsSelected && "bg-accent text-accent-foreground", dayIsDisabled &&
                    "cursor-not-allowed text-muted-foreground opacity-50")}>
          {day}
        </button>);
        }
        return days;
    };
    return (<div className={(0, utils_1.cn)("p-3", className)} {...props}>
      <div className="relative mb-4 flex items-center justify-center pt-1">
        <button_1.Button variant="outline" size="sm" onClick={goToPreviousMonth} className="absolute left-1 h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100">
          <lucide_react_1.ChevronLeft className="h-4 w-4"/>
        </button_1.Button>
        <div className="text-sm font-medium">
          {monthNames[month]} {year}
        </div>
        <button_1.Button variant="outline" size="sm" onClick={goToNextMonth} className="absolute right-1 h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100">
          <lucide_react_1.ChevronRight className="h-4 w-4"/>
        </button_1.Button>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {dayNames.map(dayName => (<div key={dayName} className="flex h-9 w-9 items-center justify-center text-center text-xs font-normal text-muted-foreground">
            {dayName}
          </div>))}
        {renderCalendarDays()}
      </div>
    </div>);
}
Calendar.displayName = "Calendar";
