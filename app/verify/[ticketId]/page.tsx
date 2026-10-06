"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";

export default function VerifyTicketPage() {
  const { user, isLoaded } = useUser();
  const params = useParams();
  const ticketId = params.ticketId;
  
  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [checkingIn, setCheckingIn] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | 'warning' } | null>(null);

  useEffect(() => {
    if (!isLoaded || !user || !ticketId) return;

    const fetchTicket = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "https://ticketing-backend-l9xz.onrender.com";
        const res = await fetch(`${baseUrl}/api/tickets/${ticketId}?clerk_id=${user.id}`);
        if (!res.ok) {
          throw new Error("Ticket not found or unauthorized");
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
  }, [ticketId, user, isLoaded]);

  const handleCheckIn = async () => {
    if (!user) return;
    setCheckingIn(true);
    setMessage(null);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "https://ticketing-backend-l9xz.onrender.com";
      const res = await fetch(`${baseUrl}/api/tickets/${ticketId}/check-in`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clerk_id: user.id }),
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

  if (!isLoaded) {
    return (
      <main className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin"></div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-white text-gray-900 rounded-3xl shadow-2xl p-8 max-w-md w-full">
          <h1 className="text-2xl font-black mb-2 text-red-600">Access Restricted 🔒</h1>
          <p className="text-gray-500 text-sm mb-6">You must be logged in as an event creator to scan and verify tickets.</p>
          <a href="/sign-in" className="block w-full bg-black text-white font-bold py-3 rounded-xl hover:bg-gray-800 transition-colors">
            Sign In to Scan
          </a>
        </div>
      </main>
    );
  }

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
            ❌ Invalid Ticket, Not Found, or Unauthorized Event
          </div>
        ) : (
          <div className="space-y-6 text-left">
            {/* Status Banner */}
            {ticket.status === "checked-in" || ticket.status === "USED" ? (
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
              <p><span className="text-gray-400">Attendee:</span> <strong className="text-gray-800">{ticket.buyerName || ticket.buyer_name}</strong></p>
              <p><span className="text-gray-400">Event:</span> <strong className="text-gray-800">{ticket.eventTitle || ticket.event_title}</strong></p>
            </div>

            {/* Action Feedback Message */}
            {message && (
              <div className={`p-3 rounded-xl text-sm font-bold text-center ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                {message.text}
              </div>
            )}

            {/* Check-In Button */}
            {ticket.status !== "checked-in" && ticket.status !== "USED" && (
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