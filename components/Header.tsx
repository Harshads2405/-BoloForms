
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="h-16 border-b border-slate-200 bg-white px-6 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
          <i className="fa-solid fa-file-pen text-white text-xl"></i>
        </div>
        <div>
          <h1 className="text-lg font-bold text-slate-800 leading-tight">DocuSigner Pro</h1>
          <p className="text-xs text-slate-500 font-medium">Responsive Document Engine</p>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-full border border-green-100">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          <span className="text-xs font-bold uppercase tracking-wider">Live Audit Trail Enabled</span>
        </div>
        <button className="text-slate-500 hover:text-slate-800 transition-colors">
          <i className="fa-solid fa-gear text-xl"></i>
        </button>
      </div>
    </header>
  );
};

export default Header;
