import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUserAuth } from '../../context/UserAuthContext';
import { 
  User, 
  Package, 
  Crown, 
  Settings, 
  LogOut, 
  Truck, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  AlertTriangle, 
  ShieldCheck, 
  Sparkles, 
  ExternalLink,
  ChevronRight,
  CreditCard,
  MapPin,
  Phone,
  Mail,
  Calendar,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CANCELLATION_REASONS = [
  'Change of mind / Ordered by mistake',
  'Want to change frame style or color',
  'Need to update prescription or lens index',
  'Found better pricing / applied wrong coupon',
  'Estimated delivery time is too long',
  'Incorrect delivery address or contact info',
  'Other reason'
];

export default function AccountDashboard() {
  const { user, isLoggedIn, logout, updateProfile, activateMembership, fetchUserOrders } = useUserAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('orders'); // 'overview', 'orders', 'membership', 'profile'
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Cancellation Modal
  const [cancellingOrder, setCancellingOrder] = useState(null);
  const [selectedReason, setSelectedReason] = useState(CANCELLATION_REASONS[0]);
  const [customNote, setCustomNote] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Profile Form
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || '',
    city: user?.city || '',
    state: user?.state || '',
    pincode: user?.pincode || ''
  });
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/account/login');
      return;
    }
    loadOrders();
  }, [isLoggedIn, user?.email]);

  const loadOrders = async () => {
    setLoadingOrders(true);
    try {
      const data = await fetchUserOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch {
      setOrders([]);
    } finally {
      setLoadingOrders(false);
    }
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleCancelOrderSubmit = async () => {
    if (!cancellingOrder) return;
    setCancelling(true);

    const fullReason = selectedReason === 'Other reason' && customNote.trim()
      ? `Other: ${customNote.trim()}`
      : customNote.trim()
      ? `${selectedReason} - ${customNote.trim()}`
      : selectedReason;

    try {
      const res = await fetch(`http://localhost:5001/api/orders/${cancellingOrder.id}/cancel-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: fullReason })
      });

      if (res.ok) {
        showToast('Cancellation request submitted to atelier desk.');
        setCancellingOrder(null);
        setCustomNote('');
        loadOrders();
      } else {
        const data = await res.json().catch(() => ({}));
        showToast(data.error || 'Failed to submit cancellation request.');
      }
    } catch {
      showToast('Network error submitting request.');
    } finally {
      setCancelling(false);
    }
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await updateProfile(profileForm);
      showToast('Profile updated successfully.');
    } catch (err) {
      showToast(err.message || 'Failed to update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleJoinMembership = async () => {
    try {
      await activateMembership('1-Year Chasma Gold Pass', 1);
      showToast('🎉 Chasma Gold VIP Pass activated!');
    } catch (err) {
      showToast(err.message || 'Membership activation failed.');
    }
  };

  if (!user) return null;

  const deliveredOrders = orders.filter(o => o.status.toLowerCase() === 'delivered');

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/30 via-white to-slate-50 text-slate-900 pt-8 pb-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative sunlit ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-b from-blue-200/15 via-indigo-100/10 to-transparent rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-6xl mx-auto space-y-8 relative z-10">

        {/* Toast Alert */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-24 right-8 z-50 px-5 py-3 bg-white border border-blue-200 text-blue-900 text-xs font-bold rounded-2xl shadow-xl flex items-center gap-2"
            >
              <Sparkles size={16} className="text-blue-600" />
              <span>{toastMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Top Header Card */}
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-xl shadow-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 text-white flex items-center justify-center font-serif text-2xl font-bold shadow-lg shadow-blue-500/20">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
                  {user.name}
                </h1>
                {user.isMember && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 text-[10px] font-extrabold uppercase tracking-wider shadow-sm">
                    <Crown size={11} /> GOLD VIP
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                <Mail size={12} className="text-slate-400" /> {user.email}
              </p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-4 sm:gap-6 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6 relative z-10">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block">Total Orders</span>
              <span className="font-serif text-2xl font-bold text-slate-900 font-mono">{orders.length}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block">Delivered</span>
              <span className="font-serif text-2xl font-bold text-emerald-600 font-mono">{deliveredOrders.length}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block">VIP Status</span>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600">
                {user.isMember ? 'Active' : 'Regular'}
              </span>
            </div>
            <button
              onClick={() => { logout(); navigate('/'); }}
              className="p-2.5 bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 rounded-xl border border-slate-200 transition-colors ml-auto cursor-pointer"
              title="Sign Out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>

        {/* Dashboard Navigation Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 border-b border-slate-200/80">
          {[
            { id: 'orders', label: 'Order History & Tracking', icon: Package, count: orders.length },
            { id: 'membership', label: 'Chasma Gold VIP Club', icon: Crown, highlight: !user.isMember },
            { id: 'profile', label: 'Profile & Addresses', icon: Settings }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon size={15} />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className={`ml-1 px-2 py-0.5 rounded-full text-[10px] ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {tab.count}
                  </span>
                )}
                {tab.highlight && (
                  <span className="ml-1 px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[9px] font-black uppercase">
                    Upgrade
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* TAB 1: ORDER HISTORY & TRACKING */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif text-xl font-bold text-slate-900">Your Eyewear Commissions</h3>
                <p className="text-xs text-slate-500">Track current lab progress, view past receipts, and manage cancellation details.</p>
              </div>
              <Link
                to="/track-order"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors uppercase tracking-wider"
              >
                <Truck size={14} /> Live Courier Tracker <ChevronRight size={14} />
              </Link>
            </div>

            {loadingOrders ? (
              <div className="p-12 text-center text-slate-400 text-sm">
                Fetching your order history from the atelier...
              </div>
            ) : orders.length === 0 ? (
              <div className="p-16 text-center bg-white rounded-3xl border border-slate-200/80 shadow-md space-y-4">
                <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mx-auto text-blue-500">
                  <Package size={28} />
                </div>
                <h4 className="font-serif text-lg font-bold text-slate-900">No Commissions Yet</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  You have not placed any orders under {user.email}. Explore our curated eyewear collections to commission your first pair.
                </p>
                <Link
                  to="/shop"
                  className="inline-block px-8 py-3.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white text-xs font-bold uppercase tracking-widest rounded-full hover:from-blue-500 hover:to-indigo-500 transition-all shadow-lg shadow-blue-500/25 active:scale-95"
                >
                  Explore Eyewear Collection
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => {
                  const isDelivered = order.status.toLowerCase() === 'delivered';
                  const isCancelled = order.status.toLowerCase() === 'cancelled';
                  const isCancelPending = order.cancellationRequested && order.cancellationRequest?.status === 'pending';
                  const isCancelDenied = order.cancellationRequest?.status === 'denied';
                  const canCancel = (order.status.toLowerCase() === 'pending' || order.status.toLowerCase() === 'processing') && !isCancelPending;

                  return (
                    <div
                      key={order.id}
                      className="bg-white rounded-3xl p-6 border border-slate-200/80 hover:border-blue-300 shadow-md shadow-slate-100 transition-all space-y-5"
                    >
                      {/* Order Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
                        <div>
                          <div className="flex items-center gap-3">
                            <span className="font-serif text-lg font-bold text-slate-900">{order.id}</span>
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                              isDelivered
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : isCancelled
                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                : isCancelPending
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-blue-50 text-blue-700 border-blue-200'
                            }`}>
                              {isCancelPending ? 'Cancel Requested' : order.status}
                            </span>
                          </div>
                          <span className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                            <Calendar size={12} /> Placed {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <Link
                            to={`/track-order?id=${order.id}`}
                            className="px-4 py-2 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 rounded-full text-xs font-semibold uppercase tracking-wider transition-colors flex items-center gap-1.5"
                          >
                            <Truck size={13} />
                            Track
                          </Link>
                          {isDelivered && (
                            <Link
                              to={`/track-order?id=${order.id}`}
                              className="px-3 py-2 text-amber-700 hover:text-amber-800 text-xs font-semibold uppercase tracking-wider underline underline-offset-4"
                            >
                              Return / Exchange
                            </Link>
                          )}
                          {canCancel && (
                            <button
                              onClick={() => setCancellingOrder(order)}
                              className="px-3 py-2 text-rose-600 hover:text-rose-800 text-xs font-semibold uppercase tracking-wider underline underline-offset-4 cursor-pointer"
                            >
                              Cancel Order
                            </button>
                          )}
                          {isCancelPending && (
                            <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px] uppercase font-bold tracking-wider flex items-center gap-1">
                              <Clock size={11} className="animate-spin" /> Pending Review
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Delivered Status Notice */}
                      {isDelivered && (
                        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-3 text-xs">
                          <CheckCircle2 size={18} className="flex-shrink-0 text-emerald-600" />
                          <span>
                            Delivered successfully {order.deliveredAt ? `on ${new Date(order.deliveredAt).toLocaleDateString()}` : 'to recipient'}.
                          </span>
                        </div>
                      )}

                      {/* Cancelled Status Notice with Reason */}
                      {isCancelled && (
                        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 space-y-1 text-xs">
                          <div className="flex items-center gap-2 font-bold text-rose-700">
                            <XCircle size={16} />
                            <span>Order Cancelled</span>
                          </div>
                          <p className="text-slate-600">
                            <span className="font-semibold text-rose-700">Reason: </span>
                            {order.cancellationReason || 'Cancelled upon customer request.'}
                          </p>
                        </div>
                      )}

                      {/* Pending Cancellation Request Notice */}
                      {isCancelPending && (
                        <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 space-y-1 text-xs">
                          <div className="flex items-center gap-2 font-bold text-amber-700">
                            <Clock size={16} className="animate-pulse" />
                            <span>Cancellation Request Under Review</span>
                          </div>
                          <p className="text-slate-600">
                            <span className="font-semibold text-amber-700">Reason: </span>
                            {order.cancellationRequest?.reason || 'Customer requested order cancellation.'}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            Submitted on {order.cancellationRequest?.requestedAt ? new Date(order.cancellationRequest.requestedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'recently'}. The atelier is reviewing fulfillment lab progress.
                          </p>
                        </div>
                      )}

                      {/* Denied Cancellation Request Notice */}
                      {isCancelDenied && !isCancelled && (
                        <div className="p-3.5 rounded-2xl bg-amber-50/50 border border-amber-200 text-amber-900 space-y-1 text-xs">
                          <div className="flex items-center gap-2 font-bold text-amber-700">
                            <AlertTriangle size={16} />
                            <span>Cancellation Request Denied</span>
                          </div>
                          <p className="text-slate-600">
                            <span className="font-semibold text-amber-700">Atelier Note: </span>
                            {order.cancellationRequest?.denialReason || 'Prescription lenses already in optical edging lab.'}
                          </p>
                          <p className="text-[11px] text-slate-500">Your order remains active and is progressing on schedule.</p>
                        </div>
                      )}

                      {/* Order Items Gallery */}
                      <div className="divide-y divide-slate-100">
                        {order.items?.map((item, idx) => (
                          <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 p-1 flex-shrink-0 flex items-center justify-center">
                                <img src={item.image} alt={item.name} className="w-full h-full object-contain mix-blend-multiply" />
                              </div>
                              <div>
                                <p className="font-bold text-slate-900">{item.name}</p>
                                <p className="text-slate-500 text-[11px]">Quantity: {item.quantity || 1}</p>
                              </div>
                            </div>
                            <span className="font-mono font-bold text-slate-900">
                              ₹{Number(item.price || 0).toLocaleString('en-IN')}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Financial & Delivery Details */}
                      <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 gap-2">
                        <div>
                          <span>Shipping to: </span>
                          <span className="text-slate-900 font-medium">{order.customer?.name} ({order.customer?.city || 'India'})</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span>Total Valuation:</span>
                          <span className="font-serif text-base font-bold text-slate-900 font-mono">₹{Number(order.total || 0).toLocaleString('en-IN')}</span>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: CHASMA GOLD VIP MEMBERSHIP (LENSKART-STYLE) */}
        {activeTab === 'membership' && (
          <div className="space-y-8">
            {/* VIP Card Graphic */}
            <div className="relative max-w-lg mx-auto rounded-3xl p-8 bg-gradient-to-br from-[#1c1917] via-[#292524] to-[#0c0a09] border-2 border-amber-400/60 shadow-[0_20px_50px_rgba(217,119,6,0.25)] text-white overflow-hidden">
              <div className="absolute -right-16 -top-16 w-64 h-64 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute top-0 right-0 p-6 opacity-20">
                <Crown size={120} />
              </div>

              <div className="relative z-10 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-mono tracking-widest text-amber-400 font-bold block">
                      GETCHASMA ATELIER
                    </span>
                    <h4 className="font-serif text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                      <Crown size={22} className="text-amber-400 fill-amber-400" />
                      GOLD VIP PRIVILEGE
                    </h4>
                  </div>
                  <div className="w-12 h-10 rounded-xl bg-gradient-to-br from-amber-200 via-amber-400 to-amber-600 border border-amber-300 shadow-inner flex items-center justify-center text-slate-950 font-black text-[9px] uppercase tracking-wider">
                    VIP CHIP
                  </div>
                </div>

                <div className="py-4">
                  <span className="text-[10px] text-amber-200/80 uppercase tracking-widest block mb-1">
                    MEMBER NUMBER
                  </span>
                  <p className="font-mono text-xl tracking-[0.2em] font-bold text-amber-300">
                    {user.isMember ? (user.membership?.memberId || 'GC-GOLD-7821') : '•••• •••• •••• ••••'}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-amber-400/20 text-xs">
                  <div>
                    <span className="text-[9px] text-amber-200/70 uppercase tracking-wider block">MEMBER NAME</span>
                    <p className="font-bold text-white uppercase">{user.name}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] text-amber-200/70 uppercase tracking-wider block">VALIDITY</span>
                    <p className="font-bold text-amber-300">
                      {user.isMember 
                        ? (user.membership?.validUntil ? new Date(user.membership.validUntil).toLocaleDateString() : 'Active 365 Days')
                        : 'Not Activated'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Membership Benefits Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  title: 'Buy 1 Get 1 Free on All Eyewear',
                  desc: 'Enjoy a complimentary second frame of equal or lesser value on every prescription and sunglasses purchase for 365 days.'
                },
                {
                  title: '50% Off Premium Lenses',
                  desc: 'Exclusive half-price privilege on high-index ultra-thin 1.67/1.74 lenses, Zeiss optical coatings, and digital screen blue-cut filters.'
                },
                {
                  title: 'Zero Delivery Fees Forever',
                  desc: 'White-glove priority express courier dispatch included on all orders with zero minimum spend requirements.'
                },
                {
                  title: 'Atelier Concierge & Free Tune-ups',
                  desc: 'Direct WhatsApp and phone line to private stylists with lifetime ultrasonic cleanings and frame adjustments.'
                }
              ].map((perk, i) => (
                <div key={i} className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-md flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0 mt-0.5 border border-amber-200">
                    <Sparkles size={18} />
                  </div>
                  <div>
                    <h5 className="font-serif font-bold text-sm text-slate-900 mb-1">{perk.title}</h5>
                    <p className="text-xs text-slate-600 leading-relaxed">{perk.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Membership CTA */}
            <div className="p-8 rounded-3xl bg-white border-2 border-amber-300 text-center space-y-4 shadow-xl shadow-amber-500/10">
              <h4 className="font-serif text-2xl font-bold text-slate-900">
                {user.isMember ? 'You Have Full Gold VIP Privileges' : 'Unlock Chasma Gold VIP Membership'}
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto">
                {user.isMember 
                  ? 'Your Gold membership is active across all channels. All orders automatically receive free VIP courier and discount privileges.'
                  : 'Join thousands of eyewear connoisseurs. Get 1 Year of Buy 1 Get 1 Free, 50% off lenses, and zero delivery charges for just ₹999/year.'}
              </p>
              {!user.isMember ? (
                <button
                  onClick={handleJoinMembership}
                  className="px-8 py-4 bg-gradient-to-r from-amber-400 via-amber-500 to-orange-400 text-slate-950 text-xs font-bold uppercase tracking-widest rounded-full hover:from-amber-300 hover:to-amber-400 transition-all shadow-lg shadow-amber-500/25 active:scale-95 cursor-pointer"
                >
                  Activate Gold VIP Pass (₹999 / Year)
                </button>
              ) : (
                <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-full text-xs font-bold uppercase tracking-wider">
                  <ShieldCheck size={16} className="text-emerald-600" />
                  Active Membership Tier: Gold VIP
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: PROFILE & DELIVERY ADDRESSES */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-xl space-y-6 max-w-2xl mx-auto">
            <div>
              <h3 className="font-serif text-xl font-bold text-slate-900">Profile & Delivery Details</h3>
              <p className="text-xs text-slate-500">Update your shipping address and contact coordinates for seamless checkout.</p>
            </div>

            <form onSubmit={handleProfileSave} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-1">
                  Street Address
                </label>
                <input
                  type="text"
                  value={profileForm.address}
                  onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={profileForm.city}
                    onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    value={profileForm.state}
                    onChange={(e) => setProfileForm({ ...profileForm, state: e.target.value })}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-1">
                    Pincode
                  </label>
                  <input
                    type="text"
                    value={profileForm.pincode}
                    onChange={(e) => setProfileForm({ ...profileForm, pincode: e.target.value })}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={savingProfile}
                className="w-full py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold uppercase tracking-widest rounded-full transition-all disabled:opacity-50 mt-4 shadow-lg shadow-blue-500/25 active:scale-95 cursor-pointer"
              >
                {savingProfile ? 'Saving Changes...' : 'Save Profile & Address'}
              </button>
            </form>
          </div>
        )}

        {/* CUSTOMER CANCELLATION MODAL */}
        <AnimatePresence>
          {cancellingOrder && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl text-slate-900 space-y-5"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2 text-rose-600 font-bold text-base">
                    <AlertTriangle size={20} />
                    <span>Request Cancellation ({cancellingOrder.id})</span>
                  </div>
                  <button
                    onClick={() => setCancellingOrder(null)}
                    className="p-1 text-slate-400 hover:text-slate-900 rounded-lg hover:bg-slate-100 cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>

                <p className="text-xs text-slate-600">
                  Please tell us why you wish to cancel this commission. Submitting this alerts our atelier fulfillment desk to review your order before lens surfacing completes.
                </p>

                {/* Reason Options */}
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {CANCELLATION_REASONS.map((reason) => (
                    <label
                      key={reason}
                      className={`flex items-center gap-3 p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                        selectedReason === reason
                          ? 'bg-rose-50 border-rose-300 text-rose-950 font-semibold'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="accountCancelReason"
                        checked={selectedReason === reason}
                        onChange={() => setSelectedReason(reason)}
                        className="accent-rose-600 cursor-pointer"
                      />
                      <span>{reason}</span>
                    </label>
                  ))}
                </div>

                {/* Optional Note */}
                <div>
                  <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-1">
                    Additional Comments (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={customNote}
                    onChange={(e) => setCustomNote(e.target.value)}
                    placeholder="Provide any additional details..."
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 outline-none focus:border-rose-500 resize-none placeholder:text-slate-400"
                  />
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setCancellingOrder(null)}
                    className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-900 uppercase tracking-wider cursor-pointer"
                  >
                    Keep Order
                  </button>
                  <button
                    type="button"
                    disabled={cancelling}
                    onClick={handleCancelOrderSubmit}
                    className="px-5 py-2.5 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white rounded-full text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50 shadow-lg shadow-rose-600/20 active:scale-95 cursor-pointer"
                  >
                    {cancelling ? 'Submitting Request...' : 'Submit Cancellation Request'}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
