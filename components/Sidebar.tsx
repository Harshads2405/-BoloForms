
import React from 'react';
import { FieldType } from '../types';

interface SidebarProps {
  onAddField: (type: FieldType) => void;
  onAISuggest: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onAddField, onAISuggest }) => {
  const tools = [
    { type: FieldType.TEXT, icon: 'fa-font', label: 'Text Block', color: 'bg-blue-50 text-blue-600' },
    { type: FieldType.SIGNATURE, icon: 'fa-signature', label: 'Signature', color: 'bg-purple-50 text-purple-600' },
    { type: FieldType.IMAGE, icon: 'fa-image', label: 'Image Box', color: 'bg-orange-50 text-orange-600' },
    { type: FieldType.DATE, icon: 'fa-calendar-day', label: 'Date Select', color: 'bg-emerald-50 text-emerald-600' },
    { type: FieldType.RADIO, icon: 'fa-circle-dot', label: 'Radio Group', color: 'bg-rose-50 text-rose-600' },
  ];

  return (
    <aside className="w-64 border-r border-slate-200 bg-white p-4 hidden lg:flex flex-col gap-6">
      <div>
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Form Elements</h3>
        <div className="space-y-2">
          {tools.map((tool) => (
            <button
              key={tool.type}
              onClick={() => onAddField(tool.type)}
              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all group active:scale-95"
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${tool.color} transition-transform group-hover:scale-110`}>
                <i className={`fa-solid ${tool.icon} text-lg`}></i>
              </div>
              <span className="text-sm font-semibold text-slate-700">{tool.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="pt-6 border-t border-slate-100">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Intelligent Tools</h3>
        <button
          onClick={onAISuggest}
          className="w-full flex items-center gap-3 p-3 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-100 transition-all group active:scale-95"
        >
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-indigo-500">
            <i className="fa-solid fa-wand-magic-sparkles text-lg"></i>
          </div>
          <span className="text-sm font-bold">AI Placement</span>
        </button>
      </div>

      <div className="mt-auto p-4 bg-slate-50 rounded-2xl border border-slate-100">
        <h4 className="text-xs font-bold text-slate-800 mb-2">BoloForms Tech</h4>
        <p className="text-xs text-slate-500 leading-relaxed">
          The <b>Burn-In Engine</b> uses Points-to-Percent translation to maintain anchoring across desktop and mobile views.
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;
