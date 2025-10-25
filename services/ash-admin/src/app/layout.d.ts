import type { Metadata } from "next";
import "./globals.css";
export declare const metadata: Metadata;
export declare const viewport: {
    width: string;
    initialScale: number;
    maximumScale: number;
    userScalable: boolean;
    themeColor: string;
};
export default function RootLayout({ children, }: {
    children: React.ReactNode;
}): import("react").JSX.Element;
