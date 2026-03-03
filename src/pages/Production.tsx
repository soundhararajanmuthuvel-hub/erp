import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Play, CheckCircle, AlertCircle, Factory } from 'lucide-react';

const Production = () => {
  const [lots, setLots] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [selectedLot, setSelectedLot] = useState<any>(null);
  const [newLot, setNewLot] = useState({ finishedProductId: '', targetQuantity: 0, lotNumber: '' });
  const [completionData, setCompletionData] = useState({ actualYield: 0, wastage: 0 });

  const fetchData = async () => {
    const [prodRes, lotRes] = await Promise.all([
      api.get('/finished-products'),
      api.get('/production')
    ]);
    setProducts(prodRes.data);
    setLots(lotRes.data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStartProduction = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/production', newLot);
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Production failed to start');
    }
  };

  const handleCompleteProduction = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.put(`/production/${selectedLot._id}/complete`, completionData);
    setIsCompleteModalOpen(false);
    fetchData();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Production Lots</h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-emerald-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-emerald-700"
        >
          <Play size={20} /> Start New Lot
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-bottom border-gray-100">
            <tr>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">Lot #</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">Product</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">Target Qty</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">Status</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {lots.map((l) => (
              <tr key={l._id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-medium text-gray-900">{l.lotNumber}</td>
                <td className="px-6 py-4 text-gray-600">{l.finishedProduct?.name}</td>
                <td className="px-6 py-4 font-bold text-gray-900">{l.targetQuantity}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                    l.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'
                  }`}>
                    {l.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {l.status === 'In Progress' && (
                    <button 
                      onClick={() => { setSelectedLot(l); setIsCompleteModalOpen(true); }}
                      className="text-emerald-600 hover:text-emerald-700 font-medium text-sm"
                    >
                      Complete
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Complete Lot Modal */}
      {isCompleteModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <h2 className="text-xl font-bold mb-6">Complete Lot {selectedLot?.lotNumber}</h2>
            <form onSubmit={handleCompleteProduction} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Actual Yield</label>
                <input type="number" required className="w-full border rounded-lg p-2" onChange={e => setCompletionData({...completionData, actualYield: Number(e.target.value)})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Wastage</label>
                <input type="number" required className="w-full border rounded-lg p-2" onChange={e => setCompletionData({...completionData, wastage: Number(e.target.value)})} />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setIsCompleteModalOpen(false)} className="flex-1 border py-2 rounded-lg">Cancel</button>
                <button type="submit" className="flex-1 bg-emerald-600 text-white py-2 rounded-lg">Complete</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Start Lot Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <h2 className="text-xl font-bold mb-6">Start Production Lot</h2>
            <form onSubmit={handleStartProduction} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Product</label>
                <select 
                  required 
                  className="w-full border rounded-lg p-2"
                  onChange={e => setNewLot({...newLot, finishedProductId: e.target.value})}
                >
                  <option value="">Select Product</option>
                  {products.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Lot Number</label>
                <input required className="w-full border rounded-lg p-2" onChange={e => setNewLot({...newLot, lotNumber: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Target Quantity</label>
                <input type="number" required className="w-full border rounded-lg p-2" onChange={e => setNewLot({...newLot, targetQuantity: Number(e.target.value)})} />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 border py-2 rounded-lg">Cancel</button>
                <button type="submit" className="flex-1 bg-emerald-600 text-white py-2 rounded-lg">Start Lot</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Production;
