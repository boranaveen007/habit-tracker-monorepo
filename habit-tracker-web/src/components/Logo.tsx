// src/components/Logo.tsx
import React from 'react';

interface LogoProps {
  className?: string; // To add extra margin or sizing classes if needed
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export default function Logo({ className = "", size = "md" }: LogoProps) {
  // Define sizes
  const sizes = {
    sm: "w-8 h-8",   // Navbar
    md: "w-12 h-12", // Medium headers
    lg: "w-16 h-16", // Login page / Hero
    xl: "w-24 h-24", // Giant splash screen
  };

  return (
    <svg 
      className={`${sizes[size]} ${className}`} 
      viewBox="0 0 64 64" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Circular emerald background */}
      <circle cx="32" cy="32" r="32" fill="#10b981"/>
      
      {/* Circular progress ring (background) */}
      <circle
        cx="32"
        cy="32"
        r="26"
        stroke="white"
        strokeWidth="2"
        strokeOpacity="0.3"
        fill="none"
      />
      
      {/* Partial progress arc (3/4 complete) */}
      <circle
        cx="32"
        cy="32"
        r="26"
        stroke="white"
        strokeWidth="2"
        fill="none"
        strokeDasharray="163.36"
        strokeDashoffset="40.84"
        strokeLinecap="round"
        transform="rotate(-90 32 32)"
      />
      
      {/* Bold checkmark */}
      <path
        d="M 20 32 L 28 40 L 44 24"
        stroke="white"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}
