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
         {/* Disclaimer & Copyright */}
                <div className="text-center space-y-2">
                    <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                        © R.E.S.Q System
                    </p>
                    <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                        This system is a student academic project developed for Barangay Nangka. 
                        It is <span className="font-bold text-slate-500">NOT</span> an official government website 
                        and should be used for educational and testing purposes only.
                    </p>
                </div>  

      </div>
    </footer>
  );
}