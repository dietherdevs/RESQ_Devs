import React from 'react';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="w-full bg-white border-t border-slate-200 py-6 mt-auto">
      <div className="max-w-7xl mx-auto px-6 md:px-10 flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
        
        {/* Left Side: Copyright */}
        <div className="text-slate-500 font-medium">
          &copy; RESQ 2026
        </div>

        {/* Right Side: Links */}
        <div className="flex items-center gap-6">
          <Link 
            to="/about" 
            className="text-slate-500 hover:text-sky-600 font-medium transition-colors duration-200"
          >
            About us
          </Link>
          
          <span className="text-slate-300">|</span>
          
          <Link 
            to="#" 
            className="text-slate-500 hover:text-sky-600 font-medium transition-colors duration-200"
          >
            Privacy Policy
          </Link>
        </div>

      </div>
    </footer>
  );
}