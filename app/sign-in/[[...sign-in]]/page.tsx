import { SignIn } from "@clerk/nextjs";
import Link from "next/link";

export default function SignInPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-900 relative overflow-hidden p-6">
      {/* Storefront-style background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-900/40 via-black to-orange-900/20 mix-blend-multiply z-0"></div>
      
      <div className="relative z-10 flex flex-col items-center w-full max-w-md">
        <Link href="/" className="mb-8 flex items-center gap-3 group">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
            <span className="text-black font-black text-lg">T</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white">Ticketing SaaS</h1>
        </Link>

        {/* Clerk Component with Custom Styles */}
        <SignIn 
          appearance={{
            elements: {
              card: "bg-white/95 backdrop-blur-xl shadow-2xl border border-white/20 rounded-[2rem] w-full",
              headerTitle: "text-2xl font-black text-gray-900",
              headerSubtitle: "text-gray-500 font-medium",
              formButtonPrimary: "bg-black hover:bg-gray-800 text-white font-bold rounded-xl py-3 normal-case transition-colors",
              socialButtonsBlockButton: "border-gray-200 hover:bg-gray-50 rounded-xl py-3 font-semibold text-gray-700",
              formFieldInput: "rounded-xl border-gray-200 focus:ring-2 focus:ring-fuchsia-500/20 focus:border-fuchsia-500 py-2.5",
              footerActionLink: "text-violet-600 hover:text-violet-700 font-bold",
            }
          }}
        />
      </div>
    </main>
  );
}