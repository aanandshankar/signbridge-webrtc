import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-[720px] text-center">
        <h1 className="text-6xl font-extrabold text-gray-900">404</h1>
        <p className="mt-4 text-xl text-gray-600">Page not found</p>
        <p className="mt-2 text-sm text-gray-500">
          The page you're looking for doesn't exist or has been moved.
        </p>

        <div className="mt-8 flex items-center justify-center gap-4">
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-black transition"
          >
            Go Home
          </Link>

          <Link
            href="/"
            className="inline-block px-6 py-3 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-100 transition"
          >
            Browse Home
          </Link>
        </div>
      </div>
    </div>
  );
}
