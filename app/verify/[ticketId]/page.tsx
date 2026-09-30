"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function VerifyTicketPage() {
  const { ticketId } = useParams();
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ticketId) return;
    
    const verifyTicket = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tickets/${ticketId}/check-in`, {
          method: "POST"
        });
        const data = await res.json();
        setResult(data);
      } catch (error) {
        setResult({ success: false, message: "Network error contacting server." });
      } finally {
        setLoading(false);
      }
    };
    
    verifyTicket();
  }, [ticketId]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white text-xl animate-pulse">Verifying Ticket...</div>;
  }

  return (
    <main className={`min-h-screen flex flex-col items-center justify-center p-6 text-white transition-colors duration-300 ${result?.success ? 'bg-green-600' : 'bg-red-600'}`}>
      <div className="bg-black/20 p-8 rounded-3xl backdrop-blur-md text-center max-w-sm w-full shadow-2xl border border-white/20">
        <div className="text-8xl mb-6">
          {result?.success ? "✅" : "❌"}
        </div>
        
        <h1 className="text-3xl font-extrabold mb-2 uppercase tracking-wide">
          {result?.message}
        </h1>
        
        {result?.buyerName && (
          <div className="mt-8 pt-6 border-t border-white/20 text-lg font-medium">
            <p className="text-white/80 text-sm uppercase tracking-wider mb-1">Attendee</p>
            <p className="text-2xl mb-4">{result.buyerName}</p>
            
            {result.eventTitle && (
              <>
                <p className="text-white/80 text-sm uppercase tracking-wider mb-1">Event</p>
                <p className="opacity-90">{result.eventTitle}</p>
              </>
            )}
          </div>
        )}
      </div>
    </main>
  );
}