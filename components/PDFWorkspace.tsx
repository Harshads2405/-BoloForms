
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Field, FieldType } from '../types';
import DraggableField from './DraggableField';

interface PDFWorkspaceProps {
  pdfUrl: string;
  fields: Field[];
  selectedFieldId: string | null;
  onSelectField: (id: string | null) => void;
  onUpdateField: (id: string, updates: Partial<Field>) => void;
  onRemoveField: (id: string) => void;
  onFieldInteract: (field: Field) => void;
}

const PDFWorkspace: React.FC<PDFWorkspaceProps> = ({ 
  pdfUrl, 
  fields, 
  selectedFieldId, 
  onSelectField, 
  onUpdateField,
  onRemoveField,
  onFieldInteract
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  const updateSize = useCallback(() => {
    if (containerRef.current) {
      const parent = containerRef.current.parentElement;
      if (parent) {
        const parentWidth = parent.clientWidth - (window.innerWidth < 640 ? 16 : 64);
        const finalWidth = Math.min(800, parentWidth);
        setContainerSize({ width: finalWidth, height: finalWidth * 1.414 });
      }
    }
  }, []);

  useEffect(() => {
    updateSize();
    window.addEventListener('resize', updateSize);
    // Extra update after a short delay to account for layout shifts
    const timer = setTimeout(updateSize, 100);
    return () => {
      window.removeEventListener('resize', updateSize);
      clearTimeout(timer);
    };
  }, [updateSize]);

  return (
    <div 
      className="relative bg-white shadow-2xl rounded-sm transition-all duration-300 mx-auto border border-slate-300 overflow-hidden touch-none"
      style={{ 
        width: containerSize.width ? `${containerSize.width}px` : '100%',
        height: containerSize.height ? `${containerSize.height}px` : 'auto',
        aspectRatio: '1 / 1.414'
      }}
      ref={containerRef}
      onClick={(e) => {
        if (e.target === e.currentTarget) onSelectField(null);
      }}
    >
      <iframe 
        src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=0`} 
        className="w-full h-full pointer-events-none absolute inset-0 grayscale-[0.2]"
        title="PDF Preview"
      />

      <div className="absolute inset-0 z-10 overflow-hidden">
        {fields.map(field => (
          <DraggableField
            key={field.id}
            field={field}
            isSelected={selectedFieldId === field.id}
            containerWidth={containerSize.width}
            containerHeight={containerSize.height}
            onSelect={() => onSelectField(field.id)}
            onUpdate={(updates) => onUpdateField(field.id, updates)}
            onRemove={() => onRemoveField(field.id)}
            onInteract={() => onFieldInteract(field)}
          />
        ))}
      </div>
      
      <div className="absolute bottom-2 right-2 bg-slate-800/80 text-white text-[8px] sm:text-[10px] px-2 py-1 rounded backdrop-blur z-20">
        Responsive Anchor v2.0
      </div>
    </div>
  );
};

export default PDFWorkspace;
