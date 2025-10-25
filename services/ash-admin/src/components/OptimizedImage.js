/** * Optimized Image Component * Replaces <img> with performance-optimized Next.js Image */ "use client";
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
exports.OptimizedImage = OptimizedImage;
exports.ResponsiveImage = ResponsiveImage;
exports.AvatarImage = AvatarImage;
exports.ProductImage = ProductImage;
exports.HeroImage = HeroImage;
const react_1 = __importStar(require("react"));
function OptimizedImage({ src, alt, width, height, className = "", fill = false, priority = false, quality = 80, sizes, objectFit = "cover", placeholder = "blur", blurDataURL, onLoad, onError, }) {
    const [isLoading, setIsLoading] = (0, react_1.useState)(true);
    const [hasError, setHasError] = (0, react_1.useState)(false); // Generate tiny blur placeholder if not provided const defaultBlurDataURL = blurDataURL || generateBlurDataURL(); const handleLoad = () => { setIsLoading(false); onLoad?.(); }; const handleError = () => { setIsLoading(false); setHasError(true); onError?.(); }; // If image fails to load, show fallback if (hasError) { return ( <div className={`flex items-center justify-center bg-gray-200 ${className}`} style={fill ? undefined : { width, height }} > <svg className="h-12 w-12 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" > <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /> </svg> </div> ); } // Common props for both fill and sized images const commonProps = { src, alt, className: `${className} ${isLoading ?"blur-sm" :"blur-0"} transition-all duration-300`, quality, priority, onLoad: handleLoad, onError: handleError, }; // Fill layout (for containers with position: relative) if (fill) { return ( <Image {...commonProps} fill sizes={sizes ||"100vw"} style={{ objectFit }} placeholder={placeholder} blurDataURL={placeholder ==="blur" ? defaultBlurDataURL : undefined} /> ); } // Fixed size layout if (!width || !height) { console.warn("OptimizedImage: width and height required when fill=false"); return null; } return ( <Image {...commonProps} width={width} height={height} sizes={sizes} style={{ objectFit }} placeholder={placeholder} blurDataURL={placeholder ==="blur" ? defaultBlurDataURL : undefined} /> );
} /** * Generate a tiny blur placeholder data URL */
function generateBlurDataURL() {
} /** * Responsive Image - automatically determines sizes */
function ResponsiveImage({ src, alt, width, height, className, priority = false, }) {
    return (<OptimizedImage src={src} alt={alt} width={width} height={height} className={className} priority={priority} sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"/>);
} /** * Avatar Image - optimized for small profile images */
function AvatarImage({ src, alt, size = 40, className = "", }) {
    return (<OptimizedImage src={src} alt={alt} width={size} height={size} className={`rounded-full ${className}`} quality={90} priority objectFit="cover"/>);
} /** * Product Image - optimized for product listings */
function ProductImage({ src, alt, width = 300, height = 300, className = "", }) {
    return (<OptimizedImage src={src} alt={alt} width={width} height={height} className={className} quality={85} sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw" objectFit="cover"/>);
} /** * Hero Image - optimized for large banner images */
function HeroImage({ src, alt, className = "", priority = true, }) {
    return (<OptimizedImage src={src} alt={alt} fill className={className} quality={90} priority={priority} sizes="100vw" objectFit="cover"/>);
}
