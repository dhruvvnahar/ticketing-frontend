"use client";

import { useState } from "react";

export default function CheckoutPage() {
  const [formData, setFormData] = useState({
    buyer_name: "",
    buyer_email: "",
    buyer_phone: "",
    event_id: "", 
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
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6 flex flex-col items-center justify-center font-sans">
      <div className="max-w-lg w-full bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl shadow-indigo-100/50 border border-white p-8 sm:p-10 transition-all duration-500">
        
        {!orderResponse ? (
          <>
            <div className="text-center mb-8">
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">Secure Checkout</h1>
              <p className="text-sm text-gray-500">Enter your details to reserve your spot.</p>
            </div>

            <form onSubmit={handleCheckout} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1">Event ID</label>
                <input required type="text" name="event_id" value={formData.event_id} onChange={handleChange} 
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 block p-3.5 transition-all duration-200 outline-none" 
                  placeholder="e.g., f0b1df9c-841c..." />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1">Full Name</label>
                <input required type="text" name="buyer_name" value={formData.buyer_name} onChange={handleChange} 
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 block p-3.5 transition-all duration-200 outline-none" 
                  placeholder="Jane Doe" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1">Email Address</label>
                <input required type="email" name="buyer_email" value={formData.buyer_email} onChange={handleChange} 
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 block p-3.5 transition-all duration-200 outline-none" 
                  placeholder="jane@example.com" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1">Phone Number</label>
                <input required type="tel" name="buyer_phone" value={formData.buyer_phone} onChange={handleChange} 
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 block p-3.5 transition-all duration-200 outline-none" 
                  placeholder="+1 (555) 000-0000" />
              </div>
              
              {error && (
                <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100 flex items-center">
                  <span className="mr-2">⚠️</span> {error}
                </div>
              )}
              
              <button disabled={loading} type="submit" 
                className="w-full text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:ring-4 focus:ring-indigo-200 font-bold rounded-xl text-lg px-5 py-4 text-center shadow-lg shadow-indigo-200 transform transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none mt-4">
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Processing...
                  </span>
                ) : "Pay Now"}
              </button>
            </form>
          </>
        ) : (
          <div className="text-center animate-fade-in-up">
            <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto text-4xl shadow-inner mb-4">
              ✓
            </div>
            <h2 className="text-2xl font-extrabold text-gray-900 mb-1">You're going!</h2>
            <p className="text-gray-500 text-sm mb-6">Order ID: <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{orderResponse.orderId || orderResponse.razorpayOrderId}</span></p>
            
            {ticketData ? (
              <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-1 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-10 rounded-full blur-xl"></div>
                <div className="bg-white rounded-xl p-6 relative z-10">
                  <p className="text-indigo-600 font-bold text-sm uppercase tracking-wider mb-1">Admit One</p>
                  <h3 className="text-xl font-black text-gray-900 mb-6 leading-tight">{ticketData.event_title}</h3>
                  
                  <div className="flex justify-center mb-6">
                    <img 
                      src={ticketData.qr_code_image} 
                      alt="Ticket QR Code" 
                      className="border-4 border-gray-50 rounded-xl shadow-sm w-48 h-48 mix-blend-multiply"
                    />
                  </div>
                  
                  <div className="border-t border-dashed border-gray-200 pt-4 flex justify-between items-center text-left">
                    <div>
                      <p className="text-xs text-gray-400 uppercase font-semibold">Attendee</p>
                      <p className="font-bold text-gray-800">{ticketData.buyer_name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400 uppercase font-semibold">Status</p>
                      <p className="font-bold text-green-500">Confirmed</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100 mt-6">
                <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-500 font-medium">Minting your secure ticket...</p>
              </div>
            )}
            
            <p className="text-sm text-gray-500 mt-6 font-medium">
              We've also sent a copy of this ticket to your email.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}