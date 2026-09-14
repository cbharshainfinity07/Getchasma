import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  IndianRupee, 
  ShoppingBag, 
  Glasses, 
  TrendingUp, 
  Clock, 
  AlertTriangle, 
  ArrowUpRight, 
  CheckCircle2, 
  Truck, 
  ArrowRight,
  Ban
} from 'lucide-react';

const DEFAULT_PRODUCT_IMG = "https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=600&auto=format&fit=crop";

export default function AdminOverview() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  const fetchStats = () => {
    fetch('http://localhost:5001/api/stats')
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching stats:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleQuickStatusUpdate = async (orderId, newStatus) => {
    setUpdatingOrderId(orderId);
    try {
      const res = await fetch(`http://localhost:5001/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        fetchStats();
      }
    } catch (err) {
      console.error("Error updating status:", err);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Revenue',
      value: `₹${Number(stats?.totalRevenue || 0).toLocaleString('en-IN')}`,
      change: '+18.4% vs last mo',
      isPositive: true,
      icon: IndianRupee,
      color: 'bg-emerald-50 text-emerald-700'
    },
    {
      title: 'Total Orders',
      value: stats?.totalOrders || 0,
      change: '+12% this week',
      isPositive: true,
      icon: ShoppingBag,
      color: 'bg-indigo-50 text-indigo-700'
    },
    {
      title: 'Active Eyewear',
      value: stats?.activeProducts || 0,
      change: 'Catalog styles',
      isPositive: true,
      icon: Glasses,
      color: 'bg-amber-50 text-amber-700'
    },
    {
      title: 'Avg. Order Value',
      value: `₹${Number(stats?.averageOrderValue || 0).toLocaleString('en-IN')}`,
      change: '+5.2% basket size',
      isPositive: true,
      icon: TrendingUp,
      color: 'bg-purple-50 text-purple-700'
    },
    {
      title: 'Orders In Pipeline',
      value: stats?.pendingOrders || 0,
      change: 'Requires fulfillment',
      isPositive: false,
      icon: Clock,
      color: 'bg-rose-50 text-rose-700'
    }
  ];

  return (
    <div className="space-y-8">
      
      {/* Top Banner Alert if low stock or pending */}
      {stats?.lowStockCount > 0 && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="text-amber-600 flex-shrink-0" size={20} />
            <span className="text-xs font-semibold text-amber-900">
              Low Stock Alert: {stats.lowStockCount} product(s) have 10 or fewer units left. Review inventory to avoid stockouts.
            </span>
          </div>
          <Link
            to="/admin/products"
            className="px-3.5 py-1.5 bg-amber-200 text-amber-900 rounded-xl text-xs font-bold hover:bg-amber-300 transition-colors whitespace-nowrap"
          >
            Review Stock &rarr;
          </Link>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="bg-white p-5 rounded-2xl border border-gray-200/70 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{card.title}</span>
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${card.color}`}>
                  <Icon size={16} />
                </div>
              </div>
              <div>
                <span className="text-2xl font-bold text-gray-900 block mb-1">{card.value}</span>
                <span className={`text-[11px] font-medium ${card.isPositive ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {card.change}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 2-Column Analytics & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Sales & Revenue Trend Simulation */}
        <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-gray-200/70 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-base text-gray-900">Revenue &amp; Sales Velocity</h3>
              <p className="text-xs text-gray-400">Weekly breakdown of orders and revenue distribution</p>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold">
              <span className="flex items-center gap-1 text-emerald-600">
                <ArrowUpRight size={14} /> +24% vs Last Week
              </span>
            </div>
          </div>

          {/* Simulated Visual Bar Chart */}
          <div className="space-y-4">
            <div className="h-44 flex items-end gap-3 pt-6 px-2 border-b border-gray-100">
              {[
                { day: 'Mon', height: '40%', val: '₹8,500' },
                { day: 'Tue', height: '65%', val: '₹14,000' },
                { day: 'Wed', height: '50%', val: '₹11,000' },
                { day: 'Thu', height: '85%', val: '₹19,000' },
                { day: 'Fri', height: '70%', val: '₹15,500' },
                { day: 'Sat', height: '95%', val: '₹21,000' },
                { day: 'Sun', height: '60%', val: '₹13,000' }
              ].map((bar, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <span className="text-[10px] text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity font-bold">
                    {bar.val}
                  </span>
                  <div
                    className="w-full bg-neutral-900 group-hover:bg-amber-400 rounded-t-lg transition-all"
                    style={{ height: bar.height }}
                  />
                  <span className="text-[11px] text-gray-500 font-semibold">{bar.day}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between text-xs text-gray-400 px-2 pt-2">
              <span>Average Daily Revenue: ₹14,600</span>
              <span className="text-gray-900 font-semibold">Peak Day: Saturday (₹21,000)</span>
            </div>
          </div>
        </div>

        {/* Top Eyewear Performers */}
        <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-gray-200/70 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base text-gray-900">Top Performing Frames</h3>
              <Link to="/admin/products" className="text-xs font-semibold text-gray-500 hover:text-black">
                View All &rarr;
              </Link>
            </div>

            <div className="divide-y divide-gray-100">
              {stats?.topProducts?.map((p) => (
                <div key={p.id} className="py-3 flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0 p-1 flex items-center justify-center border border-gray-100">
                    <img 
                      src={p.image || DEFAULT_PRODUCT_IMG} 
                      alt={p.name} 
                      onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = DEFAULT_PRODUCT_IMG; }}
                      className="w-full h-full object-contain mix-blend-multiply" 
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-xs text-gray-900 truncate">{p.name}</h4>
                    <span className="text-[11px] text-gray-400">{p.soldCount} sold &bull; {p.category}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-xs text-black block">₹{Number(p.price).toLocaleString('en-IN')}</span>
                    <span className="text-[10px] text-emerald-600 font-semibold">₹{Number(p.revenue).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 mt-4">
            <Link
              to="/admin/products?action=new"
              className="w-full py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-800 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-gray-200"
            >
              Add New Frame Style
            </Link>
          </div>
        </div>

      </div>

      {/* Recent Orders Section */}
      <div className="bg-white p-6 rounded-3xl border border-gray-200/70 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-bold text-base text-gray-900">Recent Customer Orders</h3>
            <p className="text-xs text-gray-400">Latest transactions requiring packaging and courier dispatch</p>
          </div>
          <Link
            to="/admin/orders"
            className="text-xs font-bold text-black hover:underline flex items-center gap-1"
          >
            Manage All Orders <ArrowRight size={14} />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-gray-100 text-gray-400 uppercase tracking-wider font-semibold">
                <th className="pb-3 px-3">Order ID</th>
                <th className="pb-3 px-3">Customer</th>
                <th className="pb-3 px-3">Eyewear Items</th>
                <th className="pb-3 px-3">Total</th>
                <th className="pb-3 px-3">Payment</th>
                <th className="pb-3 px-3">Current Status</th>
                <th className="pb-3 px-3 text-right">Quick Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {stats?.recentOrders?.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="py-3.5 px-3 font-mono font-bold text-gray-900">
                    {order.id}
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="font-semibold text-gray-900 block">{order.customer?.name}</span>
                    <span className="text-[11px] text-gray-400">{order.customer?.city || 'India'}</span>
                  </td>
                  <td className="py-3.5 px-3 text-gray-600">
                    <span className="font-medium">{order.items?.length || 1} frame(s)</span>
                    <span className="text-gray-400 block truncate max-w-[180px]">
                      {order.items?.map(i => i.name).join(', ')}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 font-bold text-gray-900 font-serif">
                    ₹{Number(order.total || 0).toLocaleString('en-IN')}
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="font-medium text-gray-800 block">{order.paymentMethod}</span>
                    <span className={`text-[10px] font-bold ${
                      order.paymentStatus === 'Paid' ? 'text-emerald-600' : 'text-amber-600'
                    }`}>
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td className="py-3.5 px-3">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider ${
                      order.status === 'delivered' 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : order.status === 'shipped'
                        ? 'bg-blue-100 text-blue-800'
                        : order.status === 'processing'
                        ? 'bg-indigo-100 text-indigo-800'
                        : order.status === 'cancelled' || order.cancellationRequest?.status === 'approved'
                        ? 'bg-rose-100 text-rose-800'
                        : order.status === 'refunded' || order.refundStatus === 'refunded' || order.refundDetails?.status === 'refunded'
                        ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-right">
                    {order.status === 'delivered' ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200">
                        <CheckCircle2 size={11} className="text-emerald-600" /> Delivered &amp; Locked
                      </span>
                    ) : order.status === 'cancelled' || order.cancellationRequest?.status === 'approved' ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-800 bg-rose-50 px-2 py-1 rounded-lg border border-rose-200">
                        <Ban size={11} /> Cancelled &amp; Locked
                      </span>
                    ) : (order.status === 'refunded' || order.refundStatus === 'refunded' || order.refundDetails?.status === 'refunded') ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-900 bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-300">
                        <CheckCircle2 size={11} className="text-emerald-700" /> Refunded &amp; Closed
                      </span>
                    ) : (
                      <select
                        value={order.status}
                        disabled={updatingOrderId === order.id}
                        onChange={(e) => handleQuickStatusUpdate(order.id, e.target.value)}
                        className="text-[11px] font-semibold bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1 outline-none cursor-pointer hover:border-black"
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
