import React from 'react';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    // Added 'mt-24' to force a large gap between the page content and this footer
    <footer className="w-full mt-24 py-12 border-t border-slate-100">
      <div className="max-w-4xl mx-auto px-6 flex flex-col items-center justify-center gap-10">
        
        {/* Aesthetic Separator */}
        <div className="w-16 h-1 bg-slate-200 rounded-full"></div>

        {/* Links - Wide Spacing (gap-16) */}
        <div className="flex flex-wrap justify-center items-center gap-x-16 gap-y-4 text-sm font-medium text-slate-500">
          <Link 
            to="/about" 
            className="hover:text-blue-600 hover:tracking-wide transition-all duration-300"
          >
            About R.E.S.Q.   |
          </Link>
          
          <Link 
            to="#" 
            className="hover:text-blue-600 hover:tracking-wide transition-all duration-300"
          >
            Privacy Policy   |
          </Link>

          <Link 
            to="#" 
            className="hover:text-blue-600 hover:tracking-wide transition-all duration-300"
          >
            Terms of Service
          </Link>
        </div>

        {/* Copyright */}
        <div className="text-slate-400 text-xs text-center font-medium tracking-wider uppercase">
          &copy; 2026 R.E.S.Q. System • Designed for Barangay Nangka
        </div>

      </div>
    </footer>
  );
}