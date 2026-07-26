import React, { useState, useEffect } from 'react';
import { Edit2 } from 'lucide-react';

export default function EditableField({ value, onChange, isTextArea = false, type = 'text', className = "" }) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value);

  useEffect(() => {
    setTempValue(value);
  }, [value]);

  const handleSave = () => {
    setIsEditing(false);
    let finalValue = tempValue;
    if (type === 'number') {
      const num = parseFloat(tempValue);
      if (isNaN(num)) {
        finalValue = value;
      } else {
        // Clamp to 1-10 range
        finalValue = Math.min(10, Math.max(1, num));
      }
    }
    if (finalValue !== value) {
      onChange(finalValue);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !isTextArea) {
      handleSave();
    }
    if (e.key === 'Escape') {
      setTempValue(value);
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return isTextArea ? (
      <textarea
        value={tempValue}
        onChange={(e) => setTempValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        className={`w-full p-2.5 rounded-xl bg-slate-950 border border-violet-500 text-slate-100 text-sm focus:outline-none focus:ring-1 focus:ring-violet-500 resize-none ${className}`}
        rows={4}
        autoFocus
      />
    ) : (
      <input
        type={type === 'number' ? 'number' : 'text'}
        step="0.1"
        min="1"
        max="10"
        value={tempValue}
        onChange={(e) => setTempValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        className={`w-full p-2 rounded-xl bg-slate-950 border border-violet-500 text-slate-100 text-sm focus:outline-none focus:ring-1 focus:ring-violet-500 ${className}`}
        autoFocus
      />
    );
  }

  return (
    <div 
      className={`group relative cursor-pointer border border-dashed border-transparent hover:border-slate-700/60 hover:bg-slate-900/30 px-2 py-1.5 rounded-lg transition-all ${className}`}
      onDoubleClick={() => setIsEditing(true)}
      title="Double click to edit inline"
    >
      <span className="break-words block pr-6">
        {value === undefined || value === null || value === '' ? (
          <em className="text-slate-500">Double click to add...</em>
        ) : (
          String(value)
        )}
      </span>
      <button 
        type="button"
        onClick={() => setIsEditing(true)}
        className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-violet-400 transition-all cursor-pointer"
      >
        <Edit2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
