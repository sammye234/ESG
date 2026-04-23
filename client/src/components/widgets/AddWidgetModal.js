// client/src/components/widgets/AddWidgetModal.js
import React, { useState } from 'react';
import config from '../../config';

const AddWidgetModal = ({ onAdd, onClose }) => {
  const [widgetData, setWidgetData] = useState({
    title: '',
    value: 0,
    unit: 't CO₂e',
    color: '#10B981'
  });

  const handleAdd = () => {
    if (widgetData.title.trim()) {
      onAdd(widgetData);
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]" 
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg p-6 w-full max-w-md" 
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-xl font-bold mb-4">Add New Widget</h3>
        
        <div className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Widget Title
            </label>
            <input
              type="text"
              value={widgetData.title}
              onChange={(e) => setWidgetData({...widgetData, title: e.target.value})}
              placeholder="e.g., Total Energy Usage"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              autoFocus
            />
          </div>

          {/* Initial Value */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Initial Value
            </label>
            <input
              type="number"
              value={widgetData.value}
              onChange={(e) => setWidgetData({...widgetData, value: parseFloat(e.target.value) || 0})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          {/* Unit */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Unit
            </label>
            <input
              type="text"
              value={widgetData.unit}
              onChange={(e) => setWidgetData({...widgetData, unit: e.target.value})}
              placeholder="e.g., t CO₂e, kWh, tons"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          {/* Color Picker */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Color
            </label>
            <div className="grid grid-cols-6 gap-2">
              {config.widgetColors.slice(0, 12).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setWidgetData({...widgetData, color: c})}
                  className={`w-10 h-10 rounded-full border-2 transition ${
                    widgetData.color === c 
                      ? 'border-gray-800 ring-2 ring-gray-400' 
                      : 'border-gray-200 hover:border-gray-400'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-6">
          <button
            onClick={handleAdd}
            className="flex-1 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"
          >
            Add Widget
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddWidgetModal;