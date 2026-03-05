import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Plus, Package, Settings, RefreshCw, AlertCircle } from 'lucide-react';

const FinishedProducts = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isBomModalOpen, setIsBomModalOpen] = useState(false);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [materials, setMaterials] = useState<any[]>([]);
  const [newProduct, setNewProduct] = useState({
    name: '', hsnCode: '', gstPercentage: 18, retailPrice: 0, wholesalePrice: 0, privateLabelPrice: 0, expiryDurationMonths: 12, barcode: ''
  });
  const [newBatch, setNewBatch] = useState({
    batchNumber: '', quantity: 0, productionCost: 0, expiryDate: ''
  });
  const [bomMaterials, setBomMaterials] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [showSuccess, setShowSuccess] = useState(false);

  const fetchData = async (isManual = false) => {
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching products and materials...');
      const [prodRes, matRes] = await Promise.all([
        api.get(`/finished-products?t=${Date.now()}`),
        api.get(`/raw-materials?t=${Date.now()}`)
      ]);
      console.log(`[Frontend] Received ${prodRes.data.length} products and ${matRes.data.length} materials`);
      setProducts(Array.isArray(prodRes.data) ? prodRes.data : []);
      setMaterials(Array.isArray(matRes.data) ? matRes.data : []);
      if (isManual) {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000);
      }
    } catch (err: any) {
      console.error('Error fetching products/materials:', err);
      setError(err.response?.data?.message || 'Failed to load products. Check database connection.');
      setProducts([]);
      setMaterials([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    console.log('[FinishedProducts] State updated - Products count:', products.length);
  }, [products]);

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      console.log('Sending product data:', newProduct);
      
      // Sanitize numeric inputs
      const sanitizedProduct = {
        ...newProduct,
        gstPercentage: Number(String(newProduct.gstPercentage).replace(/[^0-9.]/g, '')),
        retailPrice: Number(String(newProduct.retailPrice).replace(/[^0-9.]/g, '')),
        wholesalePrice: Number(String(newProduct.wholesalePrice).replace(/[^0-9.]/g, '')),
        privateLabelPrice: Number(String(newProduct.privateLabelPrice).replace(/[^0-9.]/g, '')),
        expiryDurationMonths: Number(String(newProduct.expiryDurationMonths).replace(/[^0-9.]/g, ''))
      };

      if (isEditMode && selectedProduct) {
        const res = await api.put(`/finished-products/${selectedProduct._id}`, sanitizedProduct);
        console.log('Product updated:', res.data);
      } else {
        const res = await api.post('/finished-products', sanitizedProduct);
        console.log('Product created:', res.data);
      }
      
      setIsModalOpen(false);
      setIsEditMode(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      
      console.log('Waiting for DB consistency...');
      await new Promise(resolve => setTimeout(resolve, 800));
      
      console.log('Refreshing data...');
      await fetchData();
      setNewProduct({
        name: '', hsnCode: '', gstPercentage: 18, retailPrice: 0, wholesalePrice: 0, privateLabelPrice: 0, expiryDurationMonths: 12, barcode: ''
      });
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to add product';
      console.error('Add product error:', msg);
      alert(`Error: ${msg}`);
    }
  };

  const handleAddBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post(`/finished-products/${selectedProduct._id}/batch`, newBatch);
      setIsBatchModalOpen(false);
      fetchData();
      setNewBatch({ batchNumber: '', quantity: 0, productionCost: 0, expiryDate: '' });
      alert('Batch added successfully! Stock updated.');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to add batch');
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
      const msg = err.response?.data?.message || err.message || 'Failed to save BOM';
      alert(`Error: ${msg}`);
    }
  };

  return (
    <div className="space-y-6">
      {showSuccess && (
        <div className="fixed top-4 right-4 z-[100] bg-emerald-600 text-white px-6 py-3 rounded-xl shadow-lg animate-bounce flex items-center gap-2">
          <Package size={20} />
          <span className="font-bold">Product added successfully!</span>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Finished Products</h1>
          <p className="text-sm text-gray-500">Manage your product catalog and BOMs</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => fetchData(true)}
            className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors flex items-center gap-2"
            title="Refresh Data"
          >
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
            <span className="text-xs font-bold hidden sm:inline">Refresh</span>
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-emerald-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-emerald-700 shadow-lg shadow-emerald-100 transition-all"
          >
            <Plus size={20} /> Add Product
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-100 text-rose-600 p-4 rounded-xl flex items-center gap-3">
          <AlertCircle size={20} />
          <p className="text-sm font-medium">{error}</p>
          <button onClick={fetchData} className="ml-auto text-xs font-bold underline">Retry</button>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600 mb-4"></div>
          <p className="text-gray-500 font-medium">Loading products...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
          <div className="p-4 bg-gray-50 rounded-full mb-4">
            <Package size={40} className="text-gray-300" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">No Products Found</h3>
          <p className="text-gray-500 max-w-xs text-center mt-1">
            You haven't added any finished products yet. Click "Add Product" to get started.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map(p => (
            <div key={p._id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 truncate">{p.name}</h3>
                  <p className="text-xs text-gray-400">HSN: {p.hsnCode}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${p.totalStock > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                    Stock: {p.totalStock}
                  </span>
                  <button 
                    onClick={() => {
                      setSelectedProduct(p);
                      setNewProduct({
                        name: p.name,
                        hsnCode: p.hsnCode,
                        gstPercentage: p.gstPercentage,
                        retailPrice: p.retailPrice,
                        wholesalePrice: p.wholesalePrice,
                        privateLabelPrice: p.privateLabelPrice,
                        expiryDurationMonths: p.expiryDurationMonths,
                        barcode: p.barcode || ''
                      });
                      setIsEditMode(true);
                      setIsModalOpen(true);
                    }}
                    className="text-xs text-emerald-600 font-bold hover:underline"
                  >
                    Edit Details
                  </button>
                </div>
              </div>
              <div className="space-y-2 text-sm text-gray-600 mb-6">
                <div className="flex justify-between"><span>Retail Price:</span> <span className="font-bold text-gray-900">₹{p.retailPrice}</span></div>
                <div className="flex justify-between"><span>Wholesale:</span> <span className="font-bold text-gray-900">₹{p.wholesalePrice}</span></div>
                <div className="flex justify-between"><span>GST:</span> <span className="font-bold text-gray-900">{p.gstPercentage}%</span></div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => { setSelectedProduct(p); setIsBatchModalOpen(true); }}
                  className="flex-1 flex items-center justify-center gap-2 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium text-sm"
                >
                  <Plus size={14} /> Add Stock
                </button>
                <button 
                  onClick={() => { setSelectedProduct(p); setIsBomModalOpen(true); }}
                  className="flex-1 flex items-center justify-center gap-2 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
                >
                  <Settings size={14} /> BOM
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Batch Modal */}
      {isBatchModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <h2 className="text-xl font-bold mb-6">Add Stock for {selectedProduct?.name}</h2>
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
                  <label className="block text-sm font-medium mb-1">Cost Price</label>
                  <input 
                    type="number" 
                    required 
                    className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 outline-none" 
                    value={newBatch.productionCost}
                    onChange={e => setNewBatch({...newBatch, productionCost: Number(e.target.value)})} 
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
                <button type="submit" className="flex-1 bg-emerald-600 text-white py-2 rounded-lg font-bold shadow-lg shadow-emerald-100">Add Stock</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-auto shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">{isEditMode ? 'Edit Product' : 'Add New Product'}</h2>
              {!isEditMode && (
                <button 
                  type="button" 
                  onClick={() => setNewProduct({
                    name: 'abc', hsnCode: 'fhj', gstPercentage: 5, retailPrice: 25, wholesalePrice: 3, privateLabelPrice: 4, expiryDurationMonths: 6, barcode: ''
                  })}
                  className="text-xs text-emerald-600 font-bold hover:underline"
                >
                  Quick Fill Sample
                </button>
              )}
            </div>
            <form onSubmit={handleAddProduct} className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">Product Name</label>
                <input 
                  required 
                  className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 outline-none" 
                  value={newProduct.name}
                  onChange={e => setNewProduct({...newProduct, name: e.target.value})} 
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">HSN Code</label>
                <input 
                  required 
                  className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 outline-none" 
                  value={newProduct.hsnCode}
                  onChange={e => setNewProduct({...newProduct, hsnCode: e.target.value})} 
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">GST %</label>
                <input 
                  type="number" 
                  required 
                  className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 outline-none" 
                  value={newProduct.gstPercentage}
                  onChange={e => setNewProduct({...newProduct, gstPercentage: Number(e.target.value)})} 
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Retail Price</label>
                <input 
                  type="number" 
                  required 
                  className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 outline-none" 
                  value={newProduct.retailPrice}
                  onChange={e => setNewProduct({...newProduct, retailPrice: Number(e.target.value)})} 
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Wholesale Price</label>
                <input 
                  type="number" 
                  required 
                  className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 outline-none" 
                  value={newProduct.wholesalePrice}
                  onChange={e => setNewProduct({...newProduct, wholesalePrice: Number(e.target.value)})} 
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Private Label Price</label>
                <input 
                  type="number" 
                  required 
                  className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 outline-none" 
                  value={newProduct.privateLabelPrice}
                  onChange={e => setNewProduct({...newProduct, privateLabelPrice: Number(e.target.value)})} 
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Expiry (Months)</label>
                <input 
                  type="number" 
                  required 
                  className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 outline-none" 
                  value={newProduct.expiryDurationMonths}
                  onChange={e => setNewProduct({...newProduct, expiryDurationMonths: Number(e.target.value)})} 
                />
              </div>
              <div className="col-span-2 flex gap-4 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 border py-2 rounded-lg font-medium">Cancel</button>
                {isEditMode && (
                  <button 
                    type="button" 
                    onClick={async () => {
                      if (window.confirm('Are you sure you want to delete this product?')) {
                        try {
                          await api.delete(`/finished-products/${selectedProduct._id}`);
                          setIsModalOpen(false);
                          setIsEditMode(false);
                          fetchData();
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
                  {isEditMode ? 'Update' : 'Save Product'}
                </button>
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
      {/* Debug Info (Always visible for now to help troubleshoot) */}
      <div className="mt-8 p-4 bg-gray-50 rounded-xl border border-gray-200 text-[10px] font-mono text-gray-400">
        <p className="font-bold text-gray-500 mb-1">System Debug Info:</p>
        <p>Products Count: {products.length}</p>
        <p>Loading State: {loading ? 'True' : 'False'}</p>
        <p>Last Fetch: {new Date().toLocaleTimeString()}</p>
        {products.length === 0 && <p className="text-rose-400">Warning: No products returned from API.</p>}
      </div>
    </div>
  );
};

export default FinishedProducts;
