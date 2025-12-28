
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Field, FieldType } from '../types';

interface DraggableFieldProps {
  field: Field;
  isSelected: boolean;
  containerWidth: number;
  containerHeight: number;
  onSelect: () => void;
  onUpdate: (updates: Partial<Field>) => void;
  onRemove: () => void;
  onInteract: () => void;
}

const DraggableField: React.FC<DraggableFieldProps> = ({
  field,
  isSelected,
  containerWidth,
  containerHeight,
  onSelect,
  onUpdate,
  onRemove,
  onInteract
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [startField, setStartField] = useState({ x: 0, y: 0, w: 0, h: 0 });
  
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (isEditing) return;
    if ('cancelable' in e && e.cancelable) e.preventDefault();
    e.stopPropagation();
    onSelect();
    setIsDragging(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setStartPos({ x: clientX, y: clientY });
    setStartField({ x: field.x, y: field.y, w: field.w, h: field.h });
  };

  const handleResizeStart = (e: React.MouseEvent | React.TouchEvent) => {
    if ('cancelable' in e && e.cancelable) e.preventDefault();
    e.stopPropagation();
    onSelect();
    setIsResizing(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setStartPos({ x: clientX, y: clientY });
    setStartField({ x: field.x, y: field.y, w: field.w, h: field.h });
  };

  const handleMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isDragging && !isResizing) return;
    
    // Prevent document scrolling while dragging/resizing
    if (e.cancelable) e.preventDefault();

    const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;

    const dx = ((clientX - startPos.x) / containerWidth) * 100;
    const dy = ((clientY - startPos.y) / containerHeight) * 100;

    if (isDragging) {
      onUpdate({
        x: Math.max(0, Math.min(100 - field.w, startField.x + dx)),
        y: Math.max(0, Math.min(100 - field.h, startField.y + dy))
      });
    } else if (isResizing) {
      onUpdate({
        w: Math.max(4, Math.min(100 - field.x, startField.w + dx)),
        h: Math.max(2, Math.min(100 - field.y, startField.h + dy))
      });
    }
  }, [isDragging, isResizing, startPos, startField, containerWidth, containerHeight, field, onUpdate]);

  const handleEnd = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
  }, []);

  useEffect(() => {
    if (isDragging || isResizing) {
      window.addEventListener('mousemove', handleMove, { passive: false });
      window.addEventListener('mouseup', handleEnd);
      window.addEventListener('touchmove', handleMove, { passive: false });
      window.addEventListener('touchend', handleEnd);
    }
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [isDragging, isResizing, handleMove, handleEnd]);

  const handleInternalInteract = () => {
    if (field.type === FieldType.TEXT || field.type === FieldType.DATE || field.type === FieldType.RADIO) {
      setIsEditing(true);
    } else {
      onInteract();
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    let newValue = e.target.value;
    if (field.type === FieldType.DATE) {
      newValue = newValue.replace(/[^0-9\/\-\.]/g, '');
      if (newValue.length > 10) newValue = newValue.substring(0, 10);
    } else if (field.type === FieldType.RADIO) {
      if (newValue.length > 15) newValue = newValue.substring(0, 15);
    } else if (field.type === FieldType.TEXT) {
      if (newValue.length > 250) newValue = newValue.substring(0, 250);
    }
    onUpdate({ value: newValue });
  };

  const getIcon = () => {
    switch(field.type) {
      case FieldType.TEXT: return 'fa-font';
      case FieldType.SIGNATURE: return 'fa-signature';
      case FieldType.IMAGE: return 'fa-image';
      case FieldType.DATE: return 'fa-calendar-day';
      case FieldType.RADIO: return 'fa-circle-dot';
      default: return 'fa-question';
    }
  };

  const getLabel = () => {
    if ((field.type === FieldType.SIGNATURE || field.type === FieldType.IMAGE) && field.value) return "";
    if (field.value) return field.value;
    return field.type.charAt(0) + field.type.slice(1).toLowerCase();
  };

  const isImageOrSigWithValue = (field.type === FieldType.SIGNATURE || field.type === FieldType.IMAGE) && field.value;
  const isTextField = field.type === FieldType.TEXT || field.type === FieldType.DATE || field.type === FieldType.RADIO;

  return (
    <div
      className={`absolute select-none transition-shadow rounded-lg overflow-visible ${
        isEditing ? 'ring-2 ring-blue-600 shadow-2xl z-30 bg-white' : 
        isSelected ? 'ring-2 ring-blue-500 shadow-xl z-20 bg-blue-50/40 cursor-move' : 
        'border border-blue-200 bg-blue-50/20 hover:bg-blue-50/40 z-10 cursor-move'
      }`}
      style={{
        left: `${field.x}%`,
        top: `${field.y}%`,
        width: `${field.w}%`,
        height: `${field.h}%`,
        touchAction: 'none'
      }}
      onMouseDown={handleDragStart}
      onTouchStart={handleDragStart}
      onDoubleClick={(e) => { 
        e.stopPropagation(); 
        handleInternalInteract(); 
      }}
    >
      <div className="w-full h-full flex flex-col items-center justify-center relative">
        {isEditing && isTextField ? (
          <textarea
            ref={inputRef}
            className="w-full h-full p-1 sm:p-2 bg-transparent border-none outline-none resize-none text-[8px] sm:text-xs font-semibold text-slate-800 text-center flex items-center justify-center"
            value={field.value || ''}
            onChange={handleTextChange}
            onBlur={() => setIsEditing(false)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                setIsEditing(false);
              }
            }}
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
          />
        ) : isImageOrSigWithValue ? (
          <img src={field.value} alt="Content" className="max-w-full max-h-full object-contain pointer-events-none p-1" />
        ) : (
          <div className={`text-[8px] sm:text-xs font-semibold leading-tight flex flex-col items-center justify-center text-center px-1 overflow-hidden w-full ${isSelected ? 'text-blue-700' : 'text-slate-600'}`}>
            <i className={`fa-solid ${getIcon()} mb-0.5 sm:mb-1 opacity-60`}></i>
            <span className="w-full break-words line-clamp-2">{getLabel()}</span>
          </div>
        )}

        {/* Action Controls Overlay - Better spacing for touch */}
        {isSelected && !isEditing && (
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex items-center gap-2 z-[40]">
            <button
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => { e.stopPropagation(); handleInternalInteract(); }}
              className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center shadow-lg hover:bg-blue-700 active:scale-90 transition-all"
              title="Edit"
            >
              <i className="fa-solid fa-pencil text-[12px]"></i>
            </button>
            <button
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => { e.stopPropagation(); onRemove(); }}
              className="bg-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 active:scale-90 transition-all"
              title="Remove"
            >
              <i className="fa-solid fa-trash-can text-[12px]"></i>
            </button>
          </div>
        )}

        {/* Larger Resize handle for mobile */}
        {isSelected && !isEditing && (
          <div
            className="absolute -bottom-2 -right-2 w-7 h-7 cursor-nwse-resize flex items-center justify-center bg-white border-2 border-blue-500 rounded-full shadow-md z-30"
            onMouseDown={handleResizeStart}
            onTouchStart={handleResizeStart}
          >
            <div className="w-2 h-2 bg-blue-500 rounded-sm"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DraggableField;
