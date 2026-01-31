import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router';
import { useApp } from '../../contexts/AppContext';
import {
  Search,
  Command,
  ShoppingCart,
  Package,
  Warehouse,
  Receipt,
  BarChart3,
  Settings,
  LayoutDashboard,
  User,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  FileText,
  Download,
  Upload,
  Plus,
  Trash2,
  Edit,
  Eye,
  Zap,
  LogOut,
  Store,
  Users,
  CreditCard,
  HelpCircle,
  Moon,
  Sun,
  Bell,
  Keyboard,
} from 'lucide-react';
import { toast } from 'sonner';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onShowShortcuts?: () => void;
}

interface Command {
  id: string;
  title: string;
  subtitle?: string;
  icon: any;
  action: () => void;
  category: 'navigation' | 'actions' | 'data' | 'settings' | 'quick';
  keywords: string[];
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, onShowShortcuts }) => {
  const navigate = useNavigate();
  const { products, sales, addSale, logout } = useApp();
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands: Command[] = useMemo(() => [
    // Navigation Commands
    {
      id: 'nav-dashboard',
      title: 'Go to Dashboard',
      subtitle: 'View sales overview and analytics',
      icon: LayoutDashboard,
      action: () => { navigate('/'); onClose(); },
      category: 'navigation',
      keywords: ['dashboard', 'home', 'overview', 'stats'],
    },
    {
      id: 'nav-billing',
      title: 'Go to Billing / POS',
      subtitle: 'Create new invoice and manage sales',
      icon: ShoppingCart,
      action: () => { navigate('/billing'); onClose(); },
      category: 'navigation',
      keywords: ['billing', 'pos', 'invoice', 'sell', 'checkout'],
    },
    {
      id: 'nav-products',
      title: 'Go to Products',
      subtitle: 'Manage product catalog',
      icon: Package,
      action: () => { navigate('/products'); onClose(); },
      category: 'navigation',
      keywords: ['products', 'items', 'catalog'],
    },
    {
      id: 'nav-inventory',
      title: 'Go to Inventory',
      subtitle: 'Manage stock levels',
      icon: Warehouse,
      action: () => { navigate('/inventory'); onClose(); },
      category: 'navigation',
      keywords: ['inventory', 'stock', 'warehouse'],
    },
    {
      id: 'nav-orders',
      title: 'Go to Orders',
      subtitle: 'View order history',
      icon: Receipt,
      action: () => { navigate('/orders'); onClose(); },
      category: 'navigation',
      keywords: ['orders', 'history', 'sales', 'transactions'],
    },
    {
      id: 'nav-reports',
      title: 'Go to Reports',
      subtitle: 'View detailed analytics',
      icon: BarChart3,
      action: () => { navigate('/reports'); onClose(); },
      category: 'navigation',
      keywords: ['reports', 'analytics', 'statistics'],
    },
    {
      id: 'nav-settings',
      title: 'Go to Settings',
      subtitle: 'Configure app preferences',
      icon: Settings,
      action: () => { navigate('/settings'); onClose(); },
      category: 'navigation',
      keywords: ['settings', 'preferences', 'config'],
    },

    // Quick Actions
    {
      id: 'quick-new-sale',
      title: 'Start New Sale',
      subtitle: 'Quick access to billing',
      icon: Plus,
      action: () => { navigate('/billing'); onClose(); toast.success('Ready to create new sale!'); },
      category: 'quick',
      keywords: ['new', 'sale', 'create', 'billing', 'invoice'],
    },
    {
      id: 'quick-add-product',
      title: 'Add New Product',
      subtitle: 'Quickly add product to catalog',
      icon: Package,
      action: () => { navigate('/products'); onClose(); toast.info('Navigate to Add Product'); },
      category: 'quick',
      keywords: ['add', 'new', 'product', 'create', 'item'],
    },
    {
      id: 'quick-today-sales',
      title: 'View Today\'s Sales',
      subtitle: `${sales.filter(s => new Date(s.createdAt).toDateString() === new Date().toDateString()).length} orders today`,
      icon: DollarSign,
      action: () => { navigate('/orders'); onClose(); },
      category: 'quick',
      keywords: ['today', 'sales', 'revenue', 'daily'],
    },
    {
      id: 'quick-low-stock',
      title: 'View Low Stock Items',
      subtitle: `${products.filter(p => p.stock < 10).length} items need attention`,
      icon: AlertTriangle,
      action: () => { navigate('/inventory'); onClose(); },
      category: 'quick',
      keywords: ['low', 'stock', 'alert', 'inventory'],
    },

    // Data Actions
    {
      id: 'data-export',
      title: 'Export All Data',
      subtitle: 'Download backup as JSON',
      icon: Download,
      action: () => {
        const data = {
          products: JSON.parse(localStorage.getItem('products') || '[]'),
          sales: JSON.parse(localStorage.getItem('sales') || '[]'),
          customers: JSON.parse(localStorage.getItem('customers') || '[]'),
          exportDate: new Date().toISOString(),
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `jr-invoice-backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        toast.success('Data exported successfully!');
        onClose();
      },
      category: 'data',
      keywords: ['export', 'download', 'backup', 'save', 'data'],
    },
    {
      id: 'data-import',
      title: 'Import Data',
      subtitle: 'Restore from backup file',
      icon: Upload,
      action: () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e: any) => {
          const file = e.target.files[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
              try {
                const data = JSON.parse(event.target?.result as string);
                if (data.products) localStorage.setItem('products', JSON.stringify(data.products));
                if (data.sales) localStorage.setItem('sales', JSON.stringify(data.sales));
                if (data.customers) localStorage.setItem('customers', JSON.stringify(data.customers));
                toast.success('Data imported successfully! Refreshing...');
                setTimeout(() => window.location.reload(), 1500);
              } catch (err) {
                toast.error('Invalid backup file');
              }
            };
            reader.readAsText(file);
          }
        };
        input.click();
        onClose();
      },
      category: 'data',
      keywords: ['import', 'upload', 'restore', 'backup'],
    },

    // Settings Actions
    {
      id: 'settings-help',
      title: 'Open Help Center',
      subtitle: 'Get support and FAQs',
      icon: HelpCircle,
      action: () => {
        toast.info('Opening help center...');
        onClose();
      },
      category: 'settings',
      keywords: ['help', 'support', 'faq', 'guide'],
    },
    {
      id: 'settings-shortcuts',
      title: 'View Keyboard Shortcuts',
      subtitle: 'Learn all shortcuts',
      icon: Keyboard,
      action: () => {
        if (onShowShortcuts) {
          onShowShortcuts();
        } else {
          toast.info('Ctrl+K: Command Palette, Ctrl+B: Billing, Ctrl+P: Products, Ctrl+I: Inventory');
          onClose();
        }
      },
      category: 'settings',
      keywords: ['keyboard', 'shortcuts', 'hotkeys', 'keys'],
    },
    {
      id: 'settings-logout',
      title: 'Logout',
      subtitle: 'Sign out of your account',
      icon: LogOut,
      action: () => { logout(); onClose(); },
      category: 'settings',
      keywords: ['logout', 'signout', 'exit'],
    },
  ], [navigate, onClose, products, sales, logout, onShowShortcuts]);

  const filteredCommands = useMemo(() => {
    if (!search) return commands;
    const searchLower = search.toLowerCase();
    return commands.filter(cmd => 
      cmd.title.toLowerCase().includes(searchLower) ||
      cmd.subtitle?.toLowerCase().includes(searchLower) ||
      cmd.keywords.some(k => k.includes(searchLower))
    );
  }, [search, commands]);

  const groupedCommands = useMemo(() => {
    const groups: Record<string, Command[]> = {
      navigation: [],
      quick: [],
      data: [],
      settings: [],
    };
    
    filteredCommands.forEach(cmd => {
      if (groups[cmd.category]) {
        groups[cmd.category].push(cmd);
      }
    });
    
    return groups;
  }, [filteredCommands]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      setSearch('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => (prev + 1) % filteredCommands.length);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredCommands[selectedIndex]) {
            filteredCommands[selectedIndex].action();
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, filteredCommands, onClose]);

  if (!isOpen) return null;

  const categoryLabels = {
    navigation: '🧭 Navigation',
    quick: '⚡ Quick Actions',
    data: '💾 Data Management',
    settings: '⚙️ Settings',
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-start justify-center pt-[15vh] px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[70vh] overflow-hidden border-2 border-indigo-500">
        {/* Search Input */}
        <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <Command className="w-5 h-5 text-white" />
            </div>
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setSelectedIndex(0); }}
              placeholder="Type a command or search... (Ctrl+K)"
              className="flex-1 bg-transparent border-none outline-none text-gray-800 placeholder-gray-500 text-lg font-medium"
            />
            <kbd className="hidden sm:block px-2 py-1 bg-gray-200 rounded text-xs font-mono text-gray-600">
              ESC
            </kbd>
          </div>
        </div>

        {/* Commands List */}
        <div className="overflow-y-auto max-h-[calc(70vh-80px)]">
          {filteredCommands.length === 0 ? (
            <div className="p-8 text-center">
              <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No commands found</p>
              <p className="text-sm text-gray-400 mt-1">Try searching for something else</p>
            </div>
          ) : (
            Object.entries(groupedCommands).map(([category, cmds]) => {
              if (cmds.length === 0) return null;
              
              return (
                <div key={category} className="py-2">
                  <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">
                    {categoryLabels[category as keyof typeof categoryLabels]}
                  </div>
                  {cmds.map((cmd, idx) => {
                    const globalIndex = filteredCommands.indexOf(cmd);
                    const isSelected = globalIndex === selectedIndex;
                    
                    return (
                      <button
                        key={cmd.id}
                        onClick={cmd.action}
                        onMouseEnter={() => setSelectedIndex(globalIndex)}
                        className={`w-full px-4 py-3 flex items-center gap-3 transition-colors ${
                          isSelected
                            ? 'bg-indigo-50 border-l-4 border-indigo-600'
                            : 'hover:bg-gray-50 border-l-4 border-transparent'
                        }`}
                      >
                        <div className={`p-2 rounded-lg ${
                          isSelected ? 'bg-indigo-100' : 'bg-gray-100'
                        }`}>
                          <cmd.icon className={`w-5 h-5 ${
                            isSelected ? 'text-indigo-600' : 'text-gray-600'
                          }`} />
                        </div>
                        <div className="flex-1 text-left">
                          <div className={`font-medium ${
                            isSelected ? 'text-indigo-900' : 'text-gray-800'
                          }`}>
                            {cmd.title}
                          </div>
                          {cmd.subtitle && (
                            <div className="text-sm text-gray-500">{cmd.subtitle}</div>
                          )}
                        </div>
                        {isSelected && (
                          <kbd className="px-2 py-1 bg-indigo-100 rounded text-xs font-mono text-indigo-700">
                            ↵
                          </kbd>
                        )}
                      </button>
                    );
                  })}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-gray-200 bg-gray-50 flex items-center justify-between text-xs text-gray-600">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white rounded border border-gray-300">↑</kbd>
              <kbd className="px-1.5 py-0.5 bg-white rounded border border-gray-300">↓</kbd>
              to navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white rounded border border-gray-300">↵</kbd>
              to select
            </span>
          </div>
          <span className="flex items-center gap-1">
            <Zap className="w-3 h-3 text-yellow-500" />
            {filteredCommands.length} commands
          </span>
        </div>
      </div>
    </div>
  );
};