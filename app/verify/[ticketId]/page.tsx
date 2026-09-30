"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function VerifyTicketPage() {
  const params = useParams();
  const ticketId = params.ticketId;
  
  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [checkingIn, setCheckingIn] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | 'warning' } | null>(null);

  useEffect(() => {
    if (!ticketId) return;

    const fetchTicket = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tickets/${ticketId}`);
        if (!res.ok) {
          throw new Error("Ticket not found");
        }
        const data = await res.json();
        setTicket(data);
      } catch (err) {
        console.error("Verification failed", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchTicket();
  }, [ticketId]);

  const handleCheckIn = async () => {
    setCheckingIn(true);
    setMessage(null);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tickets/${ticketId}/check-in`, {
        method: "POST",
      });
      const data = await res.json();
      
      if (!data.success) {
        setMessage({ text: data.message || "Check-in failed", type: 'warning' });
        if (data.status === "used" || data.status === "checked-in") {
          setTicket((prev: any) => ({ ...prev, status: "checked-in" }));
        }
        return;
      }

      setTicket((prev: any) => ({ ...prev, status: "checked-in" }));
      setMessage({ text: `${data.message}! Welcome, ${data.buyerName}.`, type: 'success' });
    } catch (err) {
      console.error("Check-in error", err);
      setMessage({ text: "Check-in request failed.", type: 'error' });
    } finally {
      setCheckingIn(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-6">
      <div className="bg-white text-gray-900 rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
        <h1 className="text-2xl font-black mb-2">Gate Check-In</h1>
        <p className="text-gray-400 text-sm mb-6 font-mono">ID: {ticketId}</p>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-12 h-12 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin"></div>
          </div>
        ) : error || !ticket ? (
          <div className="bg-red-50 text-red-600 p-6 rounded-2xl font-bold">
            ❌ Invalid Ticket or Not Found
          </div>
        ) : (
          <div className="space-y-6 text-left">
            {/* Status Banner */}
            {ticket.status === "checked-in" ? (
              <div className="bg-amber-50 text-amber-700 p-4 rounded-2xl font-bold text-center">
                ⚠️ Warning: Ticket Already Scanned / Used
              </div>
            ) : (
              <div className="bg-green-50 text-green-700 p-4 rounded-2xl font-bold text-center">
                ✓ Valid Ticket (Ready for Entry)
              </div>
            )}

            {/* Attendee Details */}
            <div className="border-t border-gray-100 pt-4 space-y-2 text-sm font-medium">
              <p><span className="text-gray-400">Attendee:</span> <strong className="text-gray-800">{ticket.buyer_name}</strong></p>
              <p><span className="text-gray-400">Event:</span> <strong className="text-gray-800">{ticket.event_title}</strong></p>
            </div>

            {/* Action Feedback Message */}
            {message && (
              <div className={`p-3 rounded-xl text-sm font-bold text-center ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                {message.text}
              </div>
            )}

            {/* Check-In Button */}
            {ticket.status !== "checked-in" && (
              <button
                onClick={handleCheckIn}
                disabled={checkingIn}
                className="w-full bg-violet-600 hover:bg-violet-700 text-white font-black py-4 rounded-2xl transition-colors shadow-lg shadow-violet-200 disabled:opacity-50"
              >
                {checkingIn ? "Checking In..." : "Check In Attendee"}
              </button>
            )}
          </div>
        )}
      </div>
    </main>
  );
}