"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Skeleton = Skeleton;
exports.SkeletonCard = SkeletonCard;
exports.SkeletonTable = SkeletonTable;
const react_1 = __importDefault(require("react"));
const utils_1 = require("@/lib/utils");
function Skeleton({ className, ...props }) {
    return (<div className={(0, utils_1.cn)("animate-pulse rounded-md bg-gray-200", className)} {...props}/>);
}
function SkeletonCard() {
    return (<div className="space-y-4 rounded-lg border p-6"> <div className="flex items-start justify-between"> <div className="flex-1 space-y-3"> <div className="flex items-center gap-3"> <Skeleton className="h-5 w-5"/> <Skeleton className="h-6 w-48"/> <Skeleton className="h-5 w-16"/> </div> <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"> <Skeleton className="h-4 w-32"/> <Skeleton className="h-4 w-40"/> <Skeleton className="h-4 w-36"/> </div> <div className="grid grid-cols-2 gap-4 md:grid-cols-4"> <Skeleton className="h-12 w-full"/> <Skeleton className="h-12 w-full"/> <Skeleton className="h-12 w-full"/> <Skeleton className="h-12 w-full"/> </div> </div> <div className="flex gap-2"> <Skeleton className="h-9 w-20"/> <Skeleton className="h-9 w-20"/> </div> </div> </div>);
}
function SkeletonTable() {
    return (<div className="space-y-3"> {[...Array(5)].map((_, i) => (<SkeletonCard key={i}/>))} </div>);
}
