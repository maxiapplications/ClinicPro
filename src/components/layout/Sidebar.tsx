import {
  LayoutDashboard,
  Receipt,
  Package,
  Users,
  FileText,
  Settings,
  Activity,
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'billing', label: 'Billing', icon: Receipt },
  { id: 'items', label: 'Items', icon: Package },
  { id: 'patients', label: 'Patients', icon: Users },
  { id: 'invoices', label: 'Invoices', icon: FileText },
  { id: 'inventory', label: 'Inventory', icon: Activity },
  { id: 'settings', label: 'Settings', icon: Settings },
];

interface SidebarContentProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

function SidebarContent({ currentView, onNavigate }: SidebarContentProps) {
  return (
    <div className="h-full flex flex-col bg-white border-r border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">ClinicPro</h1>
            <p className="text-xs text-gray-500">Accounting System</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors',
                isActive
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              )}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <div className="text-xs text-gray-500 text-center">
          Version 1.0.0
        </div>
      </div>
    </div>
  );
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const handleNavigate = (view: string) => {
    window.dispatchEvent(new CustomEvent('navigate', { detail: view }));
    onClose();
  };

  const getCurrentView = () => {
    return window.location.hash.slice(1) || 'dashboard';
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          'fixed top-0 left-0 h-full w-64 z-40 transform transition-transform duration-300 ease-in-out lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <SidebarContent currentView={getCurrentView()} onNavigate={handleNavigate} />
      </aside>
    </>
  );
}
