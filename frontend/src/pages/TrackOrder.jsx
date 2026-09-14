import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  Search, 
  CheckCircle2, 
  Clock, 
  Truck, 
  Package, 
  ShieldCheck, 
  MapPin, 
  XCircle, 
  AlertTriangle, 
  X, 
  ArrowLeft,
  Calendar,
  RotateCcw,
  Camera,
  Image as ImageIcon,
  Upload,
  Check,
  Lock,
  CreditCard,
  Building,
  Wallet,
  Smartphone,
  IndianRupee
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const STATUS_STEPS = [
  { key: 'pending', title: 'Order Placed', desc: 'Order received and verified at our studio' },
  { key: 'processing', title: 'Optical Crafting', desc: 'Precision lens grinding & frame calibration' },
  { key: 'shipped', title: 'In Transit', desc: 'Dispatched with white-glove express courier' },
  { key: 'delivered', title: 'Delivered', desc: 'Safely handed to recipient at destination' }
];

const CANCELLATION_REASONS = [
  'Change of mind / Ordered by mistake',
  'Want to change frame style or color',
  'Need to update prescription or lens index',
  'Found better pricing / applied wrong coupon',
  'Estimated delivery time is too long',
  'Incorrect delivery address or contact info',
  'Other reason'
];

const RETURN_REASONS = [
  'Prescription power mismatch or blurriness',
  'Frame size loose / bridges pinching nose',
  'Arrived damaged, bent hinge, or scratched lens',
  'Color, tint, or finish different from photos',
  'Received incorrect frame model variant',
  'Coating peeling / anti-reflective defect',
  'Other reason'
];

export default function TrackOrder() {
  const [searchParams] = useSearchParams();
  const [orderIdInput, setOrderIdInput] = useState(searchParams.get('id') || '');
  const [order, setOrder] = useState(null);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Cancel Order Modal State
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [selectedReason, setSelectedReason] = useState(CANCELLATION_REASONS[0]);
  const [customReasonNote, setCustomReasonNote] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [cancelFeedback, setCancelFeedback] = useState('');

  // Return Request Modal State
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [selectedReturnReason, setSelectedReturnReason] = useState(RETURN_REASONS[0]);
  const [returnDescription, setReturnDescription] = useState('');
  const [returnPhotos, setReturnPhotos] = useState([]);
  const [returnPhotoError, setReturnPhotoError] = useState('');
  const [submittingReturn, setSubmittingReturn] = useState(false);
  const [returnFeedback, setReturnFeedback] = useState('');

  // COD Refund Destination State
  const [codRefundMethod, setCodRefundMethod] = useState('upi'); // 'upi', 'bank_transfer', 'store_credit'
  const [codUpiId, setCodUpiId] = useState('');
  const [codBankDetails, setCodBankDetails] = useState({
    accountHolder: '',
    bankName: '',
    accountNumber: '',
    ifsc: ''
  });

  const fetchOrder = (id) => {
    if (!id || !id.trim()) return;
    setLoading(true);
    setError('');

    fetch(`http://localhost:5001/api/orders/${encodeURIComponent(id.trim())}`)
      .then(res => {
        if (!res.ok) throw new Error('Order not found');
        return res.json();
      })
      .then(data => {
        setOrder(data);
        setSearched(true);
      })
      .catch(err => {
        setError('Order identification could not be located. Please verify your reference number.');
        setOrder(null);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    const idFromQuery = searchParams.get('id');
    if (idFromQuery) {
      setOrderIdInput(idFromQuery);
      fetchOrder(idFromQuery);
    }
  }, [searchParams]);

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchOrder(orderIdInput);
  };

  // Convert uploaded image file to Base64 data URL
  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    if (!files || files.length === 0) return;

    if (returnPhotos.length + files.length > 5) {
      setReturnPhotoError('Maximum 5 photos allowed.');
      return;
    }

    setReturnPhotoError('');

    files.forEach(file => {
      if (!file.type.startsWith('image/')) {
        setReturnPhotoError('Only image files (JPG, PNG, WebP) are allowed.');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setReturnPhotoError('Image size should be less than 5MB per photo.');
        return;
      }

      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        setReturnPhotos(prev => [...prev, loadEvent.target.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemovePhoto = (indexToRemove) => {
    setReturnPhotos(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleCancelOrder = async () => {
    if (!order) return;
    setCancelling(true);
    setCancelFeedback('');

    const fullReason = selectedReason === 'Other reason' && customReasonNote.trim()
      ? `Other: ${customReasonNote.trim()}`
      : customReasonNote.trim()
      ? `${selectedReason} - ${customReasonNote.trim()}`
      : selectedReason;

    try {
      const res = await fetch(`http://localhost:5001/api/orders/${order.id}/cancel-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: fullReason })
      });

      if (res.ok) {
        const updated = await res.json();
        setOrder(updated);
        setIsCancelModalOpen(false);
        setCancelFeedback('Cancellation request submitted. Our atelier team will review your request.');
      } else {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to submit cancellation request.');
      }
    } catch (err) {
      setCancelFeedback(err.message || 'Could not submit cancellation request. Please contact concierge support.');
    } finally {
      setCancelling(false);
    }
  };

  const handleSubmitReturn = async () => {
    if (!order) return;

    if (!returnDescription.trim() || returnDescription.trim().length < 8) {
      setReturnPhotoError('Please describe the issue in detail (minimum 8 characters).');
      return;
    }

    if (returnPhotos.length === 0) {
      setReturnPhotoError('Attaching at least one inspection photograph of the eyewear defect is mandatory.');
      return;
    }

    if (order?.paymentMethod === 'Cash on Delivery') {
      if (codRefundMethod === 'upi') {
        if (!codUpiId.trim() || !codUpiId.includes('@')) {
          setReturnPhotoError('Please enter a valid UPI ID (e.g. yourname@okhdfcbank or 9876543210@paytm) to receive your refund.');
          return;
        }
      } else if (codRefundMethod === 'bank_transfer') {
        if (!codBankDetails.accountHolder.trim() || !codBankDetails.accountNumber.trim() || !codBankDetails.ifsc.trim()) {
          setReturnPhotoError('Please enter your Bank Account Holder Name, Account Number, and IFSC code for direct IMPS refund.');
          return;
        }
      }
    }

    setSubmittingReturn(true);
    setReturnPhotoError('');
    setReturnFeedback('');

    const refundPreference = order?.paymentMethod === 'Cash on Delivery'
      ? {
          method: codRefundMethod,
          upiId: codUpiId.trim(),
          bankDetails: codRefundMethod === 'bank_transfer' ? codBankDetails : null
        }
      : {
          method: 'original_source'
        };

    try {
      const res = await fetch(`http://localhost:5001/api/orders/${order.id}/return-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: selectedReturnReason,
          description: returnDescription.trim(),
          photos: returnPhotos,
          refundPreference
        })
      });

      if (res.ok) {
        const updated = await res.json();
        setOrder(updated);
        setIsReturnModalOpen(false);
        setReturnDescription('');
        setReturnPhotos([]);
        setReturnFeedback('Return request submitted successfully. Our optical inspection laboratory will review your case within 24 hours.');
      } else {
        const errorText = await res.text().catch(() => '');
        let errMsg = 'Failed to submit return request.';
        try {
          const data = JSON.parse(errorText);
          if (data.error) errMsg = data.error;
        } catch (_) {
          if (errorText && errorText.length < 150) errMsg = errorText;
        }
        throw new Error(errMsg);
      }
    } catch (err) {
      setReturnPhotoError(err.message || 'Failed to submit return request.');
    } finally {
      setSubmittingReturn(false);
    }
  };

  const getStepStatus = (stepKey) => {
    if (!order) return 'upcoming';
    const statusOrder = ['pending', 'processing', 'shipped', 'delivered'];
    const currentIdx = statusOrder.indexOf(order.status.toLowerCase());
    const stepIdx = statusOrder.indexOf(stepKey);

    if (order.status === 'cancelled') return 'cancelled';
    if (order.status.toLowerCase() === 'delivered' || order.status.startsWith('return_')) return 'completed';

    if (stepIdx < currentIdx) return 'completed';
    if (stepIdx === currentIdx) return 'current';
    return 'upcoming';
  };

  const isCancelPending = order?.cancellationRequested && order?.cancellationRequest?.status === 'pending';
  const isCancelDenied = order?.cancellationRequest?.status === 'denied';
  const canCancel = order && 
    (order.status === 'pending' || order.status === 'processing') && 
    !isCancelPending;

  const isRefunded = order && (order.status === 'refunded' || order.refundStatus === 'refunded' || order.refundDetails?.status === 'refunded');
  const isDelivered = order && (order.status.toLowerCase() === 'delivered' || order.status.startsWith('return_') || isRefunded);
  const isReturnPending = order && (order.status === 'return_requested' || (order.returnRequest && order.returnRequest.status === 'pending'));
  const isReturnApproved = order && (order.status === 'return_approved' || (order.returnRequest && order.returnRequest.status === 'approved'));
  const isReturnDenied = order && order.returnRequest && order.returnRequest.status === 'denied';
  const canRequestReturn = order && order.status.toLowerCase() === 'delivered' && !isReturnPending && !isReturnApproved && !isRefunded;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/40 via-white to-slate-50 text-slate-900 pt-12 pb-24 px-4 md:px-8 relative overflow-hidden">
      {/* Decorative sunlit ambient glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-b from-blue-200/20 via-indigo-100/10 to-transparent rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-3xl mx-auto relative z-10">
        
        {/* Luxury Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-[11px] font-bold uppercase tracking-widest mb-3 shadow-sm">
            <ShieldCheck size={14} className="text-blue-600" />
            Concierge Logistics & Optical Tracking
          </div>
          <h1 className="font-serif text-3xl md:text-5xl font-bold text-slate-900 mb-3 tracking-tight">
            Track Your <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">Eyewear</span>
          </h1>
          <p className="text-slate-600 text-xs md:text-sm max-w-md mx-auto">
            Experience real-time white-glove status updates as your bespoke frames are crafted, calibrated, and securely dispatched.
          </p>
        </div>

        {/* Tracking Input Card */}
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-xl shadow-slate-100 mb-8">
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-4 top-4 text-slate-400" />
              <input
                type="text"
                placeholder="e.g. ORD-7820"
                value={orderIdInput}
                onChange={(e) => setOrderIdInput(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 text-sm uppercase font-semibold rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 tracking-wider transition-all placeholder:text-slate-400 font-mono"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl text-xs font-bold uppercase tracking-widest transition-all disabled:opacity-50 shadow-lg shadow-blue-500/25 active:scale-95 cursor-pointer"
            >
              {loading ? 'Locating...' : 'Track Package'}
            </button>
          </form>

          {/* Quick Order Sample Pills */}
          <div className="mt-4 flex items-center gap-2 flex-wrap text-xs text-slate-500">
            <span className="text-[11px] font-semibold text-slate-400">Recent:</span>
            {['ORD-7819', 'ORD-7820', 'ORD-7821'].map(id => (
              <button
                key={id}
                type="button"
                onClick={() => { setOrderIdInput(id); fetchOrder(id); }}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 text-[11px] font-mono border border-slate-200 transition-all cursor-pointer"
              >
                {id}
              </button>
            ))}
          </div>

          {error && (
            <div className="mt-4 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <XCircle size={16} className="text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {cancelFeedback && (
            <div className="mt-4 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
              <AlertTriangle size={16} className="text-amber-600" />
              <span>{cancelFeedback}</span>
            </div>
          )}

          {returnFeedback && (
            <div className="mt-4 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-600" />
              <span>{returnFeedback}</span>
            </div>
          )}
        </div>

        {/* Tracking Status Display */}
        {order && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-xl space-y-8"
          >
            {/* Order Overview Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-blue-600">Order Identification</span>
                <h3 className="font-serif text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">{order.id}</h3>
                <span className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
                  <Calendar size={13} />
                  Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>

              <div className="flex flex-col sm:items-end gap-2">
                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block">
                  Express Courier Tracking
                </span>
                <span className="px-3.5 py-1.5 bg-blue-50 border border-blue-200 text-blue-700 rounded-xl text-xs font-mono font-bold tracking-wider">
                  {order.deliveryPartner?.awbNumber || order.trackingNumber || 'EXP-IN-782109'}
                </span>

                {/* Cancel Action */}
                {canCancel && (
                  <button
                    onClick={() => setIsCancelModalOpen(true)}
                    className="text-xs text-rose-600 hover:text-rose-800 font-semibold tracking-wider uppercase underline underline-offset-4 mt-1 transition-colors cursor-pointer"
                  >
                    Request Cancellation
                  </button>
                )}
                {isCancelPending && (
                  <span className="text-[11px] text-amber-700 font-bold tracking-wider uppercase bg-amber-50 border border-amber-200 px-3 py-1 rounded-full flex items-center gap-1.5 mt-1">
                    <Clock size={12} className="animate-spin" /> Cancellation Review Pending
                  </span>
                )}

                {/* Return Action for Delivered Orders */}
                {canRequestReturn && (
                  <button
                    onClick={() => setIsReturnModalOpen(true)}
                    className="text-xs text-amber-700 hover:text-amber-800 font-bold tracking-wider uppercase underline underline-offset-4 mt-1 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw size={13} />
                    <span>Request Return / Replacement</span>
                  </button>
                )}
                {isReturnPending && (
                  <span className="text-[11px] text-amber-700 font-bold tracking-wider uppercase bg-amber-50 border border-amber-200 px-3 py-1 rounded-full flex items-center gap-1.5 mt-1">
                    <RotateCcw size={12} className="animate-spin" /> Return Inspection Pending
                  </span>
                )}
                {isReturnApproved && (
                  <span className="text-[11px] text-emerald-700 font-bold tracking-wider uppercase bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full flex items-center gap-1.5 mt-1">
                    <CheckCircle2 size={12} /> Return Approved &amp; Manifested
                  </span>
                )}
              </div>
            </div>

            {/* GATEWAY REFUND SETTLED BANNER */}
            {isRefunded && (
              <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50 via-teal-50 to-white border-2 border-emerald-300 text-slate-900 space-y-3 shadow-md">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-lg shadow-emerald-600/20 flex-shrink-0">
                    <IndianRupee size={24} strokeWidth={2.5} />
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <h4 className="font-serif text-lg font-bold text-emerald-800">
                        Refund of ₹{Number(order.refundDetails?.amount || order.total).toLocaleString('en-IN')} Issued &amp; Settled
                      </h4>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] uppercase font-bold tracking-wider">
                        Gateway Confirmed
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">
                      Payment gateway transfer confirmed on {order.refundDetails?.refundedAt ? new Date(order.refundDetails.refundedAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'recently'}.
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-emerald-200 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Credit Destination</span>
                    <strong className="text-slate-900 font-semibold block truncate" title={order.refundDetails?.destination}>
                      {order.refundDetails?.destination || (order.paymentMethod === 'Cash on Delivery' ? 'Customer UPI/Bank' : 'Original Payment Source')}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Gateway Reference ID</span>
                    <span className="font-mono font-bold text-emerald-700 block">{order.refundDetails?.gatewayRefundId || 'rfnd_rzp_settled'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Gateway Provider</span>
                    <span className="text-slate-700 block">{order.refundDetails?.gatewayProvider || 'Instant UPI / IMPS Gateway'}</span>
                  </div>
                </div>
              </div>
            )}

            {/* RETURN APPROVED STATUS BANNER */}
            {isReturnApproved && !isRefunded && (
              <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-slate-900 space-y-3">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-lg shadow-emerald-600/20">
                    <CheckCircle2 size={24} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h4 className="font-serif text-lg font-bold text-emerald-800">Return Request Approved</h4>
                    <p className="text-xs text-slate-600">
                      Our atelier optics lab has reviewed and approved your return. Return consignment is assigned.
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-emerald-200 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Return Pickup Consignment AWB</span>
                    <span className="font-mono font-bold text-emerald-800 text-sm">{order.returnRequest?.returnAwb || 'RET-BD-782101'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Packaging Instructions</span>
                    <span className="text-slate-600">Keep frame in leather presentation case with all accessories for BlueDart agent.</span>
                  </div>
                </div>
              </div>
            )}

            {/* RETURN REQUEST UNDER INSPECTION BANNER */}
            {isReturnPending && (
              <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-slate-900 space-y-3">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-lg shadow-amber-500/20">
                    <RotateCcw size={24} strokeWidth={2.5} className="animate-spin-slow" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-serif text-lg font-bold text-amber-800">Return Inspection Under Review</h4>
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 text-[10px] uppercase font-bold tracking-wider">
                        Lab Verification
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">
                      Your return request with {order.returnRequest?.photos?.length || 1} defect photograph(s) submitted on {order.returnRequest?.requestedAt ? new Date(order.returnRequest.requestedAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'recently'} is currently being reviewed by our chief optometrist.
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-amber-200 text-xs flex flex-col sm:flex-row sm:items-center gap-2">
                  <span className="font-bold text-amber-800 uppercase tracking-wider text-[11px]">Reported Issue:</span>
                  <span className="text-slate-800 bg-white px-3 py-1 rounded-lg border border-amber-200 font-medium">
                    {order.returnRequest?.reason}: {order.returnRequest?.description}
                  </span>
                </div>
              </div>
            )}

            {/* RETURN DENIED BANNER */}
            {isReturnDenied && (
              <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200 text-slate-900 space-y-3">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-rose-100 border border-rose-300 text-rose-600 flex items-center justify-center font-bold shadow-sm">
                    <AlertTriangle size={24} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h4 className="font-serif text-lg font-bold text-rose-800">Return Request Not Approved</h4>
                    <p className="text-xs text-slate-600">
                      {order.returnRequest?.denialReason || 'Defect inspection could not be validated from submitted imagery.'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* DELIVERED CELEBRATION STATUS CARD */}
            {order.status.toLowerCase() === 'delivered' && !isReturnPending && !isReturnApproved && (
              <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-lg shadow-emerald-600/20">
                    <CheckCircle2 size={24} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h4 className="font-serif text-lg font-bold text-emerald-800">Package Delivered Successfully</h4>
                    <p className="text-xs text-slate-600">
                      Handed over to recipient on {order.deliveredAt ? new Date(order.deliveredAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Verified Delivery'}.
                    </p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-full text-[11px] uppercase font-bold tracking-wider self-start sm:self-auto">
                  <ShieldCheck size={14} />
                  30-Day Return Eligible
                </span>
              </div>
            )}

            {/* CANCELLED STATUS CARD WITH REASON */}
            {order.status.toLowerCase() === 'cancelled' && (
              <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200 text-slate-900 space-y-3">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center font-bold shadow-lg shadow-rose-600/20">
                    <XCircle size={24} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h4 className="font-serif text-lg font-bold text-rose-800">Order Cancelled</h4>
                    <p className="text-xs text-slate-600">
                      This order was permanently closed on {order.cancelledAt ? new Date(order.cancelledAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recent'}.
                    </p>
                  </div>
                </div>

                <div className="mt-2 pt-3 border-t border-rose-200 text-xs flex flex-col sm:flex-row sm:items-center gap-2">
                  <span className="font-bold text-rose-700 uppercase tracking-wider text-[11px]">Reason for Cancellation:</span>
                  <span className="text-slate-800 bg-white px-3 py-1 rounded-lg border border-rose-200 font-medium">
                    {order.cancellationReason || 'Cancelled upon customer request.'}
                  </span>
                </div>
              </div>
            )}

            {/* Visual Timeline Stepper */}
            {order.status.toLowerCase() !== 'cancelled' && (
              <div>
                <h4 className="font-bold text-[11px] uppercase tracking-[0.2em] text-slate-400 mb-6">
                  Live Dispatch Journey
                </h4>
                <div className="relative">
                  <div className="space-y-7">
                    {STATUS_STEPS.map((step) => {
                      const status = getStepStatus(step.key);
                      const isCompleted = status === 'completed';
                      const isCurrent = status === 'current';

                      return (
                        <div key={step.key} className="flex items-start gap-4 relative">
                          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 z-10 transition-all ${
                            isCompleted
                              ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                              : isCurrent
                              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white ring-4 ring-blue-100 shadow-md shadow-blue-500/30 animate-pulse'
                              : 'bg-slate-100 border border-slate-200 text-slate-400'
                          }`}>
                            {isCompleted ? (
                              <CheckCircle2 size={20} strokeWidth={2.5} />
                            ) : (
                              <Clock size={18} strokeWidth={2} />
                            )}
                          </div>

                          <div className="pt-1 flex-1">
                            <div className="flex items-center gap-2">
                              <h5 className={`text-sm font-bold tracking-tight ${
                                isCompleted ? 'text-emerald-700' : isCurrent ? 'text-blue-700' : 'text-slate-400'
                              }`}>
                                {step.title}
                              </h5>
                              {isCurrent && (
                                <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 text-[10px] uppercase font-bold tracking-wider rounded-full">
                                  Current Stage
                                </span>
                              )}
                              {isCompleted && (
                                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] uppercase font-bold tracking-wider rounded-full">
                                  Completed
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-500 mt-1">{step.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Recipient and Eyewear Package Summary */}
            <div className="pt-6 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs text-slate-600">
              <div className="flex items-start gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/70">
                <MapPin size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px] block mb-1">
                    Destination Address
                  </span>
                  <p className="font-semibold text-slate-900">{order.customer?.name}</p>
                  <p className="text-slate-500">{order.customer?.address}</p>
                  <p className="text-slate-500">{order.customer?.city}, {order.customer?.state} - {order.customer?.pincode}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/70">
                <Package size={18} className="text-indigo-600 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px] block mb-1">
                    Atelier Packaging &amp; Care
                  </span>
                  <p className="text-slate-700">{order.items?.length || 1} handcrafted frame(s) in leather presentation vault</p>
                  <p className="text-blue-600 font-semibold mt-1">Free UV400 test card &amp; microfiber cloth included</p>
                </div>
              </div>
            </div>

            {/* Ordered Items Preview */}
            {order.items && order.items.length > 0 && (
              <div className="pt-4 border-t border-slate-100">
                <h5 className="font-bold text-[11px] uppercase tracking-widest text-slate-400 mb-3">
                  Enclosed Optical Items
                </h5>
                <div className="divide-y divide-slate-100">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="py-3 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 p-1 flex-shrink-0 flex items-center justify-center">
                          <img src={item.image} alt={item.name} className="w-full h-full object-contain mix-blend-multiply" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{item.name}</p>
                          <p className="text-slate-500 text-[11px]">Qty: {item.quantity || 1}</p>
                        </div>
                      </div>
                      <span className="font-mono font-bold text-slate-900">
                        ₹{Number(item.price || 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-sm font-bold">
                  <span className="text-slate-500">Total Valuation</span>
                  <span className="font-serif text-lg text-slate-900 font-bold font-mono">
                    ₹{Number(order.total || 0).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            )}

          </motion.div>
        )}

        {/* CUSTOMER RETURN REQUEST MODAL WITH MANDATORY PHOTOS & DESCRIPTION */}
        <AnimatePresence>
          {isReturnModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-2xl text-slate-900 space-y-5 max-h-[90vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2 text-amber-700 font-bold text-base">
                    <RotateCcw size={20} />
                    <span>Request Return / Replacement ({order?.id})</span>
                  </div>
                  <button
                    onClick={() => setIsReturnModalOpen(false)}
                    className="p-1 text-slate-400 hover:text-slate-900 rounded-lg hover:bg-slate-100 cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  Our laboratory guarantees 100% optical precision. If your frame or lenses are defective or unwearable, submit this inspection request with mandatory defect photographs.
                </p>

                {/* Return Reason Dropdown */}
                <div>
                  <label className="text-[11px] uppercase font-bold tracking-wider text-slate-700 block mb-1.5">
                    1. Primary Reason for Return *
                  </label>
                  <select
                    value={selectedReturnReason}
                    onChange={(e) => setSelectedReturnReason(e.target.value)}
                    className="w-full px-4 py-3 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 outline-none focus:border-blue-500"
                  >
                    {RETURN_REASONS.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                {/* Mandatory Detailed Description */}
                <div>
                  <label className="text-[11px] uppercase font-bold tracking-wider text-slate-700 block mb-1.5">
                    2. Detailed Problem Description * <span className="text-rose-500">(Mandatory)</span>
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Describe the exact issue with the lens surfacing, frame alignment, or damage upon unboxing..."
                    value={returnDescription}
                    onChange={(e) => setReturnDescription(e.target.value)}
                    className="w-full px-4 py-3 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 outline-none focus:border-blue-500 leading-relaxed placeholder:text-slate-400"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>Minimum 8 characters</span>
                    <span>{returnDescription.length} chars</span>
                  </div>
                </div>

                {/* Mandatory Photos Section */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] uppercase font-bold tracking-wider text-slate-700">
                      3. Upload Defect Photos * <span className="text-rose-500">(At least 1 mandatory)</span>
                    </label>
                    <span className="text-[10px] text-blue-600 font-mono font-semibold">
                      {returnPhotos.length} photo(s) attached
                    </span>
                  </div>

                  {/* Photo Uploader Dropzone */}
                  <label className="border-2 border-dashed border-slate-300 hover:border-blue-500 bg-slate-50 rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer transition-all group">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                    <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                      <Camera size={18} />
                    </div>
                    <span className="text-xs font-bold text-slate-800 group-hover:text-blue-600">
                      Take Photo or Choose Files
                    </span>
                    <span className="text-[10px] text-slate-400 mt-0.5">
                      Clear photos of scratches, frame bridge, lenses, or delivery packaging
                    </span>
                  </label>

                  {/* Photos Preview Gallery */}
                  {returnPhotos.length > 0 && (
                    <div className="grid grid-cols-3 gap-2.5 mt-3">
                      {returnPhotos.map((photo, pIdx) => (
                        <div key={pIdx} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-50 group">
                          <img src={photo} alt={`Defect Proof ${pIdx + 1}`} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => handleRemovePhoto(pIdx)}
                            className="absolute top-1 right-1 p-1 rounded-full bg-black/70 text-white hover:bg-rose-600 transition-all shadow-md"
                            title="Remove photo"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {returnPhotoError && (
                    <p className="text-xs text-rose-600 font-semibold mt-2">{returnPhotoError}</p>
                  )}
                </div>

                {/* 4. REFUND REVERSAL / PAYOUT DESTINATION */}
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] uppercase font-bold tracking-wider text-slate-700 block">
                      4. Refund Reimbursement Destination *
                    </label>
                    <span className="text-[10px] font-bold text-blue-600">
                      Amount: ₹{Number(order?.total || 0).toLocaleString('en-IN')}
                    </span>
                  </div>

                  {order?.paymentMethod === 'Cash on Delivery' ? (
                    <div className="space-y-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                      <p className="text-[11px] text-slate-600">
                        Since this commission was placed via <strong>Cash on Delivery</strong>, select your preferred digital method to receive your ₹{Number(order?.total || 0).toLocaleString('en-IN')} refund upon inspection:
                      </p>

                      {/* COD Options Radio Cards */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => setCodRefundMethod('upi')}
                          className={`p-3 rounded-xl border text-left transition-all ${
                            codRefundMethod === 'upi'
                              ? 'bg-blue-50 border-blue-500 text-blue-950 shadow-sm'
                              : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 font-bold text-xs text-blue-700 mb-1">
                            <Smartphone size={14} /> Instant UPI
                          </div>
                          <span className="text-[10px] text-slate-500 block leading-tight">Direct credit via UPI VPA (GPay / PhonePe / Paytm)</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setCodRefundMethod('bank_transfer')}
                          className={`p-3 rounded-xl border text-left transition-all ${
                            codRefundMethod === 'bank_transfer'
                              ? 'bg-blue-50 border-blue-500 text-blue-950 shadow-sm'
                              : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 font-bold text-xs text-blue-700 mb-1">
                            <Building size={14} /> Bank IMPS
                          </div>
                          <span className="text-[10px] text-slate-500 block leading-tight">Direct bank account credit (NEFT / IMPS 24x7)</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setCodRefundMethod('store_credit')}
                          className={`p-3 rounded-xl border text-left transition-all ${
                            codRefundMethod === 'store_credit'
                              ? 'bg-emerald-50 border-emerald-500 text-emerald-950 shadow-sm'
                              : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 font-bold text-xs text-emerald-700 mb-1">
                            <Wallet size={14} /> Store Credit
                          </div>
                          <span className="text-[10px] text-emerald-600 font-bold block leading-tight">+5% VIP Bonus added to your wallet</span>
                        </button>
                      </div>

                      {/* UPI Input */}
                      {codRefundMethod === 'upi' && (
                        <div className="space-y-1.5 pt-1">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block">
                            Enter Your UPI ID (VPA) *
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. mobileNumber@upi or yourname@okhdfcbank"
                            value={codUpiId}
                            onChange={(e) => setCodUpiId(e.target.value)}
                            className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 placeholder-slate-400 outline-none focus:border-blue-500 font-mono"
                          />
                        </div>
                      )}

                      {/* Bank Details Inputs */}
                      {codRefundMethod === 'bank_transfer' && (
                        <div className="space-y-2 pt-1">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <div>
                              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block mb-1">Account Holder Name *</label>
                              <input
                                type="text"
                                placeholder="As on bank passbook"
                                value={codBankDetails.accountHolder}
                                onChange={(e) => setCodBankDetails(prev => ({ ...prev, accountHolder: e.target.value }))}
                                className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-900 outline-none focus:border-blue-500"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block mb-1">Bank Name</label>
                              <input
                                type="text"
                                placeholder="e.g. HDFC Bank, ICICI, SBI"
                                value={codBankDetails.bankName}
                                onChange={(e) => setCodBankDetails(prev => ({ ...prev, bankName: e.target.value }))}
                                className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-900 outline-none focus:border-blue-500"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <div>
                              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block mb-1">Bank Account Number *</label>
                              <input
                                type="text"
                                placeholder="Account number"
                                value={codBankDetails.accountNumber}
                                onChange={(e) => setCodBankDetails(prev => ({ ...prev, accountNumber: e.target.value }))}
                                className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-900 outline-none focus:border-blue-500 font-mono"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block mb-1">IFSC Code *</label>
                              <input
                                type="text"
                                placeholder="e.g. HDFC0001234"
                                value={codBankDetails.ifsc}
                                onChange={(e) => setCodBankDetails(prev => ({ ...prev, ifsc: e.target.value.toUpperCase() }))}
                                className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-900 outline-none focus:border-blue-500 font-mono uppercase"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Store Credit Note */}
                      {codRefundMethod === 'store_credit' && (
                        <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
                          ✨ <strong>Maison VIP Incentive:</strong> Receive ₹{Number(Math.round(order.total * 1.05)).toLocaleString('en-IN')} (includes ₹{Math.round(order.total * 0.05)} bonus credit) in your wallet instantly upon return clearance.
                        </div>
                      )}
                    </div>
                  ) : (
                    /* DIGITAL PAYMENT LOCKED ORIGINAL SOURCE CARD */
                    <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-950 flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-indigo-100 border border-indigo-200 text-indigo-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Lock size={16} />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-indigo-950">Refund Locked to Original Payment Method</span>
                          <span className="px-2 py-0.2 rounded-full bg-indigo-100 text-indigo-800 text-[9px] font-bold uppercase tracking-wider">
                            RBI Secure Routing
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 leading-relaxed">
                          {order?.paymentMethod === 'UPI' ? (
                            <>
                              Your refund of <strong>₹{Number(order?.total || 0).toLocaleString('en-IN')}</strong> will be automatically credited back to your originating <strong>UPI Account</strong> (UTR: <code className="font-mono text-indigo-700">{order.paymentDetails?.upiUtr || 'Original UPI'}</code>). Funds reflect within 24-48 hours of optical inspection.
                            </>
                          ) : (
                            <>
                              Your refund of <strong>₹{Number(order?.total || 0).toLocaleString('en-IN')}</strong> will be reversed directly to your originating <strong>{order?.paymentDetails?.cardNetwork || 'Card'}</strong> ending in <code className="font-mono text-indigo-700">•••• {order?.paymentDetails?.cardLast4 || '****'}</code>. Reversal reflects on your card statement within 3-5 business days.
                            </>
                          )}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsReturnModalOpen(false)}
                    className="px-5 py-2.5 rounded-full border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={submittingReturn}
                    onClick={handleSubmitReturn}
                    className="px-6 py-2.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer shadow-lg shadow-blue-500/20 active:scale-95"
                  >
                    {submittingReturn ? 'Submitting Case...' : 'Submit Return Request'}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* CUSTOMER CANCELLATION MODAL */}
        <AnimatePresence>
          {isCancelModalOpen && (
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
                    <span>Request Order Cancellation ({order?.id})</span>
                  </div>
                  <button
                    onClick={() => setIsCancelModalOpen(false)}
                    className="p-1 text-slate-400 hover:text-slate-900 rounded-lg hover:bg-slate-100 cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>

                <p className="text-xs text-slate-600">
                  Submitting this request alerts our atelier fulfillment desk. If lenses have not entered prescription surface-grinding, our team will review and approve your cancellation.
                </p>

                {/* Reason Selection */}
                <div className="space-y-2">
                  <label className="text-[11px] uppercase font-bold tracking-wider text-slate-500 block">
                    Reason for Cancellation *
                  </label>
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
                          name="cancelReason"
                          checked={selectedReason === reason}
                          onChange={() => setSelectedReason(reason)}
                          className="accent-rose-600 cursor-pointer"
                        />
                        <span>{reason}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Optional Note */}
                <div>
                  <label className="text-[11px] uppercase font-bold tracking-wider text-slate-500 block mb-1">
                    Additional Context (Optional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Provide any extra details for our lab managers..."
                    value={customReasonNote}
                    onChange={(e) => setCustomReasonNote(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 outline-none focus:border-rose-500 resize-none placeholder:text-slate-400"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsCancelModalOpen(false)}
                    className="px-4 py-2 rounded-full border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    Keep Order
                  </button>
                  <button
                    type="button"
                    disabled={cancelling}
                    onClick={handleCancelOrder}
                    className="px-5 py-2 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white rounded-full text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 shadow-lg shadow-rose-600/20 active:scale-95 cursor-pointer"
                  >
                    {cancelling ? 'Submitting...' : 'Submit Request'}
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
