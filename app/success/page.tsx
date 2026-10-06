import Link from "next/link";

export default function SuccessPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-violet-600 via-fuchsia-600 to-orange-500 p-6 flex flex-col items-center justify-center font-sans relative overflow-hidden">
      <div className="absolute top-0 left-0 w-96 h-96 bg-white opacity-20 rounded-full mix-blend-overlay filter blur-3xl transform -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-[30rem] h-[30rem] bg-amber-300 opacity-20 rounded-full mix-blend-overlay filter blur-3xl transform translate-x-1/3 translate-y-1/3"></div>
      
      <div className="max-w-md w-full bg-white/95 backdrop-blur-2xl rounded-[2rem] shadow-2xl shadow-purple-900/50 border border-white/50 p-8 sm:p-10 relative z-10 text-center transition-all duration-500">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
          <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        
        <h1 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">Tickets Secured!</h1>
        
        <p className="text-gray-600 font-medium mb-8 leading-relaxed">
          Your order was successful. We've just emailed a unique QR code ticket to each attendee you listed. 
          <br/><br/>
          <span className="font-bold text-violet-700">Make sure everyone checks their inbox!</span>
        </p>
        
        <Link href="/" className="block w-full text-white bg-black hover:bg-gray-800 font-black rounded-2xl text-lg px-5 py-4 transition-transform hover:-translate-y-1 shadow-xl">
          Return to Home
        </Link>
      </div>
    </main>
  );
}