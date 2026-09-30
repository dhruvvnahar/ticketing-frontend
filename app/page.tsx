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
        throw new Error(data.detail || "Something went wrong");
      }
      
      setOrderResponse(data);
      fetchTicketDetails(data.ticketId);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 p-6 flex flex-col items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-xl shadow-md p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Complete Purchase</h1>
        
        {!orderResponse ? (
          <form onSubmit={handleCheckout} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Event ID (from /api/seed)</label>
              <input required type="text" name="event_id" value={formData.event_id} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <input required type="text" name="buyer_name" value={formData.buyer_name} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email Address</label>
              <input required type="email" name="buyer_email" value={formData.buyer_email} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone Number</label>
              <input required type="tel" name="buyer_phone" value={formData.buyer_phone} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" />
            </div>
            
            {error && <p className="text-red-500 text-sm">{error}</p>}
            
            <button disabled={loading} type="submit" className="w-full bg-black text-white font-bold py-3 rounded-lg mt-4 disabled:opacity-50">
              {loading ? "Processing..." : "Pay Now"}
            </button>
          </form>
        ) : (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto text-3xl">✓</div>
            <h2 className="text-xl font-bold text-gray-800">Mock Order Created!</h2>
            <p className="text-gray-600">Order ID: <span className="font-mono text-xs">{orderResponse.orderId}</span></p>
            
            {ticketData ? (
              <div className="mt-6 border-t pt-6 w-full">
                <h3 className="text-xl font-semibold mb-2">{ticketData.event_title}</h3>
                <p className="text-gray-600 mb-4">Admit One: {ticketData.buyer_name}</p>
                
                <img 
                  src={ticketData.qr_code_image} 
                  alt="Ticket QR Code" 
                  className="mx-auto border-4 border-gray-100 rounded-lg shadow-sm w-48 h-48"
                />
                
                <p className="text-sm text-gray-500 mt-4">
                  Run the PowerShell webhook command to finalize payment and trigger the email!
                </p>
              </div>
            ) : (
              <div className="mt-6 border-t pt-6 w-full">
                <p className="text-gray-500 animate-pulse">Generating your secure ticket...</p>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}