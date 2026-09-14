import React, { useState, useEffect } from 'react';
import { Plus, FolderTree, Check, X, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE_URL } from '../../config/api';

const DEFAULT_PRODUCT_IMG = "https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=600&auto=format&fit=crop";

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCat, setNewCat] = useState({ name: '', description: '', image: '' });
  const [toastMessage, setToastMessage] = useState('');

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      fetch(`${API_BASE_URL}/api/categories`).then(r => r.json()),
      fetch(`${API_BASE_URL}/api/products`).then(r => r.json())
    ])
      .then(([cats, prods]) => {
        setCategories(cats);
        setProducts(prods);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching categories:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCat.name.trim()) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCat)
      });

      if (!res.ok) throw new Error('Failed to create category');

      const created = await res.json();
      setCategories(prev => [...prev, created]);
      setIsModalOpen(false);
      setNewCat({ name: '', description: '', image: '' });
      showToast(`Category "${created.name}" created!`);
    } catch (err) {
      console.error(err);
      alert('Error creating category.');
    }
  };

  const getProductCount = (categoryName, categoryId) => {
    const nameMatch = (categoryName || '').toLowerCase().replace(/[-_ ]/g, '');
    const idMatch = (categoryId || '').toLowerCase().replace(/[-_ ]/g, '');
    return products.filter(p => {
      const pCat = (p.category || '').toLowerCase().replace(/[-_ ]/g, '');
      const pCatId = (p.categoryId || '').toLowerCase().replace(/[-_ ]/g, '');
      return pCat === nameMatch || pCatId === idMatch;
    }).length;
  };

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

      {/* Control Header */}
      <div className="bg-white p-5 rounded-3xl border border-gray-200/70 shadow-sm flex items-center justify-between">
        <div>
          <h3 className="font-bold text-base text-gray-900">Eyewear Categories</h3>
          <p className="text-xs text-gray-400">Organize and group eyewear frames across the storefront</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-2.5 bg-black text-white text-xs font-semibold uppercase tracking-wider rounded-xl hover:bg-neutral-800 transition-all flex items-center gap-2"
        >
          <Plus size={15} /> Add Category
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {categories.map((cat) => {
          const count = getProductCount(cat.name, cat.id);
          return (
            <div
              key={cat.id}
              className="bg-white rounded-3xl p-6 border border-gray-200/70 shadow-sm flex flex-col justify-between group hover:shadow-md transition-shadow"
            >
              <div className="aspect-[4/3] bg-gray-50 rounded-2xl mb-4 p-4 flex items-center justify-center overflow-hidden border border-gray-100">
                <img
                  src={cat.image || DEFAULT_PRODUCT_IMG}
                  alt={cat.name}
                  onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = DEFAULT_PRODUCT_IMG; }}
                  className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-bold text-base text-gray-900">{cat.name}</h4>
                  <span className="px-2.5 py-0.5 rounded-full bg-neutral-100 text-neutral-800 text-[11px] font-bold">
                    {count} frame(s)
                  </span>
                </div>
                <p className="text-xs text-gray-500 line-clamp-2 mb-4 leading-relaxed">
                  {cat.description || "Curated eyewear collection for distinctive aesthetics."}
                </p>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
                <span className="font-mono text-[10px]">Slug: {cat.id}</span>
                <span className="text-black font-semibold group-hover:translate-x-1 transition-transform">
                  Active &rarr;
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ADD CATEGORY MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl border border-gray-200"
            >
              <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
                <h3 className="font-serif text-xl font-bold text-gray-900">New Eyewear Category</h3>
                <button onClick={() => setIsModalOpen(false)} className="p-1 text-gray-400 hover:text-black">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleCreateCategory} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-gray-700 uppercase tracking-wider mb-2">Category Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sports &amp; Cycling"
                    value={newCat.name}
                    onChange={(e) => setNewCat({ ...newCat, name: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-black outline-none font-medium"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 uppercase tracking-wider mb-2">Description</label>
                  <textarea
                    rows="3"
                    placeholder="Brief overview of this category..."
                    value={newCat.description}
                    onChange={(e) => setNewCat({ ...newCat, description: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-black outline-none font-medium"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 uppercase tracking-wider mb-2">Banner / Feature Image URL</label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={newCat.image}
                    onChange={(e) => setNewCat({ ...newCat, image: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-black outline-none font-mono"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl font-semibold hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-black text-white font-semibold uppercase tracking-wider rounded-xl hover:bg-neutral-800"
                  >
                    Create Category
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
