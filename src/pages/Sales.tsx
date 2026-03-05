import React, { useEffect, useState, useRef } from 'react';
import api from '../services/api';
import { Plus, ShoppingCart, UserPlus, Printer, Share2, X, Download, Eye } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const InvoiceModal = ({ sale, onClose }: { sale: any, onClose: () => void }) => {
  const invoiceRef = useRef<HTMLDivElement>(null);
  const [company, setCompany] = useState<any>(null);

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const response = await api.get('/company');
        setCompany(response.data);
      } catch (error) {
        console.error('Error fetching company:', error);
      }
    };
    fetchCompany();
  }, []);

  const handleDownloadPDF = async () => {
    if (!invoiceRef.current) return;
    const canvas = await html2canvas(invoiceRef.current);
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`Invoice-${sale.invoiceNumber}.pdf`);
  };

  const handleWhatsAppShare = () => {
    const text = `Hello ${sale.customer?.name}, here is your invoice ${sale.invoiceNumber} for ₹${sale.grandTotal}. View details: ${window.location.origin}/invoice/${sale._id}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[60]">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[95vh] flex flex-col">
        <div className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-2xl">
          <h2 className="font-bold text-gray-900">Invoice Preview</h2>
          <div className="flex gap-2">
            <button onClick={handleDownloadPDF} className="p-2 hover:bg-white rounded-lg text-emerald-600" title="Download PDF"><Download size={20} /></button>
            <button onClick={handleWhatsAppShare} className="p-2 hover:bg-white rounded-lg text-blue-600" title="Share on WhatsApp"><Share2 size={20} /></button>
            <button onClick={() => window.print()} className="p-2 hover:bg-white rounded-lg text-gray-600" title="Print"><Printer size={20} /></button>
            <button onClick={onClose} className="p-2 hover:bg-white rounded-lg text-rose-600"><X size={20} /></button>
          </div>
        </div>
        
        <div className="flex-1 overflow-auto p-8" ref={invoiceRef}>
          <div className="border p-8 rounded-lg bg-white shadow-sm">
            <div className="flex justify-between mb-8">
              <div className="flex gap-4 items-start">
                {company?.logo && (
                  <img src={company.logo} alt="Company Logo" className="w-16 h-16 object-contain" />
                )}
                <div>
                  <h1 className="text-3xl font-bold text-emerald-600">{company?.name || 'Amudhasurabiy Organics'}</h1>
                  <p className="text-gray-500 text-sm max-w-xs">{company?.address}</p>
                  <div className="text-xs text-gray-400 mt-1">
                    {company?.phone && <span>Ph: {company.phone} </span>}
                    {company?.email && <span>| Email: {company.email}</span>}
                  </div>
                  {company?.gstin && <p className="text-xs font-bold text-gray-500 mt-1">GSTIN: {company.gstin}</p>}
                </div>
              </div>
              <div className="text-right">
                <h2 className="text-xl font-bold">INVOICE</h2>
                <p className="text-gray-600">#{sale.invoiceNumber}</p>
                <p className="text-gray-600">{sale.saleDate ? new Date(sale.saleDate).toLocaleDateString() : 'N/A'}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="font-bold text-gray-400 uppercase text-xs mb-2">Bill To:</h3>
                <p className="font-bold text-gray-900">{sale.customer?.name}</p>
                <p className="text-gray-600">{sale.customer?.phone}</p>
                <p className="text-gray-600">{sale.customer?.address}</p>
                {sale.customer?.gstNumber && <p className="text-gray-600">GST: {sale.customer.gstNumber}</p>}
              </div>
              <div className="text-right">
                <h3 className="font-bold text-gray-400 uppercase text-xs mb-2">Payment Info:</h3>
                <p className="text-gray-600">Mode: {sale.paymentMode}</p>
                <p className={`font-bold ${sale.paymentStatus === 'Paid' ? 'text-emerald-600' : 'text-rose-600'}`}>
                  Status: {sale.paymentStatus}
                </p>
              </div>
            </div>

            <table className="w-full mb-8">
              <thead>
                <tr className="border-b-2 border-gray-100 text-left">
                  <th className="py-2 text-gray-600">Item</th>
                  <th className="py-2 text-gray-600">Batch</th>
                  <th className="py-2 text-gray-600 text-right">Qty</th>
                  <th className="py-2 text-gray-600 text-right">Price</th>
                  <th className="py-2 text-gray-600 text-right">GST</th>
                  <th className="py-2 text-gray-600 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sale.items?.map((item: any, i: number) => (
                  <tr key={i}>
                    <td className="py-3 font-medium">{item.product?.name}</td>
                    <td className="py-3 text-gray-600">{item.batchNumber}</td>
                    <td className="py-3 text-right">{item.quantity}</td>
                    <td className="py-3 text-right">₹{(item.pricePerUnit || 0).toLocaleString()}</td>
                    <td className="py-3 text-right">₹{(item.gstAmount || 0).toLocaleString()}</td>
                    <td className="py-3 text-right font-bold">₹{(item.totalAmount || 0).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-end">
              <div className="w-64 space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal:</span>
                  <span>₹{(sale.subTotal || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Total GST:</span>
                  <span>₹{(sale.totalGst || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xl font-bold border-t pt-2 text-emerald-600">
                  <span>Grand Total:</span>
                  <span>₹{(sale.grandTotal || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600 text-sm">
                  <span>Amount Paid:</span>
                  <span>₹{(sale.amountPaid || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-rose-600 font-bold">
                  <span>Balance Due:</span>
                  <span>₹{(sale.balanceAmount || 0).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Sales = () => {
  const [sales, setSales] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [newSale, setNewSale] = useState({
    customerId: '',
    saleType: 'Retail',
    items: [{ productId: '', batchNumber: '', quantity: 1, pricePerUnit: 0 }],
    paymentMode: 'Cash',
    amountPaid: 0
  });

  const fetchData = async () => {
    try {
      const [prodRes, saleRes, custRes] = await Promise.all([
        api.get('/finished-products'),
        api.get('/sales'),
        api.get('/customers')
      ]);
      setProducts(Array.isArray(prodRes.data) ? prodRes.data : []);
      setSales(Array.isArray(saleRes.data) ? saleRes.data : []);
      setCustomers(Array.isArray(custRes.data) ? custRes.data : []);
    } catch (err) {
      console.error('Error fetching sales data:', err);
      setProducts([]);
      setSales([]);
      setCustomers([]);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleProductChange = (idx: number, productId: string) => {
    const product = products.find(p => p._id === productId);
    const items = [...newSale.items];
    items[idx].productId = productId;
    
    // Auto-fill price based on sale type
    if (product) {
      if (newSale.saleType === 'Retail') items[idx].pricePerUnit = product.retailPrice;
      else if (newSale.saleType === 'Wholesale') items[idx].pricePerUnit = product.wholesalePrice;
      else items[idx].pricePerUnit = product.privateLabelPrice;
    }
    
    setNewSale({ ...newSale, items });
  };

  const handleCreateSale = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/sales', newSale);
      setIsModalOpen(false);
      fetchData();
      setSelectedInvoice(res.data); // Show invoice after creation
      setNewSale({
        customerId: '',
        saleType: 'Retail',
        items: [{ productId: '', batchNumber: '', quantity: 1, pricePerUnit: 0 }],
        paymentMode: 'Cash',
        amountPaid: 0
      });
    } catch (err: any) {
      alert(err.response?.data?.message || 'Sale failed. Check database connection.');
    }
  };

  const addItem = () => {
    setNewSale({
      ...newSale,
      items: [...newSale.items, { productId: '', batchNumber: '', quantity: 1, pricePerUnit: 0 }]
    });
  };

  const removeItem = (idx: number) => {
    const items = newSale.items.filter((_, i) => i !== idx);
    setNewSale({ ...newSale, items });
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
                <td className="px-6 py-4 font-bold text-gray-900">₹{(s.grandTotal || 0).toLocaleString()}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                    s.paymentStatus === 'Paid' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                  }`}>
                    {s.paymentStatus}
                  </span>
                </td>
                <td className="px-6 py-4 flex gap-3">
                  <button 
                    onClick={() => setSelectedInvoice(s)}
                    className="text-emerald-600 hover:text-emerald-700 p-1 hover:bg-emerald-50 rounded"
                    title="View Invoice"
                  >
                    <Eye size={18} />
                  </button>
                  <button className="text-gray-400 hover:text-gray-600"><Printer size={18} /></button>
                  <button className="text-gray-400 hover:text-gray-600"><Share2 size={18} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedInvoice && (
        <InvoiceModal 
          sale={selectedInvoice} 
          onClose={() => setSelectedInvoice(null)} 
        />
      )}

      {/* New Sale Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 max-w-5xl w-full max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Create New Invoice</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X /></button>
            </div>
            <form onSubmit={handleCreateSale} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Customer</label>
                  <select required className="w-full border rounded-lg p-2" onChange={e => setNewSale({...newSale, customerId: e.target.value})}>
                    <option value="">Select Customer</option>
                    {customers.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Sale Type</label>
                  <select className="w-full border rounded-lg p-2" value={newSale.saleType} onChange={e => setNewSale({...newSale, saleType: e.target.value})}>
                    <option value="Retail">Retail</option>
                    <option value="Wholesale">Wholesale</option>
                    <option value="Private Label">Private Label</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Payment Mode</label>
                  <select className="w-full border rounded-lg p-2" onChange={e => setNewSale({...newSale, paymentMode: e.target.value})}>
                    <option value="Cash">Cash</option>
                    <option value="Bank">Bank</option>
                    <option value="Credit">Credit</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-gray-700">Items</h3>
                  <button type="button" onClick={addItem} className="text-emerald-600 flex items-center gap-1 text-sm font-bold">
                    <Plus size={16} /> Add Item
                  </button>
                </div>
                {newSale.items.map((item, idx) => (
                  <div key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end bg-gray-50 p-4 rounded-xl relative">
                    <div className="md:col-span-4">
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Product</label>
                      <select 
                        required
                        className="w-full border rounded-lg p-2 bg-white"
                        value={item.productId}
                        onChange={e => handleProductChange(idx, e.target.value)}
                      >
                        <option value="">Select Product</option>
                        {products.map(p => (
                          <option key={p._id} value={p._id} disabled={p.totalStock <= 0}>
                            {p.name} {p.totalStock <= 0 ? '(OUT OF STOCK)' : `(Stock: ${p.totalStock})`}
                          </option>
                        ))}
                      </select>
                      {item.productId && products.find(p => p._id === item.productId)?.totalStock <= 0 && (
                        <p className="text-[10px] text-rose-600 mt-1 font-bold">
                          ⚠️ No stock available. Add stock in Products page first.
                        </p>
                      )}
                    </div>
                    <div className="md:col-span-3">
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Batch</label>
                      <select 
                        required
                        className="w-full border rounded-lg p-2 bg-white"
                        value={item.batchNumber}
                        onChange={e => {
                          const items = [...newSale.items];
                          items[idx].batchNumber = e.target.value;
                          setNewSale({...newSale, items});
                        }}
                      >
                        <option value="">Select Batch</option>
                        {products.find(p => p._id === item.productId)?.batches.map((b: any) => (
                          <option key={b.batchNumber} value={b.batchNumber}>{b.batchNumber} (Qty: {b.quantity})</option>
                        ))}
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Qty</label>
                      <input 
                        type="number" 
                        required
                        min="1"
                        className="w-full border rounded-lg p-2 bg-white" 
                        value={item.quantity}
                        onChange={e => {
                          const items = [...newSale.items];
                          items[idx].quantity = Number(e.target.value);
                          setNewSale({...newSale, items});
                        }} 
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Price</label>
                      <input 
                        type="number" 
                        required
                        className="w-full border rounded-lg p-2 bg-white" 
                        value={item.pricePerUnit}
                        onChange={e => {
                          const items = [...newSale.items];
                          items[idx].pricePerUnit = Number(e.target.value);
                          setNewSale({...newSale, items});
                        }} 
                      />
                    </div>
                    <div className="md:col-span-1">
                      <button 
                        type="button" 
                        onClick={() => removeItem(idx)}
                        className="text-rose-600 p-2 hover:bg-rose-50 rounded-lg w-full flex justify-center"
                      >
                        <X size={20} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Amount Paid (₹)</label>
                    <input 
                      type="number" 
                      className="w-full border rounded-lg p-3 text-lg font-bold" 
                      value={newSale.amountPaid}
                      onChange={e => setNewSale({...newSale, amountPaid: Number(e.target.value)})} 
                    />
                  </div>
                </div>
                <div className="bg-emerald-50 p-6 rounded-2xl space-y-2">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal:</span>
                    <span className="font-bold">₹{(newSale.items.reduce((acc, item) => acc + (item.quantity * item.pricePerUnit), 0) || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xl font-bold text-emerald-600 border-t pt-2">
                    <span>Grand Total (Est):</span>
                    <span>₹{((newSale.items.reduce((acc, item) => acc + (item.quantity * item.pricePerUnit), 0) * 1.18) || 0).toLocaleString()}</span>
                  </div>
                  <p className="text-[10px] text-emerald-600 text-right">* GST estimated at 18% for preview</p>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 border py-3 rounded-xl font-bold text-gray-600">Cancel</button>
                <button type="submit" className="flex-1 bg-emerald-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all">
                  Generate Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sales;
