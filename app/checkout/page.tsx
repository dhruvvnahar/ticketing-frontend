"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function CheckoutContent() {
  const searchParams = useSearchParams();
  const eventIdFromUrl = searchParams.get("eventId") || "";

  const [formData, setFormData] = useState({
  buyerName: "",
  buyerEmail: "",
  buyerPhone: "",
  eventId: eventIdFromUrl,
});
  const [orderResponse, setOrderResponse] = useState<any>(null);
  const [ticketData, setTicketData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const fetchTicketDetails = async (ticketId: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tickets/${ticketId}`);
      if (response.ok) {
        const data = await response.json();
        setTicketData(data);
      }
    } catch (error) {
      console.error("Failed to fetch ticket:", error);
    }
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    if (!formData.eventId) {
      setError("No Event ID found. Please start from the home page.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/create-ticket-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.detail || "Something went wrong creating the order");
      }
      
      setOrderResponse(data);

      const orderIdToConfirm = data.orderId || data.razorpayOrderId;
      if (orderIdToConfirm) {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/webhook`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            payload: {
              payment: {
                entity: {
                  order_id: orderIdToConfirm,
                },
              },
            },
          }),
        });
      }

      if (data.ticketId) {
        fetchTicketDetails(data.ticketId);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-violet-600 via-fuchsia-600 to-orange-500 p-6 flex flex-col items-center justify-center font-sans relative overflow-hidden">
      <div className="absolute top-0 left-0 w-96 h-96 bg-white opacity-20 rounded-full mix-blend-overlay filter blur-3xl transform -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-[30rem] h-[30rem] bg-amber-300 opacity-20 rounded-full mix-blend-overlay filter blur-3xl transform translate-x-1/3 translate-y-1/3"></div>
      
      <div className="max-w-lg w-full bg-white/95 backdrop-blur-2xl rounded-[2rem] shadow-2xl shadow-purple-900/50 border border-white/50 p-8 sm:p-10 relative z-10 transition-all duration-500">
        {!orderResponse ? (
          <>
            <div className="text-center mb-8">
              <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-orange-500 tracking-tight mb-2">Grab Your Spot</h1>
              <p className="text-sm font-medium text-gray-500">Fill in your details for instant access.</p>
            </div>

            <form onSubmit={handleCheckout} className="space-y-5">
              {/* Notice the Event ID field is completely gone from the UI! */}
              <div>
                <label className="block text-xs font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-fuchsia-600 uppercase tracking-widest mb-1.5">Full Name</label>
                <input required type="text" name="buyer_name" value={formData.buyerName} onChange={handleChange} 
                  className="w-full bg-gray-50/50 border border-gray-200 text-gray-900 rounded-2xl focus:bg-white focus:ring-4 focus:ring-fuchsia-500/20 focus:border-fuchsia-500 block p-4 outline-none font-medium" placeholder="Jane Doe" />
              </div>
              <div>
                <label className="block text-xs font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-fuchsia-600 uppercase tracking-widest mb-1.5">Email Address</label>
                <input required type="email" name="buyer_email" value={formData.buyerEmail} onChange={handleChange} 
                  className="w-full bg-gray-50/50 border border-gray-200 text-gray-900 rounded-2xl focus:bg-white focus:ring-4 focus:ring-fuchsia-500/20 focus:border-fuchsia-500 block p-4 outline-none font-medium" placeholder="jane@example.com" />
              </div>
              <div>
                <label className="block text-xs font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-fuchsia-600 uppercase tracking-widest mb-1.5">Phone Number</label>
                <input required type="tel" name="buyer_phone" value={formData.buyerPhone} onChange={handleChange} 
                  className="w-full bg-gray-50/50 border border-gray-200 text-gray-900 rounded-2xl focus:bg-white focus:ring-4 focus:ring-fuchsia-500/20 focus:border-fuchsia-500 block p-4 outline-none font-medium" placeholder="+1 (555) 000-0000" />
              </div>
              
              {error && (<div className="bg-red-50 text-red-600 text-sm p-4 rounded-2xl border border-red-100 font-bold">⚠️ {error}</div>)}
              
              <button disabled={loading} type="submit" className="w-full text-white bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 font-black rounded-2xl text-lg px-5 py-4 text-center shadow-xl shadow-fuchsia-500/30 transition-transform hover:-translate-y-1 mt-6">
                {loading ? "Processing..." : "Secure My Ticket"}
              </button>
            </form>
          </>
        ) : (
          <div className="text-center">
            {/* Same success state UI from your previous code goes here */}
            <h2 className="text-3xl font-black text-gray-900 mb-2">You're going!</h2>
            <p className="text-gray-500 text-sm mb-8 font-medium">Order ID: {orderResponse.orderId}</p>
            {ticketData ? (
              <div className="bg-gradient-to-br from-violet-600 via-fuchsia-600 to-orange-500 rounded-[2rem] p-1.5 mt-6">
                <div className="bg-white rounded-[1.6rem] p-6 sm:p-8">
                  <h3 className="text-2xl font-black text-gray-900 mb-8">{ticketData.event_title}</h3>
                  <img src={ticketData.qr_code_image} alt="Ticket QR" className="mx-auto border-[6px] border-gray-50 rounded-2xl w-56 h-56 mb-6" />
                  <p className="font-black text-gray-800 text-lg">{ticketData.buyer_name}</p>
                </div>
              </div>
            ) : (<p>Minting your ticket...</p>)}
          </div>
        )}
      </div>
    </main>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-900 flex items-center justify-center text-white font-bold">Loading secure checkout...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}