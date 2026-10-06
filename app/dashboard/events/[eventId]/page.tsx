import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";

export default async function EventAttendeesPage(props: any) {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const resolvedParams = await props.params;
  const actualEventId = resolvedParams.eventId || resolvedParams.id;

  let tickets = [];
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/events/${actualEventId}/tickets`, {
      cache: "no-store",
    });
    if (res.ok) {
      tickets = await res.json();
    }
  } catch (error) {
    console.error("Failed to fetch tickets", error);
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-violet-200 via-pink-100 to-blue-200">
      <nav className="bg-white/40 backdrop-blur-xl sticky top-0 z-50 border-b border-white/50 px-6 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="flex items-center gap-2 text-gray-900 hover:text-violet-700 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="font-bold text-sm tracking-tight">Back to Dashboard</span>
          </Link>
        </div>
        <UserButton />
      </nav>

      <div className="max-w-5xl mx-auto p-6 mt-8">
        <div className="mb-8">
          <h2 className="text-3xl font-black text-gray-900">Attendee List</h2>
          <p className="text-gray-700 mt-1 font-medium">View and manage ticket holders for this event.</p>
        </div>

        <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-white/60 shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/60 bg-white/40">
                  <th className="p-4 text-xs font-bold text-gray-600 uppercase tracking-wider">Buyer Name</th>
                  <th className="p-4 text-xs font-bold text-gray-600 uppercase tracking-wider">Email</th>
                  <th className="p-4 text-xs font-bold text-gray-600 uppercase tracking-wider">Phone</th>
                  <th className="p-4 text-xs font-bold text-gray-600 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/60">
                {tickets.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-12 text-center text-gray-700 font-medium">
                      No tickets sold yet. Share your event link to get started!
                    </td>
                  </tr>
                ) : (
                  tickets.map((ticket: any) => (
                    <tr key={ticket.id} className="hover:bg-white/50 transition-colors">
                      <td className="p-4 font-bold text-gray-900">{ticket.buyerName}</td>
                      <td className="p-4 text-gray-700 font-medium">{ticket.buyerEmail}</td>
                      <td className="p-4 text-gray-700 font-medium">{ticket.buyerPhone}</td>
                      <td className="p-4">
                        <span className={`px-3 py-1.5 text-xs font-bold rounded-full shadow-sm ${
                          ticket.status === 'checked-in' 
                            ? 'bg-green-100 text-green-700 border border-green-200' 
                            : 'bg-white text-violet-700 border border-violet-200'
                        }`}>
                          {ticket.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}