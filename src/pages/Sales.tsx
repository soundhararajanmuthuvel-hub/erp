import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Plus, ShoppingCart, UserPlus, Printer, Share2 } from 'lucide-react';

const Sales = () => {
  const [sales, setSales] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newSale, setNewSale] = useState({
    customerId: '',
    saleType: 'Retail',
    items: [{ productId: '', batchNumber: '', quantity: 1, pricePerUnit: 0 }],
    paymentMode: 'Cash',
    amountPaid: 0
  });

  const fetchData = async () => {
    const [prodRes, saleRes, custRes] = await Promise.all([
      api.get('/finished-products'),
      api.get('/sales'),
      api.get('/customers')
    ]);
    setProducts(prodRes.data);
    setSales(saleRes.data);
    setCustomers(custRes.data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateSale = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/sales', newSale);
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Sale failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Sales & Billing</h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-emerald-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-emerald-700"
        >
          <Plus size={20} /> New Invoice
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-bottom border-gray-100">
            <tr>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">Invoice #</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">Customer</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">Total</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">Status</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sales.map((s) => (
              <tr key={s._id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-medium text-gray-900">{s.invoiceNumber}</td>
                <td className="px-6 py-4 text-gray-600">{s.customer?.name}</td>
                <td className="px-6 py-4 font-bold text-gray-900">₹{s.grandTotal.toLocaleString()}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                    s.paymentStatus === 'Paid' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                  }`}>
                    {s.paymentStatus}
                  </span>
                </td>
                <td className="px-6 py-4 flex gap-3">
                  <button className="text-gray-400 hover:text-gray-600"><Printer size={18} /></button>
                  <button className="text-gray-400 hover:text-gray-600"><Share2 size={18} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* New Sale Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-auto">
            <h2 className="text-xl font-bold mb-6">Create New Invoice</h2>
            <form onSubmit={handleCreateSale} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Customer</label>
                  <select required className="w-full border rounded-lg p-2" onChange={e => setNewSale({...newSale, customerId: e.target.value})}>
                    <option value="">Select Customer</option>
                    {customers.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Sale Type</label>
                  <select className="w-full border rounded-lg p-2" onChange={e => setNewSale({...newSale, saleType: e.target.value})}>
                    <option value="Retail">Retail</option>
                    <option value="Wholesale">Wholesale</option>
                    <option value="Private Label">Private Label</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-bold text-gray-700">Items</h3>
                {newSale.items.map((item, idx) => (
                  <div key={idx} className="grid grid-cols-4 gap-4 items-end">
                    <div className="col-span-1">
                      <select 
                        className="w-full border rounded-lg p-2"
                        onChange={e => {
                          const items = [...newSale.items];
                          items[idx].productId = e.target.value;
                          setNewSale({...newSale, items});
                        }}
                      >
                        <option value="">Product</option>
                        {products.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <input placeholder="Batch" className="w-full border rounded-lg p-2" onChange={e => {
                        const items = [...newSale.items];
                        items[idx].batchNumber = e.target.value;
                        setNewSale({...newSale, items});
                      }} />
                    </div>
                    <div>
                      <input type="number" placeholder="Qty" className="w-full border rounded-lg p-2" onChange={e => {
                        const items = [...newSale.items];
                        items[idx].quantity = Number(e.target.value);
                        setNewSale({...newSale, items});
                      }} />
                    </div>
                    <div>
                      <input type="number" placeholder="Price" className="w-full border rounded-lg p-2" onChange={e => {
                        const items = [...newSale.items];
                        items[idx].pricePerUnit = Number(e.target.value);
                        setNewSale({...newSale, items});
                      }} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <label className="block text-sm font-medium mb-1">Payment Mode</label>
                  <select className="w-full border rounded-lg p-2" onChange={e => setNewSale({...newSale, paymentMode: e.target.value})}>
                    <option value="Cash">Cash</option>
                    <option value="Bank">Bank</option>
                    <option value="Credit">Credit</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Amount Paid</label>
                  <input type="number" className="w-full border rounded-lg p-2" onChange={e => setNewSale({...newSale, amountPaid: Number(e.target.value)})} />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 border py-2 rounded-lg">Cancel</button>
                <button type="submit" className="flex-1 bg-emerald-600 text-white py-2 rounded-lg">Generate Invoice</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sales;
