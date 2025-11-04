"use client";

import { useLanguage } from "@/lib/language-context";
import { Globe } from "lucide-react";

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 backdrop-blur-sm">
      <Globe className="h-4 w-4 text-white" />
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value as "en" | "fil")}
        className="flex-1 bg-transparent text-sm font-medium text-white focus:outline-none cursor-pointer"
        style={{ color: '#FFFFFF' }}
      >
        <option value="en" className="text-gray-900 bg-white">English</option>
        <option value="fil" className="text-gray-900 bg-white">Filipino</option>
      </select>
    </div>
  );
}
