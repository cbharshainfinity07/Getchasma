import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Eye, 
  Clock, 
  Truck, 
  CheckCircle2, 
  XCircle, 
  X, 
  Phone, 
  Mail, 
  Package, 
  CreditCard,
  Check,
  AlertTriangle,
  Ban,
  ShieldAlert,
  RotateCcw,
  Camera,
  IndianRupee,
  ZoomIn,
  Zap,
  Wallet,
  Smartphone,
  Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE_URL } from '../../config/api';

const STATUS_TABS = [
  { id: 'all', label: 'All Orders' },
  { id: 'returns', label: 'Return Requests' },
  { id: 'requests', label: 'Cancellation Requests' },
  { id: 'pending', label: 'Pending' },
  { id: 'processing', label: 'Processing' },
  { id: 'shipped', label: 'Shipped' },
  { id: 'delivered', label: 'Delivered' },
  { id: 'refunded', label: 'Refunded' },
  { id: 'cancelled', label: 'Cancelled' },
];

const DEFAULT_PRODUCT_IMG = "https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=600&auto=format&fit=crop";
const DEFAULT_DEFECT_IMG = "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?q=80&w=800&auto=format&fit=crop";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  
  // Cancellation Modal States
  const [cancellingOrder, setCancellingOrder] = useState(null);
  const [cancelReason, setCancelReason] = useState('Customer requested cancellation');
  const [cancelNote, setCancelNote] = useState('');

  // Cancellation Review States
  const [reviewingOrder, setReviewingOrder] = useState(null);
  const [denialReason, setDenialReason] = useState('Custom prescription lenses already undergoing diamond edging & surfacing');
  const [customDenialNote, setCustomDenialNote] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);

  // Payment Gateway Refund States
  const [refundingOrder, setRefundingOrder] = useState(null);
  const [gatewayProvider, setGatewayProvider] = useState('Razorpay Instant Payouts');
  const [refundNotes, setRefundNotes] = useState('');
  const [refundLoading, setRefundLoading] = useState(false);

  // Return Management States
  const [returnStats, setReturnStats] = useState({ total: 0, pending: 0, approved: 0, denied: 0 });
  const [reviewingReturnOrder, setReviewingReturnOrder] = useState(null);
  const [returnDenialReason, setReturnDenialReason] = useState('No defect or manufacturing flaw observed in inspection photos');
  const [returnDenialNote, setReturnDenialNote] = useState('');
  const [inspectingPhoto, setInspectingPhoto] = useState(null);

  const ADMIN_CANCEL_REASONS = [
    'Customer requested cancellation',
    'Item out of stock / Atelier production delay',
    'Potential fraudulent transaction flagged',
    'Customer shipping address invalid or undeliverable',
    'Duplicate order placed in error',
    'Other reason'
  ];

  const DENIAL_REASONS = [
    'Custom prescription lenses already undergoing diamond edging & surfacing',
    'Order has already been packed & handed over to express courier',
    'Custom bespoke frame engraving already finalized',
    'Past the allowable cancellation timeframe for custom optical orders',
    'Other reason'
  ];

  const RETURN_DENIAL_REASONS = [
    'No defect or manufacturing flaw observed in inspection photos',
    'Damage caused by external accidental impact / mishandling',
    'Prescription values match customer\'s submitted order exactly',
    'Beyond the allowable 7-day return inspection window',
    'Security tag / authenticity serial seal removed or broken',
    'Other reason'
  ];

  const fetchCountsAndStats = () => {
    // Fetch cancellation requests count
    fetch(`${API_BASE_URL}/api/orders?status=requests`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setPendingRequestsCount(data.length);
        }
      })
      .catch(() => {});

    // Fetch returns stats
    fetch(`${API_BASE_URL}/api/orders/returns/stats`)
      .then(res => res.json())
      .then(data => {
        if (data && typeof data.total === 'number') {
          setReturnStats(data);
        }
      })
      .catch(() => {});
  };

  const fetchOrders = () => {
    setLoading(true);
    let url = `${API_BASE_URL}/api/orders`;
    const params = [];
    if (activeTab !== 'all') params.push(`status=${activeTab}`);
    if (searchTerm) params.push(`search=${encodeURIComponent(searchTerm)}`);
    if (params.length) url += `?${params.join('&')}`;

    fetch(url)
      .then(res => res.json())
      .then(data => {
        setOrders(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching orders:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchOrders();
    fetchCountsAndStats();
  }, [activeTab, searchTerm]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3800);
  };

  const executeStatusUpdate = async (orderId, newStatus, cancellationReason = null) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch(`${API_BASE_URL}/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, cancellationReason })
      });

      if (res.ok) {
        const updated = await res.json();
        setOrders(prev => prev.map(o => o.id === orderId ? updated : o));
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder(updated);
        }
        fetchCountsAndStats();
        showToast(`Order ${orderId} marked as ${newStatus.toUpperCase()}`);
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    if (newStatus === 'cancelled') {
      const target = orders.find(o => o.id === orderId);
      setCancellingOrder(target || { id: orderId });
      return;
    }
    await executeStatusUpdate(orderId, newStatus);
  };

  const handleConfirmCancel = async () => {
    if (!cancellingOrder) return;
    const finalReason = cancelReason === 'Other reason' && cancelNote.trim()
      ? `Other: ${cancelNote.trim()}`
      : cancelNote.trim()
      ? `${cancelReason} - ${cancelNote.trim()}`
      : cancelReason;

    await executeStatusUpdate(cancellingOrder.id, 'cancelled', finalReason);
    setCancellingOrder(null);
    setCancelNote('');
  };

  // Toggle COD Payment Collection
  const handleToggleCod = async (orderId, currentCollected) => {
    const targetOrder = orders.find(o => o.id === orderId);
    if (targetOrder && (targetOrder.status === 'cancelled' || targetOrder.cancellationRequest?.status === 'approved')) {
      showToast('Cannot modify cash collection on a cancelled order.');
      return;
    }
    if (targetOrder && (targetOrder.status === 'refunded' || targetOrder.refundStatus === 'refunded' || targetOrder.refundDetails?.status === 'refunded')) {
      showToast('Cannot modify cash collection on a refunded order.');
      return;
    }

    const targetState = !currentCollected;
    try {
      const res = await fetch(`${API_BASE_URL}/api/orders/${orderId}/cod-payment`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ collected: targetState })
      });

      if (res.ok) {
        const updated = await res.json();
        setOrders(prev => prev.map(o => o.id === orderId ? updated : o));
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder(updated);
        }
        showToast(
          targetState 
            ? `₹ COD Payment marked COLLECTED & AUDITED for ${orderId}` 
            : `COD Payment marked PENDING for ${orderId}`
        );
      }
    } catch (err) {
      showToast('Failed to update COD payment status.');
    }
  };

  // Admin approves customer cancellation request
  const handleApproveCancellation = async (orderId) => {
    setReviewLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/orders/${orderId}/cancellation-review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve' })
      });

      if (res.ok) {
        const updated = await res.json();
        setOrders(prev => prev.map(o => o.id === orderId ? updated : o));
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder(updated);
        }
        fetchCountsAndStats();
        showToast(`✅ Cancellation Approved: Order ${orderId} cancelled & stock restored.`);
      } else {
        const data = await res.json().catch(() => ({}));
        showToast(data.error || 'Failed to approve cancellation.');
      }
    } catch (err) {
      showToast('Error approving cancellation.');
    } finally {
      setReviewLoading(false);
    }
  };

  // Admin denies customer cancellation request with reason
  const handleDenyCancellation = async () => {
    if (!reviewingOrder) return;
    setReviewLoading(true);

    const fullDenialReason = denialReason === 'Other reason' && customDenialNote.trim()
      ? `Other: ${customDenialNote.trim()}`
      : customDenialNote.trim()
      ? `${denialReason} - ${customDenialNote.trim()}`
      : denialReason;

    try {
      const res = await fetch(`${API_BASE_URL}/api/orders/${reviewingOrder.id}/cancellation-review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'deny', denialReason: fullDenialReason })
      });

      if (res.ok) {
        const updated = await res.json();
        setOrders(prev => prev.map(o => o.id === reviewingOrder.id ? updated : o));
        if (selectedOrder && selectedOrder.id === reviewingOrder.id) {
          setSelectedOrder(updated);
        }
        const deniedId = reviewingOrder.id;
        setReviewingOrder(null);
        setCustomDenialNote('');
        fetchCountsAndStats();
        showToast(`🚫 Cancellation request denied for ${deniedId}. Customer notified & order kept active.`);
      } else {
        const data = await res.json().catch(() => ({}));
        showToast(data.error || 'Failed to deny cancellation.');
      }
    } catch (err) {
      showToast('Error denying cancellation.');
    } finally {
      setReviewLoading(false);
    }
  };

  // Admin reviews Return Request (Approve or Deny)
  const handleApproveReturn = async (orderId) => {
    setReviewLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/orders/${orderId}/return-review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve' })
      });

      if (res.ok) {
        const updated = await res.json();
        setOrders(prev => prev.map(o => o.id === orderId ? updated : o));
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder(updated);
        }
        fetchCountsAndStats();
        showToast(`✅ Return Approved for ${orderId}. Reverse pickup AWB generated & inventory restored.`);
      } else {
        const data = await res.json().catch(() => ({}));
        showToast(data.error || 'Failed to approve return.');
      }
    } catch (err) {
      showToast('Error approving return request.');
    } finally {
      setReviewLoading(false);
    }
  };

  const handleDenyReturn = async () => {
    if (!reviewingReturnOrder) return;
    setReviewLoading(true);

    const fullDenialReason = returnDenialReason === 'Other reason' && returnDenialNote.trim()
      ? `Other: ${returnDenialNote.trim()}`
      : returnDenialNote.trim()
      ? `${returnDenialReason} - ${returnDenialNote.trim()}`
      : returnDenialReason;

    try {
      const res = await fetch(`${API_BASE_URL}/api/orders/${reviewingReturnOrder.id}/return-review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'deny', denialReason: fullDenialReason })
      });

      if (res.ok) {
        const updated = await res.json();
        setOrders(prev => prev.map(o => o.id === reviewingReturnOrder.id ? updated : o));
        if (selectedOrder && selectedOrder.id === reviewingReturnOrder.id) {
          setSelectedOrder(updated);
        }
        const deniedId = reviewingReturnOrder.id;
        setReviewingReturnOrder(null);
        setReturnDenialNote('');
        fetchCountsAndStats();
        showToast(`🚫 Return claim denied for ${deniedId}. Customer notified.`);
      } else {
        const data = await res.json().catch(() => ({}));
        showToast(data.error || 'Failed to deny return.');
      }
    } catch (err) {
      showToast('Error denying return.');
    } finally {
      setReviewLoading(false);
    }
  };

  // Helper: check if prepaid return/cancellation is awaiting physical warehouse delivery
  const isAwaitingWarehouseArrival = (order) => {
    if (!order) return false;
    if (order.returnRequest && order.returnRequest.status === 'approved' && !order.returnRequest.receivedAtWarehouse) {
      return true;
    }
    if (order.cancellationRequest && order.cancellationRequest.status === 'approved' && order.cancellationRequest.wasDispatched && !order.cancellationRequest.receivedAtWarehouse) {
      return true;
    }
    return false;
  };

  const isPrepaidOrder = (order) => {
    return order?.paymentMethod === 'UPI' || order?.paymentMethod === 'Card' || order?.paymentMethod === 'Credit Card' || order?.paymentMethod === 'Debit Card';
  };

  // Admin confirms inbound return/RTO package delivered & inspected at warehouse
  const handleConfirmReturnReceived = async (orderId) => {
    setReviewLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/orders/${orderId}/return-receive`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ condition: 'Pristine & Quality Verified', notes: 'Package verified at Bengaluru Optical Warehouse.' })
      });

      if (res.ok) {
        const updated = await res.json();
        setOrders(prev => prev.map(o => o.id === orderId ? updated : o));
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder(updated);
        }
        fetchCountsAndStats();
        showToast(`📦 Inbound return received & verified at warehouse for ${orderId}! Refund option unlocked.`);
      } else {
        const data = await res.json().catch(() => ({}));
        showToast(data.error || 'Failed to confirm return receipt.');
      }
    } catch (err) {
      showToast('Error confirming return receipt at warehouse.');
    } finally {
      setReviewLoading(false);
    }
  };

  // Admin executes Payment Gateway Refund
  const handleProcessRefund = async () => {
    if (!refundingOrder) return;
    setRefundLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/orders/${refundingOrder.id}/refund`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gatewayProvider,
          notes: refundNotes
        })
      });

      if (res.ok) {
        const updated = await res.json();
        setOrders(prev => prev.map(o => o.id === refundingOrder.id ? updated : o));
        if (selectedOrder && selectedOrder.id === refundingOrder.id) {
          setSelectedOrder(updated);
        }
        const refundAmt = Number(updated.refundDetails?.amount || updated.total).toLocaleString('en-IN');
        setRefundingOrder(null);
        setRefundNotes('');
        fetchCountsAndStats();
        showToast(`⚡ Gateway Refund Processed! ₹${refundAmt} routed via ${gatewayProvider}.`);
      } else {
        const data = await res.json().catch(() => ({}));
        showToast(data.error || 'Failed to process gateway refund.');
      }
    } catch (err) {
      showToast('Network error processing gateway refund.');
    } finally {
      setRefundLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch ((status || '').toLowerCase()) {
      case 'refunded':
        return 'bg-emerald-100 text-emerald-900 border-emerald-300 font-bold';
      case 'delivered':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'shipped':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'processing':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'cancelled':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'return_requested':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'return_approved':
        return 'bg-purple-100 text-purple-900 border-purple-300';
      case 'return_denied':
        return 'bg-neutral-200 text-neutral-800 border-neutral-300';
      default:
        return 'bg-amber-100 text-amber-800 border-amber-200';
    }
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

      {/* Control Bar: Filter Tabs & Search */}
      <div className="bg-white p-5 rounded-3xl border border-gray-200/70 shadow-sm flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide pb-2 lg:pb-0">
          {STATUS_TABS.map((tab) => {
            const isRequestsTab = tab.id === 'requests';
            const isReturnsTab = tab.id === 'returns';
            let count = null;
            if (isRequestsTab) count = pendingRequestsCount;
            if (isReturnsTab) count = returnStats.pending;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  activeTab === tab.id
                    ? 'bg-black text-white shadow-sm'
                    : (isRequestsTab && pendingRequestsCount > 0) || (isReturnsTab && returnStats.pending > 0)
                    ? 'bg-amber-50 text-amber-900 border border-amber-300 font-bold'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-black'
                }`}
              >
                <span>{tab.label}</span>
                {count > 0 && (
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                    activeTab === tab.id ? 'bg-amber-400 text-black' : 'bg-rose-500 text-white'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative max-w-sm w-full">
          <Search size={16} className="absolute left-3.5 top-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by Order #, Customer, Phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-gray-200 outline-none focus:border-black font-medium"
          />
        </div>

      </div>

      {/* DEDICATED RETURNS STATS RIBBON WHEN IN 'returns' TAB */}
      {activeTab === 'returns' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
              <RotateCcw size={20} />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block">Total Return Claims</span>
              <span className="text-xl font-bold text-gray-900 font-serif">{returnStats.total}</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-amber-200 bg-amber-50/40 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
              <Clock size={20} />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-amber-700 tracking-wider block">Pending Inspection</span>
              <span className="text-xl font-bold text-amber-900 font-serif">{returnStats.pending}</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-emerald-200 bg-emerald-50/40 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-emerald-700 tracking-wider block">Approved &amp; Restocked</span>
              <span className="text-xl font-bold text-emerald-900 font-serif">{returnStats.approved}</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center font-bold">
              <XCircle size={20} />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block">Denied Claims</span>
              <span className="text-xl font-bold text-rose-900 font-serif">{returnStats.denied}</span>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Orders Card Feed (< 768px) */}
      <div className="block md:hidden space-y-3">
        {loading ? (
          <div className="bg-white p-8 rounded-2xl border border-gray-200 text-center text-gray-400 text-xs">
            Loading shipments...
          </div>
        ) : orders.length > 0 ? (
          orders.map((order) => (
            <div key={order.id} className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-sm space-y-3">
              {/* Header: ID, Date, and Status Badge */}
              <div className="flex items-start justify-between gap-2 border-b border-gray-100 pb-2.5">
                <div>
                  <span className="font-mono font-bold text-sm text-gray-900 block">{order.id}</span>
                  <span className="text-[10px] text-gray-400">
                    {new Date(order.createdAt).toLocaleDateString()} &bull; {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div>
                  {order.status === 'cancelled' || order.cancellationRequest?.status === 'approved' ? (
                    isAwaitingWarehouseArrival(order) ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-900 text-[10px] font-bold uppercase border border-amber-300">
                        <Truck size={11} className="text-amber-700 animate-pulse" /> RTO In Transit
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 text-rose-800 text-[10px] font-bold uppercase border border-rose-200">
                        <Ban size={11} /> Cancelled &amp; Locked
                      </span>
                    )
                  ) : (order.status === 'refunded' || order.refundStatus === 'refunded' || order.refundDetails?.status === 'refunded') ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-900 text-[10px] font-bold uppercase border border-emerald-300">
                      <CheckCircle2 size={11} /> Refunded &amp; Closed
                    </span>
                  ) : order.status === 'return_requested' ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold uppercase border border-amber-300">
                      <RotateCcw size={11} className="animate-spin" /> Return Claim
                    </span>
                  ) : order.status === 'return_approved' ? (
                    isAwaitingWarehouseArrival(order) ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-100 text-blue-900 text-[10px] font-bold uppercase border border-blue-300">
                        <Truck size={11} className="text-blue-700 animate-pulse" /> Return In Transit
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-900 text-[10px] font-bold uppercase border border-indigo-300">
                        <CheckCircle2 size={11} className="text-indigo-700" /> Return Received &bull; Refund Ready
                      </span>
                    )
                  ) : order.status === 'return_denied' ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-neutral-100 text-neutral-800 text-[10px] font-bold uppercase border border-neutral-300">
                      <XCircle size={11} /> Return Denied
                    </span>
                  ) : order.status === 'delivered' ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-900 text-[10px] font-bold uppercase border border-emerald-300">
                      <CheckCircle2 size={11} /> Delivered &amp; Locked
                    </span>
                  ) : (
                    <select
                      value={order.status}
                      disabled={updatingId === order.id}
                      onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                      className={`text-[10px] font-bold uppercase tracking-wider rounded-lg px-2 py-1 border outline-none ${getStatusBadge(order.status)}`}
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancel Order</option>
                    </select>
                  )}
                </div>
              </div>

              {/* Customer Row with tap-to-call */}
              <div className="flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-gray-900 block">{order.customer?.name}</span>
                  <span className="text-[11px] text-gray-400">{order.customer?.city}, {order.customer?.state}</span>
                </div>
                {order.customer?.phone && (
                  <a
                    href={`tel:${order.customer.phone}`}
                    className="flex items-center gap-1 px-2.5 py-1 bg-gray-100 hover:bg-black hover:text-white rounded-lg text-[11px] font-semibold text-gray-700 transition-colors"
                  >
                    <Phone size={11} /> {order.customer.phone}
                  </a>
                )}
              </div>

              {/* Items Preview & Amount */}
              <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-xl border border-gray-100">
                <div className="flex items-center gap-2">
                  {order.items?.slice(0, 2).map((item, idx) => (
                    <div key={idx} className="w-9 h-9 rounded-lg bg-white p-1 border border-gray-200 overflow-hidden flex-shrink-0">
                      <img src={item.image || DEFAULT_PRODUCT_IMG} alt="" className="w-full h-full object-contain mix-blend-multiply" />
                    </div>
                  ))}
                  <span className="text-xs text-gray-600 font-medium">{order.items?.length || 1} frame(s)</span>
                </div>
                <div className="text-right">
                  <span className="font-serif font-bold text-base text-gray-900 block">₹{Number(order.total || 0).toLocaleString('en-IN')}</span>
                  <span className={`text-[10px] font-bold ${
                    order.status === 'cancelled' || order.cancellationRequest?.status === 'approved'
                      ? 'text-rose-600'
                      : order.paymentStatus === 'Paid' ? 'text-emerald-600' : 'text-amber-600'
                  }`}>
                    {order.paymentMethod} &bull; {
                      order.status === 'cancelled' || order.cancellationRequest?.status === 'approved'
                        ? 'Voided'
                        : order.paymentStatus
                    }
                  </span>
                </div>
              </div>

              {/* COD Quick Toggle on Mobile */}
              {order.paymentMethod === 'Cash on Delivery' && (
                <div className="pt-0.5">
                  {order.status === 'cancelled' || order.cancellationRequest?.status === 'approved' ? (
                    <div className="w-full py-1.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 bg-gray-100 text-gray-500 border border-gray-200">
                      <Ban size={12} className="text-gray-400" /> COD Voided &bull; Order Cancelled
                    </div>
                  ) : (order.status === 'refunded' || order.refundStatus === 'refunded' || order.refundDetails?.status === 'refunded') ? (
                    <div className="w-full py-1.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200">
                      <CheckCircle2 size={12} className="text-emerald-600" /> COD Settled &bull; Refund Closed
                    </div>
                  ) : (
                    <button
                      onClick={() => handleToggleCod(order.id, order.codPaymentCollected)}
                      className={`w-full py-1.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-colors ${
                        order.codPaymentCollected
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-amber-100 text-amber-900 border-amber-300 animate-pulse'
                      }`}
                    >
                      {order.codPaymentCollected ? (
                        <><Check size={13} className="text-emerald-600" /> ₹ Cash Payment Received &amp; Verified</>
                      ) : (
                        <><Clock size={13} className="text-amber-700" /> Confirm Doorstep Cash Collected</>
                      )}
                    </button>
                  )}
                </div>
              )}

              {/* Pending Return Alert on Mobile */}
              {order.returnRequest && order.returnRequest.status === 'pending' && (
                <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 text-purple-950 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs flex items-center gap-1 text-purple-900">
                      <RotateCcw size={12} className="text-purple-700" /> Return Claim Inspection
                    </span>
                    <span className="text-[10px] bg-purple-200 px-2 py-0.2 rounded-full font-bold">
                      {order.returnRequest.photos?.length || 0} Photos
                    </span>
                  </div>
                  <p className="text-xs text-gray-800 italic">{order.returnRequest.reason}</p>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      disabled={reviewLoading}
                      onClick={() => handleApproveReturn(order.id)}
                      className="py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold uppercase"
                    >
                      Approve Return
                    </button>
                    <button
                      disabled={reviewLoading}
                      onClick={() => setReviewingReturnOrder(order)}
                      className="py-1.5 bg-rose-600 text-white rounded-lg text-xs font-bold uppercase"
                    >
                      Deny Claim
                    </button>
                  </div>
                </div>
              )}

              {/* Pending Cancellation on Mobile */}
              {order.cancellationRequested && order.cancellationRequest?.status === 'pending' && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 space-y-2">
                  <div className="flex items-center gap-1 font-bold text-xs text-amber-800">
                    <AlertTriangle size={13} className="text-amber-600" /> Customer Requested Cancellation
                  </div>
                  <p className="text-xs text-gray-700 italic">"{order.cancellationRequest.reason}"</p>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      disabled={reviewLoading}
                      onClick={() => handleApproveCancellation(order.id)}
                      className="py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold uppercase"
                    >
                      Approve
                    </button>
                    <button
                      disabled={reviewLoading}
                      onClick={() => setReviewingOrder(order)}
                      className="py-1.5 bg-rose-600 text-white rounded-lg text-xs font-bold uppercase"
                    >
                      Deny
                    </button>
                  </div>
                </div>
              )}

              {/* Quick Refund Trigger on Mobile */}
              {order.refundStatus === 'pending_gateway_refund' && order.status !== 'refunded' && (
                <button
                  onClick={() => setRefundingOrder(order)}
                  className="w-full py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold uppercase flex items-center justify-center gap-1.5 shadow"
                >
                  <Zap size={13} className="text-amber-300" />
                  <span>⚡ Issue Gateway Refund (₹{Number(order.total || 0).toLocaleString('en-IN')})</span>
                </button>
              )}

              {order.refundStatus === 'refunded' && (
                <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-[10px] font-mono flex items-center justify-between">
                  <span className="font-sans font-bold flex items-center gap-1 text-emerald-800">
                    <CheckCircle2 size={12} className="text-emerald-600" /> Gateway Refunded:
                  </span>
                  <span>{order.refundDetails?.gatewayRefundId}</span>
                </div>
              )}

              {/* View Full Order Button */}
              <button
                onClick={() => setSelectedOrder(order)}
                className="w-full py-2 border border-gray-200 text-gray-800 hover:bg-black hover:text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Eye size={13} />
                <span>View Full Commission Dossier</span>
              </button>
            </div>
          ))
        ) : (
          <div className="bg-white p-8 rounded-2xl border border-gray-200 text-center text-gray-400 text-xs">
            No orders found under &ldquo;{activeTab}&rdquo;.
          </div>
        )}
      </div>

      {/* Desktop Orders Table (Screen width >= 768px) */}
      <div className="hidden md:block bg-white rounded-3xl border border-gray-200/70 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50 text-gray-400 uppercase tracking-wider font-semibold">
                <th className="py-3.5 px-4">Order ID &amp; Date</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Items</th>
                <th className="py-3.5 px-4">Total (INR)</th>
                <th className="py-3.5 px-4">Payment &amp; COD Verification</th>
                <th className="py-3.5 px-4">Status &amp; Actions</th>
                <th className="py-3.5 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-gray-400">
                    Loading customer shipments and orders...
                  </td>
                </tr>
              ) : orders.length > 0 ? (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                    
                    {/* Order ID & Date */}
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-gray-900 block text-xs md:text-sm">
                        {order.id}
                      </span>
                      <span className="text-[11px] text-gray-400">
                        {new Date(order.createdAt).toLocaleDateString()} &bull; {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </td>

                    {/* Customer */}
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-gray-900 block">{order.customer?.name}</span>
                      <span className="text-[11px] text-gray-400 block">{order.customer?.phone}</span>
                      <span className="text-[10px] text-gray-400 truncate max-w-[150px] block">{order.customer?.city}, {order.customer?.state}</span>
                    </td>

                    {/* Items preview */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        {order.items?.slice(0, 2).map((item, idx) => (
                          <div key={idx} className="w-8 h-8 rounded-lg bg-gray-50 p-1 border border-gray-100 overflow-hidden flex-shrink-0" title={item.name}>
                            <img 
                              src={item.image || DEFAULT_PRODUCT_IMG} 
                              alt={item.name} 
                              onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = DEFAULT_PRODUCT_IMG; }}
                              className="w-full h-full object-contain mix-blend-multiply" 
                            />
                          </div>
                        ))}
                        <span className="text-[11px] text-gray-600 font-medium ml-1">
                          {order.items?.length || 1} item(s)
                        </span>
                      </div>
                    </td>

                    {/* Total in INR */}
                    <td className="py-3.5 px-4 font-bold text-gray-900 text-sm font-serif">
                      ₹{Number(order.total || 0).toLocaleString('en-IN')}
                    </td>

                    {/* Payment & COD Verification */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-gray-800 text-[11px]">{order.paymentMethod}</span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                            order.status === 'cancelled' || order.cancellationRequest?.status === 'approved'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : order.paymentStatus === 'Paid' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                          }`}>
                            {order.status === 'cancelled' || order.cancellationRequest?.status === 'approved' ? 'Voided' : order.paymentStatus}
                          </span>
                        </div>

                        {/* If UPI, show short UTR preview */}
                        {order.paymentDetails?.upiUtr && (
                          <div className="text-[10px] font-mono text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100 truncate max-w-[140px]" title={`UPI UTR: ${order.paymentDetails.upiUtr}`}>
                            UTR: {order.paymentDetails.upiUtr}
                          </div>
                        )}

                        {/* If Card, show network and last 4 */}
                        {order.paymentDetails?.cardLast4 && (
                          <div className="text-[10px] font-mono text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded truncate max-w-[140px]">
                            {order.paymentDetails.cardNetwork || 'Card'}: •••• {order.paymentDetails.cardLast4}
                          </div>
                        )}

                        {/* COD Collection Quick Toggle */}
                        {order.paymentMethod === 'Cash on Delivery' && (
                          <div className="pt-0.5">
                            {order.status === 'cancelled' || order.cancellationRequest?.status === 'approved' ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-gray-100 text-gray-500 text-[10px] font-semibold border border-gray-200">
                                <Ban size={10} className="text-gray-400" />
                                <span>COD Voided</span>
                              </span>
                            ) : (order.status === 'refunded' || order.refundStatus === 'refunded' || order.refundDetails?.status === 'refunded') ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 text-[10px] font-semibold border border-emerald-200">
                                <CheckCircle2 size={10} className="text-emerald-600" />
                                <span>COD Settled</span>
                              </span>
                            ) : order.codPaymentCollected ? (
                              <button
                                onClick={() => handleToggleCod(order.id, true)}
                                title="Click to change back to Pending Collection"
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-[10px] font-bold border border-emerald-300 transition-colors"
                              >
                                <Check size={11} className="text-emerald-700" />
                                <span>₹ Collected &amp; Verified</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => handleToggleCod(order.id, false)}
                                title="Click when courier confirms cash received"
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 text-[10px] font-bold border border-amber-300 transition-colors animate-pulse"
                              >
                                <Clock size={11} className="text-amber-700" />
                                <span>Pending Collection</span>
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Status Dropdown & Action Badges */}
                    <td className="py-3.5 px-4">
                      {order.status === 'cancelled' || order.cancellationRequest?.status === 'approved' ? (
                        isAwaitingWarehouseArrival(order) ? (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-[11px] font-bold uppercase tracking-wider">
                            <Truck size={13} className="text-amber-700 animate-pulse" />
                            <span>RTO In Transit</span>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-[11px] font-bold uppercase tracking-wider">
                            <Ban size={13} className="text-rose-600" />
                            <span>Cancelled &amp; Locked</span>
                          </div>
                        )
                      ) : (order.status === 'refunded' || order.refundStatus === 'refunded' || order.refundDetails?.status === 'refunded') ? (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-900 text-[11px] font-bold uppercase tracking-wider">
                          <CheckCircle2 size={13} className="text-emerald-700" />
                          <span>Refunded &amp; Closed</span>
                        </div>
                      ) : order.status === 'return_requested' ? (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-100 border border-amber-300 text-amber-900 text-[11px] font-bold uppercase tracking-wider">
                          <RotateCcw size={13} className="text-amber-700 animate-spin" />
                          <span>Return Requested</span>
                        </div>
                      ) : order.status === 'return_approved' ? (
                        isAwaitingWarehouseArrival(order) ? (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-100 border border-blue-300 text-blue-900 text-[11px] font-bold uppercase tracking-wider">
                            <Truck size={13} className="text-blue-700 animate-pulse" />
                            <span>Return In Transit</span>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-100 border border-indigo-300 text-indigo-900 text-[11px] font-bold uppercase tracking-wider">
                            <CheckCircle2 size={13} className="text-indigo-700" />
                            <span>Return Received &bull; Refund Ready</span>
                          </div>
                        )
                      ) : order.status === 'return_denied' ? (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-100 border border-neutral-300 text-neutral-800 text-[11px] font-bold uppercase tracking-wider">
                          <XCircle size={13} className="text-neutral-600" />
                          <span>Return Denied</span>
                        </div>
                      ) : order.status === 'delivered' ? (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-900 text-[11px] font-bold uppercase tracking-wider">
                          <CheckCircle2 size={13} className="text-emerald-700" />
                          <span>Delivered &amp; Finalized</span>
                        </div>
                      ) : (
                        <select
                          value={order.status}
                          disabled={updatingId === order.id}
                          onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                          className={`text-[11px] font-bold uppercase tracking-wider rounded-xl px-2.5 py-1 border outline-none cursor-pointer ${getStatusBadge(order.status)}`}
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancel Order</option>
                        </select>
                      )}

                      {/* Pending Return Request Alert in Table Row */}
                      {order.returnRequest && order.returnRequest?.status === 'pending' && (
                        <div className="mt-2 p-2.5 rounded-xl bg-purple-50 border border-purple-200 text-purple-950 space-y-1.5 shadow-sm">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-[10px] uppercase text-purple-900 flex items-center gap-1">
                              <RotateCcw size={11} className="text-purple-700" /> Return Claim
                            </span>
                            {order.returnRequest.photos?.length > 0 && (
                              <span className="text-[9px] font-bold text-purple-700 bg-purple-200/70 px-1.5 py-0.2 rounded-full flex items-center gap-0.5">
                                <Camera size={10} /> {order.returnRequest.photos.length} photo(s)
                              </span>
                            )}
                          </div>
                          
                          <p className="text-[10px] text-gray-700 italic truncate max-w-[150px]" title={order.returnRequest.reason}>
                            {order.returnRequest.reason}
                          </p>

                          {/* Photo Thumbnails Preview */}
                          {order.returnRequest.photos?.length > 0 && (
                            <div className="flex items-center gap-1 pt-0.5">
                              {order.returnRequest.photos.slice(0, 3).map((ph, pIdx) => (
                                <button
                                  key={pIdx}
                                  type="button"
                                  onClick={() => setInspectingPhoto(ph)}
                                  className="w-6 h-6 rounded border border-purple-300 overflow-hidden relative group"
                                  title="Click to zoom inspect"
                                >
                                  <img 
                                    src={ph || DEFAULT_DEFECT_IMG} 
                                    alt="Defect" 
                                    onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = DEFAULT_DEFECT_IMG; }}
                                    className="w-full h-full object-cover" 
                                  />
                                </button>
                              ))}
                            </div>
                          )}

                          <div className="flex items-center gap-1.5 pt-1">
                            <button
                              disabled={reviewLoading}
                              onClick={() => handleApproveReturn(order.id)}
                              className="px-2 py-0.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-[9px] font-bold uppercase transition-colors"
                              title="Approve return, restore stock & generate pickup"
                            >
                              Approve
                            </button>
                            <button
                              disabled={reviewLoading}
                              onClick={() => setReviewingReturnOrder(order)}
                              className="px-2 py-0.5 rounded-md bg-rose-600 hover:bg-rose-700 text-white text-[9px] font-bold uppercase transition-colors"
                              title="Deny return claim with explanation"
                            >
                              Deny
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Refund Status in Table Row */}
                      {order.refundStatus === 'refunded' && (
                        <div className="mt-1.5 p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-0.5">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-[10px] uppercase flex items-center gap-1 text-emerald-800">
                              <Zap size={11} className="text-emerald-600" /> Gateway Refunded
                            </span>
                            <span className="text-[10px] font-bold font-serif">₹{Number(order.refundDetails?.amount || order.total).toLocaleString('en-IN')}</span>
                          </div>
                          <span className="font-mono text-[9px] text-emerald-700 block truncate" title={order.refundDetails?.gatewayRefundId}>
                            Ref: {order.refundDetails?.gatewayRefundId}
                          </span>
                        </div>
                      )}

                      {order.refundStatus === 'pending_gateway_refund' && order.status !== 'refunded' && (
                        <div className="mt-1.5">
                          <button
                            type="button"
                            onClick={() => setRefundingOrder(order)}
                            className="w-full px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold uppercase flex items-center justify-center gap-1 shadow-sm transition-colors"
                            title="Process instant payment gateway refund"
                          >
                            <Zap size={11} className="text-amber-300 animate-pulse" />
                            <span>Issue Gateway Refund</span>
                          </button>
                        </div>
                      )}

                      {/* Pending Cancellation Alert in Table Row */}
                      {order.cancellationRequested && order.cancellationRequest?.status === 'pending' && (
                        <div className="mt-1.5 p-2 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 space-y-1">
                          <div className="flex items-center gap-1 font-bold text-[10px] uppercase text-amber-800">
                            <AlertTriangle size={11} className="text-amber-600 animate-pulse" />
                            <span>Cancel Requested</span>
                          </div>
                          <p className="text-[10px] text-gray-700 italic truncate max-w-[140px]" title={order.cancellationRequest.reason}>
                            &ldquo;{order.cancellationRequest.reason}&rdquo;
                          </p>
                          <div className="flex items-center gap-1.5 pt-0.5">
                            <button
                              disabled={reviewLoading}
                              onClick={() => handleApproveCancellation(order.id)}
                              className="px-2 py-0.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-[9px] font-bold uppercase transition-colors"
                              title="Approve cancellation and restore stock"
                            >
                              Approve
                            </button>
                            <button
                              disabled={reviewLoading}
                              onClick={() => setReviewingOrder(order)}
                              className="px-2 py-0.5 rounded-md bg-rose-600 hover:bg-rose-700 text-white text-[9px] font-bold uppercase transition-colors"
                              title="Deny cancellation request with reason"
                            >
                              Deny
                            </button>
                          </div>
                        </div>
                      )}

                      {order.status === 'cancelled' && order.cancellationReason && (
                        <span className="block text-[10px] text-rose-500 font-medium mt-1 truncate max-w-[140px]" title={order.cancellationReason}>
                          Reason: {order.cancellationReason}
                        </span>
                      )}

                      {order.cancellationRequest?.status === 'denied' && order.status !== 'cancelled' && (
                        <span className="block text-[10px] text-amber-700 font-medium mt-1 truncate max-w-[140px]" title={`Denied: ${order.cancellationRequest?.denialReason}`}>
                          Cancel Denied: {order.cancellationRequest?.denialReason}
                        </span>
                      )}
                    </td>

                    {/* Action Button */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="px-3 py-1.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-black hover:text-white transition-all text-xs font-semibold inline-flex items-center gap-1"
                      >
                        <Eye size={13} /> View
                      </button>
                    </td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-gray-400">
                    No customer orders found under &ldquo;{activeTab}&rdquo;.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ORDER DETAILS MODAL / DRAWER */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-3xl bg-white rounded-3xl p-6 md:p-8 shadow-2xl border border-gray-200 max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif text-2xl font-bold text-gray-900">
                      Order {selectedOrder.id}
                    </h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusBadge(selectedOrder.status)}`}>
                      {selectedOrder.status}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400">
                    Created on {new Date(selectedOrder.createdAt).toLocaleString()}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-black"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-6 text-xs">
                
                {/* RETURN INSPECTION DOSSIER BANNER */}
                {selectedOrder.returnRequest && (
                  <div className={`p-5 rounded-2xl border-2 space-y-4 shadow-sm ${
                    selectedOrder.returnRequest.status === 'pending'
                      ? 'bg-purple-50 border-purple-300 text-purple-950'
                      : selectedOrder.returnRequest.status === 'approved'
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                      : 'bg-neutral-100 border-neutral-300 text-neutral-900'
                  }`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold flex-shrink-0 shadow ${
                          selectedOrder.returnRequest.status === 'pending'
                            ? 'bg-purple-600 text-white'
                            : selectedOrder.returnRequest.status === 'approved'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-neutral-700 text-white'
                        }`}>
                          <RotateCcw size={20} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-sm">Customer Return &amp; Inspection Claim</h4>
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                              selectedOrder.returnRequest.status === 'pending'
                                ? 'bg-purple-200 text-purple-900'
                                : selectedOrder.returnRequest.status === 'approved'
                                ? 'bg-emerald-200 text-emerald-900'
                                : 'bg-neutral-200 text-neutral-800'
                            }`}>
                              {selectedOrder.returnRequest.status}
                            </span>
                          </div>
                          <p className="text-xs opacity-75 mt-0.5">
                            Submitted on {selectedOrder.returnRequest.requestedAt ? new Date(selectedOrder.returnRequest.requestedAt).toLocaleString() : 'recently'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="p-3 bg-white/90 rounded-xl border border-purple-200 text-xs">
                        <span className="font-bold text-purple-900 block mb-0.5">Reported Optical Issue:</span>
                        <p className="text-gray-900 font-semibold">{selectedOrder.returnRequest.reason}</p>
                      </div>
                      <div className="p-3 bg-white/90 rounded-xl border border-purple-200 text-xs">
                        <span className="font-bold text-purple-900 block mb-0.5">Customer Description:</span>
                        <p className="text-gray-800 leading-relaxed italic">{selectedOrder.returnRequest.description}</p>
                      </div>
                    </div>

                    {/* Defect Inspection Photos Gallery */}
                    {selectedOrder.returnRequest.photos?.length > 0 && (
                      <div className="p-3 bg-white/90 rounded-xl border border-purple-200 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-purple-900 text-xs flex items-center gap-1.5">
                            <Camera size={14} /> Mandatory Optical Defect Inspection Photos ({selectedOrder.returnRequest.photos.length})
                          </span>
                          <span className="text-[10px] text-gray-500 font-medium">Click thumbnail to expand</span>
                        </div>
                        <div className="flex items-center gap-3 overflow-x-auto pb-1">
                          {selectedOrder.returnRequest.photos.map((photoUrl, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setInspectingPhoto(photoUrl)}
                              className="w-20 h-20 rounded-xl border-2 border-purple-200 hover:border-purple-600 overflow-hidden relative group flex-shrink-0 transition-all shadow-sm"
                            >
                              <img 
                                src={photoUrl || DEFAULT_DEFECT_IMG} 
                                alt={`Defect inspection ${idx + 1}`} 
                                onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = DEFAULT_DEFECT_IMG; }}
                                className="w-full h-full object-cover" 
                              />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                                <ZoomIn size={18} />
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Return Action Buttons if Pending */}
                    {selectedOrder.returnRequest.status === 'pending' && (
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between pt-2 border-t border-purple-200 gap-3">
                        <span className="text-[11px] text-purple-900 font-medium">
                          Evaluate inspection photos to approve restock pickup or issue a detailed denial.
                        </span>
                        <div className="flex items-center gap-2 self-end sm:self-auto">
                          <button
                            type="button"
                            disabled={reviewLoading}
                            onClick={() => setReviewingReturnOrder(selectedOrder)}
                            className="px-4 py-2 bg-white border border-rose-300 text-rose-700 hover:bg-rose-50 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors shadow-sm disabled:opacity-50"
                          >
                            <Ban size={14} /> Deny Claim
                          </button>
                          <button
                            type="button"
                            disabled={reviewLoading}
                            onClick={() => handleApproveReturn(selectedOrder.id)}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors shadow-sm disabled:opacity-50"
                          >
                            <CheckCircle2 size={14} /> Approve Return &amp; Restock
                          </button>
                        </div>
                      </div>
                    )}

                    {/* If Return Approved or Denied Banner */}
                    {selectedOrder.returnRequest.status === 'approved' && (
                      <div className="text-xs text-emerald-800 font-medium pt-1">
                        ✓ Return approved on {new Date(selectedOrder.returnRequest.resolvedAt || selectedOrder.returnRequest.reviewedAt || Date.now()).toLocaleString()}. Reverse courier consignment: <strong className="font-mono">{selectedOrder.returnRequest.returnTrackingNumber || 'RET-EXP-8891'}</strong>
                      </div>
                    )}
                    {selectedOrder.returnRequest.status === 'denied' && (
                      <div className="text-xs text-neutral-700 font-medium pt-1">
                        ✕ Return claim denied: "{selectedOrder.returnRequest.denialReason}"
                      </div>
                    )}
                  </div>
                )}

                {/* INBOUND RETURN SHIPMENT MONITOR ("KEEP AN EYE ON TRANSIT BACK TO WAREHOUSE") */}
                {((selectedOrder.returnRequest && selectedOrder.returnRequest.status === 'approved') || 
                  (selectedOrder.cancellationRequest && selectedOrder.cancellationRequest.status === 'approved' && selectedOrder.cancellationRequest.wasDispatched)) && (
                  <div className={`p-5 rounded-2xl border-2 space-y-4 shadow-sm ${
                    (selectedOrder.returnRequest?.receivedAtWarehouse || selectedOrder.cancellationRequest?.receivedAtWarehouse)
                      ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
                      : 'bg-blue-50/80 border-blue-300 text-blue-950'
                  }`}>
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold flex-shrink-0 shadow ${
                          (selectedOrder.returnRequest?.receivedAtWarehouse || selectedOrder.cancellationRequest?.receivedAtWarehouse)
                            ? 'bg-emerald-600 text-white'
                            : 'bg-blue-600 text-white'
                        }`}>
                          <Truck size={22} className={!(selectedOrder.returnRequest?.receivedAtWarehouse || selectedOrder.cancellationRequest?.receivedAtWarehouse) ? 'animate-pulse' : ''} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-bold text-sm">
                              {(selectedOrder.returnRequest?.receivedAtWarehouse || selectedOrder.cancellationRequest?.receivedAtWarehouse)
                                ? 'Inbound Return Delivered & Verified at Warehouse'
                                : 'Inbound Return Transit Monitor • BlueDart Reverse Logistics'}
                            </h4>
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                              (selectedOrder.returnRequest?.receivedAtWarehouse || selectedOrder.cancellationRequest?.receivedAtWarehouse)
                                ? 'bg-emerald-200 text-emerald-900 border border-emerald-300'
                                : 'bg-blue-200 text-blue-900 border border-blue-300 animate-pulse'
                            }`}>
                              {(selectedOrder.returnRequest?.receivedAtWarehouse || selectedOrder.cancellationRequest?.receivedAtWarehouse)
                                ? 'Received & Inspected'
                                : 'En Route to Warehouse'}
                            </span>
                          </div>
                          <p className="text-xs opacity-80 mt-0.5">
                            {(selectedOrder.returnRequest?.receivedAtWarehouse || selectedOrder.cancellationRequest?.receivedAtWarehouse)
                              ? `Merchandise arrived at Central Optics Facility on ${new Date(selectedOrder.returnRequest?.receivedAtWarehouseTime || selectedOrder.cancellationRequest?.receivedAtWarehouseTime || Date.now()).toLocaleString()}. Optical condition verified.`
                              : 'Keep an eye on return consignment. Payment gateway refund is held until the package arrives at the warehouse.'}
                          </p>
                        </div>
                      </div>

                      {/* Confirm Receipt Action Button */}
                      {!(selectedOrder.returnRequest?.receivedAtWarehouse || selectedOrder.cancellationRequest?.receivedAtWarehouse) && (
                        <button
                          type="button"
                          disabled={reviewLoading}
                          onClick={() => handleConfirmReturnReceived(selectedOrder.id)}
                          className="px-4 py-2.5 bg-blue-700 hover:bg-blue-800 active:scale-95 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-md transition-all self-start sm:self-auto disabled:opacity-50"
                        >
                          <Package size={15} />
                          <span>📦 Confirm Received at Warehouse</span>
                        </button>
                      )}
                    </div>

                    {/* Consignment Metrics Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div className="p-3 bg-white/95 rounded-xl border border-blue-200/80 space-y-0.5">
                        <span className="text-[10px] uppercase font-bold text-gray-500 block">Reverse Consignment AWB</span>
                        <span className="font-mono font-bold text-blue-900 text-xs">
                          {selectedOrder.returnRequest?.returnAwb || selectedOrder.returnRequest?.returnTrackingNumber || selectedOrder.cancellationRequest?.returnAwb || 'RET-BD-982341'}
                        </span>
                        <span className="text-[10px] text-gray-500 block">BlueDart Reverse Air Express</span>
                      </div>

                      <div className="p-3 bg-white/95 rounded-xl border border-blue-200/80 space-y-0.5">
                        <span className="text-[10px] uppercase font-bold text-gray-500 block">Transit Route</span>
                        <span className="font-bold text-gray-900 text-xs block truncate">
                          {selectedOrder.customer?.city || 'Origin'} ➔ Bengaluru Central Hub
                        </span>
                        <span className="text-[10px] text-gray-500 block">Optical Inspection Facility</span>
                      </div>

                      <div className="p-3 bg-white/95 rounded-xl border border-blue-200/80 space-y-0.5">
                        <span className="text-[10px] uppercase font-bold text-gray-500 block">Refund Safeguard</span>
                        <div className="flex items-center gap-1.5">
                          {(selectedOrder.returnRequest?.receivedAtWarehouse || selectedOrder.cancellationRequest?.receivedAtWarehouse) ? (
                            <span className="text-emerald-700 font-bold text-xs flex items-center gap-1">
                              <CheckCircle2 size={13} /> Refund Authorized
                            </span>
                          ) : (
                            <span className="text-amber-800 font-bold text-xs flex items-center gap-1">
                              <Lock size={12} /> Held (Awaiting Arrival)
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-gray-500 block">
                          {(selectedOrder.returnRequest?.receivedAtWarehouse || selectedOrder.cancellationRequest?.receivedAtWarehouse) ? 'Gateway refund button unlocked' : 'Unlocks upon warehouse scan'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* ACTION REQUIRED: PENDING CANCELLATION REQUEST BANNER */}
                {selectedOrder.cancellationRequested && selectedOrder.cancellationRequest?.status === 'pending' && (
                  <div className="p-5 rounded-2xl bg-amber-50 border-2 border-amber-400 text-amber-950 space-y-3 shadow-md">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold flex-shrink-0 shadow">
                          <AlertTriangle size={20} className="animate-pulse" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-sm text-amber-900">Customer Requested Cancellation</h4>
                            <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 text-[10px] font-bold uppercase tracking-wider">
                              Action Required
                            </span>
                          </div>
                          <p className="text-xs text-amber-800 mt-0.5">
                            Submitted on {selectedOrder.cancellationRequest?.requestedAt ? new Date(selectedOrder.cancellationRequest.requestedAt).toLocaleString() : 'recently'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 bg-white/90 rounded-xl border border-amber-200 text-xs">
                      <span className="font-bold text-amber-900 block mb-0.5">Customer's Stated Reason:</span>
                      <p className="text-gray-900 font-medium italic">"{selectedOrder.cancellationRequest?.reason}"</p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between pt-2 border-t border-amber-200/80 gap-3">
                      <span className="text-[11px] text-amber-800">
                        Select an action to resolve this cancellation request:
                      </span>
                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        <button
                          type="button"
                          disabled={reviewLoading}
                          onClick={() => setReviewingOrder(selectedOrder)}
                          className="px-4 py-2 bg-white border border-rose-300 text-rose-700 hover:bg-rose-50 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors shadow-sm disabled:opacity-50"
                        >
                          <Ban size={14} /> Deny Request
                        </button>
                        <button
                          type="button"
                          disabled={reviewLoading}
                          onClick={() => handleApproveCancellation(selectedOrder.id)}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors shadow-sm disabled:opacity-50"
                        >
                          <CheckCircle2 size={14} /> Approve Cancellation
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* PREVIOUS CANCELLATION DENIAL NOTICE */}
                {selectedOrder.cancellationRequest?.status === 'denied' && selectedOrder.status !== 'cancelled' && (
                  <div className="p-4 rounded-2xl bg-neutral-100 border border-neutral-300 text-neutral-800 text-xs space-y-1">
                    <div className="flex items-center gap-2 font-bold text-neutral-900">
                      <ShieldAlert size={16} className="text-amber-600" />
                      <span>Previous Customer Cancellation Request Was Denied</span>
                    </div>
                    <p className="text-neutral-700">
                      <span className="font-semibold">Reason Sent to Customer:</span> "{selectedOrder.cancellationRequest?.denialReason}"
                    </p>
                    <p className="text-[10px] text-neutral-500">
                      Denied on {selectedOrder.cancellationRequest?.deniedAt ? new Date(selectedOrder.cancellationRequest.deniedAt).toLocaleString() : 'recently'} &bull; Order preserved in active fulfillment.
                    </p>
                  </div>
                )}

                {/* Status Updater or Cancelled/Delivered/Refunded Lock Banner */}
                {selectedOrder.status === 'cancelled' || selectedOrder.cancellationRequest?.status === 'approved' ? (
                  <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold flex-shrink-0 shadow-sm">
                        <Ban size={20} />
                      </div>
                      <div>
                        <span className="font-bold text-xs uppercase tracking-wider block text-rose-950">Fulfillment Lifecycle Locked</span>
                        <span className="text-[11px] text-rose-800">This commission is permanently cancelled. Inventory has been restored and no further status transitions can be performed.</span>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-rose-200/80 text-rose-900 border border-rose-300 rounded-full text-[10px] font-extrabold uppercase tracking-widest self-start sm:self-auto">
                      Locked
                    </span>
                  </div>
                ) : (selectedOrder.status === 'refunded' || selectedOrder.refundStatus === 'refunded' || selectedOrder.refundDetails?.status === 'refunded') ? (
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold flex-shrink-0 shadow-sm">
                        <IndianRupee size={20} />
                      </div>
                      <div>
                        <span className="font-bold text-xs uppercase tracking-wider block text-emerald-950">Refund Issued &amp; Commission Permanently Closed</span>
                        <span className="text-[11px] text-emerald-800">
                          Payment gateway refund of ₹{Number(selectedOrder.refundDetails?.amount || selectedOrder.total).toLocaleString('en-IN')} has been settled. All order fulfillment processes are permanently closed and locked.
                        </span>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-emerald-200 text-emerald-900 border border-emerald-300 rounded-full text-[10px] font-extrabold uppercase tracking-widest self-start sm:self-auto">
                      Closed &bull; Locked
                    </span>
                  </div>
                ) : selectedOrder.status === 'delivered' ? (
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold flex-shrink-0 shadow-sm">
                        <CheckCircle2 size={20} />
                      </div>
                      <div>
                        <span className="font-bold text-xs uppercase tracking-wider block text-emerald-950">Consignment Delivered &amp; Finalized</span>
                        <span className="text-[11px] text-emerald-800">This commission has been securely delivered to the customer. Status transitions are permanently locked unless the customer submits an optical return or replacement claim.</span>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-emerald-200 text-emerald-900 border border-emerald-300 rounded-full text-[10px] font-extrabold uppercase tracking-widest self-start sm:self-auto">
                      Finalized
                    </span>
                  </div>
                ) : selectedOrder.status === 'return_denied' ? (
                  <div className="p-4 rounded-2xl bg-neutral-100 border border-neutral-300 text-neutral-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-neutral-600 text-white flex items-center justify-center font-bold flex-shrink-0 shadow-sm">
                        <XCircle size={20} />
                      </div>
                      <div>
                        <span className="font-bold text-xs uppercase tracking-wider block text-neutral-950">Return Denied &amp; Closed</span>
                        <span className="text-[11px] text-neutral-700">Return inspection claim was denied. Order remains finalized.</span>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-neutral-200 text-neutral-900 border border-neutral-300 rounded-full text-[10px] font-extrabold uppercase tracking-widest self-start sm:self-auto">
                      Closed
                    </span>
                  </div>
                ) : (
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <span className="font-bold text-gray-900 block text-xs mb-0.5">Update Fulfillment Status</span>
                      <span className="text-[11px] text-gray-400">Updates live customer order tracking timeline immediately.</span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {['pending', 'processing', 'shipped', 'delivered'].map((st) => (
                        <button
                          key={st}
                          onClick={() => handleUpdateStatus(selectedOrder.id, st)}
                          className={`px-3 py-1.5 rounded-xl font-bold uppercase text-[10px] tracking-wider transition-all ${
                            selectedOrder.status === st
                              ? 'bg-black text-white shadow-sm'
                              : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                      <button
                        onClick={() => handleUpdateStatus(selectedOrder.id, 'cancelled')}
                        className="px-3 py-1.5 rounded-xl font-bold uppercase text-[10px] tracking-wider bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition-all"
                      >
                        Cancel Order
                      </button>
                    </div>
                  </div>
                )}

                {/* CASH ON DELIVERY VERIFICATION & AUDIT CARD */}
                {selectedOrder.paymentMethod === 'Cash on Delivery' && (
                  (selectedOrder.status === 'cancelled' || selectedOrder.cancellationRequest?.status === 'approved') ? (
                    <div className="p-4 rounded-2xl border border-gray-200 bg-gray-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gray-200 text-gray-500 flex items-center justify-center font-bold flex-shrink-0">
                          <Ban size={20} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-gray-800 text-xs">Cash on Delivery Reconciliation</h4>
                            <span className="px-2 py-0.2 rounded-full text-[10px] font-extrabold uppercase bg-rose-100 text-rose-800 border border-rose-200">
                              Cancelled &bull; No Cash Due
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-500 mt-0.5">
                            This order was cancelled. Doorstep cash collection is voided and permanently locked.
                          </p>
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-gray-200 text-gray-600 rounded-full text-[10px] font-extrabold uppercase tracking-wider self-start sm:self-auto">
                        Voided
                      </span>
                    </div>
                  ) : (selectedOrder.status === 'refunded' || selectedOrder.refundStatus === 'refunded' || selectedOrder.refundDetails?.status === 'refunded') ? (
                    <div className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold flex-shrink-0">
                          <CheckCircle2 size={20} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-emerald-950 text-xs">Cash on Delivery Reconciliation</h4>
                            <span className="px-2 py-0.2 rounded-full text-[10px] font-extrabold uppercase bg-emerald-200 text-emerald-900 border border-emerald-300">
                              Refund Settled &bull; Closed
                            </span>
                          </div>
                          <p className="text-[11px] text-emerald-800 mt-0.5">
                            Customer refund has been processed. Cash collection audit is finalized and closed.
                          </p>
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-emerald-200 text-emerald-900 rounded-full text-[10px] font-extrabold uppercase tracking-wider self-start sm:self-auto">
                        Settled
                      </span>
                    </div>
                  ) : (
                    <div className="p-4 rounded-2xl border border-amber-200 bg-amber-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold flex-shrink-0 ${
                          selectedOrder.codPaymentCollected ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-white'
                        }`}>
                          <IndianRupee size={20} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-gray-900 text-xs">Cash on Delivery Reconciliation</h4>
                            <span className={`px-2 py-0.2 rounded-full text-[10px] font-extrabold uppercase ${
                              selectedOrder.codPaymentCollected ? 'bg-emerald-200 text-emerald-900' : 'bg-amber-200 text-amber-900'
                            }`}>
                              {selectedOrder.codPaymentCollected ? 'Payment Received' : 'Awaiting Cash at Doorstep'}
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-600 mt-0.5">
                            {selectedOrder.codPaymentCollected
                              ? 'The delivery partner has deposited and verified customer cash payment.'
                              : `Courier must collect ₹${Number(selectedOrder.total || 0).toLocaleString('en-IN')} upon delivery handover.`}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleToggleCod(selectedOrder.id, selectedOrder.codPaymentCollected)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors shadow-sm ${
                          selectedOrder.codPaymentCollected
                            ? 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        }`}
                      >
                        {selectedOrder.codPaymentCollected ? 'Mark as Uncollected' : '✓ Confirm Cash Collected'}
                      </button>
                    </div>
                  )
                )}

                {/* PAYMENT GATEWAY REFUND STATION */}
                {(selectedOrder.refundDetails || selectedOrder.refundStatus === 'pending_gateway_refund' || selectedOrder.status === 'return_approved' || selectedOrder.status === 'refunded') && (
                  <div className={`p-5 rounded-2xl border-2 space-y-4 shadow-sm ${
                    selectedOrder.status === 'refunded' || selectedOrder.refundStatus === 'refunded'
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                      : 'bg-indigo-50 border-indigo-300 text-indigo-950'
                  }`}>
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold flex-shrink-0 shadow ${
                          selectedOrder.status === 'refunded' || selectedOrder.refundStatus === 'refunded'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-indigo-600 text-white'
                        }`}>
                          <Zap size={20} className={selectedOrder.status === 'refunded' ? '' : 'animate-pulse'} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-sm">
                              {selectedOrder.status === 'refunded' || selectedOrder.refundStatus === 'refunded'
                                ? 'Payment Gateway Refund Settled & Audited'
                                : 'Payment Gateway Refund Station'}
                            </h4>
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                              selectedOrder.status === 'refunded' || selectedOrder.refundStatus === 'refunded'
                                ? 'bg-emerald-200 text-emerald-900'
                                : isAwaitingWarehouseArrival(selectedOrder) && isPrepaidOrder(selectedOrder)
                                ? 'bg-amber-200 text-amber-900 border border-amber-300'
                                : 'bg-indigo-200 text-indigo-900'
                            }`}>
                              {selectedOrder.status === 'refunded' || selectedOrder.refundStatus === 'refunded'
                                ? 'Settled'
                                : isAwaitingWarehouseArrival(selectedOrder) && isPrepaidOrder(selectedOrder)
                                ? 'Held (Awaiting Arrival)'
                                : 'Awaiting Reversal'}
                            </span>
                          </div>
                          <p className="text-xs opacity-75 mt-0.5">
                            {selectedOrder.status === 'refunded' || selectedOrder.refundStatus === 'refunded'
                              ? `Funds remitted via ${selectedOrder.refundDetails?.gatewayProvider || 'Payment Gateway'} on ${selectedOrder.refundDetails?.refundedAt ? new Date(selectedOrder.refundDetails.refundedAt).toLocaleString() : 'recently'}`
                              : isAwaitingWarehouseArrival(selectedOrder) && isPrepaidOrder(selectedOrder)
                              ? 'Refund option is locked while item is in return transit. Confirm warehouse receipt above to authorize reversal.'
                              : 'Ready for automated reversal via payment gateway connection'}
                          </p>
                        </div>
                      </div>

                      {(selectedOrder.status !== 'refunded' && selectedOrder.refundStatus !== 'refunded') && (
                        isAwaitingWarehouseArrival(selectedOrder) && isPrepaidOrder(selectedOrder) ? (
                          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-100/90 border border-amber-300 text-amber-900 text-xs font-bold self-start sm:self-auto shadow-sm">
                            <Lock size={14} className="text-amber-700 flex-shrink-0" />
                            <span>Refund Locked (Awaiting Warehouse Receipt)</span>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setRefundingOrder(selectedOrder)}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold uppercase rounded-xl tracking-wider flex items-center gap-1.5 shadow transition-colors self-start sm:self-auto animate-pulse"
                          >
                            <Zap size={14} className="text-amber-300" />
                            <span>⚡ Process Gateway Refund (₹{Number(selectedOrder.total || 0).toLocaleString('en-IN')})</span>
                          </button>
                        )
                      )}
                    </div>

                    {/* Refund Routing Breakdown */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="p-3 bg-white/90 rounded-xl border border-gray-200 text-xs space-y-1">
                        <span className="font-bold text-gray-500 uppercase text-[10px] block">Target Destination</span>
                        <div className="font-bold text-gray-900 flex items-center gap-1.5">
                          {selectedOrder.paymentMethod === 'Cash on Delivery' ? (
                            <Wallet size={14} className="text-purple-600" />
                          ) : selectedOrder.paymentMethod === 'UPI' ? (
                            <Smartphone size={14} className="text-indigo-600" />
                          ) : (
                            <CreditCard size={14} className="text-blue-600" />
                          )}
                          <span>
                            {selectedOrder.refundDetails?.destination || (
                              selectedOrder.paymentMethod === 'Cash on Delivery'
                                ? 'COD Customer Designated Account'
                                : `Original ${selectedOrder.paymentMethod} Payment Source`
                            )}
                          </span>
                        </div>
                        {selectedOrder.paymentMethod !== 'Cash on Delivery' ? (
                          <span className="text-[10px] text-emerald-700 font-medium flex items-center gap-1">
                            <Lock size={10} /> Auto-routed to originating account per RBI guidelines
                          </span>
                        ) : (
                          <span className="text-[10px] text-gray-500">Customer verified payout destination</span>
                        )}
                      </div>

                      <div className="p-3 bg-white/90 rounded-xl border border-gray-200 text-xs space-y-1">
                        <span className="font-bold text-gray-500 uppercase text-[10px] block">Gateway Reversal Amount</span>
                        <div className="text-base font-bold text-gray-900 font-serif">
                          ₹{Number(selectedOrder.refundDetails?.amount || selectedOrder.total || 0).toLocaleString('en-IN')}
                        </div>
                        <span className="text-[10px] text-gray-500">100% Full Commission Reversal &bull; Zero cancellation fee</span>
                      </div>
                    </div>

                    {/* If settled: Gateway Reference & Audit Trail */}
                    {(selectedOrder.status === 'refunded' || selectedOrder.refundStatus === 'refunded') && (
                      <div className="p-3 bg-white/90 rounded-xl border border-emerald-200 space-y-2">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px]">
                          <span className="text-gray-600">
                            <strong>Gateway Provider:</strong> {selectedOrder.refundDetails?.gatewayProvider || 'Razorpay Instant Payouts'}
                          </span>
                          <span className="font-mono text-emerald-800 font-bold bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                            ID: {selectedOrder.refundDetails?.gatewayRefundId}
                          </span>
                        </div>
                        {selectedOrder.refundDetails?.notes && (
                          <p className="text-[11px] text-gray-700 italic border-t border-emerald-100 pt-1.5">
                            Audit Notes: {selectedOrder.refundDetails.notes}
                          </p>
                        )}
                        <div className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1 pt-0.5">
                          <CheckCircle2 size={12} /> Webhook status: 200 OK (Payment Gateway Settlement Confirmed)
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Customer Information */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                    <span className="font-bold text-gray-900 block text-xs uppercase tracking-wider mb-2">
                      Customer Profile
                    </span>
                    <p className="font-bold text-black text-sm mb-1">{selectedOrder.customer?.name}</p>
                    <p className="text-gray-500 flex items-center gap-1.5 mb-1"><Phone size={13} /> {selectedOrder.customer?.phone}</p>
                    <p className="text-gray-500 flex items-center gap-1.5"><Mail size={13} /> {selectedOrder.customer?.email || 'No email provided'}</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                    <span className="font-bold text-gray-900 block text-xs uppercase tracking-wider mb-2">
                      Delivery Address
                    </span>
                    <p className="text-gray-700 leading-relaxed">
                      {selectedOrder.customer?.address}<br />
                      {selectedOrder.customer?.city}, {selectedOrder.customer?.state} - {selectedOrder.customer?.pincode}
                    </p>
                    <span className="inline-block mt-2 px-2.5 py-1 bg-white border border-gray-200 rounded-lg text-[10px] font-mono text-gray-600">
                      Tracking #: {selectedOrder.trackingNumber}
                    </span>
                  </div>
                </div>

                {/* Itemized Products */}
                <div>
                  <span className="font-bold text-gray-900 block text-xs uppercase tracking-wider mb-3">
                    Purchased Eyewear ({selectedOrder.items?.length || 1})
                  </span>
                  <div className="space-y-2">
                    {selectedOrder.items?.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 border border-gray-100">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-white p-1 border border-gray-200/60 overflow-hidden flex-shrink-0 flex items-center justify-center">
                            <img 
                              src={item.image || DEFAULT_PRODUCT_IMG} 
                              alt={item.name} 
                              onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = DEFAULT_PRODUCT_IMG; }}
                              className="w-full h-full object-contain mix-blend-multiply" 
                            />
                          </div>
                          <div>
                            <span className="font-bold text-gray-900 block text-xs">{item.name}</span>
                            {item.lensDetails && (
                              <div className="mt-0.5 text-[10px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                                <strong>Lens:</strong> {item.lensDetails.lensPackage} &bull; <strong>Prescription:</strong> {item.lensDetails.prescriptionMethod}
                              </div>
                            )}
                            <span className="text-gray-400 text-[11px] block mt-0.5">
                              Qty: {item.quantity} &bull; ₹{Number(item.price).toLocaleString('en-IN')} each
                            </span>
                          </div>
                        </div>
                        <span className="font-bold text-gray-900 text-xs font-serif">
                          ₹{Number(item.price * item.quantity).toLocaleString('en-IN')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Financial & Transaction Breakdown */}
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-2">
                  <div className="flex justify-between text-gray-500">
                    <span>Subtotal</span>
                    <span>₹{Number(selectedOrder.subtotal || 0).toLocaleString('en-IN')}</span>
                  </div>
                  {selectedOrder.discount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-medium">
                      <span>Discount Applied</span>
                      <span>-₹{Number(selectedOrder.discount || 0).toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-500">
                    <span>Express Shipping</span>
                    <span>{selectedOrder.shipping === 0 ? 'FREE' : `₹${Number(selectedOrder.shipping).toLocaleString('en-IN')}`}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-black pt-2 border-t border-gray-200">
                    <span>Total Amount</span>
                    <span className="font-serif">₹{Number(selectedOrder.total || 0).toLocaleString('en-IN')}</span>
                  </div>
                  
                  {/* TRANSACTION AUDIT SECTION */}
                  <div className="pt-3 border-t border-gray-200 text-xs space-y-1">
                    <span className="font-bold text-gray-800 block text-[11px] uppercase tracking-wider">
                      Transaction &amp; Gateway Audit
                    </span>
                    <div className="flex items-center justify-between text-gray-600">
                      <span>Payment Method:</span>
                      <strong className="text-gray-900">{selectedOrder.paymentMethod}</strong>
                    </div>
                    <div className="flex items-center justify-between text-gray-600">
                      <span>Payment Status:</span>
                      <strong className={selectedOrder.paymentStatus === 'Paid' ? 'text-emerald-600' : 'text-amber-600'}>
                        {selectedOrder.paymentStatus}
                      </strong>
                    </div>

                    {/* Detailed UPI Details */}
                    {selectedOrder.paymentDetails?.upiUtr && (
                      <div className="mt-2 p-2.5 rounded-xl bg-indigo-50/80 border border-indigo-200 text-indigo-950 space-y-1 font-mono">
                        <div className="flex items-center justify-between">
                          <span className="font-sans font-bold text-[10px] text-indigo-900 uppercase">UPI UTR Transaction ID</span>
                          <span className="text-[10px] bg-indigo-200/80 px-1.5 py-0.2 rounded font-sans font-bold text-indigo-900">VERIFIED</span>
                        </div>
                        <div className="text-sm font-bold tracking-wider select-all text-indigo-900">
                          {selectedOrder.paymentDetails.upiUtr}
                        </div>
                        <div className="text-[10px] text-indigo-700 font-sans">
                          Merchant VPA: pay.getchasma@icici &bull; Real-time UPI settlement
                        </div>
                      </div>
                    )}

                    {/* Detailed Card Details */}
                    {selectedOrder.paymentDetails?.cardholderName && (
                      <div className="mt-2 p-2.5 rounded-xl bg-gray-100 border border-gray-200 text-gray-800 space-y-1 font-mono">
                        <div className="flex items-center justify-between font-sans">
                          <span className="font-bold text-[10px] uppercase text-gray-700">Card Payment Verification</span>
                          <span className="text-[10px] font-bold text-gray-600">{selectedOrder.paymentDetails.cardNetwork || 'Debit/Credit'}</span>
                        </div>
                        <div className="text-xs font-bold text-gray-900">
                          {selectedOrder.paymentDetails.cardholderName} &bull; •••• •••• •••• {selectedOrder.paymentDetails.cardLast4 || '****'}
                        </div>
                        <div className="text-[10px] text-gray-500 font-sans">
                          Expiry: {selectedOrder.paymentDetails.cardExpiry || '12/28'} &bull; 3D Secure Verified
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* DELIVERY PARTNER DISPATCH STATUS */}
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200/80 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-black text-white flex items-center justify-center">
                      <Truck size={16} />
                    </div>
                    <div>
                      <span className="font-bold text-gray-900 block text-xs">
                        Delivery Partner: {selectedOrder.deliveryPartner?.carrier || 'Delhivery Express / BlueDart'}
                      </span>
                      <span className="text-[10px] text-gray-500 font-mono">
                        Consignment AWB: {selectedOrder.deliveryPartner?.awb || selectedOrder.trackingNumber} &bull; Status: {selectedOrder.deliveryPartner?.status || selectedOrder.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 bg-white border border-gray-200 rounded-lg text-[10px] font-bold text-gray-700">
                    Carrier Sync Ready
                  </span>
                </div>

              </div>

              {/* Close Button */}
              <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end">
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="px-6 py-2.5 bg-black text-white text-xs font-semibold uppercase tracking-wider rounded-xl hover:bg-neutral-800"
                >
                  Close
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ADMIN PAYMENT GATEWAY REFUND MODAL */}
      <AnimatePresence>
        {refundingOrder && (
          <div className="fixed inset-0 z-[68] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-white rounded-3xl p-6 md:p-7 shadow-2xl border border-gray-200 space-y-5 text-gray-900"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2 text-indigo-700 font-bold">
                  <Zap size={22} className="text-amber-500" />
                  <span className="font-serif text-lg">Payment Gateway Refund Station</span>
                </div>
                <button
                  onClick={() => setRefundingOrder(null)}
                  className="p-1.5 text-gray-400 hover:text-black rounded-lg hover:bg-gray-100"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Order and Customer Summary */}
              <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-500">Order Reference:</span>
                  <span className="font-mono font-bold text-gray-900">{refundingOrder.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Customer Name:</span>
                  <span className="font-bold text-gray-900">{refundingOrder.customer?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Original Payment Mode:</span>
                  <span className="font-semibold text-gray-900">{refundingOrder.paymentMethod}</span>
                </div>
              </div>

              {/* Refund Destination Card */}
              <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-200 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-indigo-950 uppercase text-[10px] tracking-wider">
                    Target Refund Destination
                  </span>
                  {refundingOrder.paymentMethod !== 'Cash on Delivery' ? (
                    <span className="text-[10px] font-bold bg-indigo-200/80 text-indigo-900 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Lock size={10} /> Auto-Locked (RBI Mandated)
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold bg-purple-200/80 text-purple-900 px-2 py-0.5 rounded-full">
                      COD Customer Account
                    </span>
                  )}
                </div>

                <div className="p-3 bg-white rounded-xl border border-indigo-100">
                  <div className="font-semibold text-gray-900 flex items-center gap-2">
                    {refundingOrder.paymentMethod === 'Cash on Delivery' ? (
                      <Wallet size={16} className="text-purple-600" />
                    ) : refundingOrder.paymentMethod === 'UPI' ? (
                      <Smartphone size={16} className="text-indigo-600" />
                    ) : (
                      <CreditCard size={16} className="text-blue-600" />
                    )}
                    <span>
                      {refundingOrder.refundDetails?.destination || (
                        refundingOrder.paymentMethod === 'UPI' && refundingOrder.paymentDetails?.upiUtr
                          ? `Original UPI Source (UTR: ${refundingOrder.paymentDetails.upiUtr})`
                          : refundingOrder.paymentMethod === 'Card' && refundingOrder.paymentDetails?.cardLast4
                          ? `Original ${refundingOrder.paymentDetails.cardNetwork || ''} Card (•••• ${refundingOrder.paymentDetails.cardLast4})`
                          : refundingOrder.paymentMethod === 'Cash on Delivery'
                          ? 'COD Direct Payout (Customer Designated)'
                          : `Original ${refundingOrder.paymentMethod} Source`
                      )}
                    </span>
                  </div>
                  {refundingOrder.paymentMethod !== 'Cash on Delivery' ? (
                    <p className="text-[10px] text-gray-500 mt-1">
                      Funds will reverse automatically back to customer's linked bank account / card. Redirection to third-party accounts is strictly blocked.
                    </p>
                  ) : (
                    <p className="text-[10px] text-gray-500 mt-1">
                      Payout will be transferred directly to customer's submitted details via instant IMPS / UPI payout API.
                    </p>
                  )}
                </div>
              </div>

              {/* Gateway Provider Selection */}
              <div>
                <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wider block mb-1.5">
                  Connected Payment Gateway Processor
                </label>
                <select
                  value={gatewayProvider}
                  onChange={(e) => setGatewayProvider(e.target.value)}
                  className="w-full p-3 rounded-xl border border-gray-300 text-xs font-semibold bg-white outline-none focus:border-indigo-600"
                >
                  <option value="Razorpay Instant Payouts">Razorpay Instant Payouts (Direct UPI / Card Reversal)</option>
                  <option value="Cashfree AutoCollect & Payouts">Cashfree AutoCollect &amp; Payouts Engine</option>
                  <option value="Direct Bank IMPS / RTGS Clearing">Direct Bank IMPS / RTGS Clearing (ICICI Treasury)</option>
                </select>
                <span className="text-[10px] text-gray-400 mt-1 block">
                  Future-ready gateway integration architecture. Simulates instant settlement reference ID.
                </span>
              </div>

              {/* Amount Preview */}
              <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider block">Refund Amount (INR)</span>
                  <span className="text-xl font-bold font-serif text-emerald-950">
                    ₹{Number(refundingOrder.refundDetails?.amount || refundingOrder.total || 0).toLocaleString('en-IN')}
                  </span>
                </div>
                <span className="text-[10px] font-bold px-2 py-1 bg-emerald-200 text-emerald-900 rounded-lg uppercase">
                  100% Reimbursement
                </span>
              </div>

              {/* Gateway Reference ID Preview */}
              <div className="text-[10px] text-gray-500 flex items-center justify-between font-mono bg-gray-50 p-2 rounded-lg border border-gray-200">
                <span>Gateway ID Preview:</span>
                <span className="font-bold text-indigo-700">rfnd_rzp_{refundingOrder.id.replace(/[^a-zA-Z0-9]/g, '').slice(-8)}</span>
              </div>

              {/* Notes */}
              <div>
                <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wider block mb-1">
                  Accounting &amp; Audit Remarks (Optional)
                </label>
                <textarea
                  rows={2}
                  value={refundNotes}
                  onChange={(e) => setRefundNotes(e.target.value)}
                  placeholder="e.g. Return approved by Optical Quality Lab, customer satisfied..."
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-xs text-black outline-none focus:border-indigo-500 resize-none bg-gray-50"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setRefundingOrder(null)}
                  className="px-4 py-2 text-xs font-semibold text-gray-500 hover:text-black"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={refundLoading}
                  onClick={handleProcessRefund}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 shadow-md disabled:opacity-50"
                >
                  <Zap size={14} className="text-amber-300" />
                  <span>{refundLoading ? 'Processing Gateway Reversal...' : `Authorize & Refund ₹${Number(refundingOrder.refundDetails?.amount || refundingOrder.total || 0).toLocaleString('en-IN')}`}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* PHOTO INSPECTION LIGHTBOX MODAL */}
      <AnimatePresence>
        {inspectingPhoto && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative max-w-4xl max-h-[90vh] bg-neutral-950 rounded-3xl overflow-hidden border border-neutral-800 shadow-2xl flex flex-col"
            >
              <div className="p-4 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between text-white">
                <div className="flex items-center gap-2 font-semibold text-xs">
                  <Camera size={16} className="text-purple-400" />
                  <span>Customer Optical Defect Inspection Photo</span>
                </div>
                <button
                  onClick={() => setInspectingPhoto(null)}
                  className="p-1.5 rounded-full hover:bg-neutral-800 text-neutral-400 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="p-4 flex items-center justify-center overflow-auto bg-black max-h-[75vh]">
                <img
                  src={inspectingPhoto || DEFAULT_DEFECT_IMG}
                  alt="Defect Full View"
                  onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = DEFAULT_DEFECT_IMG; }}
                  className="max-h-[70vh] max-w-full object-contain rounded-xl"
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ADMIN RETURN DENIAL REASON MODAL */}
      <AnimatePresence>
        {reviewingReturnOrder && (
          <div className="fixed inset-0 z-[65] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-gray-200 space-y-4 text-gray-900"
            >
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2 text-rose-600 font-bold">
                  <RotateCcw size={20} />
                  <span>Deny Return Claim ({reviewingReturnOrder.id})</span>
                </div>
                <button
                  onClick={() => setReviewingReturnOrder(null)}
                  className="p-1 text-gray-400 hover:text-black rounded-lg hover:bg-gray-100"
                >
                  <X size={18} />
                </button>
              </div>

              <p className="text-xs text-gray-500 leading-relaxed">
                Select the inspection reason for declining this return claim. The explanation will be issued on the customer's live tracking receipt.
              </p>

              {/* Customer reported issue */}
              <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 text-xs">
                <span className="font-bold text-purple-900 block text-[11px] mb-0.5">Customer Defect Report:</span>
                <span className="text-purple-800 italic font-medium">"{reviewingReturnOrder.returnRequest?.reason}"</span>
              </div>

              {/* Denial reasons selection */}
              <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                {RETURN_DENIAL_REASONS.map((r) => (
                  <label
                    key={r}
                    className={`flex items-center gap-3 p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                      returnDenialReason === r
                        ? 'bg-rose-50 border-rose-300 text-rose-900 font-medium'
                        : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <input
                      type="radio"
                      name="adminReturnDenialReason"
                      checked={returnDenialReason === r}
                      onChange={() => setReturnDenialReason(r)}
                      className="accent-rose-600"
                    />
                    <span>{r}</span>
                  </label>
                ))}
              </div>

              {/* Custom Note */}
              <div>
                <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wider block mb-1">
                  Optical Lab Quality Report / Note (Optional)
                </label>
                <textarea
                  rows={2}
                  value={returnDenialNote}
                  onChange={(e) => setReturnDenialNote(e.target.value)}
                  placeholder="e.g. Scratches are consistent with keys/abrasion, not manufacturing defect..."
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-xs text-black outline-none focus:border-rose-500 resize-none bg-gray-50"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setReviewingReturnOrder(null)}
                  className="px-4 py-2 text-xs font-semibold text-gray-500 hover:text-black"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={reviewLoading}
                  onClick={handleDenyReturn}
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50"
                >
                  {reviewLoading ? 'Submitting...' : 'Confirm Denial & Keep Order Closed'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ADMIN CANCELLATION REASON MODAL */}
      <AnimatePresence>
        {cancellingOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-gray-200 space-y-4 text-gray-900"
            >
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2 text-rose-600 font-bold">
                  <XCircle size={20} />
                  <span>Cancel Order {cancellingOrder.id}</span>
                </div>
                <button
                  onClick={() => setCancellingOrder(null)}
                  className="p-1 text-gray-400 hover:text-black rounded-lg hover:bg-gray-100"
                >
                  <X size={18} />
                </button>
              </div>

              <p className="text-xs text-gray-500">
                Select the business reason for cancelling this commission. This reason will be permanently attached to the order audit trail and visible in the customer's live tracking receipt.
              </p>

              {/* Reasons */}
              <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                {ADMIN_CANCEL_REASONS.map((r) => (
                  <label
                    key={r}
                    className={`flex items-center gap-3 p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                      cancelReason === r
                        ? 'bg-rose-50 border-rose-300 text-rose-900 font-medium'
                        : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <input
                      type="radio"
                      name="adminCancelReason"
                      checked={cancelReason === r}
                      onChange={() => setCancelReason(r)}
                      className="accent-rose-600"
                    />
                    <span>{r}</span>
                  </label>
                ))}
              </div>

              {/* Optional Custom Note */}
              <div>
                <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wider block mb-1">
                  Internal Remarks / Customer Note (Optional)
                </label>
                <textarea
                  rows={2}
                  value={cancelNote}
                  onChange={(e) => setCancelNote(e.target.value)}
                  placeholder="e.g. Customer emailed requesting full refund due to..."
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-xs text-black outline-none focus:border-rose-500 resize-none bg-gray-50"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setCancellingOrder(null)}
                  className="px-4 py-2 text-xs font-semibold text-gray-500 hover:text-black"
                >
                  Discard
                </button>
                <button
                  type="button"
                  onClick={handleConfirmCancel}
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors"
                >
                  Confirm Cancellation
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ADMIN DENIAL REASON MODAL */}
      <AnimatePresence>
        {reviewingOrder && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-gray-200 space-y-4 text-gray-900"
            >
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2 text-rose-600 font-bold">
                  <Ban size={20} />
                  <span>Deny Cancellation Request ({reviewingOrder.id})</span>
                </div>
                <button
                  onClick={() => setReviewingOrder(null)}
                  className="p-1 text-gray-400 hover:text-black rounded-lg hover:bg-gray-100"
                >
                  <X size={18} />
                </button>
              </div>

              <p className="text-xs text-gray-500 leading-relaxed">
                State the operational reason why this customer's cancellation request cannot be granted. This explanation will be displayed directly on their live tracking timeline and account commission receipt.
              </p>

              {/* Customer request reminder */}
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs">
                <span className="font-bold text-amber-900 block text-[11px] mb-0.5">Customer Stated Reason:</span>
                <span className="text-amber-800 italic font-medium">"{reviewingOrder.cancellationRequest?.reason}"</span>
              </div>

              {/* Denial reasons selection */}
              <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                {DENIAL_REASONS.map((r) => (
                  <label
                    key={r}
                    className={`flex items-center gap-3 p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                      denialReason === r
                        ? 'bg-rose-50 border-rose-300 text-rose-900 font-medium'
                        : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <input
                      type="radio"
                      name="adminDenialReason"
                      checked={denialReason === r}
                      onChange={() => setDenialReason(r)}
                      className="accent-rose-600"
                    />
                    <span>{r}</span>
                  </label>
                ))}
              </div>

              {/* Optional Custom Note */}
              <div>
                <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wider block mb-1">
                  Custom Notes / Explanation (Optional)
                </label>
                <textarea
                  rows={2}
                  value={customDenialNote}
                  onChange={(e) => setCustomDenialNote(e.target.value)}
                  placeholder="e.g. Lens edging is 85% completed in our lab..."
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-xs text-black outline-none focus:border-rose-500 resize-none bg-gray-50"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setReviewingOrder(null)}
                  className="px-4 py-2 text-xs font-semibold text-gray-500 hover:text-black"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={reviewLoading}
                  onClick={handleDenyCancellation}
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50"
                >
                  {reviewLoading ? 'Submitting...' : 'Confirm Denial & Keep Order Active'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
