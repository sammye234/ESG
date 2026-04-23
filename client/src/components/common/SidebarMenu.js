// client/src/components/common/SidebarMenu.js
import React from 'react';
import {
  Home, FolderOpen, Settings,
  HelpCircle, Edit2, MessageSquare, X, Beaker
} from 'lucide-react';

const SidebarMenu = ({
  isOpen,
  onClose,
  onNavigate,
  onShowMaterialCalc,
}) => {
  const menuItems = [
    {
      icon: Home,
      label: 'Dashboard',
      onClick: () => { onNavigate('dashboard'); onClose(); }
    },
    {
      icon: FolderOpen,
      label: 'File Management',
      onClick: () => { onNavigate('files'); onClose(); }
    },
    {
      icon: Beaker,
      label: 'Material EF Calculator',
      onClick: () => {
        if (onShowMaterialCalc) {
          onShowMaterialCalc();
        }
        onClose();
      }
    },
    {
      icon: Edit2,
      label: 'Profile Settings',
      onClick: () => { alert('Profile Settings — Coming Soon!'); onClose(); }
    },
    {
      icon: MessageSquare,
      label: 'Contact Us',
      onClick: () => { alert('Contact — Coming Soon!'); onClose(); }
    },
    {
      icon: Settings,
      label: 'Settings',
      onClick: () => { alert('Settings coming soon!'); onClose(); }
    },
    {
      icon: HelpCircle,
      label: 'Help & Support',
      onClick: () => { alert('Help documentation coming soon!'); onClose(); }
    },
    
  ];

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-72 bg-white shadow-2xl z-50">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-emerald-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">E</span>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-800">ESG Dashboard</p>
              <p className="text-xs text-gray-500">Sustainability Metrics</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition">
            <X className="w-5 h-5"/>
          </button>
        </div>

        {/* Menu Items */}
        <nav className="p-4 overflow-y-auto h-[calc(100vh-80px)]">
          <div className="space-y-0.5">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <button
                  key={index}
                  onClick={item.onClick}
                  className="w-full flex items-center gap-3 px-4 py-3 text-gray-600
                    hover:bg-emerald-50 hover:text-emerald-700 rounded-xl transition-all group text-sm font-medium"
                >
                  <Icon className="w-4 h-4 group-hover:scale-110 transition-transform flex-shrink-0"/>
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* Footer tip */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <div className="px-4 py-3 bg-emerald-50 rounded-xl">
              <p className="text-xs font-semibold text-emerald-800 mb-1">💡 Quick Tip</p>
              <p className="text-xs text-emerald-600 leading-relaxed">
                Use the Environmental, Social, and Governance tabs on the dashboard to navigate between ESG modules.
              </p>
            </div>
          </div>
        </nav>
      </div>
    </>
  );
};

export default SidebarMenu;