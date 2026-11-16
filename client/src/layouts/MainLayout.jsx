import { Outlet, Link, useNavigate, useLocation } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../store/slices/authSlice";

const MainLayout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  const navItems = [
    {
      path: "/",
      label: "Home",
      icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
      isProtected: false,
    },
    {
      path: "/detect",
      label: "AI Detect",
      icon: "M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z",
      isProtected: false,
    },
    {
      path: "/search",
      label: "Search Food",
      icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
      isProtected: false,
    },
    {
      path: "/logs",
      label: "History",
      icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
      isProtected: true,
    },
    {
      path: "/profile",
      label: "Profile",
      icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
      isProtected: true,
    },
  ];

  const visibleNavItems = navItems.filter(
    (item) => !item.isProtected || isAuthenticated,
  );

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col pb-24 md:pb-0 selection:bg-blue-100 selection:text-blue-900">
      {/* Top Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-zinc-200/70 transition-all">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              <Link to="/" className="flex items-center gap-2.5 group">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-sm shadow-blue-500/20 group-hover:scale-105 transition-transform duration-200">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2.2"
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <span className="text-lg font-bold tracking-tight text-zinc-900">
                  Dietary
                </span>
              </Link>

              {/* Desktop Menu */}
              <div className="hidden md:flex items-center gap-1">
                {visibleNavItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 ${
                        isActive
                          ? "bg-zinc-100 text-zinc-900 font-semibold"
                          : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50"
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Desktop Auth Button */}
            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <button
                  onClick={handleLogout}
                  className="text-xs font-medium text-zinc-600 hover:text-rose-600 bg-white border border-zinc-200 hover:border-rose-200 px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer active:scale-[0.98]"
                >
                  Sign Out
                </button>
              ) : (
                <Link
                  to="/login"
                  className="text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 px-4 py-1.5 rounded-lg shadow-sm hover:shadow active:scale-[0.98] transition-all"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto py-8 px-4 sm:px-6 relative z-10">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200/60 bg-white/50 py-8 relative z-10">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-xs text-zinc-400">
            &copy; {new Date().getFullYear()} Dietary. Precision AI Nutrition &
            Health.
          </p>
        </div>
      </footer>

      {/* Mobile Floating Bottom Nav */}
      <div className="md:hidden fixed bottom-3 left-3 right-3 bg-white/90 backdrop-blur-xl border border-zinc-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.08)] rounded-2xl flex justify-around items-center py-2 px-2 z-50">
        {visibleNavItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all ${
                isActive
                  ? "text-blue-600 bg-blue-50/70 font-semibold"
                  : "text-zinc-400 hover:text-zinc-700 font-medium"
              }`}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d={item.icon}
                />
              </svg>
              <span className="text-[10px] tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default MainLayout;
