import { Bell } from 'lucide-react';
import { useSettings } from '../../hooks/useSettings';

export function Header() {
  const { settings } = useSettings();

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="lg:ml-0 ml-16">
          <h2 className="text-2xl font-bold text-gray-900">
            {settings?.clinic_name || 'Clinic Management'}
          </h2>
          <p className="text-sm text-gray-500">
            Manage your clinic operations efficiently
          </p>
        </div>

        <div className="flex items-center gap-4">
          <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <Bell className="w-6 h-6 text-gray-700" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>
        </div>
      </div>
    </header>
  );
}
