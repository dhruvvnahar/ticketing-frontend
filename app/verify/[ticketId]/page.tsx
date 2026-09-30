"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function VerifyTicketPage() {
  const params = useParams();
  const ticketId = params.ticketId;
  
  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

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

  return (
    <main className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-6">
      <div className="bg-white text-gray-900 rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
        <h1 className="text-2xl font-black mb-2">Ticket Verification</h1>
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
          <div className="space-y-4 text-left">
            <div className="bg-green-50 text-green-700 p-4 rounded-2xl font-bold text-center">
              ✓ Valid Ticket (Status: {ticket.status.toUpperCase()})
            </div>
            <div className="border-t border-gray-100 pt-4 space-y-2 text-sm font-medium">
              <p><span className="text-gray-400">Attendee:</span> <strong className="text-gray-800">{ticket.buyer_name}</strong></p>
              <p><span className="text-gray-400">Event:</span> <strong className="text-gray-800">{ticket.event_title}</strong></p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}