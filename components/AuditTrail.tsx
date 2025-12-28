
import React from 'react';
import { AuditRecord } from '../types';

interface AuditTrailProps {
  logs: AuditRecord[];
}

const AuditTrail: React.FC<AuditTrailProps> = ({ logs }) => {
  return (
    <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Security Audit Trail</h3>
      
      {logs.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
          <i className="fa-solid fa-shield-halved text-slate-300 text-3xl mb-3"></i>
          <p className="text-xs text-slate-400 font-medium">No records yet.<br/>Signatures will generate hash chains.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {logs.map((log, idx) => (
            <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[10px]">
              <div className="flex justify-between mb-2">
                <span className="font-bold text-blue-600">{log.action}</span>
                <span className="text-slate-400">{log.timestamp}</span>
              </div>
              <div className="space-y-1">
                <p className="truncate"><span className="font-semibold text-slate-600">Original:</span> {log.originalHash}</p>
                <p className="truncate"><span className="font-semibold text-slate-600">Signed:</span> {log.finalHash}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
        <div className="flex items-center gap-2 mb-1">
          <i className="fa-solid fa-circle-check text-blue-500 text-[10px]"></i>
          <span className="text-[10px] font-bold text-blue-700 uppercase">SHA-256 Validated</span>
        </div>
        <p className="text-[9px] text-blue-600 leading-tight">
          Each state change is hashed and stored in the secure history ledger.
        </p>
      </div>
    </div>
  );
};

export default AuditTrail;
