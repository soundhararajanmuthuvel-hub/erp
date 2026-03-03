import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Building2, Upload, Save, Globe, Mail, Phone, MapPin, Hash } from 'lucide-react';

interface CompanyDetails {
  _id?: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  gstin: string;
  pan: string;
  logo: string;
}

const Settings = () => {
  const [company, setCompany] = useState<CompanyDetails>({
    name: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    gstin: '',
    pan: '',
    logo: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchCompany();
  }, []);

  const fetchCompany = async () => {
    try {
      const response = await axios.get('/api/company');
      setCompany(response.data);
    } catch (error) {
      console.error('Error fetching company details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCompany(prev => ({ ...prev, [name]: value }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCompany(prev => ({ ...prev, logo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      await axios.put('/api/company', company);
      setMessage({ type: 'success', text: 'Company details updated successfully!' });
      // Refresh sidebar/header if needed (could use a context)
      window.dispatchEvent(new CustomEvent('company-updated'));
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to update company details' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Building2 className="text-emerald-600" />
          Company Settings
        </h1>
      </div>

      {message.text && (
        <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Logo Section */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold mb-4">Company Logo</h2>
            <div className="flex flex-col items-center gap-4">
              <div className="w-48 h-48 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden relative group">
                {company.logo ? (
                  <img src={company.logo} alt="Company Logo" className="w-full h-full object-contain" />
                ) : (
                  <Building2 size={48} className="text-gray-300" />
                )}
                <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <Upload className="text-white" />
                  <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                </label>
              </div>
              <p className="text-xs text-gray-500 text-center">
                Recommended: Square image, PNG or JPG. Max 2MB.
              </p>
            </div>
          </div>
        </div>

        {/* Details Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold mb-6">General Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-2.5 text-gray-400" size={18} />
                  <input
                    type="text"
                    name="name"
                    value={company.name}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                    required
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-2.5 text-gray-400" size={18} />
                  <textarea
                    name="address"
                    value={company.address}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 text-gray-400" size={18} />
                  <input
                    type="text"
                    name="phone"
                    value={company.phone}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 text-gray-400" size={18} />
                  <input
                    type="email"
                    name="email"
                    value={company.email}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-2.5 text-gray-400" size={18} />
                  <input
                    type="text"
                    name="website"
                    value={company.website}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">GSTIN</label>
                <div className="relative">
                  <Hash className="absolute left-3 top-2.5 text-gray-400" size={18} />
                  <input
                    type="text"
                    name="gstin"
                    value={company.gstin}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">PAN Number</label>
                <div className="relative">
                  <Hash className="absolute left-3 top-2.5 text-gray-400" size={18} />
                  <input
                    type="text"
                    name="pan"
                    value={company.pan}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
              >
                <Save size={18} />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Settings;
