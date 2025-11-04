"use client";

import { useLanguage } from "@/lib/language-context";
import { Globe } from "lucide-react";

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-2">
      <Globe className="h-5 w-5 text-gray-600" />
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value as "en" | "fil")}
        className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="en">English</option>
        <option value="fil">Filipino</option>
      </select>
    </div>
  );
}
