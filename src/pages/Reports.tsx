import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { FileText, Download, PieChart, Calendar } from 'lucide-react';
import * as XLSX from 'xlsx';

const Reports = () => {
  const [plData, setPlData] = useState<any>(null);
  const [gstData, setGstData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  const fetchReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const [plRes, gstRes] = await Promise.all([
        api.get(`/reports/profit-loss?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`),
        api.get(`/reports/gst?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`)
      ]);
      setPlData(plRes.data || null);
      setGstData(Array.isArray(gstRes.data) ? gstRes.data : []);
    } catch (err: any) {
      console.error('Error fetching reports:', err);
      setError(err.response?.data?.message || 'Failed to load report data');
      setPlData(null);
      setGstData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [dateRange]);

  const exportToExcel = () => {
    const wb = XLSX.utils.book_new();
    
    // P&L Sheet
    const plSheetData = [
      ['Profit & Loss Statement', '', ''],
      ['Period', `${dateRange.startDate} to ${dateRange.endDate}`, ''],
      ['', '', ''],
      ['Category', 'Amount (₹)', ''],
      ['Total Revenue (Gross)', plData?.revenue, ''],
      ['GST Collected', plData?.gst, ''],
      ['Net Revenue', plData?.netRevenue, ''],
      ['Production Cost', plData?.productionCost, ''],
      ['Operating Expenses', plData?.expenses, ''],
      ['Net Profit', plData?.netProfit, '']
    ];
    const wsPL = XLSX.utils.aoa_to_sheet(plSheetData);
    XLSX.utils.book_append_sheet(wb, wsPL, "Profit & Loss");

    // GST Sheet
    const wsGST = XLSX.utils.json_to_sheet(gstData);
    XLSX.utils.book_append_sheet(wb, wsGST, "GST Summary");

    XLSX.writeFile(wb, `Financial_Report_${dateRange.startDate}_${dateRange.endDate}.xlsx`);
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Financial Reports</h1>
          <p className="text-gray-500">Analyze your business performance</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-white border rounded-lg px-3 py-2 shadow-sm">
            <Calendar size={18} className="text-gray-400" />
            <input 
              type="date" 
              className="border-none focus:ring-0 text-sm" 
              value={dateRange.startDate}
              onChange={e => setDateRange({...dateRange, startDate: e.target.value})}
            />
            <span className="text-gray-400">to</span>
            <input 
              type="date" 
              className="border-none focus:ring-0 text-sm" 
              value={dateRange.endDate}
              onChange={e => setDateRange({...dateRange, endDate: e.target.value})}
            />
          </div>
          <button 
            disabled={loading || !!error}
            onClick={exportToExcel}
            className="bg-emerald-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-emerald-700 shadow-lg shadow-emerald-100 transition-all disabled:opacity-50"
          >
            <Download size={20} /> Export Excel
          </button>
        </div>
      </header>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        </div>
      ) : error ? (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 p-6 rounded-2xl flex flex-col items-center gap-4">
          <FileText size={48} />
          <div className="text-center">
            <h2 className="text-xl font-bold">Report Error</h2>
            <p>{error}</p>
          </div>
          <button 
            onClick={fetchReports}
            className="bg-rose-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-rose-700"
          >
            Retry
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Profit & Loss */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><PieChart size={24} /></div>
            <h2 className="text-xl font-bold text-gray-900">Profit & Loss Statement</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Total Revenue (Gross)</span>
              <span className="font-bold">₹{(plData?.revenue || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">GST Collected</span>
              <span className="font-bold text-rose-600">- ₹{(plData?.gst || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-2 border-b font-bold bg-gray-50 px-2 rounded">
              <span>Net Revenue</span>
              <span>₹{(plData?.netRevenue || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Production Cost (FIFO)</span>
              <span className="font-bold text-rose-600">- ₹{(plData?.productionCost || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Operating Expenses</span>
              <span className="font-bold text-rose-600">- ₹{(plData?.expenses || 0).toLocaleString()}</span>
            </div>
            <div className={`flex justify-between py-4 mt-4 px-4 rounded-xl text-lg font-bold ${
              plData?.netProfit >= 0 ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
            }`}>
              <span>Net Profit</span>
              <span>₹{(plData?.netProfit || 0).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* GST Summary */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><FileText size={24} /></div>
            <h2 className="text-xl font-bold text-gray-900">GST HSN Summary</h2>
          </div>

          <div className="overflow-hidden rounded-xl border border-gray-100">
            <table className="w-full text-left">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase">HSN Code</th>
                  <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase">Taxable Val</th>
                  <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase">GST</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {gstData.map((g, i) => (
                  <tr key={i}>
                    <td className="px-4 py-3 text-sm font-medium">{g.hsnCode}</td>
                    <td className="px-4 py-3 text-sm">₹{(g.totalTaxableValue || 0).toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm font-bold text-emerald-600">₹{(g.totalGst || 0).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )}
  </div>
);
};

export default Reports;
