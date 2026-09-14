import React, { useState, useEffect } from 'react';
import { 
  Tag, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Check, 
  X, 
  Copy, 
  Globe, 
  Eye, 
  EyeOff, 
  Sparkles, 
  Percent, 
  DollarSign, 
  AlertCircle 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE_URL } from '../../config/api';

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modals & Toast
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [deletingCoupon, setDeletingCoupon] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  const [copiedCode, setCopiedCode] = useState(null);

  const initialForm = {
    code: '',
    description: '',
    discountType: 'percentage', // 'percentage' or 'fixed'
    discountValue: '',
    minOrderValue: 0,
    displayOnSite: true,
    isActive: true
  };

  const [formData, setFormData] = useState(initialForm);

  const fetchCoupons = () => {
    setLoading(true);
    fetch(`${API_BASE_URL}/api/coupons`)
      .then(res => res.json())
      .then(data => {
        setCoupons(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching coupons:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    showToast(`Copied code "${code}" to clipboard!`);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Toggle displayOnSite directly from table
  const handleToggleDisplay = async (coupon) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/coupons/${coupon.id}/display`, {
        method: 'PATCH'
      });
      if (res.ok) {
        const updated = await res.json();
        setCoupons(prev => prev.map(c => c.id === coupon.id ? updated : c));
        localStorage.setItem('chasma_coupons_updated', Date.now().toString());
        window.dispatchEvent(new Event('chasma_coupon_toggle'));
        showToast(
          updated.displayOnSite 
            ? `Coupon "${updated.code}" is now broadcasted on the website banner!` 
            : `Coupon "${updated.code}" hidden from website banner.`
        );
      }
    } catch (err) {
      console.error("Error toggling display:", err);
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      description: coupon.description,
      discountType: coupon.discountType || 'percentage',
      discountValue: coupon.discountValue,
      minOrderValue: coupon.minOrderValue || 0,
      displayOnSite: Boolean(coupon.displayOnSite),
      isActive: Boolean(coupon.isActive)
    });
    setIsModalOpen(true);
  };

  // Create / Update Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.code || !formData.discountValue) {
      alert('Please fill in coupon code and discount value.');
      return;
    }

    const payload = {
      code: formData.code.trim().toUpperCase(),
      description: formData.description || `${formData.discountValue}${formData.discountType === 'percentage' ? '%' : '$'} Off Eyewear`,
      discountType: formData.discountType,
      discountValue: Number(formData.discountValue),
      minOrderValue: Number(formData.minOrderValue) || 0,
      displayOnSite: formData.displayOnSite,
      isActive: formData.isActive
    };

    try {
      const url = editingCoupon 
        ? `${API_BASE_URL}/api/coupons/${editingCoupon.id}`
        : `${API_BASE_URL}/api/coupons`;
      
      const method = editingCoupon ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('Failed to save coupon');

      const saved = await res.json();

      if (editingCoupon) {
        setCoupons(prev => prev.map(c => c.id === saved.id ? saved : c));
        showToast(`Updated coupon "${saved.code}"!`);
      } else {
        setCoupons(prev => [saved, ...prev]);
        showToast(`Created new coupon "${saved.code}"!`);
      }

      localStorage.setItem('chasma_coupons_updated', Date.now().toString());
      window.dispatchEvent(new Event('chasma_coupon_toggle'));

      setIsModalOpen(false);
      setEditingCoupon(null);
      setFormData(initialForm);
    } catch (err) {
      console.error("Error saving coupon:", err);
      alert('Failed to save coupon.');
    }
  };

  // Delete
  const handleDelete = async () => {
    if (!deletingCoupon) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/coupons/${deletingCoupon.id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setCoupons(prev => prev.filter(c => c.id !== deletingCoupon.id));
        localStorage.setItem('chasma_coupons_updated', Date.now().toString());
        window.dispatchEvent(new Event('chasma_coupon_toggle'));
        showToast(`Deleted coupon "${deletingCoupon.code}".`);
        setDeletingCoupon(null);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to delete coupon.');
    }
  };

  const filteredCoupons = coupons.filter(c => 
    !searchTerm.trim() || 
    c.code.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
    c.description.toLowerCase().includes(searchTerm.toLowerCase().trim())
  );

  const displayedCount = coupons.filter(c => c.displayOnSite && c.isActive).length;

  return (
    <div className="space-y-6">
      
      {/* Toast Alert */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-8 z-50 px-5 py-3 bg-black text-white text-xs font-semibold rounded-2xl shadow-xl flex items-center gap-2 border border-neutral-700"
          >
            <Check size={16} className="text-emerald-400" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200/70 shadow-sm">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">
            Total Coupons
          </span>
          <span className="text-2xl font-bold text-gray-900">{coupons.length}</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200/70 shadow-sm">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">
            Active Promo Codes
          </span>
          <span className="text-2xl font-bold text-emerald-600">
            {coupons.filter(c => c.isActive).length}
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200/70 shadow-sm border-l-4 border-l-amber-500">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">
            Broadcasted on Website
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-black">{displayedCount}</span>
            <span className="text-xs text-amber-600 font-medium">Visible to Shoppers</span>
          </div>
        </div>
      </div>

      {/* Action Control Bar */}
      <div className="bg-white p-5 rounded-3xl border border-gray-200/70 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        
        {/* Search */}
        <div className="relative max-w-sm w-full">
          <Search size={16} className="absolute left-3.5 top-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search coupons by code or offer title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-gray-200 outline-none focus:border-black font-medium"
          />
        </div>

        {/* Create Coupon Trigger */}
        <button
          onClick={() => {
            setEditingCoupon(null);
            setFormData(initialForm);
            setIsModalOpen(true);
          }}
          className="px-5 py-2.5 bg-black text-white text-xs font-semibold uppercase tracking-wider rounded-xl hover:bg-neutral-800 transition-all flex items-center justify-center gap-2 shadow-sm"
        >
          <Plus size={15} />
          <span>New Coupon Code</span>
        </button>

      </div>

      {/* Coupons Table */}
      <div className="bg-white rounded-3xl border border-gray-200/70 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50 text-gray-400 uppercase tracking-wider font-semibold">
                <th className="py-3.5 px-4">Coupon Code</th>
                <th className="py-3.5 px-4">Discount Value</th>
                <th className="py-3.5 px-4">Min Order</th>
                <th className="py-3.5 px-4">Show on User Website?</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-gray-400">
                    Loading promotional coupon engine...
                  </td>
                </tr>
              ) : filteredCoupons.length > 0 ? (
                filteredCoupons.map((coupon) => (
                  <tr key={coupon.id} className="hover:bg-gray-50/50 transition-colors">
                    
                    {/* Code with Copy */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-black bg-gray-100 px-2.5 py-1 rounded-lg border border-gray-200 tracking-wider">
                          {coupon.code}
                        </span>
                        <button
                          onClick={() => handleCopy(coupon.code)}
                          className="p-1.5 text-gray-400 hover:text-black rounded-lg hover:bg-gray-100"
                          title="Copy Code"
                        >
                          {copiedCode === coupon.code ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                        </button>
                      </div>
                      <span className="text-[11px] text-gray-500 block mt-1 line-clamp-1">{coupon.description}</span>
                    </td>

                    {/* Discount Value */}
                    <td className="py-3.5 px-4 font-bold text-black text-sm">
                      {coupon.discountType === 'percentage' 
                        ? `${coupon.discountValue}% OFF` 
                        : `₹${Number(coupon.discountValue).toLocaleString('en-IN')} OFF`}
                    </td>

                    {/* Min Order */}
                    <td className="py-3.5 px-4 text-gray-600 font-medium">
                      {coupon.minOrderValue > 0 ? `₹${Number(coupon.minOrderValue).toLocaleString('en-IN')}` : 'No Minimum'}
                    </td>

                    {/* Display on User Website Switch */}
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleToggleDisplay(coupon)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold transition-all ${
                          coupon.displayOnSite
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : 'bg-gray-100 text-gray-500 border border-gray-200 hover:text-black'
                        }`}
                        title="Click to toggle whether shoppers see this code on the website banner"
                      >
                        <Globe size={13} className={coupon.displayOnSite ? 'text-amber-600' : 'text-gray-400'} />
                        <span>{coupon.displayOnSite ? 'Displayed on Site' : 'Hidden from Site'}</span>
                      </button>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        coupon.isActive 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {coupon.isActive ? 'Active' : 'Disabled'}
                      </span>
                    </td>

                    {/* Action Buttons */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(coupon)}
                          className="p-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-black hover:text-white transition-all"
                          title="Edit Coupon"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={() => setDeletingCoupon(coupon)}
                          className="p-2 rounded-xl border border-gray-200 text-gray-400 hover:text-rose-600 hover:border-rose-300 transition-all"
                          title="Delete Coupon"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-gray-400">
                    No promotional coupons found. Click &ldquo;New Coupon Code&rdquo; to create one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT COUPON MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg bg-white rounded-3xl p-6 md:p-8 shadow-2xl border border-gray-200 text-xs"
            >
              <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
                <div>
                  <h3 className="font-serif text-xl font-bold text-gray-900">
                    {editingCoupon ? `Edit Coupon: ${editingCoupon.code}` : 'Create New Promotional Coupon'}
                  </h3>
                  <p className="text-xs text-gray-400">
                    Define discount terms and choose whether to broadcast it to shoppers.
                  </p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-black"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                
                {/* Coupon Code */}
                <div>
                  <label className="block font-bold text-gray-700 uppercase tracking-wider mb-2">
                    Coupon Code (Uppercase) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. FESTIVE20, B1G1, VIP30"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-black outline-none font-mono font-bold text-sm tracking-wider uppercase"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block font-bold text-gray-700 uppercase tracking-wider mb-2">
                    Promotion Headline / Description
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 20% Off on All Titanium &amp; Acetate Frames"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-black outline-none font-medium text-xs"
                  />
                </div>

                {/* Discount Type & Value */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-gray-700 uppercase tracking-wider mb-2">
                      Discount Type
                    </label>
                    <select
                      value={formData.discountType}
                      onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-black outline-none font-medium bg-white"
                    >
                      <option value="percentage">Percentage (%) Off</option>
                      <option value="fixed">Flat Rupee (₹) Off</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 uppercase tracking-wider mb-2">
                      Discount Value *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      placeholder={formData.discountType === 'percentage' ? "e.g. 15" : "e.g. 500"}
                      value={formData.discountValue}
                      onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-black outline-none font-bold text-sm"
                    />
                  </div>
                </div>

                {/* Minimum Order Value */}
                <div>
                  <label className="block font-bold text-gray-700 uppercase tracking-wider mb-2">
                    Minimum Order Subtotal (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0 for no minimum"
                    value={formData.minOrderValue}
                    onChange={(e) => setFormData({ ...formData, minOrderValue: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-black outline-none font-medium"
                  />
                  <span className="text-[10px] text-gray-400 mt-1 block">
                    Coupon only applies if customer cart equals or exceeds this amount.
                  </span>
                </div>

                {/* PROMINENT ASK: DISPLAY IN USER WEBSITE? */}
                <div className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                  formData.displayOnSite 
                    ? 'border-amber-400 bg-amber-50/70' 
                    : 'border-gray-200 bg-gray-50'
                }`}>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.displayOnSite}
                      onChange={(e) => setFormData({ ...formData, displayOnSite: e.target.checked })}
                      className="w-5 h-5 accent-amber-500 rounded mt-0.5"
                    />
                    <div className="space-y-1">
                      <span className="font-bold text-black text-xs block">
                        Display this coupon on the customer website?
                      </span>
                      <p className="text-[11px] text-gray-600 leading-relaxed">
                        When enabled, this coupon code and offer will be broadcasted live in the <strong>Top Announcement Banner</strong> and the <strong>Checkout Available Offers Drawer</strong> so shoppers can see and apply it with 1 click.
                      </p>
                    </div>
                  </label>
                </div>

                {/* Active Status */}
                <label className="flex items-center gap-2 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 accent-black rounded"
                  />
                  <span className="font-semibold text-gray-700">Coupon is active and ready to use</span>
                </label>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-5 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2.5 border border-gray-200 rounded-xl font-semibold text-gray-600 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-black text-white font-semibold uppercase tracking-wider rounded-xl hover:bg-neutral-800"
                  >
                    {editingCoupon ? 'Save Changes' : 'Create Coupon'}
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DELETE CONFIRMATION */}
      <AnimatePresence>
        {deletingCoupon && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-gray-200 text-center text-xs"
            >
              <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <AlertCircle size={24} />
              </div>
              <h3 className="font-serif text-lg font-bold text-gray-900 mb-1">Delete Coupon?</h3>
              <p className="text-gray-500 mb-5">
                Are you sure you want to delete coupon <strong>{deletingCoupon.code}</strong>?
              </p>
              <div className="flex gap-2 justify-center">
                <button
                  onClick={() => setDeletingCoupon(null)}
                  className="px-4 py-2 border border-gray-200 rounded-xl font-semibold text-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-rose-600 text-white font-semibold uppercase tracking-wider rounded-xl"
                >
                  Confirm Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
