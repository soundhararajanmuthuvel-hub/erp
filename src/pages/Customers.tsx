import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Plus, User, Phone, MapPin, CreditCard, Search } from 'lucide-react';

const Customers = () => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    gstNumber: '',
    creditLimit: 50000
  });

  const fetchCustomers = async () => {
    try {
      const res = await api.get('/customers');
      setCustomers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Error fetching customers:', err);
      setCustomers([]);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/customers', newCustomer);
      setIsModalOpen(false);
      fetchCustomers();
      setNewCustomer({
        name: '',
        phone: '',
        email: '',
        address: '',
        gstNumber: '',
        creditLimit: 50000
      });
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to add customer');
    }
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customer Management</h1>
          <p className="text-gray-500">Manage your retail and wholesale clients</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-emerald-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-emerald-700 shadow-lg shadow-emerald-100 transition-all"
        >
          <Plus size={20} /> Add Customer
        </button>
      </div>

      <div className="flex gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Search by name or phone..." 
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCustomers.map((c) => (
          <div key={c._id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                <User size={24} />
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-gray-400 uppercase">Outstanding</p>
                <p className={`text-lg font-bold ${c.outstandingBalance > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                  ₹{(c.outstandingBalance || 0).toLocaleString()}
                </p>
              </div>
            </div>
            
            <h3 className="text-lg font-bold text-gray-900 mb-1">{c.name}</h3>
            
            <div className="space-y-2 mt-4">
              <div className="flex items-center gap-2 text-gray-600 text-sm">
                <Phone size={14} />
                <span>{c.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 text-sm">
                <MapPin size={14} />
                <span className="truncate">{c.address}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 text-sm">
                <CreditCard size={14} />
                <span>Limit: ₹{(c.creditLimit || 0).toLocaleString()}</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t flex gap-2">
              <button className="flex-1 text-sm font-bold text-emerald-600 hover:bg-emerald-50 py-2 rounded-lg transition-colors">
                View Ledger
              </button>
              <button className="flex-1 text-sm font-bold text-blue-600 hover:bg-blue-50 py-2 rounded-lg transition-colors">
                Edit
              </button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <h2 className="text-xl font-bold mb-6">Add New Customer</h2>
            <form onSubmit={handleCreateCustomer} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Full Name</label>
                <input 
                  required 
                  className="w-full border rounded-lg p-2" 
                  value={newCustomer.name}
                  onChange={e => setNewCustomer({...newCustomer, name: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Phone</label>
                  <input 
                    required 
                    className="w-full border rounded-lg p-2" 
                    value={newCustomer.phone}
                    onChange={e => setNewCustomer({...newCustomer, phone: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">GST Number</label>
                  <input 
                    className="w-full border rounded-lg p-2" 
                    value={newCustomer.gstNumber}
                    onChange={e => setNewCustomer({...newCustomer, gstNumber: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input 
                  type="email"
                  className="w-full border rounded-lg p-2" 
                  value={newCustomer.email}
                  onChange={e => setNewCustomer({...newCustomer, email: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Address</label>
                <textarea 
                  className="w-full border rounded-lg p-2" 
                  rows={2}
                  value={newCustomer.address}
                  onChange={e => setNewCustomer({...newCustomer, address: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Credit Limit (₹)</label>
                <input 
                  type="number"
                  className="w-full border rounded-lg p-2" 
                  value={newCustomer.creditLimit}
                  onChange={e => setNewCustomer({...newCustomer, creditLimit: Number(e.target.value)})}
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 border py-2 rounded-lg">Cancel</button>
                <button type="submit" className="flex-1 bg-emerald-600 text-white py-2 rounded-lg font-bold">Save Customer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;
