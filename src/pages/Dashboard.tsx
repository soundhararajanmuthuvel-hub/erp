import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { 
  TrendingUp, 
  Package, 
  AlertTriangle, 
  Clock, 
  DollarSign,
  Factory,
  ShoppingCart,
  RefreshCw
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';

const StatCard = ({ title, value, icon: Icon, color, subValue }: any) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
    <div className="flex items-start justify-between mb-4">
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon size={24} className="text-white" />
      </div>
      {subValue && <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{subValue}</span>}
    </div>
    <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
    <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/reports/dashboard');
        setStats(res.data);
      } catch (err: any) {
        console.error(err);
        setError(err.response?.data?.message || 'Failed to load dashboard stats');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
    </div>
  );

  if (error) return (
    <div className="bg-rose-50 border border-rose-200 text-rose-700 p-6 rounded-2xl flex flex-col items-center gap-4">
      <AlertTriangle size={48} />
      <div className="text-center">
        <h2 className="text-xl font-bold">Dashboard Error</h2>
        <p>{error}</p>
      </div>
      <button 
        onClick={() => window.location.reload()}
        className="bg-rose-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-rose-700"
      >
        Retry
      </button>
    </div>
  );

  const chartData = stats?.weeklySales || [];

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-500">Welcome back to Amudhasurabiy Organics</p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => window.location.reload()}
            className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
            title="Refresh Dashboard"
          >
            <RefreshCw size={20} />
          </button>
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-gray-100 shadow-sm">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Database Connected</span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Today's Sales" 
          value={`₹${(stats?.todaySales || 0).toLocaleString()}`} 
          icon={TrendingUp} 
          color="bg-emerald-500" 
        />
        <StatCard 
          title="Production Lots" 
          value={stats?.todayProduction || 0} 
          icon={Factory} 
          color="bg-blue-500" 
          subValue="Today"
        />
        <StatCard 
          title="Low Stock Alert" 
          value={stats?.lowStockCount || 0} 
          icon={AlertTriangle} 
          color="bg-amber-500" 
        />
        <StatCard 
          title="Outstanding" 
          value={`₹${(stats?.outstandingAmount || 0).toLocaleString()}`} 
          icon={DollarSign} 
          color="bg-rose-500" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Sales Performance</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="sales" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Recent Activities</h3>
          <div className="space-y-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <ShoppingCart size={18} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">New Sale: INV-202400{i}</p>
                  <p className="text-xs text-gray-500">2 hours ago • ₹4,500</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
