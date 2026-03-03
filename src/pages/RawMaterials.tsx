import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Plus, Package, History, AlertCircle } from 'lucide-react';

const RawMaterials = () => {
  const [materials, setMaterials] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<any>(null);
  const [newMaterial, setNewMaterial] = useState({ name: '', unit: '', lowStockThreshold: 10 });
  const [newBatch, setNewBatch] = useState({ batchNumber: '', supplier: '', quantity: 0, purchasePrice: 0, expiryDate: '' });

  const fetchMaterials = async () => {
    const res = await api.get('/raw-materials');
    setMaterials(res.data);
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  const handleAddMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/raw-materials', newMaterial);
      setIsModalOpen(false);
      fetchMaterials();
      setNewMaterial({ name: '', unit: '', lowStockThreshold: 10 });
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to add material. Check database connection.');
    }
  };

  const handleAddBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post(`/raw-materials/${selectedMaterial._id}/batch`, newBatch);
      setIsBatchModalOpen(false);
      fetchMaterials();
      setNewBatch({ batchNumber: '', supplier: '', quantity: 0, purchasePrice: 0, expiryDate: '' });
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to add batch. Check database connection.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Raw Materials</h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-emerald-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-emerald-700"
        >
          <Plus size={20} /> Add Material
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-bottom border-gray-100">
            <tr>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">Material Name</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">Unit</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">Total Stock</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">Status</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {materials.map((m) => (
              <tr key={m._id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-medium text-gray-900">{m.name}</td>
                <td className="px-6 py-4 text-gray-600">{m.unit}</td>
                <td className="px-6 py-4 font-bold text-gray-900">{m.totalStock}</td>
                <td className="px-6 py-4">
                  {m.totalStock <= m.lowStockThreshold ? (
                    <span className="flex items-center gap-1 text-amber-600 bg-amber-50 px-2 py-1 rounded-full text-xs font-bold">
                      <AlertCircle size={12} /> Low Stock
                    </span>
                  ) : (
                    <span className="text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full text-xs font-bold">In Stock</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <button 
                    onClick={() => { setSelectedMaterial(m); setIsBatchModalOpen(true); }}
                    className="text-emerald-600 hover:text-emerald-700 font-medium text-sm"
                  >
                    Add Batch
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Material Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <h2 className="text-xl font-bold mb-6">Add New Material</h2>
            <form onSubmit={handleAddMaterial} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input required className="w-full border rounded-lg p-2" onChange={e => setNewMaterial({...newMaterial, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Unit (kg, g, l, ml, pc)</label>
                <input required className="w-full border rounded-lg p-2" onChange={e => setNewMaterial({...newMaterial, unit: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Low Stock Threshold</label>
                <input type="number" required className="w-full border rounded-lg p-2" onChange={e => setNewMaterial({...newMaterial, lowStockThreshold: Number(e.target.value)})} />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 border py-2 rounded-lg">Cancel</button>
                <button type="submit" className="flex-1 bg-emerald-600 text-white py-2 rounded-lg">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Batch Modal */}
      {isBatchModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <h2 className="text-xl font-bold mb-6">Add Batch for {selectedMaterial?.name}</h2>
            <form onSubmit={handleAddBatch} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Batch Number</label>
                <input required className="w-full border rounded-lg p-2" onChange={e => setNewBatch({...newBatch, batchNumber: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Supplier</label>
                <input required className="w-full border rounded-lg p-2" onChange={e => setNewBatch({...newBatch, supplier: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Quantity</label>
                  <input type="number" required className="w-full border rounded-lg p-2" onChange={e => setNewBatch({...newBatch, quantity: Number(e.target.value)})} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Price per Unit</label>
                  <input type="number" required className="w-full border rounded-lg p-2" onChange={e => setNewBatch({...newBatch, purchasePrice: Number(e.target.value)})} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Expiry Date</label>
                <input type="date" required className="w-full border rounded-lg p-2" onChange={e => setNewBatch({...newBatch, expiryDate: e.target.value})} />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setIsBatchModalOpen(false)} className="flex-1 border py-2 rounded-lg">Cancel</button>
                <button type="submit" className="flex-1 bg-emerald-600 text-white py-2 rounded-lg">Save Batch</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RawMaterials;
