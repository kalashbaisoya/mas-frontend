import { useContext, useState, useEffect, useRef } from 'react';
import { AuthContext } from '../../contexts/AuthContext.jsx';
import { NavLink, useNavigate } from 'react-router-dom';

const Sidebar = () => {
  const { authData, setAuthData } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const sidebarRef = useRef(null);
  const toggleRef = useRef(null);

  const handleLogout = () => {
    setAuthData(null);
    localStorage.removeItem('authData');
    navigate('/login');
  };

  const user = authData?.user;
  const initials = user
    ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase()
    : 'U';

  // Close sidebar on outside click (excluding toggle button)
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        isOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(e.target) &&
        !toggleRef.current.contains(e.target)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isOpen]);

  return (
    <>
      {/* Toggle button for mobile */}
      <button
        ref={toggleRef}
        className="md:hidden fixed top-4 left-4 z-40 bg-gray-700 text-white px-3 py-2 rounded"
        onClick={() => setIsOpen(true)}
      >
        ☰
      </button>

      {/* Backdrop for mobile */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"></div>
      )}

      <aside
        ref={sidebarRef}
        className={`fixed top-0 left-0 h-screen w-64 bg-gray-800 text-white p-6 z-40 transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
      >
        <div className="flex flex-col justify-between h-full">
          <div>
            {user && (
              <div className="mb-8 flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center text-2xl font-bold text-white">
                  {initials}
                </div>
                <h3 className="mt-2 text-lg font-semibold">
                  {user.firstName} {user.lastName}
                </h3>
                <p className="text-sm text-gray-300">{user.emailId}</p>
                <p className="text-sm text-gray-400 mt-1">{user.contactNumber}</p>
                <span className="mt-2 inline-block px-3 py-1 text-xs bg-yellow-500 text-black rounded-full">
                  {user.systemRole.roleName}
                </span>
              </div>
            )}

            <nav className="space-y-4">
              <NavLink
                to="/dashboard-page"
                end
                className={({ isActive }) =>
                  `block hover:text-yellow-300 ${isActive ? 'text-yellow-300 font-semibold' : ''}`
                }
              >
                🏠 Home
              </NavLink>

              {user?.systemRole?.roleName === 'ADMIN' && (
                <NavLink
                  to="/dashboard-page/admin"
                  className={({ isActive }) =>
                    `block hover:text-yellow-300 ${isActive ? 'text-yellow-300 font-semibold' : ''}`
                  }
                >
                  ⚙️ Admin Panel
                </NavLink>
              )}
            </nav>
          </div>

          <button
            onClick={handleLogout}
            className="mt-6 text-sm text-red-400 hover:text-red-300"
          >
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;