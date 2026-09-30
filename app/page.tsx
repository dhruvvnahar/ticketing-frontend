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
    <main className="min-h-screen bg-gradient-to-br from-violet-600 via-fuchsia-600 to-orange-500 p-6 flex flex-col items-center justify-center font-sans relative overflow-hidden">
      
      {/* Decorative floating shapes */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-white opacity-20 rounded-full mix-blend-overlay filter blur-3xl transform -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-[30rem] h-[30rem] bg-amber-300 opacity-20 rounded-full mix-blend-overlay filter blur-3xl transform translate-x-1/3 translate-y-1/3"></div>
      <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-cyan-300 opacity-20 rounded-full mix-blend-overlay filter blur-3xl transform -translate-x-1/2 -translate-y-1/2"></div>

      <div className="max-w-lg w-full bg-white/95 backdrop-blur-2xl rounded-[2rem] shadow-2xl shadow-purple-900/50 border border-white/50 p-8 sm:p-10 relative z-10 transition-all duration-500">
        
        {!orderResponse ? (
          <>
            <div className="text-center mb-8">
              <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-orange-500 tracking-tight mb-2">
                Grab Your Spot
              </h1>
              <p className="text-sm font-medium text-gray-500">Fill in your details for instant access.</p>
            </div>

            <form onSubmit={handleCheckout} className="space-y-5">
              <div>
                <label className="block text-xs font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-fuchsia-600 uppercase tracking-widest mb-1.5">Event ID</label>
                <input required type="text" name="event_id" value={formData.event_id} onChange={handleChange} 
                  className="w-full bg-gray-50/50 border border-gray-200 text-gray-900 rounded-2xl focus:bg-white focus:ring-4 focus:ring-fuchsia-500/20 focus:border-fuchsia-500 block p-4 transition-all duration-300 outline-none font-medium placeholder-gray-400" 
                  placeholder="e.g., f0b1df9c-841c..." />
              </div>
              <div>
                <label className="block text-xs font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-fuchsia-600 uppercase tracking-widest mb-1.5">Full Name</label>
                <input required type="text" name="buyer_name" value={formData.buyer_name} onChange={handleChange} 
                  className="w-full bg-gray-50/50 border border-gray-200 text-gray-900 rounded-2xl focus:bg-white focus:ring-4 focus:ring-fuchsia-500/20 focus:border-fuchsia-500 block p-4 transition-all duration-300 outline-none font-medium placeholder-gray-400" 
                  placeholder="Jane Doe" />
              </div>
              <div>
                <label className="block text-xs font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-fuchsia-600 uppercase tracking-widest mb-1.5">Email Address</label>
                <input required type="email" name="buyer_email" value={formData.buyer_email} onChange={handleChange} 
                  className="w-full bg-gray-50/50 border border-gray-200 text-gray-900 rounded-2xl focus:bg-white focus:ring-4 focus:ring-fuchsia-500/20 focus:border-fuchsia-500 block p-4 transition-all duration-300 outline-none font-medium placeholder-gray-400" 
                  placeholder="jane@example.com" />
              </div>
              <div>
                <label className="block text-xs font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-fuchsia-600 uppercase tracking-widest mb-1.5">Phone Number</label>
                <input required type="tel" name="buyer_phone" value={formData.buyer_phone} onChange={handleChange} 
                  className="w-full bg-gray-50/50 border border-gray-200 text-gray-900 rounded-2xl focus:bg-white focus:ring-4 focus:ring-fuchsia-500/20 focus:border-fuchsia-500 block p-4 transition-all duration-300 outline-none font-medium placeholder-gray-400" 
                  placeholder="+1 (555) 000-0000" />
              </div>
              
              {error && (
                <div className="bg-red-50 text-red-600 text-sm p-4 rounded-2xl border border-red-100 flex items-center font-bold">
                  <span className="mr-2 text-xl">⚠️</span> {error}
                </div>
              )}
              
              <button disabled={loading} type="submit" 
                className="w-full text-white bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 focus:ring-4 focus:ring-fuchsia-300 font-black rounded-2xl text-lg px-5 py-4 text-center shadow-xl shadow-fuchsia-500/30 transform transition-all duration-300 hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none mt-6">
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Processing...
                  </span>
                ) : "Secure My Ticket"}
              </button>
            </form>
          </>
        ) : (
          <div className="text-center animate-fade-in-up">
            <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-600 text-white rounded-full flex items-center justify-center mx-auto text-5xl shadow-lg shadow-green-500/30 mb-6 transform scale-110">
              ✓
            </div>
            <h2 className="text-3xl font-black text-gray-900 mb-2">You're going!</h2>
            <p className="text-gray-500 text-sm mb-8 font-medium">Order ID: <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded text-gray-700">{orderResponse.orderId || orderResponse.razorpayOrderId}</span></p>
            
            {ticketData ? (
              <div className="bg-gradient-to-br from-violet-600 via-fuchsia-600 to-orange-500 rounded-[2rem] p-1.5 shadow-2xl relative overflow-hidden mt-6 transform transition-all hover:scale-[1.02] duration-300">
                <div className="bg-white rounded-[1.6rem] p-6 sm:p-8 relative z-10">
                  <p className="text-fuchsia-600 font-black text-sm uppercase tracking-widest mb-2">Admit One</p>
                  <h3 className="text-2xl font-black text-gray-900 mb-8 leading-tight">{ticketData.event_title}</h3>
                  
                  <div className="flex justify-center mb-8">
                    <img 
                      src={ticketData.qr_code_image} 
                      alt="Ticket QR Code" 
                      className="border-[6px] border-gray-50 rounded-2xl shadow-lg w-56 h-56 mix-blend-multiply"
                    />
                  </div>
                  
                  <div className="border-t-2 border-dashed border-gray-200 pt-6 flex justify-between items-center text-left">
                    <div>
                      <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">Attendee</p>
                      <p className="font-black text-gray-800 text-lg">{ticketData.buyer_name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">Status</p>
                      <p className="font-black text-green-500 text-lg">Confirmed</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-3xl p-10 border border-gray-100 mt-8 shadow-inner">
                <div className="w-10 h-10 border-4 border-fuchsia-200 border-t-fuchsia-600 rounded-full animate-spin mx-auto mb-5"></div>
                <p className="text-gray-500 font-bold">Minting your secure ticket...</p>
              </div>
            )}
            
            <p className="text-sm text-gray-500 mt-8 font-bold">
              Check your email for the backup copy.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}