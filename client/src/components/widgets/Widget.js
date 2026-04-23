// client/src/components/widgets/Widget.js
import React, { useState } from 'react';
import { X, Palette, Edit2, LayoutGrid } from 'lucide-react';
import config from '../../config';

const Widget = ({ id, title, value, unit, color, onRemove, onColorChange, onRename }) => {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [newTitle, setNewTitle] = useState(title);

  const handleRename = () => {
    if (newTitle.trim()) {
      onRename(id, newTitle);
      setShowRenameModal(false);
    }
  };

  return (
    <>
      <div 
        className="h-full rounded-xl shadow-lg p-6 relative overflow-hidden"
        style={{ backgroundColor: color }}
      >
        {/* Header with Actions */}
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-white font-semibold text-lg">{title}</h3>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setNewTitle(title);
                setShowRenameModal(true);
              }}
              className="text-white/80 hover:text-white p-1 rounded hover:bg-white/10 z-50 no-drag"
              title="Rename widget"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowColorPicker(!showColorPicker);
              }}
              className="text-white/80 hover:text-white p-1 rounded hover:bg-white/10 z-50 no-drag"
              title="Change color"
            >
              <Palette className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onRemove(id);
              }}
              className="text-white/80 hover:text-white p-1 rounded hover:bg-white/10 z-50 no-drag"
              title="Remove widget"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Color Picker */}
        {showColorPicker && (
          <div className="absolute top-12 right-4 bg-white rounded-lg shadow-xl p-3 z-50 grid grid-cols-5 gap-2 no-drag">
            {config.widgetColors.map((c) => (
              <button
                key={c}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onColorChange(id, c);
                  setShowColorPicker(false);
                }}
                className="w-8 h-8 rounded-full border-2 border-gray-200 hover:border-gray-400 transition"
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        )}

        {/* Value Display */}
        <div className="flex flex-col justify-center h-2/3">
          <div className="text-5xl font-bold text-white mb-2">
            {typeof value === 'number' ? value.toLocaleString() : String(value)}
          </div>
          <div className="text-xl text-white/90">{unit}</div>
        </div>

        {/* Corner Icon */}
        <div className="absolute bottom-2 right-2 text-white/30">
          <LayoutGrid className="w-4 h-4" />
        </div>
      </div>

      {/* Rename Modal */}
      {showRenameModal && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]" 
          onClick={() => setShowRenameModal(false)}
        >
          <div 
            className="bg-white rounded-lg p-6 w-full max-w-md" 
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold mb-4">Rename Widget</h3>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleRename();
                }
              }}
              placeholder="Widget name..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-emerald-500 outline-none"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleRename}
                className="flex-1 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"
              >
                Rename
              </button>
              <button
                type="button"
                onClick={() => setShowRenameModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Widget;