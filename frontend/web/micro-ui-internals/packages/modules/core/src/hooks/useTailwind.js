import { useEffect } from "react";

// Custom hook to load Tailwind CSS and Djibouti colors
export const useTailwind = () => {
  useEffect(() => {
    // Load Tailwind CSS
    if (!document.querySelector('#tailwind-css')) {
      const link = document.createElement('link');
      link.id = 'tailwind-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/tailwindcss@1.9.6/dist/tailwind.min.css';
      document.head.appendChild(link);
    }
    
    // Add custom Djibouti colors and utilities
    if (!document.querySelector('#djibouti-colors')) {
      const style = document.createElement('style');
      style.id = 'djibouti-colors';
      style.textContent = `
        /* Djibouti Brand Colors */
        .bg-djibouti-primary { background-color: #006769 !important; }
        .bg-djibouti-primary-light { background-color: #4ca6a8 !important; }
        .bg-djibouti-primary-dark { background-color: #004a4b !important; }
        .bg-djibouti-secondary { background-color: #cdd23e !important; }
        .bg-djibouti-sage { background-color: #748269 !important; }
        
        .text-djibouti-primary { color: #006769 !important; }
        .text-djibouti-primary-light { color: #4ca6a8 !important; }
        .text-djibouti-primary-dark { color: #004a4b !important; }
        .text-djibouti-secondary { color: #cdd23e !important; }
        .text-djibouti-sage { color: #748269 !important; }
        
        .border-djibouti-primary { border-color: #006769 !important; }
        .border-djibouti-secondary { border-color: #cdd23e !important; }
        .border-djibouti-sage { border-color: #748269 !important; }
        
        /* Hover states */
        .hover\\:bg-djibouti-primary:hover { background-color: #006769 !important; }
        .hover\\:bg-djibouti-primary-dark:hover { background-color: #004a4b !important; }
        .hover\\:bg-djibouti-secondary:hover { background-color: #cdd23e !important; }
        .hover\\:bg-djibouti-sage:hover { background-color: #748269 !important; }
        
        /* Focus states */
        .focus\\:border-djibouti-primary:focus { border-color: #006769 !important; }
        .focus\\:ring-djibouti-primary:focus { 
          --tw-ring-color: #006769 !important; 
          box-shadow: 0 0 0 3px rgba(0, 103, 105, 0.1) !important;
        }
        
        /* Gradient backgrounds */
        .bg-gradient-djibouti { 
          background: linear-gradient(90deg, #006769 0%, #748269 100%) !important; 
        }
        .bg-gradient-djibouti-light { 
          background: linear-gradient(90deg, #4ca6a8 0%, #cdd23e 100%) !important; 
        }
        
        /* Custom utilities */
        .shadow-djibouti {
          box-shadow: 0 4px 15px rgba(0, 103, 105, 0.2) !important;
        }
        .card-djibouti {
          background: white !important;
          border-radius: 12px !important;
          box-shadow: 0 4px 15px rgba(0, 103, 105, 0.1) !important;
          border: 1px solid rgba(0, 103, 105, 0.1) !important;
        }
      `;
      document.head.appendChild(style);
    }
  }, []);
};

export default useTailwind;
