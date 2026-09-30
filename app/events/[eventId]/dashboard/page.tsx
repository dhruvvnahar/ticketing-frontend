"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function EventDashboardPage() {
  const params = useParams();
  const eventId = params?.eventId;

  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!eventId) return;

    const fetchDashboard = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/events/${eventId}/tickets`);
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setDashboardData(data);
      } catch (err) {
        console.error("Failed to load dashboard data", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
    const interval = setInterval(fetchDashboard, 5000);
    return () => clearInterval(interval);
  }, [eventId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex justify-center items-center">
        <div className="w-12 h-12 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <main className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-6">
        <div className="bg-gray-800 border border-gray-700 p-8 rounded-3xl text-center max-w-md w-full">
          <h2 className="text-xl font-bold text-red-400 mb-2">Could not load dashboard</h2>
          <p className="text-gray-400 text-sm">Please check if your backend is online and the event ID is correct.</p>
        </div>
      </main>
    );
  }

  const { totalTickets = 0, checkedInCount = 0, tickets = [] } = dashboardData;
  const percentage = totalTickets > 0 ? Math.round((checkedInCount / totalTickets) * 100) : 0;

  return (
    <main className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Gate Control Dashboard</h1>
          <p className="text-gray-400 text-sm mt-1">Live entry tracking and attendee status</p>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-800 border border-gray-700/50 rounded-3xl p-6">
            <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Total Sold</p>
            <h3 className="text-4xl font-black mt-2 text-white">{totalTickets}</h3>
          </div>
          <div className="bg-gray-800 border border-gray-700/50 rounded-3xl p-6">
            <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Checked In</p>
            <h3 className="text-4xl font-black mt-2 text-green-400">{checkedInCount}</h3>
          </div>
          <div className="bg-gray-800 border border-gray-700/50 rounded-3xl p-6">
            <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Turnout Rate</p>
            <h3 className="text-4xl font-black mt-2 text-violet-400">{percentage}%</h3>
          </div>
        </div>

        {/* Attendees List */}
        <div className="bg-gray-800 border border-gray-700/50 rounded-3xl p-6">
          <h2 className="text-lg font-bold mb-4">Attendee List</h2>
          <div className="divide-y divide-gray-700/50">
            {tickets.length === 0 ? (
              <p className="text-gray-500 py-4 text-center">No tickets sold yet.</p>
            ) : (
              tickets.map((ticket: any) => (
                <div key={ticket.id} className="py-4 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-white">{ticket.buyer_name || ticket.buyerName}</p>
                    <p className="text-xs text-gray-400 font-mono">{ticket.id}</p>
                  </div>
                  <div>
                    <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                      ticket.status === 'checked-in' ? 'bg-green-950 text-green-400 border border-green-800/50' : 'bg-violet-950 text-violet-400 border border-violet-800/50'
                    }`}>
                      {ticket.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </main>
  );
}