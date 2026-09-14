import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Eye, 
  Check, 
  X, 
  AlertCircle, 
  Image as ImageIcon,
  Sparkles,
  SlidersHorizontal,
  Minus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PRESET_IMAGES = [
  { label: 'Gold Aviator', url: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=600&auto=format&fit=crop' },
  { label: 'Retro Square', url: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?q=80&w=600&auto=format&fit=crop' },
  { label: 'Round Tortoise', url: 'https://images.unsplash.com/photo-1577803645773-f96470509666?q=80&w=600&auto=format&fit=crop' },
  { label: 'Minimal Titanium', url: 'https://images.unsplash.com/photo-1591076482161-42ce6da69f67?q=80&w=600&auto=format&fit=crop' },
  { label: 'Cat-Eye Riviera', url: 'https://images.unsplash.com/photo-1509695507497-903c140c43b0?q=80&w=600&auto=format&fit=crop' },
  { label: 'Urban Wayfarer', url: 'https://images.unsplash.com/photo-1582142407894-ec85a1260a46?q=80&w=600&auto=format&fit=crop' },
  { label: 'Blue Light', url: 'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?q=80&w=600&auto=format&fit=crop' }
];

const CATEGORIES = [
  'Sun Glass',
  'Eye Glasses',
  'Women',
  'Men',
];

const DEFAULT_PRODUCT_IMG = "https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=600&auto=format&fit=crop";

export default function AdminProducts() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deletingProduct, setDeletingProduct] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  // Form State
  const initialFormState = {
    name: '',
    category: 'Sun Glass',
    gender: 'Unisex',
    price: '',
    originalPrice: '',
    stock: 20,
    image: PRESET_IMAGES[0].url,
    description: '',
    frameMaterial: 'Handcrafted Acetate',
    lensType: 'Polarized UV400',
    isDealOfDay: false,
    isFeatured: true
  };

  const [formData, setFormData] = useState(initialFormState);

  // Check if opened with ?action=new
  useEffect(() => {
    if (searchParams.get('action') === 'new') {
      setIsAddModalOpen(true);
      searchParams.delete('action');
      setSearchParams(searchParams);
    }
  }, [searchParams]);

  const fetchProducts = () => {
    setLoading(true);
    fetch('http://localhost:5001/api/products')
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching products:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Quick inline stock adjustment
  const handleStockAdjust = async (product, delta) => {
    const newStock = Math.max(0, (product.stock || 0) + delta);
    try {
      const res = await fetch(`http://localhost:5001/api/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock: newStock })
      });
      if (res.ok) {
        setProducts(prev => prev.map(p => p.id === product.id ? { ...p, stock: newStock } : p));
        showToast(`Updated stock for ${product.name} to ${newStock}`);
      }
    } catch (err) {
      console.error("Stock update error:", err);
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || '',
      category: product.category || 'Sun Glass',
      gender: product.gender || 'Unisex',
      price: product.price || '',
      originalPrice: product.originalPrice || '',
      stock: product.stock !== undefined ? product.stock : 20,
      image: product.image || PRESET_IMAGES[0].url,
      description: product.description || '',
      frameMaterial: product.specs?.['Frame Material'] || 'Titanium Alloy',
      lensType: product.specs?.['Lens'] || 'Polarized UV400',
      isDealOfDay: Boolean(product.isDealOfDay),
      isFeatured: Boolean(product.isFeatured)
    });
  };

  // Submit Add Product
  const handleCreateProduct = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price) {
      alert('Please fill in product name and price.');
      return;
    }

    const payload = {
      name: formData.name,
      category: formData.category,
      gender: formData.gender,
      price: Number(formData.price),
      originalPrice: formData.originalPrice ? Number(formData.originalPrice) : Math.round(Number(formData.price) * 1.25),
      stock: Number(formData.stock),
      image: formData.image,
      images: [formData.image],
      description: formData.description || 'Handcrafted premium eyewear designed for effortless style and optical precision.',
      specs: {
        'Frame Material': formData.frameMaterial,
        'Lens': formData.lensType,
        'Fit': 'Medium',
        'Weight': '20g'
      },
      isDealOfDay: formData.isDealOfDay,
      isFeatured: formData.isFeatured
    };

    try {
      const res = await fetch('http://localhost:5001/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('Failed to create product');

      const created = await res.json();
      setProducts(prev => [created, ...prev]);
      setIsAddModalOpen(false);
      setFormData(initialFormState);
      showToast(`Created frame "${created.name}" successfully!`);
    } catch (err) {
      console.error(err);
      alert('Error creating product. Please try again.');
    }
  };

  // Submit Update Product
  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    if (!editingProduct) return;

    const payload = {
      name: formData.name,
      category: formData.category,
      gender: formData.gender,
      price: Number(formData.price),
      originalPrice: formData.originalPrice ? Number(formData.originalPrice) : Math.round(Number(formData.price) * 1.25),
      stock: Number(formData.stock),
      image: formData.image,
      description: formData.description,
      specs: {
        'Frame Material': formData.frameMaterial,
        'Lens': formData.lensType,
        'Fit': editingProduct.specs?.['Fit'] || 'Medium',
        'Weight': editingProduct.specs?.['Weight'] || '20g'
      },
      isDealOfDay: formData.isDealOfDay,
      isFeatured: formData.isFeatured
    };

    try {
      const res = await fetch(`http://localhost:5001/api/products/${editingProduct.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('Failed to update product');

      const updated = await res.json();
      setProducts(prev => prev.map(p => p.id === updated.id ? updated : p));
      setEditingProduct(null);
      showToast(`Updated product "${updated.name}" successfully!`);
    } catch (err) {
      console.error(err);
      alert('Error updating product.');
    }
  };

  // Submit Delete
  const handleDeleteProduct = async () => {
    if (!deletingProduct) return;

    try {
      const res = await fetch(`http://localhost:5001/api/products/${deletingProduct.id}`, {
        method: 'DELETE'
      });

      if (!res.ok) throw new Error('Failed to delete product');

      setProducts(prev => prev.filter(p => p.id !== deletingProduct.id));
      showToast(`Deleted product #${deletingProduct.id}`);
      setDeletingProduct(null);
    } catch (err) {
      console.error(err);
      alert('Error deleting product.');
    }
  };

  // Filter products by search and category
  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch = !searchTerm.trim() || 
      p.name.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
      (p.category && p.category.toLowerCase().includes(searchTerm.toLowerCase().trim()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      
      {/* Toast Notification */}
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

      {/* Control Bar */}
      <div className="bg-white p-5 rounded-3xl border border-gray-200/70 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        
        {/* Search & Category Filter */}
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search size={16} className="absolute left-3.5 top-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search eyewear by title or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-gray-200 outline-none focus:border-black font-medium"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs font-semibold bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 outline-none cursor-pointer hover:border-black"
          >
            <option value="All">All Categories</option>
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Action Button: Add Product */}
        <button
          onClick={() => {
            setFormData(initialFormState);
            setIsAddModalOpen(true);
          }}
          className="px-5 py-2.5 bg-black text-white text-xs font-semibold uppercase tracking-wider rounded-xl hover:bg-neutral-800 transition-all flex items-center justify-center gap-2 shadow-sm"
        >
          <Plus size={15} />
          <span>New Product</span>
        </button>

      </div>

      {/* Mobile Products Card Feed (< 768px) */}
      <div className="block md:hidden space-y-3">
        {loading ? (
          <div className="bg-white p-8 rounded-2xl border border-gray-200 text-center text-gray-400 text-xs">
            Loading inventory catalog...
          </div>
        ) : filteredProducts.length > 0 ? (
          filteredProducts.map((p) => (
            <div key={p.id} className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-sm space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-16 h-16 rounded-xl bg-gray-50 p-1.5 flex items-center justify-center flex-shrink-0 border border-gray-100">
                  <img
                    src={p.image || DEFAULT_PRODUCT_IMG}
                    alt={p.name}
                    onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = DEFAULT_PRODUCT_IMG; }}
                    className="w-full h-full object-contain mix-blend-multiply"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-1">
                    <span className="font-bold text-gray-900 text-sm block truncate">{p.name}</span>
                    <span className="font-serif font-bold text-sm text-gray-900 flex-shrink-0">₹{Number(p.price).toLocaleString('en-IN')}</span>
                  </div>
                  <span className="text-[11px] text-gray-400 block mt-0.5">{p.category} &bull; {p.gender}</span>
                  <div className="flex items-center gap-1.5 mt-1">
                    {p.isDealOfDay && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-100 text-amber-900">DEAL</span>
                    )}
                    {p.isFeatured && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-indigo-100 text-indigo-900">FEATURED</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Stock Stepper & Quick Action Row */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-gray-500 font-semibold">Stock:</span>
                  <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                    <button
                      onClick={() => handleStockQuickAdjust(p.id, Math.max(0, (p.stock || 0) - 1))}
                      className="p-1 hover:bg-gray-200 text-gray-600 transition-colors"
                      title="Decrement stock by 1"
                    >
                      <Minus size={13} />
                    </button>
                    <span className="px-2 text-xs font-bold text-gray-900 font-mono">
                      {p.stock || 0}
                    </span>
                    <button
                      onClick={() => handleStockQuickAdjust(p.id, (p.stock || 0) + 1)}
                      className="p-1 hover:bg-gray-200 text-gray-600 transition-colors"
                      title="Increment stock by 1"
                    >
                      <Plus size={13} />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenEditModal(p)}
                    className="p-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-black hover:text-white transition-colors"
                    title="Edit Product"
                  >
                    <Edit3 size={14} />
                  </button>
                  <button
                    onClick={() => setDeletingProduct(p)}
                    className="p-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-600 hover:text-white transition-colors"
                    title="Delete Product"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white p-8 rounded-2xl border border-gray-200 text-center text-gray-400 text-xs">
            No frames found matching your query.
          </div>
        )}
      </div>

      {/* Desktop Products Table (Screen width >= 768px) */}
      <div className="hidden md:block bg-white rounded-3xl border border-gray-200/70 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50 text-gray-400 uppercase tracking-wider font-semibold">
                <th className="py-3.5 px-4">Frame</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Price</th>
                <th className="py-3.5 px-4">Inventory Stock</th>
                <th className="py-3.5 px-4">Badges</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-gray-400">
                    Loading inventory catalog...
                  </td>
                </tr>
              ) : filteredProducts.length > 0 ? (
                filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                    {/* Frame Preview & Title */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gray-50 p-1 flex items-center justify-center flex-shrink-0 border border-gray-100">
                          <img 
                            src={p.image || DEFAULT_PRODUCT_IMG} 
                            alt={p.name} 
                            onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = DEFAULT_PRODUCT_IMG; }}
                            className="w-full h-full object-contain mix-blend-multiply" 
                          />
                        </div>
                        <div>
                          <span className="font-bold text-gray-900 block text-xs md:text-sm">{p.name}</span>
                          <span className="text-[11px] text-gray-400">ID: #{p.id} &bull; {p.gender}</span>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-800 text-[11px] font-semibold">
                        {p.category}
                      </span>
                    </td>

                    {/* Pricing */}
                    <td className="py-3 px-4">
                      <span className="font-bold text-gray-900 block font-serif">₹{Number(p.price).toLocaleString('en-IN')}</span>
                      {p.originalPrice && p.originalPrice > p.price && (
                        <span className="text-[10px] text-gray-400 line-through">
                          ₹{Number(p.originalPrice).toLocaleString('en-IN')}
                        </span>
                      )}
                    </td>

                    {/* Stock with quick +/- controls */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          p.stock > 10
                            ? 'bg-emerald-100 text-emerald-800'
                            : p.stock > 0
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}>
                          {p.stock} in stock
                        </span>
                        <div className="flex items-center border border-gray-200 rounded-lg bg-white">
                          <button
                            onClick={() => handleStockAdjust(p, -1)}
                            className="p-1 hover:bg-gray-100 text-gray-500 rounded-l"
                            title="Decrease Stock"
                          >
                            <Minus size={11} />
                          </button>
                          <button
                            onClick={() => handleStockAdjust(p, 1)}
                            className="p-1 hover:bg-gray-100 text-gray-500 rounded-r"
                            title="Increase Stock"
                          >
                            <Plus size={11} />
                          </button>
                        </div>
                      </div>
                    </td>

                    {/* Badges */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {p.isDealOfDay && (
                          <span className="px-2 py-0.5 rounded-md bg-black text-white text-[10px] font-bold uppercase">
                            Deal
                          </span>
                        )}
                        {p.isFeatured && (
                          <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 text-[10px] font-bold uppercase">
                            Featured
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Action Buttons */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="p-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-black hover:text-white hover:border-black transition-all"
                          title="Update Product Details"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={() => setDeletingProduct(p)}
                          className="p-2 rounded-xl border border-gray-200 text-gray-400 hover:text-rose-600 hover:border-rose-300 hover:bg-rose-50 transition-all"
                          title="Delete Frame"
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
                    No frames found matching your query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD / EDIT PRODUCT MODAL */}
      <AnimatePresence>
        {(isAddModalOpen || editingProduct) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-2xl bg-white rounded-2xl md:rounded-3xl p-4 sm:p-6 md:p-8 shadow-2xl border border-gray-200 max-h-[92vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
                <div>
                  <h3 className="font-serif text-xl font-bold text-gray-900">
                    {editingProduct ? `Update Frame: ${editingProduct.name}` : 'Add New Eyewear Frame'}
                  </h3>
                  <p className="text-xs text-gray-400">
                    {editingProduct ? 'Modify pricing, stock, specifications, or imagery' : 'Add a new frame to the GetChasma catalog'}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingProduct(null);
                  }}
                  className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-black"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={editingProduct ? handleUpdateProduct : handleCreateProduct} className="space-y-6">
                
                {/* Product Name */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                    Frame Model Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Aurelia Titanium Aviator"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2.5 text-xs rounded-xl border border-gray-200 focus:border-black outline-none font-medium"
                  />
                </div>

                {/* Category & Gender */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                      Category *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-2.5 text-xs rounded-xl border border-gray-200 focus:border-black outline-none font-medium bg-white"
                    >
                      {CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                      Gender / Target
                    </label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      className="w-full px-4 py-2.5 text-xs rounded-xl border border-gray-200 focus:border-black outline-none font-medium bg-white"
                    >
                      <option value="Unisex">Unisex</option>
                      <option value="Men">Men</option>
                      <option value="Women">Women</option>
                    </select>
                  </div>
                </div>

                {/* Price, Original Price, Stock */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                      Selling Price (₹) *
                    </label>
                    <input
                      type="number"
                      step="1"
                      required
                      placeholder="2999"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full px-4 py-2.5 text-xs rounded-xl border border-gray-200 focus:border-black outline-none font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                      Compare/Original Price (₹)
                    </label>
                    <input
                      type="number"
                      step="1"
                      placeholder="3999"
                      value={formData.originalPrice}
                      onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                      className="w-full px-4 py-2.5 text-xs rounded-xl border border-gray-200 focus:border-black outline-none font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                      Inventory Units *
                    </label>
                    <input
                      type="number"
                      required
                      placeholder="25"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      className="w-full px-4 py-2.5 text-xs rounded-xl border border-gray-200 focus:border-black outline-none font-medium"
                    />
                  </div>
                </div>

                {/* Image Selection with Presets */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                    Product Image URL
                  </label>
                  <div className="flex gap-3 mb-2">
                    <input
                      type="url"
                      required
                      placeholder="https://images.unsplash.com/..."
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      className="w-full px-4 py-2.5 text-xs rounded-xl border border-gray-200 focus:border-black outline-none font-mono"
                    />
                    <div className="w-11 h-11 bg-gray-50 rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0 border border-gray-200">
                      <img src={formData.image} alt="Preview" className="w-full h-full object-contain mix-blend-multiply" />
                    </div>
                  </div>

                  {/* Preset quick buttons */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] text-gray-400 font-semibold mr-1">Quick Select:</span>
                    {PRESET_IMAGES.map((preset) => (
                      <button
                        type="button"
                        key={preset.label}
                        onClick={() => setFormData({ ...formData, image: preset.url })}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-medium transition-all ${
                          formData.image === preset.url
                            ? 'bg-black text-white'
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                    Product Story / Description
                  </label>
                  <textarea
                    rows="3"
                    placeholder="Describe frame ergonomics, materials, and personality..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2.5 text-xs rounded-xl border border-gray-200 focus:border-black outline-none font-medium leading-relaxed"
                  />
                </div>

                {/* Frame Material & Lens Type */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                      Frame Material
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Japanese Grade-1 Titanium"
                      value={formData.frameMaterial}
                      onChange={(e) => setFormData({ ...formData, frameMaterial: e.target.value })}
                      className="w-full px-4 py-2.5 text-xs rounded-xl border border-gray-200 focus:border-black outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                      Lens Technology
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Polarized UV400 Category 3"
                      value={formData.lensType}
                      onChange={(e) => setFormData({ ...formData, lensType: e.target.value })}
                      className="w-full px-4 py-2.5 text-xs rounded-xl border border-gray-200 focus:border-black outline-none"
                    />
                  </div>
                </div>

                {/* Toggles */}
                <div className="flex items-center gap-6 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-700">
                    <input
                      type="checkbox"
                      checked={formData.isDealOfDay}
                      onChange={(e) => setFormData({ ...formData, isDealOfDay: e.target.checked })}
                      className="w-4 h-4 accent-black rounded"
                    />
                    <span>Highlight as &ldquo;Deal of the Day&rdquo;</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-700">
                    <input
                      type="checkbox"
                      checked={formData.isFeatured}
                      onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                      className="w-4 h-4 accent-black rounded"
                    />
                    <span>Featured in Home Showcase</span>
                  </label>
                </div>

                {/* Submit Actions */}
                <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddModalOpen(false);
                      setEditingProduct(null);
                    }}
                    className="px-5 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-xs font-semibold hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-black text-white text-xs font-semibold uppercase tracking-wider rounded-xl hover:bg-neutral-800 shadow-md"
                  >
                    {editingProduct ? 'Save Changes' : 'Publish Product'}
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DELETE CONFIRMATION MODAL */}
      <AnimatePresence>
        {deletingProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-gray-200 text-center"
            >
              <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <AlertCircle size={28} />
              </div>
              <h3 className="font-serif text-xl font-bold text-gray-900 mb-2">Delete Eyewear Frame?</h3>
              <p className="text-xs text-gray-500 mb-6">
                Are you sure you want to remove <strong>{deletingProduct.name}</strong>? This action cannot be undone and will remove it from the storefront.
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setDeletingProduct(null)}
                  className="px-5 py-2.5 border border-gray-200 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteProduct}
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold uppercase tracking-wider shadow-sm"
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
