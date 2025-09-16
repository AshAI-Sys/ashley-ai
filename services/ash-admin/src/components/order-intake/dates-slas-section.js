'use client';
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
exports.DatesSLAsSection = DatesSLAsSection;
const react_1 = __importStar(require("react"));
const card_1 = require("@/components/ui/card");
const button_1 = require("@/components/ui/button");
const label_1 = require("@/components/ui/label");
const badge_1 = require("@/components/ui/badge");
const calendar_1 = require("@/components/ui/calendar");
const popover_1 = require("@/components/ui/popover");
const lucide_react_1 = require("lucide-react");
const date_fns_1 = require("date-fns");
const react_hot_toast_1 = require("react-hot-toast");
const SLA_MATRIX = {
    'silkscreen': {
        standardDays: 7,
        expressAvailable: true,
        expressDays: 5,
        rushSurcharge: 25
    },
    'sublimation': {
        standardDays: 5,
        expressAvailable: true,
        expressDays: 3,
        rushSurcharge: 30
    },
    'dtf': {
        standardDays: 4,
        expressAvailable: true,
        expressDays: 2,
        rushSurcharge: 35
    },
    'embroidery': {
        standardDays: 10,
        expressAvailable: true,
        expressDays: 7,
        rushSurcharge: 20
    }
};
const QUANTITY_MULTIPLIERS = [
    { min: 1, max: 50, multiplier: 1.0 },
    { min: 51, max: 100, multiplier: 1.2 },
    { min: 101, max: 250, multiplier: 1.5 },
    { min: 251, max: 500, multiplier: 2.0 },
    { min: 501, max: 1000, multiplier: 2.5 },
    { min: 1001, max: 9999999, multiplier: 3.0 }
];
const HOLIDAYS_2024 = [
    '2024-01-01', // New Year
    '2024-02-12', // Chinese New Year
    '2024-04-09', // Araw ng Kagitingan
    '2024-05-01', // Labor Day
    '2024-06-12', // Independence Day
    '2024-08-26', // National Heroes Day
    '2024-11-01', // All Saints Day
    '2024-11-30', // Bonifacio Day
    '2024-12-25', // Christmas
    '2024-12-30' // Rizal Day
];
function DatesSLAsSection({ deliveryDate, printingMethod, totalQuantity, onDeliveryDateChange, onTimelineValidation, onRushSurcharge }) {
    const [calendarOpen, setCalendarOpen] = (0, react_1.useState)(false);
    const [validating, setValidating] = (0, react_1.useState)(false);
    const [timelineValidation, setTimelineValidation] = (0, react_1.useState)(null);
    const [suggestedDates, setSuggestedDates] = (0, react_1.useState)([]);
    (0, react_1.useEffect)(() => {
        if (deliveryDate && printingMethod && totalQuantity > 0) {
            validateTimeline();
        }
        else {
            setTimelineValidation(null);
            onRushSurcharge(0);
        }
    }, [deliveryDate, printingMethod, totalQuantity]);
    const getSLAInfo = () => {
        return SLA_MATRIX[printingMethod] || null;
    };
    const getQuantityMultiplier = () => {
        const multiplier = QUANTITY_MULTIPLIERS.find(m => totalQuantity >= m.min && totalQuantity <= m.max);
        return multiplier?.multiplier || 1.0;
    };
    const calculateWorkingDays = (startDate, endDate) => {
        let workingDays = 0;
        let currentDate = new Date(startDate);
        while (currentDate <= endDate) {
            if (!(0, date_fns_1.isWeekend)(currentDate) && !isHoliday(currentDate)) {
                workingDays++;
            }
            currentDate = (0, date_fns_1.addDays)(currentDate, 1);
        }
        return workingDays;
    };
    const isHoliday = (date) => {
        const dateString = (0, date_fns_1.format)(date, 'yyyy-MM-dd');
        return HOLIDAYS_2024.includes(dateString);
    };
    const addWorkingDays = (startDate, days) => {
        let currentDate = new Date(startDate);
        let addedDays = 0;
        while (addedDays < days) {
            currentDate = (0, date_fns_1.addDays)(currentDate, 1);
            if (!(0, date_fns_1.isWeekend)(currentDate) && !isHoliday(currentDate)) {
                addedDays++;
            }
        }
        return currentDate;
    };
    const validateTimeline = async () => {
        if (!deliveryDate || !printingMethod)
            return;
        setValidating(true);
        try {
            const slaInfo = getSLAInfo();
            if (!slaInfo)
                return;
            const today = new Date();
            const targetDate = (0, date_fns_1.parseISO)(deliveryDate);
            const quantityMultiplier = getQuantityMultiplier();
            const requiredDays = Math.ceil(slaInfo.standardDays * quantityMultiplier);
            const workingDays = calculateWorkingDays(today, targetDate);
            const isRush = workingDays < requiredDays;
            const feasible = workingDays >= Math.ceil(slaInfo.expressDays * quantityMultiplier);
            // Simulate Ashley AI analysis
            await new Promise(resolve => setTimeout(resolve, 2000));
            const suggestions = [];
            const warnings = [];
            if (isRush && feasible) {
                suggestions.push(`Rush order detected. Consider express production (${slaInfo.expressDays} days base)`);
                suggestions.push(`Additional ${slaInfo.rushSurcharge}% surcharge will apply`);
            }
            if (!feasible) {
                const earliestDate = addWorkingDays(today, Math.ceil(slaInfo.expressDays * quantityMultiplier));
                suggestions.push(`Earliest possible delivery: ${(0, date_fns_1.format)(earliestDate, 'MMM dd, yyyy')}`);
                warnings.push('Timeline not feasible even with express production');
            }
            if (workingDays > requiredDays * 1.5) {
                suggestions.push('Extended timeline allows for cost optimization opportunities');
            }
            if (quantityMultiplier > 1) {
                suggestions.push(`Large quantity (${totalQuantity}) extends base timeline by ${Math.round((quantityMultiplier - 1) * 100)}%`);
            }
            const validation = {
                feasible,
                isRush,
                workingDays,
                requiredDays,
                suggestions,
                warnings,
                ashleyConfidence: Math.floor(Math.random() * 20) + 80 // 80-100%
            };
            setTimelineValidation(validation);
            onTimelineValidation(validation);
            // Calculate rush surcharge
            if (isRush && feasible) {
                onRushSurcharge(slaInfo.rushSurcharge);
            }
            else {
                onRushSurcharge(0);
            }
            // Generate suggested dates
            generateSuggestedDates(slaInfo);
        }
        catch (error) {
            console.error('Timeline validation error:', error);
            react_hot_toast_1.toast.error('Ashley AI timeline validation failed');
        }
        finally {
            setValidating(false);
        }
    };
    const generateSuggestedDates = (slaInfo) => {
        const today = new Date();
        const quantityMultiplier = getQuantityMultiplier();
        const suggested = [];
        // Express delivery
        const expressDate = addWorkingDays(today, Math.ceil(slaInfo.expressDays * quantityMultiplier));
        suggested.push(expressDate);
        // Standard delivery
        const standardDate = addWorkingDays(today, Math.ceil(slaInfo.standardDays * quantityMultiplier));
        suggested.push(standardDate);
        // Safe delivery (standard + 2 days buffer)
        const safeDate = addWorkingDays(today, Math.ceil(slaInfo.standardDays * quantityMultiplier) + 2);
        suggested.push(safeDate);
        setSuggestedDates(suggested);
    };
    const selectSuggestedDate = (date) => {
        onDeliveryDateChange((0, date_fns_1.format)(date, 'yyyy-MM-dd'));
        setCalendarOpen(false);
        react_hot_toast_1.toast.success('Delivery date updated');
    };
    const slaInfo = getSLAInfo();
    const selectedDate = deliveryDate ? (0, date_fns_1.parseISO)(deliveryDate) : null;
    return (<card_1.Card>
      <card_1.CardHeader>
        <card_1.CardTitle className="flex items-center gap-2">
          E. Dates & SLAs
          <badge_1.Badge variant="secondary">Required</badge_1.Badge>
        </card_1.CardTitle>
      </card_1.CardHeader>
      <card_1.CardContent className="space-y-6">
        {/* Delivery Date Picker */}
        <div>
          <label_1.Label>Target Delivery Date *</label_1.Label>
          <div className="flex gap-2">
            <popover_1.Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <popover_1.PopoverTrigger asChild>
                <button_1.Button variant="outline" className="w-full justify-start text-left font-normal">
                  <lucide_react_1.CalendarIcon className="mr-2 h-4 w-4"/>
                  {selectedDate ? (0, date_fns_1.format)(selectedDate, 'PPP') : 'Select delivery date'}
                </button_1.Button>
              </popover_1.PopoverTrigger>
              <popover_1.PopoverContent className="w-auto p-0" align="start">
                <calendar_1.Calendar mode="single" selected={selectedDate || undefined} onSelect={(date) => {
            if (date) {
                onDeliveryDateChange((0, date_fns_1.format)(date, 'yyyy-MM-dd'));
                setCalendarOpen(false);
            }
        }} disabled={(date) => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            return date < today;
        }} initialFocus/>
              </popover_1.PopoverContent>
            </popover_1.Popover>
          </div>
        </div>

        {/* SLA Information */}
        {slaInfo && (<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <lucide_react_1.Clock className="w-5 h-5 text-blue-600"/>
              <h4 className="font-medium text-blue-900">
                {printingMethod.charAt(0).toUpperCase() + printingMethod.slice(1)} SLA
              </h4>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-blue-700 font-medium">Standard Production:</span>
                <div className="text-blue-800">
                  {Math.ceil(slaInfo.standardDays * getQuantityMultiplier())} working days
                  {getQuantityMultiplier() > 1 && (<span className="text-blue-600 ml-1">
                      (base: {slaInfo.standardDays} days × {getQuantityMultiplier().toFixed(1)} qty factor)
                    </span>)}
                </div>
              </div>
              
              <div>
                <span className="text-blue-700 font-medium">Express Available:</span>
                <div className="text-blue-800">
                  {slaInfo.expressAvailable ? (<>
                      {Math.ceil(slaInfo.expressDays * getQuantityMultiplier())} working days 
                      <span className="text-amber-600 ml-1">(+{slaInfo.rushSurcharge}% surcharge)</span>
                    </>) : ('Not available')}
                </div>
              </div>
            </div>
          </div>)}

        {/* Ashley AI Timeline Validation */}
        {validating && (<div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <lucide_react_1.Sparkles className="w-5 h-5 text-purple-600 animate-pulse"/>
              <span className="text-purple-900 font-medium">Ashley AI is analyzing timeline...</span>
            </div>
          </div>)}

        {timelineValidation && (<div className={`border rounded-lg p-4 ${timelineValidation.feasible
                ? timelineValidation.isRush
                    ? 'bg-amber-50 border-amber-200'
                    : 'bg-green-50 border-green-200'
                : 'bg-red-50 border-red-200'}`}>
            <div className="flex items-start gap-3">
              {timelineValidation.feasible ? (timelineValidation.isRush ? (<lucide_react_1.Zap className="w-5 h-5 text-amber-600 mt-1"/>) : (<lucide_react_1.CheckCircle className="w-5 h-5 text-green-600 mt-1"/>)) : (<lucide_react_1.AlertTriangle className="w-5 h-5 text-red-600 mt-1"/>)}
              
              <div className="flex-1">
                <div className="flex justify-between items-start mb-2">
                  <h4 className={`font-medium ${timelineValidation.feasible
                ? timelineValidation.isRush ? 'text-amber-900' : 'text-green-900'
                : 'text-red-900'}`}>
                    Ashley AI Timeline Analysis
                    {timelineValidation.isRush && timelineValidation.feasible && (<badge_1.Badge variant="outline" className="ml-2 text-amber-700 border-amber-300">
                        Rush Order
                      </badge_1.Badge>)}
                  </h4>
                  <badge_1.Badge variant="outline" className="text-xs">
                    {timelineValidation.ashleyConfidence}% confidence
                  </badge_1.Badge>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4 mb-3 text-sm">
                  <div>
                    <span className="font-medium">Available Days:</span>
                    <span className="ml-2">{timelineValidation.workingDays} working days</span>
                  </div>
                  <div>
                    <span className="font-medium">Required Days:</span>
                    <span className="ml-2">{timelineValidation.requiredDays} working days</span>
                  </div>
                </div>
                
                {timelineValidation.suggestions.length > 0 && (<div className="mb-3">
                    <h5 className="font-medium text-sm mb-2">Suggestions:</h5>
                    <ul className="space-y-1">
                      {timelineValidation.suggestions.map((suggestion, i) => (<li key={i} className="text-sm flex items-start gap-1">
                          <span className="text-blue-500 mt-1">•</span>
                          {suggestion}
                        </li>))}
                    </ul>
                  </div>)}
                
                {timelineValidation.warnings.length > 0 && (<div>
                    <h5 className="font-medium text-sm mb-2 text-red-700">Warnings:</h5>
                    <ul className="space-y-1">
                      {timelineValidation.warnings.map((warning, i) => (<li key={i} className="text-sm flex items-start gap-1 text-red-600">
                          <lucide_react_1.AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0"/>
                          {warning}
                        </li>))}
                    </ul>
                  </div>)}
              </div>
            </div>
          </div>)}

        {/* Suggested Dates */}
        {suggestedDates.length > 0 && (<div>
            <label_1.Label className="mb-3 block">Suggested Delivery Dates</label_1.Label>
            <div className="grid md:grid-cols-3 gap-3">
              {suggestedDates.map((date, index) => {
                const types = ['Express', 'Standard', 'Safe'];
                const colors = ['amber', 'blue', 'green'];
                const today = new Date();
                const workingDays = calculateWorkingDays(today, date);
                return (<button key={index} onClick={() => selectSuggestedDate(date)} className={`p-3 border-2 rounded-lg text-left transition-colors ${selectedDate && (0, date_fns_1.format)(selectedDate, 'yyyy-MM-dd') === (0, date_fns_1.format)(date, 'yyyy-MM-dd')
                        ? `border-${colors[index]}-500 bg-${colors[index]}-50`
                        : `border-${colors[index]}-200 hover:border-${colors[index]}-300`}`}>
                    <div className={`font-medium text-${colors[index]}-900`}>
                      {types[index]} Delivery
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {(0, date_fns_1.format)(date, 'MMM dd, yyyy')}
                    </div>
                    <div className={`text-xs text-${colors[index]}-600 mt-1`}>
                      {workingDays} working days
                    </div>
                  </button>);
            })}
            </div>
          </div>)}
      </card_1.CardContent>
    </card_1.Card>);
}
