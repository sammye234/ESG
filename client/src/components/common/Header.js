// client/src/components/common/Header.js
import React from 'react';
import { Menu, LogOut } from 'lucide-react';

const Header = ({ title, subtitle, onMenuClick, actions = [], onLogout }) => {
  return (
    <header className="bg-white shadow-md px-8 py-4 sticky top-0 z-40">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          {onMenuClick && (
            <button
              onClick={onMenuClick}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
              title="Menu"
            >
              <Menu className="w-6 h-6 text-gray-700" />
            </button>
          )}
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
            {subtitle && (
              <p className="text-sm text-gray-600">{subtitle}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Custom actions */}
          {actions.map((action, idx) => (
            <button
              key={idx}
              onClick={action.onClick}
              className={action.className}
              title={action.label}
            >
              {action.icon && <action.icon className="w-4 h-4" />}
              <span>{action.label}</span>
            </button>
          ))}

          {/* Logout button */}
          {onLogout && (
            <button
              onClick={onLogout}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition flex items-center gap-2"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;