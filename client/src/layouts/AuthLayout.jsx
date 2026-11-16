import { Outlet, Link } from 'react-router';

const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col justify-between relative selection:bg-blue-100 selection:text-blue-900">
      {/* Subtle background ambient pattern */}
      <div className="fixed inset-0 bg-pattern opacity-60 pointer-events-none" />
      
      {/* Top minimal header */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-sm shadow-blue-500/20 group-hover:scale-105 transition-transform duration-200">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="text-xl font-bold tracking-tight text-zinc-900">Dietary</span>
        </Link>

        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-900 transition-colors py-1.5 px-3 rounded-lg hover:bg-zinc-100/80"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Home
        </Link>
      </header>

      {/* Main card container */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 relative z-10">
        <div className="w-full max-w-[420px]">
          <Outlet />
        </div>
      </main>

      {/* Subtle bottom footer */}
      <footer className="relative z-10 py-6 text-center text-xs text-zinc-400">
        &copy; {new Date().getFullYear()} Dietary. Precision AI Nutrition & Health.
      </footer>
    </div>
  );
};

export default AuthLayout;
