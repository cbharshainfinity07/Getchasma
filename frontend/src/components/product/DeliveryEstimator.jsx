import { useState } from "react";
import { Truck } from "lucide-react";

export const DeliveryEstimator = () => {
  const [pincode, setPincode] = useState("");
  const [estimate, setEstimate] = useState(null);

  const checkDelivery = (e) => {
    e.preventDefault();
    if (pincode.length === 6) {
      setEstimate({
        dispatchDate: "Tomorrow, 2:00 PM IST",
        deliveryDate: "Within 48 Hours via BlueDart Air",
        serviceable: true,
      });
    }
  };

  return (
    <div className="border border-brand-black/10 p-3.5 bg-white">
      <form onSubmit={checkDelivery} className="flex gap-2">
        <input
          type="text"
          maxLength={6}
          value={pincode}
          onChange={(e) => setPincode(e.target.value.replace(/\D/g, ""))}
          placeholder="ENTER PINCODE FOR DISPATCH DATES"
          className="flex-1 bg-[#f8f8f7] border border-brand-black/10 px-3 py-2 text-xs font-mono tracking-wider focus:outline-none focus:border-brand-black"
        />
        <button
          type="submit"
          disabled={pincode.length !== 6}
          className="bg-brand-black text-white px-4 py-2 text-xs font-mono uppercase tracking-wider disabled:opacity-40 cursor-pointer"
        >
          Check
        </button>
      </form>

      {estimate && (
        <div className="mt-3 pt-3 border-t border-brand-black/5 flex items-start gap-2.5">
          <Truck className="w-3.5 h-3.5 text-[#0f766e] flex-shrink-0 mt-0.5" />
          <div className="text-[11px] font-mono leading-tight">
            <div className="text-brand-black font-semibold">
              LAB SURFACING CUTOFF: {estimate.dispatchDate}
            </div>
            <div className="text-zinc-500 mt-0.5">
              Estimated Delivery: {estimate.deliveryDate}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryEstimator;
