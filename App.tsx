
import React, { useState, useRef } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import PDFWorkspace from './components/PDFWorkspace';
import AuditTrail from './components/AuditTrail';
import SignatureModal from './components/SignatureModal';
import { Field, FieldType, AuditRecord } from './types';
import { burnFieldsIntoPdf } from './services/burnInEngine';
import { generateTimestamp } from './services/cryptoService';
import { suggestFieldPlacement } from './services/geminiService';

const App: React.FC = () => {
  const [fields, setFields] = useState<Field[]>([]);
  const [auditLog, setAuditLog] = useState<AuditRecord[]>([]);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSigModal, setShowSigModal] = useState<{ id: string } | null>(null);
  const [showAuditPanel, setShowAuditPanel] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string>("https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf");
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeImageFieldId, setActiveImageFieldId] = useState<string | null>(null);

  const simulateBackendStore = async (payload: any) => {
    console.log("SIMULATING BACKEND STORAGE (MONGODB)...", payload);
    await new Promise(resolve => setTimeout(resolve, 800));
    return { success: true, id: Math.random().toString(36).substring(7) };
  };

  const addField = (type: FieldType) => {
    const newField: Field = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      x: 20,
      y: 20,
      w: type === FieldType.SIGNATURE || type === FieldType.IMAGE ? 25 : 20,
      h: type === FieldType.SIGNATURE || type === FieldType.IMAGE ? 12 : 6,
      page: 1,
      value: type === FieldType.DATE ? new Date().toLocaleDateString() : ''
    };
    setFields([...fields, newField]);
    setSelectedFieldId(newField.id);
  };

  const updateField = (id: string, updates: Partial<Field>) => {
    setFields(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const removeField = (id: string) => {
    setFields(prev => prev.filter(f => f.id !== id));
    if (selectedFieldId === id) setSelectedFieldId(null);
  };

  const handleFinalize = async () => {
    if (fields.length === 0) return alert("Add at least one field first.");
    
    setIsProcessing(true);
    try {
      const result = await burnFieldsIntoPdf(pdfUrl, fields);
      
      const auditEntry: AuditRecord = {
        timestamp: generateTimestamp(),
        action: 'DOCUMENT_BURN_IN_COMPLETE',
        originalHash: result.originalHash,
        finalHash: result.finalHash
      };
      
      await simulateBackendStore({
        pdfId: "doc_123",
        hashes: { original: result.originalHash, final: result.finalHash },
        coordinates: fields
      });
      
      setAuditLog([auditEntry, ...auditLog]);
      
      const url = URL.createObjectURL(result.blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `signed_contract_${Date.now()}.pdf`;
      link.click();
      
    } catch (error) {
      console.error(error);
      alert("Error generating PDF. See console.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAISuggestion = async () => {
    const suggestion = await suggestFieldPlacement("Standard legal contract with clause 5 signature area.");
    if (suggestion) {
      addField(FieldType.SIGNATURE);
    }
  };

  const handleFieldInteract = (field: Field) => {
    switch (field.type) {
      case FieldType.SIGNATURE:
        setShowSigModal({ id: field.id });
        break;
      case FieldType.IMAGE:
        setActiveImageFieldId(field.id);
        fileInputRef.current?.click();
        break;
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && activeImageFieldId) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        updateField(activeImageFieldId, { value: dataUrl });
      };
      reader.readAsDataURL(file);
    }
    setActiveImageFieldId(null);
  };

  return (
    <div className="flex flex-col h-screen bg-slate-100 overflow-hidden font-sans">
      <Header />
      
      <div className="flex flex-1 overflow-hidden relative">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <Sidebar onAddField={addField} onAISuggest={handleAISuggestion} />
        </div>

        {/* Main Editor Area */}
        <main className="flex-1 flex flex-col items-center p-2 sm:p-4 lg:p-8 overflow-y-auto pdf-container">
          <div className="mb-4 text-center px-4">
            <h2 className="text-lg sm:text-xl font-bold text-slate-800">BoloForms Signature Engine</h2>
            <p className="text-[10px] sm:text-xs text-slate-500 uppercase tracking-wider font-semibold">Responsive Anchoring Protocol Active</p>
          </div>

          <PDFWorkspace 
            pdfUrl={pdfUrl}
            fields={fields} 
            selectedFieldId={selectedFieldId}
            onSelectField={setSelectedFieldId}
            onUpdateField={updateField}
            onRemoveField={removeField}
            onFieldInteract={handleFieldInteract}
          />
          
          <div className="h-24 lg:hidden w-full shrink-0"></div> {/* Spacer for mobile bottom nav */}
        </main>

        {/* Audit Trail - Collapsible on Mobile, Sidebar on Desktop */}
        <div className={`
          fixed lg:relative inset-y-0 right-0 z-40 w-full sm:w-80 bg-white border-l border-slate-200 transition-transform duration-300 transform
          ${showAuditPanel ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
          flex flex-col
        `}>
          <div className="lg:hidden p-4 border-b flex justify-between items-center bg-slate-50">
            <span className="font-bold text-slate-700">Audit History</span>
            <button onClick={() => setShowAuditPanel(false)} className="p-2 text-slate-500">
              <i className="fa-solid fa-xmark text-xl"></i>
            </button>
          </div>
          <AuditTrail logs={auditLog} />
          <div className="p-4 sm:p-6 mt-auto border-t border-slate-100 bg-slate-50/80">
            <button 
              onClick={handleFinalize}
              disabled={isProcessing}
              className={`w-full ${isProcessing ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2 group text-sm sm:text-base`}
            >
              {isProcessing ? (
                <i className="fa-solid fa-spinner animate-spin"></i>
              ) : (
                <i className="fa-solid fa-cloud-arrow-up group-hover:translate-y-[-2px] transition-transform"></i>
              )}
              {isProcessing ? 'Processing...' : 'Finalize & Store'}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation for Tools */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-2 flex justify-around items-center z-50 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
        <button onClick={() => addField(FieldType.TEXT)} className="flex flex-col items-center gap-1 p-2 text-blue-600 active:scale-90 transition-transform">
          <i className="fa-solid fa-font text-lg"></i>
          <span className="text-[10px] font-bold">Text</span>
        </button>
        <button onClick={() => addField(FieldType.SIGNATURE)} className="flex flex-col items-center gap-1 p-2 text-purple-600 active:scale-90 transition-transform">
          <i className="fa-solid fa-signature text-lg"></i>
          <span className="text-[10px] font-bold">Sign</span>
        </button>
        <button onClick={() => addField(FieldType.IMAGE)} className="flex flex-col items-center gap-1 p-2 text-orange-600 active:scale-90 transition-transform">
          <i className="fa-solid fa-image text-lg"></i>
          <span className="text-[10px] font-bold">Image</span>
        </button>
        <button onClick={() => setShowAuditPanel(true)} className="flex flex-col items-center gap-1 p-2 text-slate-500 active:scale-90 transition-transform">
          <i className="fa-solid fa-shield-halved text-lg"></i>
          <span className="text-[10px] font-bold">Audit</span>
        </button>
        <button onClick={handleFinalize} className="flex flex-col items-center gap-1 p-2 text-green-600 active:scale-90 transition-transform">
          <i className="fa-solid fa-check-double text-lg"></i>
          <span className="text-[10px] font-bold">Done</span>
        </button>
      </div>

      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
        accept="image/png, image/jpeg"
      />

      {showSigModal && (
        <SignatureModal 
          onSave={(data) => updateField(showSigModal.id, { value: data })}
          onClose={() => setShowSigModal(null)}
        />
      )}
    </div>
  );
};

export default App;
