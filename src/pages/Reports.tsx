import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { FileText, Download, PieChart } from 'lucide-react';

const Reports = () => {
  const [plData, setPlData] = useState<any>(null);
  const [gstData, setGstData] = useState<any[]>([]);

  useEffect(() => {
    const fetchReports = async () => {
      const [plRes, gstRes] = await Promise.all([
        api.get('/reports/profit-loss'),
        api.get('/reports/gst')
      ]);
      setPlData(plRes.data);
      setGstData(gstRes.data);
    };
    fetchReports();
  }, []);

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Financial Reports</h1>
          <p className="text-gray-500">Analyze your business performance</p>
        </div>
        <button className="bg-emerald-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-emerald-700">
          <Download size={20} /> Export All
        </button>
      </header>

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
              <span className="font-bold">₹{plData?.revenue.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">GST Collected</span>
              <span className="font-bold text-rose-600">- ₹{plData?.gst.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-2 border-b font-bold bg-gray-50 px-2 rounded">
              <span>Net Revenue</span>
              <span>₹{plData?.netRevenue.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Production Cost (FIFO)</span>
              <span className="font-bold text-rose-600">- ₹{plData?.productionCost.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Operating Expenses</span>
              <span className="font-bold text-rose-600">- ₹{plData?.expenses.toLocaleString()}</span>
            </div>
            <div className={`flex justify-between py-4 mt-4 px-4 rounded-xl text-lg font-bold ${
              plData?.netProfit >= 0 ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
            }`}>
              <span>Net Profit</span>
              <span>₹{plData?.netProfit.toLocaleString()}</span>
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
                    <td className="px-4 py-3 text-sm">₹{g.totalTaxableValue.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm font-bold text-emerald-600">₹{g.totalGst.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
