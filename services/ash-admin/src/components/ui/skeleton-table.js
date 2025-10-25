"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SkeletonTable = SkeletonTable;
const react_1 = __importDefault(require("react"));
function SkeletonTable({ rows = 5, columns = 5 }) {
    return (<div className="w-full">
      <div className="animate-pulse">
        {/* Table Header */}
        <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
          <div className="flex gap-4">
            {Array.from({ length: columns }).map((_, i) => (<div key={i} className="h-4 flex-1 rounded bg-gray-300"></div>))}
          </div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-gray-200">
          {Array.from({ length: rows }).map((_, rowIndex) => (<div key={rowIndex} className="px-4 py-4">
              <div className="flex gap-4">
                {Array.from({ length: columns }).map((_, colIndex) => (<div key={colIndex} className="h-4 flex-1 rounded bg-gray-200"></div>))}
              </div>
            </div>))}
        </div>
      </div>
    </div>);
}
exports.default = SkeletonTable;
