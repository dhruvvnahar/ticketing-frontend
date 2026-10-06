import { UserButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function DashboardPage() {
  const user = await currentUser();
  
  if (!user) {
    redirect("/sign-in");
  }

  const primaryEmail = user.emailAddresses.find(
    (email) => email.id === user.primaryEmailAddressId
  )?.emailAddress || "no-email@provided.com";

  // 1. Sync creator on load
  try {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/sync-creator`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clerk_id: user.id,
        email: primaryEmail,
        name: user.firstName || "Creator",
      }),
    });
  } catch (error) {
    console.error("Failed to sync creator", error);
  }

  // 2. Fetch events for this user
  let events = [];
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/events?clerk_id=${user.id}`, {
      cache: "no-store",
    });
    if (res.ok) {
      events = await res.json();
    }
  } catch (error) {
    console.error("Failed to fetch events", error);
  }

  // 3. Fetch live analytics
  let analytics = { totalRevenue: 0, ticketsSold: 0 };
  try {
    const analyticsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/analytics?clerk_id=${user.id}`, {
      cache: "no-store",
    });
    if (analyticsRes.ok) {
      analytics = await analyticsRes.json();
    }
  } catch (error) {
    console.error("Failed to fetch analytics", error);
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
            {/* Injecting Live Revenue */}
            <p className="text-4xl font-black text-gray-900">₹{analytics.totalRevenue.toFixed(2)}</p>
          </div>
          <div className="bg-white/60 backdrop-blur-md rounded-2xl p-6 border border-white/60 shadow-md">
            <p className="text-sm font-bold text-gray-600 uppercase tracking-wider mb-2">Tickets Sold</p>
            {/* Injecting Live Ticket Count */}
            <p className="text-4xl font-black text-gray-900">{analytics.ticketsSold}</p>
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
              <Link key={event.id} href={`/dashboard/events/${event.id}`} className="group block h-full">
                <div className="bg-white/60 backdrop-blur-md h-full rounded-2xl border border-white/60 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden">
                  <div className="relative h-48 w-full bg-gray-100 overflow-hidden">
                    {event.imageUrl ? (
                      <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs font-semibold">No Image</div>
                    )}
                  </div>
                  <div className="p-5 flex flex-col flex-grow">
                    <h3 className="text-xl font-black text-gray-900 group-hover:text-violet-700 transition-colors line-clamp-1">{event.title}</h3>
                    <p className="text-gray-700 text-sm mt-2.5 font-medium">{event.date ? event.date.replace("T", " ").substring(0, 16) : "Date TBD"}</p>
                    <div className="mt-auto pt-6 flex items-center justify-between border-t border-white/50">
                      <p className="text-lg font-black text-gray-900">₹{event.price.toFixed(2)}</p>
                      <span className="text-violet-700 text-sm font-bold">Manage &rarr;</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}