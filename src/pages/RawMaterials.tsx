import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Plus, Package, History, AlertCircle } from 'lucide-react';

const RawMaterials = () => {
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<any>(null);
  const [newMaterial, setNewMaterial] = useState({ name: '', unit: '', lowStockThreshold: 10 });
  const [newBatch, setNewBatch] = useState({ batchNumber: '', supplier: '', quantity: 0, purchasePrice: 0, expiryDate: '' });

  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const fetchMaterials = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/raw-materials?t=${Date.now()}`);
      console.log(`[Frontend] Received ${res.data.length} materials`);
      setMaterials(Array.isArray(res.data) ? res.data : []);
    } catch (err: any) {
      console.error('Error fetching materials:', err);
      setError(err.response?.data?.message || 'Failed to load materials. Check database connection.');
      setMaterials([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  const handleAddMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Sanitize numeric inputs
      const sanitizedMaterial = {
        ...newMaterial,
        lowStockThreshold: Number(String(newMaterial.lowStockThreshold).replace(/[^0-9.]/g, ''))
      };

      if (isEditMode && selectedMaterial) {
        const res = await api.put(`/raw-materials/${selectedMaterial._id}`, sanitizedMaterial);
        console.log('Material updated:', res.data);
      } else {
        const res = await api.post('/raw-materials', sanitizedMaterial);
        console.log('Material created:', res.data);
      }
      
      setIsModalOpen(false);
      setIsEditMode(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      
      // Small delay for DB consistency
      await new Promise(resolve => setTimeout(resolve, 800));
      
      fetchMaterials();
      setNewMaterial({ name: '', unit: '', lowStockThreshold: 10 });
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to add material';
      alert(`Error: ${msg}`);
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
      const msg = err.response?.data?.message || err.message || 'Failed to add batch';
      alert(`Error: ${msg}`);
    }
  };

  return (
    <div className="space-y-6">
      {showSuccess && (
        <div className="fixed top-4 right-4 z-[100] bg-emerald-600 text-white px-6 py-3 rounded-xl shadow-lg animate-bounce flex items-center gap-2">
          <Package size={20} />
          <span className="font-bold">Material saved successfully!</span>
        </div>
      )}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Raw Materials</h1>
          <p className="text-sm text-gray-500">Track and manage your raw material inventory</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-emerald-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-emerald-700 shadow-lg shadow-emerald-100 transition-all"
        >
          <Plus size={20} /> Add Material
        </button>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-100 text-rose-600 p-4 rounded-xl flex items-center gap-3">
          <AlertCircle size={20} />
          <p className="text-sm font-medium">{error}</p>
          <button onClick={fetchMaterials} className="ml-auto text-xs font-bold underline">Retry</button>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600 mb-4"></div>
          <p className="text-gray-500 font-medium">Loading inventory...</p>
        </div>
      ) : materials.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
          <div className="p-4 bg-gray-50 rounded-full mb-4">
            <Package size={40} className="text-gray-300" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">No Materials Found</h3>
          <p className="text-gray-500 max-w-xs text-center mt-1">
            Your raw material inventory is empty. Click "Add Material" to create your first item.
          </p>
        </div>
      ) : (
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
                      <span className="flex items-center gap-1 text-amber-600 bg-amber-50 px-2 py-1 rounded-full text-xs font-bold w-fit">
                        <AlertCircle size={12} /> Low Stock
                      </span>
                    ) : (
                      <span className="text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full text-xs font-bold w-fit">In Stock</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-3">
                      <button 
                        onClick={() => { setSelectedMaterial(m); setIsBatchModalOpen(true); }}
                        className="text-emerald-600 hover:text-emerald-700 font-bold text-xs px-3 py-1 rounded-md hover:bg-emerald-50 transition-colors"
                      >
                        Add Batch
                      </button>
                      <button 
                        onClick={() => {
                          setSelectedMaterial(m);
                          setNewMaterial({
                            name: m.name,
                            unit: m.unit,
                            lowStockThreshold: m.lowStockThreshold
                          });
                          setIsEditMode(true);
                          setIsModalOpen(true);
                        }}
                        className="text-gray-400 hover:text-emerald-600 font-bold text-xs"
                      >
                        Edit
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Material Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">{isEditMode ? 'Edit Material' : 'Add New Material'}</h2>
              {!isEditMode && (
                <button 
                  type="button" 
                  onClick={() => setNewMaterial({
                    name: 'Sample Raw Material', unit: 'kg', lowStockThreshold: 5
                  })}
                  className="text-xs text-emerald-600 font-bold hover:underline"
                >
                  Quick Fill
                </button>
              )}
            </div>
            <form onSubmit={handleAddMaterial} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input 
                  required 
                  className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 outline-none" 
                  value={newMaterial.name}
                  onChange={e => setNewMaterial({...newMaterial, name: e.target.value})} 
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Unit (kg, g, l, ml, pc)</label>
                <input 
                  required 
                  className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 outline-none" 
                  value={newMaterial.unit}
                  onChange={e => setNewMaterial({...newMaterial, unit: e.target.value})} 
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Low Stock Threshold</label>
                <input 
                  type="number" 
                  required 
                  className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 outline-none" 
                  value={newMaterial.lowStockThreshold}
                  onChange={e => setNewMaterial({...newMaterial, lowStockThreshold: Number(e.target.value)})} 
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 border py-2 rounded-lg font-medium">Cancel</button>
                {isEditMode && (
                  <button 
                    type="button" 
                    onClick={async () => {
                      if (window.confirm('Are you sure you want to delete this material?')) {
                        try {
                          await api.delete(`/raw-materials/${selectedMaterial._id}`);
                          setIsModalOpen(false);
                          setIsEditMode(false);
                          fetchMaterials();
                        } catch (err: any) {
                          alert(err.response?.data?.message || 'Delete failed');
                        }
                      }
                    }}
                    className="flex-1 bg-rose-50 text-rose-600 py-2 rounded-lg font-bold border border-rose-100"
                  >
                    Delete
                  </button>
                )}
                <button type="submit" className="flex-1 bg-emerald-600 text-white py-2 rounded-lg font-bold shadow-lg shadow-emerald-100">
                  {isEditMode ? 'Update' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Batch Modal */}
      {isBatchModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <h2 className="text-xl font-bold mb-6">Add Batch for {selectedMaterial?.name}</h2>
            <form onSubmit={handleAddBatch} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Batch Number</label>
                <input 
                  required 
                  className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 outline-none" 
                  value={newBatch.batchNumber}
                  onChange={e => setNewBatch({...newBatch, batchNumber: e.target.value})} 
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Supplier</label>
                <input 
                  required 
                  className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 outline-none" 
                  value={newBatch.supplier}
                  onChange={e => setNewBatch({...newBatch, supplier: e.target.value})} 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Quantity</label>
                  <input 
                    type="number" 
                    required 
                    className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 outline-none" 
                    value={newBatch.quantity}
                    onChange={e => setNewBatch({...newBatch, quantity: Number(e.target.value)})} 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Price per Unit</label>
                  <input 
                    type="number" 
                    required 
                    className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 outline-none" 
                    value={newBatch.purchasePrice}
                    onChange={e => setNewBatch({...newBatch, purchasePrice: Number(e.target.value)})} 
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Expiry Date</label>
                <input 
                  type="date" 
                  required 
                  className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 outline-none" 
                  value={newBatch.expiryDate}
                  onChange={e => setNewBatch({...newBatch, expiryDate: e.target.value})} 
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setIsBatchModalOpen(false)} className="flex-1 border py-2 rounded-lg font-medium">Cancel</button>
                <button type="submit" className="flex-1 bg-emerald-600 text-white py-2 rounded-lg font-bold shadow-lg shadow-emerald-100">Save Batch</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RawMaterials;
