import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useUserAuth } from '../context/UserAuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Truck, ArrowLeft, CreditCard, Banknote, QrCode, Tag, Crown, Check, Copy } from 'lucide-react';

export default function Checkout() {
  const { cartItems, cartTotal, clearCart } = useCart();
  const { user, isMember, activateMembership } = useUserAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    city: user?.city || '',
    state: user?.state || '',
    pincode: user?.pincode || ''
  });

  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [upiUtr, setUpiUtr] = useState('');
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    cardholderName: user?.name || '',
    expiry: '',
    cvv: '',
    network: 'RuPay'
  });
  const [copiedUpi, setCopiedUpi] = useState(false);

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [addMembershipPass, setAddMembershipPass] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        name: prev.name || user.name || '',
        email: prev.email || user.email || '',
        phone: prev.phone || user.phone || '',
        address: prev.address || user.address || '',
        city: prev.city || user.city || '',
        state: prev.state || user.state || '',
        pincode: prev.pincode || user.pincode || ''
      }));
      setCardDetails(prev => ({
        ...prev,
        cardholderName: prev.cardholderName || user.name || ''
      }));
    }
  }, [user]);

  useEffect(() => {
    fetch('http://localhost:5001/api/coupons')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const publicCoupons = data.filter(c => c.displayOnSite && c.isActive);
          setAvailableCoupons(publicCoupons);
        }
      })
      .catch(err => console.error('Error loading checkout coupons:', err));
  }, []);

  // Indian Rupee Pricing calculations
  const discountAmount = appliedCoupon ? appliedCoupon.calculatedDiscount : 0;
  const isFreeShipping = isMember || addMembershipPass || cartTotal >= 1999;
  const shippingFee = isFreeShipping ? 0 : 99;
  const membershipFee = addMembershipPass ? 999 : 0;
  const finalTotal = Math.max(0, cartTotal - discountAmount + shippingFee + membershipFee);

  const copyUpiId = () => {
    navigator.clipboard.writeText('pay.getchasma@icici');
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const applyCouponCode = async (codeToApply) => {
    const code = (codeToApply || couponCode).trim().toUpperCase();
    if (!code) return;
    setCouponError('');
    setIsApplyingCoupon(true);

    try {
      const res = await fetch('http://localhost:5001/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, orderTotal: cartTotal })
      });
      const data = await res.json();

      if (!res.ok) {
        setCouponError(data.error || 'Invalid coupon code');
        setAppliedCoupon(null);
      } else {
        setAppliedCoupon({
          code: data.code,
          discountType: data.discountType,
          discountValue: data.discountValue,
          calculatedDiscount: data.calculatedDiscount,
          description: data.description
        });
        setCouponCode(data.code);
      }
    } catch (err) {
      console.error('Coupon validation error:', err);
      setCouponError('Network error validating coupon. Please try again.');
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleApplyCoupon = (e) => {
    if (e) e.preventDefault();
    applyCouponCode();
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.address || !formData.pincode) {
      alert('Please fill in your name, contact phone, delivery address, and pincode.');
      return;
    }

    if (cartItems.length === 0) {
      alert('Your cart is empty.');
      navigate('/shop');
      return;
    }

    if (paymentMethod === 'UPI' && (!upiUtr.trim() || upiUtr.trim().length < 6)) {
      alert('Please enter your 12-digit UPI UTR / Transaction Reference ID from Google Pay, PhonePe, or Paytm.');
      return;
    }

    setIsSubmitting(true);

    const isCod = paymentMethod === 'Cash on Delivery';
    const cardLast4Digits = cardDetails.cardNumber.replace(/\s+/g, '').slice(-4) || '4242';

    const orderPayload = {
      customer: formData,
      items: cartItems.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
        lensDetails: item.lensDetails || null
      })),
      subtotal: cartTotal,
      discount: discountAmount,
      shipping: shippingFee,
      total: finalTotal,
      paymentMethod,
      paymentDetails: {
        method: paymentMethod,
        utrNumber: paymentMethod === 'UPI' ? upiUtr.trim() : '',
        cardLast4: paymentMethod === 'Credit Card' ? cardLast4Digits : '',
        cardNetwork: paymentMethod === 'Credit Card' ? cardDetails.network : '',
        cardholderName: paymentMethod === 'Credit Card' ? cardDetails.cardholderName : formData.name,
        txnId: paymentMethod === 'UPI' 
          ? `UPI-${upiUtr.trim()}` 
          : paymentMethod === 'Credit Card' 
          ? `CARD-TXN-${Date.now()}-${cardLast4Digits}` 
          : `COD-${Date.now()}`,
        paymentStatus: isCod ? 'Pending' : 'Paid',
        codCollected: false
      },
      deliveryPartner: {
        carrier: 'BlueDart Express',
        awbNumber: `BD-IN-${Math.floor(10000000 + Math.random() * 90000000)}`,
        trackingUrl: 'https://track.bluedart.com/',
        status: 'Manifested',
        estimatedDelivery: new Date(Date.now() + 3 * 86400000).toISOString()
      }
    };

    try {
      const response = await fetch('http://localhost:5001/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });

      if (!response.ok) {
        throw new Error('Failed to create order');
      }

      const createdOrder = await response.json();

      if (addMembershipPass && user) {
        try {
          await activateMembership('1-Year Chasma Gold Pass', 1);
        } catch (e) {
          console.error("Membership activation failed:", e);
        }
      }

      clearCart();
      navigate(`/order-confirmation/${createdOrder.id}`);
    } catch (err) {
      console.error('Order submission error:', err);
      alert('Failed to place order. Please check that backend server is running and try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] py-6 sm:py-12 md:py-20">
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
          <Link to="/shop" className="inline-flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-black transition-colors uppercase tracking-wider">
            <ArrowLeft size={16} /> Continue Shopping
          </Link>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <ShieldCheck size={16} className="text-emerald-600" />
            <span className="hidden sm:inline">256-Bit Encrypted Atelier Checkout</span>
            <span className="sm:hidden">Insured</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12">
          
          {/* Left Column: Form & Payment */}
          <div className="lg:col-span-7">
            <form onSubmit={handlePlaceOrder} className="space-y-6 sm:space-y-8">
              
              {/* Shipping Address */}
              <div className="bg-white rounded-2xl md:rounded-3xl p-4 sm:p-6 md:p-8 border border-gray-100 shadow-sm">
                <h3 className="font-serif text-xl font-bold text-black mb-1">1. Delivery Address</h3>
                <p className="text-xs text-gray-400 mb-6">Enter destination for insured express consignment.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Full Name *</label>
                    <input
                      type="text"
                      name="name"
                      required
                      placeholder="e.g. Vikramaditya Sharma"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 text-xs rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-black outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Phone Number *</label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      placeholder="+91 98765 43210"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 text-xs rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-black outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      placeholder="vikram@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 text-xs rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-black outline-none transition-all"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Complete Street Address *</label>
                    <input
                      type="text"
                      name="address"
                      required
                      placeholder="House/Flat No., Building Name, Street, Landmark"
                      value={formData.address}
                      onChange={handleChange}
                      className="w-full px-4 py-3 text-xs rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-black outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">City *</label>
                    <input
                      type="text"
                      name="city"
                      required
                      placeholder="Bengaluru"
                      value={formData.city}
                      onChange={handleChange}
                      className="w-full px-4 py-3 text-xs rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-black outline-none transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">State *</label>
                      <input
                        type="text"
                        name="state"
                        required
                        placeholder="Karnataka"
                        value={formData.state}
                        onChange={handleChange}
                        className="w-full px-4 py-3 text-xs rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-black outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Pincode *</label>
                      <input
                        type="text"
                        name="pincode"
                        required
                        placeholder="560001"
                        value={formData.pincode}
                        onChange={handleChange}
                        className="w-full px-4 py-3 text-xs rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-black outline-none transition-all font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Delivery Speed */}
              <div className="bg-white rounded-2xl md:rounded-3xl p-4 sm:p-6 md:p-8 border border-gray-100 shadow-sm">
                <h3 className="font-serif text-xl font-bold text-black mb-1">2. Shipping Partner</h3>
                <p className="text-xs text-gray-400 mb-6">Dispatched via insured express network.</p>

                <div className="p-4 rounded-2xl border-2 border-black bg-gray-50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Truck size={20} className="text-black" />
                    <div>
                      <span className="font-bold text-xs text-black block">BlueDart &bull; Express Armored Courier</span>
                      <span className="text-[10px] text-gray-500">2-4 Business Days with Tamper-Evident Seal</span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-600">
                    {shippingFee === 0 ? 'FREE' : '₹99'}
                  </span>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-2xl md:rounded-3xl p-4 sm:p-6 md:p-8 border border-gray-100 shadow-sm">
                <h3 className="font-serif text-xl font-bold text-black mb-1">3. Payment Option</h3>
                <p className="text-xs text-gray-400 mb-6">Select your preferred transaction channel.</p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                  {/* UPI */}
                  <label 
                    onClick={() => setPaymentMethod('UPI')}
                    className={`p-4 rounded-2xl border-2 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                      paymentMethod === 'UPI' ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <QrCode size={24} className="mb-2 text-black" />
                    <span className="text-xs font-bold text-black">Instant UPI / QR</span>
                    <span className="text-[10px] text-gray-400 mt-0.5">GPay, PhonePe, Paytm</span>
                  </label>

                  {/* Card */}
                  <label 
                    onClick={() => setPaymentMethod('Credit Card')}
                    className={`p-4 rounded-2xl border-2 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                      paymentMethod === 'Credit Card' ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <CreditCard size={24} className="mb-2 text-black" />
                    <span className="text-xs font-bold text-black">Debit / Card</span>
                    <span className="text-[10px] text-gray-400 mt-0.5">RuPay, Visa, MasterCard</span>
                  </label>

                  {/* Cash on Delivery */}
                  <label 
                    onClick={() => setPaymentMethod('Cash on Delivery')}
                    className={`p-4 rounded-2xl border-2 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                      paymentMethod === 'Cash on Delivery' ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Banknote size={24} className="mb-2 text-black" />
                    <span className="text-xs font-bold text-black">Cash On Delivery</span>
                    <span className="text-[10px] text-gray-400 mt-0.5">Pay at doorstep</span>
                  </label>
                </div>

                {/* Sub-details for selected payment */}
                {paymentMethod === 'UPI' && (
                  <div className="p-5 bg-gray-50 rounded-2xl border border-gray-200/80 space-y-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 bg-white rounded-xl border border-gray-200">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block">Official Merchant VPA</span>
                        <span className="font-mono font-bold text-sm text-black">pay.getchasma@icici</span>
                      </div>
                      <button
                        type="button"
                        onClick={copyUpiId}
                        className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-xs font-semibold text-black flex items-center gap-1.5 transition-all"
                      >
                        {copiedUpi ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                        <span>{copiedUpi ? 'Copied!' : 'Copy UPI ID'}</span>
                      </button>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-1.5">
                        UPI 12-Digit UTR / Transaction Reference ID *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 423891028341 (Found in GPay/PhonePe receipt)"
                        value={upiUtr}
                        onChange={(e) => setUpiUtr(e.target.value)}
                        className="w-full px-4 py-3 text-xs rounded-xl bg-white border border-gray-300 font-mono tracking-wider focus:border-black outline-none"
                      />
                      <p className="text-[11px] text-gray-500 mt-1">
                        Please pay ₹{finalTotal.toLocaleString('en-IN')} to the UPI ID above, then enter the 12-digit UTR from your bank confirmation for verification.
                      </p>
                    </div>
                  </div>
                )}

                {paymentMethod === 'Credit Card' && (
                  <div className="space-y-3 p-5 bg-gray-50 rounded-2xl border border-gray-200/80">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-bold text-gray-700">Card Network:</span>
                      {['RuPay', 'Visa', 'MasterCard'].map(net => (
                        <button
                          key={net}
                          type="button"
                          onClick={() => setCardDetails(prev => ({ ...prev, network: net }))}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                            cardDetails.network === net ? 'bg-black text-white' : 'bg-white border border-gray-200 text-gray-600'
                          }`}
                        >
                          {net}
                        </button>
                      ))}
                    </div>

                    <input
                      type="text"
                      placeholder="Cardholder Full Name"
                      value={cardDetails.cardholderName}
                      onChange={(e) => setCardDetails(prev => ({ ...prev, cardholderName: e.target.value }))}
                      className="w-full px-4 py-2.5 text-xs rounded-xl bg-white border border-gray-200 outline-none"
                    />

                    <input
                      type="text"
                      placeholder="Card Number (e.g. 4532 8912 3456 7890)"
                      value={cardDetails.cardNumber}
                      onChange={(e) => setCardDetails(prev => ({ ...prev, cardNumber: e.target.value }))}
                      className="w-full px-4 py-2.5 text-xs rounded-xl bg-white border border-gray-200 outline-none font-mono"
                    />

                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="MM / YY"
                        value={cardDetails.expiry}
                        onChange={(e) => setCardDetails(prev => ({ ...prev, expiry: e.target.value }))}
                        className="px-4 py-2.5 text-xs rounded-xl bg-white border border-gray-200 outline-none"
                      />
                      <input
                        type="password"
                        placeholder="CVV"
                        maxLength="4"
                        value={cardDetails.cvv}
                        onChange={(e) => setCardDetails(prev => ({ ...prev, cvv: e.target.value }))}
                        className="px-4 py-2.5 text-xs rounded-xl bg-white border border-gray-200 outline-none font-mono"
                      />
                    </div>
                  </div>
                )}

                {paymentMethod === 'Cash on Delivery' && (
                  <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 space-y-1">
                    <p className="font-bold">Cash on Delivery (Doorstep Payment)</p>
                    <p>
                      Please keep exact cash of <strong>₹{finalTotal.toLocaleString('en-IN')}</strong> or prepare your UPI app ready to pay the courier executive upon arrival.
                    </p>
                  </div>
                )}
              </div>

              {/* Submit Button on Desktop */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-5 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-widest rounded-full transition-all shadow-xl shadow-blue-500/25 active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? 'Confirming Acquisition...' : `Place Order &bull; ₹${finalTotal.toLocaleString('en-IN')}`}
              </button>

            </form>
          </div>

          {/* Right Column: Order Items Summary & Promo Code */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm sticky top-24">
              <h3 className="font-serif text-xl font-bold text-black mb-4">Order Summary</h3>

              {/* Items List */}
              <div className="divide-y divide-gray-100 max-h-72 overflow-y-auto mb-6 pr-2">
                {cartItems.map((item) => (
                  <div key={item.id} className="py-3 flex items-center gap-4">
                    <div className="w-16 h-16 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center p-2 border border-gray-100">
                      <img src={item.image} alt={item.name} className="w-full h-full object-contain mix-blend-multiply" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-gray-900 truncate">{item.name}</h4>
                      <p className="text-xs text-gray-400 mt-0.5">Qty: {item.quantity}</p>
                    </div>
                    <span className="text-xs font-bold text-black font-mono">
                      ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>

              {/* Coupon Code Input & Available Offers */}
              <div className="mb-6">
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                  Promo / Coupon Code
                </label>
                
                {appliedCoupon ? (
                  <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                        ✓
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs text-emerald-950 uppercase">{appliedCoupon.code}</span>
                          <span className="px-2 py-0.5 bg-emerald-200/80 text-emerald-900 rounded text-[10px] font-bold">
                            {appliedCoupon.discountType === 'percentage' ? `${appliedCoupon.discountValue}% OFF` : `₹${appliedCoupon.discountValue} OFF`}
                          </span>
                        </div>
                        <p className="text-[11px] text-emerald-700 mt-0.5 font-mono">
                          Savings applied: -₹{appliedCoupon.calculatedDiscount.toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="text-xs text-rose-600 hover:text-rose-800 font-semibold px-2 py-1 cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon}>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Tag size={14} className="absolute left-3.5 top-3.5 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Enter coupon code"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value)}
                          className="w-full pl-9 pr-3 py-2.5 text-xs uppercase font-medium rounded-xl border border-gray-200 outline-none focus:border-black tracking-wider"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={isApplyingCoupon || !couponCode.trim()}
                        className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl uppercase tracking-wider disabled:opacity-50 transition-all shadow-sm active:scale-95 cursor-pointer"
                      >
                        {isApplyingCoupon ? 'Verifying...' : 'Apply'}
                      </button>
                    </div>
                    {couponError && (
                      <p className="text-xs text-rose-500 font-semibold mt-1.5">{couponError}</p>
                    )}
                  </form>
                )}

                {/* Available Public Coupons */}
                {!appliedCoupon && availableCoupons.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-[10px] uppercase font-bold tracking-wider text-gray-400 mb-1.5">
                      Available Offers
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {availableCoupons.map((coupon) => (
                        <button
                          key={coupon.id}
                          type="button"
                          onClick={() => applyCouponCode(coupon.code)}
                          className="px-2.5 py-1 rounded-lg border border-dashed border-amber-300 bg-amber-50/80 hover:bg-amber-100 text-amber-900 text-[11px] font-medium transition-all text-left flex items-center gap-1.5 group cursor-pointer"
                        >
                          <span className="font-mono font-bold uppercase">{coupon.code}</span>
                          <span className="text-amber-700 text-[10px]">
                            ({coupon.discountType === 'percentage' ? `${coupon.discountValue}% off` : `₹${coupon.discountValue} off`})
                          </span>
                          <span className="text-[10px] text-amber-800 font-bold group-hover:underline ml-0.5">Apply</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Gold VIP Member Privilege Badge */}
              {isMember && (
                <div className="p-3.5 bg-gradient-to-r from-amber-50 to-amber-100/60 border border-amber-300 rounded-2xl flex items-center justify-between text-xs mb-4 shadow-sm">
                  <div className="flex items-center gap-2 text-amber-950 font-bold">
                    <Crown size={18} className="text-amber-600 fill-amber-500" />
                    <span>Gold VIP Privilege Active</span>
                  </div>
                  <span className="text-[10px] uppercase font-extrabold text-amber-900 bg-amber-200/80 px-2.5 py-0.5 rounded-full">
                    Free VIP Courier
                  </span>
                </div>
              )}

              {/* 1-Click Membership Add-On for non-members */}
              {!isMember && (
                <div 
                  onClick={() => setAddMembershipPass(!addMembershipPass)}
                  className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all mb-4 flex items-start gap-3 ${
                    addMembershipPass 
                      ? 'bg-amber-50/90 border-amber-400 text-amber-950 shadow-sm' 
                      : 'bg-gray-50 border-dashed border-gray-300 text-gray-700 hover:border-amber-300'
                  }`}
                >
                  <input 
                    type="checkbox" 
                    checked={addMembershipPass} 
                    onChange={() => {}} 
                    className="mt-0.5 accent-amber-500 cursor-pointer" 
                  />
                  <div className="flex-1 text-xs">
                    <div className="flex items-center justify-between font-bold">
                      <span className="flex items-center gap-1.5 text-black">
                        <Crown size={14} className="text-amber-500 fill-amber-400" />
                        Join Chasma Gold VIP (1 Year)
                      </span>
                      <span className="font-mono text-amber-800">+₹999</span>
                    </div>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      Get instant Free Delivery today + Buy 1 Get 1 Free for 365 days!
                    </p>
                  </div>
                </div>
              )}

              {/* Calculation Rows */}
              <div className="space-y-3 pt-4 border-t border-gray-100 text-xs text-gray-600 mb-6">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-black font-mono">₹{cartTotal.toLocaleString('en-IN')}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Discount ({appliedCoupon?.code})</span>
                    <span className="font-bold font-mono">-₹{discountAmount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                {addMembershipPass && (
                  <div className="flex justify-between text-amber-800 font-semibold">
                    <span className="flex items-center gap-1"><Crown size={12} /> 1-Year Gold VIP Pass</span>
                    <span className="font-mono">+₹999</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Express Delivery</span>
                  <span className="font-semibold text-black font-mono">
                    {shippingFee === 0 ? (
                      <span className="text-emerald-600 font-bold">
                        FREE {isMember || addMembershipPass ? '(VIP Privilege)' : ''}
                      </span>
                    ) : (
                      `₹${shippingFee.toLocaleString('en-IN')}`
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-base font-bold text-black pt-3 border-t border-gray-100">
                  <span>Total Due</span>
                  <span className="font-mono">₹{finalTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Safety badge */}
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 text-[11px] text-gray-500 flex items-center gap-2">
                <ShieldCheck size={18} className="text-emerald-600 flex-shrink-0" />
                <span>Zero-risk guarantee: 30-day money-back return on all optical orders.</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
