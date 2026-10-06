"use client";

import { useEffect, useState } from "react";
import { UserButton, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function DashboardPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  
  const [events, setEvents] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState({ totalRevenue: 0, ticketsSold: 0 });
  const [loading, setLoading] = useState(true);

  // Fetch all data when the component loads
  useEffect(() => {
    if (!isLoaded) return;
    if (!user) {
      router.push("/sign-in");
      return;
    }

    const fetchData = async () => {
      try {
        const primaryEmail = user.primaryEmailAddress?.emailAddress || "no-email@provided.com";
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "https://ticketing-backend-l9xz.onrender.com";

        // 1. Sync creator
        await fetch(`${baseUrl}/api/sync-creator`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            clerk_id: user.id,
            email: primaryEmail,
            name: user.fullName || "Creator",
          }),
        });

        // 2. Fetch events
        const eventsRes = await fetch(`${baseUrl}/api/events?clerk_id=${user.id}`);
        if (eventsRes.ok) {
          setEvents(await eventsRes.json());
        }

        // 3. Fetch analytics
        const analyticsRes = await fetch(`${baseUrl}/api/analytics?clerk_id=${user.id}`);
        if (analyticsRes.ok) {
          setAnalytics(await analyticsRes.json());
        }
      } catch (error) {
        console.error("Error fetching data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, isLoaded, router]);

  // Handle Pause/Resume
  const handleTogglePause = async (eventId: string, currentStatus: boolean) => {
    if (!user) return;
    
    // Optimistic UI update (instantly changes the button without waiting for reload)
    setEvents(events.map(e => e.id === eventId ? { ...e, isActive: !currentStatus } : e));
    
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "https://ticketing-backend-l9xz.onrender.com";
    try {
      await fetch(`${baseUrl}/api/events/${eventId}/toggle?clerk_id=${user.id}`, {
        method: "PATCH",
      });
    } catch (error) {
      console.error("Failed to toggle event status", error);
    }
  };

  // Handle Delete
  const handleDelete = async (eventId: string) => {
    if (!user) return;
    const confirmed = window.confirm("Are you sure you want to delete this event? This will also delete all associated tickets.");
    if (!confirmed) return;

    // Optimistic UI update (instantly removes from screen)
    setEvents(events.filter(e => e.id !== eventId));

    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "https://ticketing-backend-l9xz.onrender.com";
    try {
      await fetch(`${baseUrl}/api/events/${eventId}?clerk_id=${user.id}`, {
        method: "DELETE",
      });
    } catch (error) {
      console.error("Failed to delete event", error);
    }
  };

  // Loading State
  if (!isLoaded || loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-violet-200 via-pink-100 to-blue-200 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-white border-t-black rounded-full animate-spin"></div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-violet-200 via-pink-100 to-blue-200">
      <nav className="bg-white/40 backdrop-blur-xl sticky top-0 z-50 border-b border-white/50 px-6 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center shadow-md">
            <span className="text-white font-black text-sm">T</span>
          </div>
          <h1 className="text-xl font-black tracking-tight text-gray-900">Creator Hub</h1>
        </div>
        <UserButton />
      </nav>

      <div className="max-w-6xl mx-auto p-6 mt-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 mb-10">
          <div>
            <h2 className="text-3xl font-black tracking-tight text-gray-900 mb-1">Overview</h2>
            <p className="text-gray-700 text-sm font-medium">Welcome back, track your events and sales.</p>
          </div>
          <Link
            href="/dashboard/events/new"
            className="group flex items-center gap-2 px-5 py-2.5 bg-black text-white font-semibold rounded-xl hover:bg-gray-800 hover:shadow-lg transition-all text-sm"
          >
            <span>Create New Event</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white/60 backdrop-blur-md rounded-2xl p-6 border border-white/60 shadow-md">
            <p className="text-sm font-bold text-gray-600 uppercase tracking-wider mb-2">Total Events</p>
            <p className="text-4xl font-black text-gray-900">{events.length}</p>
          </div>
          <div className="bg-white/60 backdrop-blur-md rounded-2xl p-6 border border-white/60 shadow-md">
            <p className="text-sm font-bold text-gray-600 uppercase tracking-wider mb-2">Total Revenue</p>
            <p className="text-4xl font-black text-gray-900">₹{(analytics.totalRevenue || 0).toFixed(2)}</p>
          </div>
          <div className="bg-white/60 backdrop-blur-md rounded-2xl p-6 border border-white/60 shadow-md">
            <p className="text-sm font-bold text-gray-600 uppercase tracking-wider mb-2">Tickets Sold</p>
            <p className="text-4xl font-black text-gray-900">{analytics.ticketsSold || 0}</p>
          </div>
        </div>

        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-black tracking-tight text-gray-900">Your Events</h3>
        </div>

        {events.length === 0 ? (
          <div className="bg-white/60 backdrop-blur-md rounded-3xl p-16 text-center border border-white/60 shadow-md">
            <h3 className="text-lg font-bold text-gray-900 mb-2">No events found</h3>
            <p className="text-gray-700 mb-6">You haven't published any ticketed events yet.</p>
            <Link
              href="/dashboard/events/new"
              className="text-sm font-bold text-white bg-black px-6 py-3 rounded-xl hover:bg-gray-800 transition-colors shadow-lg"
            >
              Publish First Event
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event: any) => (
              <div key={event.id} className="bg-white/60 backdrop-blur-md h-full rounded-2xl border border-white/60 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden">
                
                {/* Image Link */}
                <Link href={`/dashboard/events/${event.id}`} className="group block relative h-48 w-full bg-gray-100 overflow-hidden">
                  {event.imageUrl ? (
                    <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs font-semibold">No Image</div>
                  )}
                </Link>
                
                <div className="p-5 flex flex-col flex-grow">
                  <Link href={`/dashboard/events/${event.id}`}>
                    <h3 className="text-xl font-black text-gray-900 hover:text-violet-700 transition-colors line-clamp-1">{event.title}</h3>
                  </Link>
                  <p className="text-gray-700 text-sm mt-2.5 font-medium">{event.date ? event.date.replace("T", " ").substring(0, 16) : "Date TBD"}</p>
                  
                  <div className="mt-auto pt-6 flex flex-col gap-4 border-t border-white/50">
                    <div className="flex items-center justify-between">
                      <p className="text-lg font-black text-gray-900">₹{(event.price || 0).toFixed(2)}</p>
                      <Link href={`/dashboard/events/${event.id}`} className="text-violet-700 text-sm font-bold hover:underline">
                        Manage &rarr;
                      </Link>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleTogglePause(event.id, event.isActive)}
                        className={`flex-1 px-3 py-2 rounded-lg text-xs font-bold transition-colors shadow-sm ${
                          event.isActive === false 
                            ? "bg-green-100 text-green-700 hover:bg-green-200" 
                            : "bg-orange-100 text-orange-700 hover:bg-orange-200"
                        }`}
                      >
                        {event.isActive === false ? "▶ Resume" : "⏸ Pause"}
                      </button>
                      
                      <button 
                        onClick={() => handleDelete(event.id)}
                        className="flex-1 px-3 py-2 rounded-lg text-xs font-bold bg-red-50 text-red-600 hover:bg-red-100 transition-colors shadow-sm"
                      >
                        Delete
                      </button>
                    </div>

                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}