/**
 * Optimized Image Component
 * Replaces <img> with performance-optimized Next.js Image
 */

'use client'

import React, { useState } from 'react'
import Image from 'next/image'

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  fill?: boolean
  priority?: boolean
  quality?: number
  sizes?: string
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down'
  placeholder?: 'blur' | 'empty'
  blurDataURL?: string
  onLoad?: () => void
  onError?: () => void
}

/**
 * Optimized Image with automatic WebP/AVIF conversion, lazy loading, and blur placeholder
 */
export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = '',
  fill = false,
  priority = false,
  quality = 80,
  sizes,
  objectFit = 'cover',
  placeholder = 'blur',
  blurDataURL,
  onLoad,
  onError,
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  // Generate tiny blur placeholder if not provided
  const defaultBlurDataURL = blurDataURL || generateBlurDataURL()

  const handleLoad = () => {
    setIsLoading(false)
    onLoad?.()
  }

  const handleError = () => {
    setIsLoading(false)
    setHasError(true)
    onError?.()
  }

  // If image fails to load, show fallback
  if (hasError) {
    return (
      <div
        className={`bg-gray-200 dark:bg-gray-700 flex items-center justify-center ${className}`}
        style={fill ? undefined : { width, height }}
      >
        <svg
          className="w-12 h-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>
    )
  }

  // Common props for both fill and sized images
  const commonProps = {
    src,
    alt,
    className: `${className} ${isLoading ? 'blur-sm' : 'blur-0'} transition-all duration-300`,
    quality,
    priority,
    onLoad: handleLoad,
    onError: handleError,
  }

  // Fill layout (for containers with position: relative)
  if (fill) {
    return (
      <Image
        {...commonProps}
        fill
        sizes={sizes || '100vw'}
        style={{ objectFit }}
        placeholder={placeholder}
        blurDataURL={placeholder === 'blur' ? defaultBlurDataURL : undefined}
      />
    )
  }

  // Fixed size layout
  if (!width || !height) {
    console.warn('OptimizedImage: width and height required when fill=false')
    return null
  }

  return (
    <Image
      {...commonProps}
      width={width}
      height={height}
      sizes={sizes}
      style={{ objectFit }}
      placeholder={placeholder}
      blurDataURL={placeholder === 'blur' ? defaultBlurDataURL : undefined}
    />
  )
}

/**
 * Generate a tiny blur placeholder data URL
 */
function generateBlurDataURL(): string {
  // 4x4 gray gradient as base64
  return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiNlNWU3ZWI7c3RvcC1vcGFjaXR5OjEiIC8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdHlsZT0ic3RvcC1jb2xvcjojZjNmNGY2O3N0b3Atb3BhY2l0eToxIiAvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIiBmaWxsPSJ1cmwoI2cpIiAvPjwvc3ZnPg=='
}

/**
 * Responsive Image - automatically determines sizes
 */
export function ResponsiveImage({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
}: Omit<OptimizedImageProps, 'sizes' | 'fill'>) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      priority={priority}
      sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
    />
  )
}

/**
 * Avatar Image - optimized for small profile images
 */
export function AvatarImage({
  src,
  alt,
  size = 40,
  className = '',
}: {
  src: string
  alt: string
  size?: number
  className?: string
}) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={`rounded-full ${className}`}
      quality={90}
      priority
      objectFit="cover"
    />
  )
}

/**
 * Product Image - optimized for product listings
 */
export function ProductImage({
  src,
  alt,
  width = 300,
  height = 300,
  className = '',
}: {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
}) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      quality={85}
      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
      objectFit="cover"
    />
  )
}

/**
 * Hero Image - optimized for large banner images
 */
export function HeroImage({
  src,
  alt,
  className = '',
  priority = true,
}: {
  src: string
  alt: string
  className?: string
  priority?: boolean
}) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      fill
      className={className}
      quality={90}
      priority={priority}
      sizes="100vw"
      objectFit="cover"
    />
  )
}
