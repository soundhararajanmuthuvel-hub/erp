import React from 'react';
import { Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import { useAuth, AuthProvider } from './context/AuthContext';
import api from './services/api';
import { 
  LayoutDashboard, 
  Package, 
  FlaskConical, 
  Factory, 
  ShoppingCart, 
  FileText, 
  Users,
  Settings as SettingsIcon,
  Menu,
  X
} from 'lucide-react';
import Dashboard from './pages/Dashboard';
import RawMaterials from './pages/RawMaterials';
import FinishedProducts from './pages/FinishedProducts';
import Production from './pages/Production';
import Sales from './pages/Sales';
import Reports from './pages/Reports';
import Customers from './pages/Customers';
import Settings from './pages/Settings';

const SidebarItem = ({ to, icon: Icon, label, onClick }: any) => (
  <Link 
    to={to} 
    onClick={onClick}
    className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 rounded-lg transition-colors"
  >
    <Icon size={20} />
    <span className="font-medium">{label}</span>
  </Link>
);

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = React.useState(false);
  const [company, setCompany] = React.useState<any>(null);
  const [dbError, setDbError] = React.useState<any>(null);

  const fetchCompany = async () => {
    try {
      console.log('Fetching company details...');
      const response = await api.get('/company');
      setCompany(response.data);
      setDbError(null);
      console.log('Company details loaded:', response.data.name);
    } catch (error: any) {
      console.error('Error fetching company:', error);
    }
  };

  React.useEffect(() => {
    fetchCompany();
    
    const handleDbError = (e: any) => {
      setDbError(e.detail);
    };

    window.addEventListener('company-updated', fetchCompany);
    window.addEventListener('db-connection-error', handleDbError);
    
    return () => {
      window.removeEventListener('company-updated', fetchCompany);
      window.removeEventListener('db-connection-error', handleDbError);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* DB Error Overlay */}
      {dbError && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl border border-rose-100">
            <div className="flex items-center gap-4 mb-6 text-rose-600">
              <div className="p-3 bg-rose-50 rounded-2xl">
                <X size={32} />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Database Connection Error</h2>
                <p className="text-rose-500 font-medium">Your IP is likely not whitelisted in MongoDB Atlas.</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="w-6 h-6 bg-emerald-600 text-white rounded-full flex items-center justify-center text-xs">!</span>
                  How to fix this (Action Required):
                </h3>
                <ol className="space-y-3 text-gray-600 list-decimal ml-4">
                  <li>Log in to your <a href="https://cloud.mongodb.com/" target="_blank" rel="noreferrer" className="text-emerald-600 font-bold underline">MongoDB Atlas Dashboard</a>.</li>
                  <li>In the left sidebar, click <strong>Network Access</strong> (under Security).</li>
                  <li>Click the green <strong>Add IP Address</strong> button.</li>
                  <li>Click <strong>Allow Access From Anywhere</strong> (adds 0.0.0.0/0).</li>
                  <li>Click <strong>Confirm</strong> and wait 60 seconds for it to apply.</li>
                </ol>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => window.location.reload()}
                  className="flex-1 bg-emerald-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all"
                >
                  I've whitelisted it, Reload App
                </button>
              </div>
              
              <p className="text-center text-xs text-gray-400">
                This error occurs because the AI Studio environment uses dynamic IP addresses that change frequently.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Menu Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-md shadow-md"
      >
        {isOpen ? <X /> : <Menu />}
      </button>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out
        lg:relative lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-full flex flex-col p-4">
          <div className="flex items-center gap-2 px-4 py-6 mb-6">
            {company?.logo ? (
              <img src={company.logo} alt="Logo" className="w-8 h-8 object-contain rounded" />
            ) : (
              <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold">
                {company?.name?.charAt(0) || 'N'}
              </div>
            )}
            <h1 className="text-xl font-bold text-gray-900 truncate">{company?.name || 'Amudhasurabiy Organics'}</h1>
          </div>

          <nav className="flex-1 space-y-1">
            <SidebarItem to="/" icon={LayoutDashboard} label="Dashboard" onClick={() => setIsOpen(false)} />
            <SidebarItem to="/raw-materials" icon={Package} label="Raw Materials" onClick={() => setIsOpen(false)} />
            <SidebarItem to="/finished-products" icon={FlaskConical} label="Products" onClick={() => setIsOpen(false)} />
            <SidebarItem to="/production" icon={Factory} label="Production" onClick={() => setIsOpen(false)} />
            <SidebarItem to="/sales" icon={ShoppingCart} label="Sales & Billing" onClick={() => setIsOpen(false)} />
            <SidebarItem to="/customers" icon={Users} label="Customers" onClick={() => setIsOpen(false)} />
            <SidebarItem to="/reports" icon={FileText} label="Reports" onClick={() => setIsOpen(false)} />
            <SidebarItem to="/settings" icon={SettingsIcon} label="Settings" onClick={() => setIsOpen(false)} />
          </nav>

          <div className="pt-4 border-t border-gray-100">
            <div className="px-4 py-3">
              <p className="text-sm font-medium text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-500">Open Access Mode</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 lg:p-8 overflow-auto">
        <div className="max-w-7xl mx-auto pt-12 lg:pt-0">
          {children}
        </div>
      </main>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/raw-materials" element={<RawMaterials />} />
          <Route path="/finished-products" element={<FinishedProducts />} />
          <Route path="/production" element={<Production />} />
          <Route path="/sales" element={<Sales />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Layout>
    </AuthProvider>
  );
}
