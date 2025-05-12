import Link from "next/link";

export default function NotFound() {
  return (
    <div className="w-[97%] mx-auto mt-9 sm:mt-10 pb-12 rounded-lg h-[calc(100vh-6rem)]">
      <div className="w-full h-full bg-white rounded-4xl flex flex-col items-center justify-center p-10">
        <h1 className="text-6xl sm:text-8xl font-black tracking-tighter mb-6">404</h1>
        <h2 className="text-2xl sm:text-4xl font-bold mb-8">Page Not Found</h2>
        <p className="text-lg text-gray-600 mb-8 text-center">
          Oops! The page you're looking for doesn't exist or has been moved.
        </p>
        <Link 
          href="/" 
          className="px-6 py-3 bg-[#f7fa3e] rounded-lg text-lg font-semibold hover:bg-[#e8eb37] transition-colors"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
} 