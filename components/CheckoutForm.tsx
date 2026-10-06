"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CheckoutForm({ event }: { event: any }) {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [attendees, setAttendees] = useState([
    { buyerName: "", buyerEmail: "", buyerPhone: "" }
  ]);

  const addTicket = () => {
    setAttendees([...attendees, { buyerName: "", buyerEmail: "", buyerPhone: "" }]);
  };

  const removeTicket = (index: number) => {
    if (attendees.length > 1) {
      setAttendees(attendees.filter((_, i) => i !== index));
    }
  };

  const updateAttendee = (index: number, field: string, value: string) => {
    const newAttendees = [...attendees];
    newAttendees[index] = { ...newAttendees[index], [field]: value };
    setAttendees(newAttendees);
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/create-ticket-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: event.id,
          attendees: attendees
        }),
      });

      if (res.ok) {
        router.push("/success");
      } else {
        const errorData = await res.json();
        alert(`Checkout failed: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Checkout failed", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const totalAmount = event.price * attendees.length;

  return (
    <form onSubmit={handleCheckout} className="max-w-2xl mx-auto space-y-8">
      {attendees.map((attendee, index) => (
        <div key={index} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative">
          {attendees.length > 1 && (
            <button 
              type="button" 
              onClick={() => removeTicket(index)}
              className="absolute top-4 right-4 text-red-500 text-sm font-bold hover:text-red-700 transition-colors"
            >
              Remove
            </button>
          )}
          
          <h3 className="text-lg font-black mb-4">Ticket {index + 1} Details</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Full Name</label>
              <input 
                required
                type="text" 
                value={attendee.buyerName}
                onChange={(e) => updateAttendee(index, "buyerName", e.target.value)}
                className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-violet-600 outline-none transition-all"
                placeholder="Jane Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Email (For QR Code)</label>
              <input 
                required
                type="email" 
                value={attendee.buyerEmail}
                onChange={(e) => updateAttendee(index, "buyerEmail", e.target.value)}
                className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-violet-600 outline-none transition-all"
                placeholder="jane@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Phone Number</label>
              <input 
                required
                type="tel" 
                value={attendee.buyerPhone}
                onChange={(e) => updateAttendee(index, "buyerPhone", e.target.value)}
                className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-violet-600 outline-none transition-all"
                placeholder="+91 98765 43210"
              />
            </div>
          </div>
        </div>
      ))}

      <div className="flex justify-between items-center bg-gray-50 p-6 rounded-2xl border border-gray-100">
        <button 
          type="button" 
          onClick={addTicket}
          className="text-violet-600 font-bold hover:text-violet-800 transition-colors"
        >
          + Add Another Ticket
        </button>
        <div className="text-right">
          <p className="text-sm text-gray-500 font-bold uppercase tracking-wider">Total Amount</p>
          <p className="text-3xl font-black text-gray-900">₹{totalAmount.toFixed(2)}</p>
        </div>
      </div>

      <button 
        type="submit" 
        disabled={isProcessing}
        className="w-full bg-black text-white py-4 rounded-xl font-bold text-lg hover:bg-gray-800 disabled:opacity-50 transition-colors shadow-md hover:shadow-lg"
      >
        {isProcessing ? "Processing Order..." : `Pay ₹${totalAmount.toFixed(2)}`}
      </button>
    </form>
  );
}