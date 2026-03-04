import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Plus, Package, Settings } from 'lucide-react';

const FinishedProducts = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBomModalOpen, setIsBomModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [materials, setMaterials] = useState<any[]>([]);
  const [newProduct, setNewProduct] = useState({
    name: '', hsnCode: '', gstPercentage: 18, retailPrice: 0, wholesalePrice: 0, privateLabelPrice: 0, expiryDurationMonths: 12, barcode: ''
  });
  const [bomMaterials, setBomMaterials] = useState<any[]>([]);

  const fetchData = async () => {
    try {
      const [prodRes, matRes] = await Promise.all([
        api.get('/finished-products'),
        api.get('/raw-materials')
      ]);
      setProducts(Array.isArray(prodRes.data) ? prodRes.data : []);
      setMaterials(Array.isArray(matRes.data) ? matRes.data : []);
    } catch (err) {
      console.error('Error fetching products/materials:', err);
      setProducts([]);
      setMaterials([]);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/finished-products', newProduct);
      setIsModalOpen(false);
      fetchData();
      setNewProduct({
        name: '', hsnCode: '', gstPercentage: 18, retailPrice: 0, wholesalePrice: 0, privateLabelPrice: 0, expiryDurationMonths: 12, barcode: ''
      });
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to add product. Check database connection.');
    }
  };

  const handleSaveBOM = async () => {
    try {
      await api.post('/bom', {
        finishedProduct: selectedProduct._id,
        materials: bomMaterials.map(m => ({ material: m.materialId, quantity: m.quantity }))
      });
      setIsBomModalOpen(false);
      alert('BOM saved successfully');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save BOM. Check database connection.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Finished Products</h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-emerald-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-emerald-700"
        >
          <Plus size={20} /> Add Product
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map(p => (
          <div key={p._id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-bold text-gray-900">{p.name}</h3>
              <span className="text-xs font-bold bg-emerald-50 text-emerald-600 px-2 py-1 rounded-full">Stock: {p.totalStock}</span>
            </div>
            <div className="space-y-2 text-sm text-gray-600 mb-6">
              <div className="flex justify-between"><span>Retail Price:</span> <span className="font-bold text-gray-900">₹{p.retailPrice}</span></div>
              <div className="flex justify-between"><span>Wholesale:</span> <span className="font-bold text-gray-900">₹{p.wholesalePrice}</span></div>
              <div className="flex justify-between"><span>GST:</span> <span className="font-bold text-gray-900">{p.gstPercentage}%</span></div>
            </div>
            <button 
              onClick={() => { setSelectedProduct(p); setIsBomModalOpen(true); }}
              className="w-full flex items-center justify-center gap-2 py-2 border border-emerald-600 text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors"
            >
              <Settings size={16} /> Configure BOM
            </button>
          </div>
        ))}
      </div>

      {/* Add Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-auto">
            <h2 className="text-xl font-bold mb-6">Add New Product</h2>
            <form onSubmit={handleAddProduct} className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">Product Name</label>
                <input required className="w-full border rounded-lg p-2" onChange={e => setNewProduct({...newProduct, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">HSN Code</label>
                <input required className="w-full border rounded-lg p-2" onChange={e => setNewProduct({...newProduct, hsnCode: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">GST %</label>
                <input type="number" required className="w-full border rounded-lg p-2" onChange={e => setNewProduct({...newProduct, gstPercentage: Number(e.target.value)})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Retail Price</label>
                <input type="number" required className="w-full border rounded-lg p-2" onChange={e => setNewProduct({...newProduct, retailPrice: Number(e.target.value)})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Wholesale Price</label>
                <input type="number" required className="w-full border rounded-lg p-2" onChange={e => setNewProduct({...newProduct, wholesalePrice: Number(e.target.value)})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Private Label Price</label>
                <input type="number" required className="w-full border rounded-lg p-2" onChange={e => setNewProduct({...newProduct, privateLabelPrice: Number(e.target.value)})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Expiry (Months)</label>
                <input type="number" required className="w-full border rounded-lg p-2" onChange={e => setNewProduct({...newProduct, expiryDurationMonths: Number(e.target.value)})} />
              </div>
              <div className="col-span-2 flex gap-4 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 border py-2 rounded-lg">Cancel</button>
                <button type="submit" className="flex-1 bg-emerald-600 text-white py-2 rounded-lg">Save Product</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BOM Modal */}
      {isBomModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full">
            <h2 className="text-xl font-bold mb-6">BOM for {selectedProduct?.name}</h2>
            <div className="space-y-4 mb-6">
              {bomMaterials.map((bm, idx) => (
                <div key={idx} className="flex gap-4 items-end">
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-1">Material</label>
                    <select 
                      className="w-full border rounded-lg p-2"
                      value={bm.materialId}
                      onChange={e => {
                        const newBom = [...bomMaterials];
                        newBom[idx].materialId = e.target.value;
                        setBomMaterials(newBom);
                      }}
                    >
                      <option value="">Select Material</option>
                      {materials.map(m => <option key={m._id} value={m._id}>{m.name} ({m.unit})</option>)}
                    </select>
                  </div>
                  <div className="w-32">
                    <label className="block text-sm font-medium mb-1">Qty per Unit</label>
                    <input 
                      type="number" 
                      className="w-full border rounded-lg p-2"
                      value={bm.quantity}
                      onChange={e => {
                        const newBom = [...bomMaterials];
                        newBom[idx].quantity = Number(e.target.value);
                        setBomMaterials(newBom);
                      }}
                    />
                  </div>
                  <button onClick={() => setBomMaterials(bomMaterials.filter((_, i) => i !== idx))} className="text-red-500 p-2">Remove</button>
                </div>
              ))}
              <button 
                onClick={() => setBomMaterials([...bomMaterials, { materialId: '', quantity: 0 }])}
                className="text-emerald-600 font-medium text-sm"
              >
                + Add Material to BOM
              </button>
            </div>
            <div className="flex gap-4 pt-4">
              <button type="button" onClick={() => setIsBomModalOpen(false)} className="flex-1 border py-2 rounded-lg">Cancel</button>
              <button onClick={handleSaveBOM} className="flex-1 bg-emerald-600 text-white py-2 rounded-lg">Save BOM</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinishedProducts;
