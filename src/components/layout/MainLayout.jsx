import Sidebar from './Sidebar';
import { Outlet } from 'react-router-dom';

const MainLayout = () => {
  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 h-screen overflow-y-auto bg-gray-100 p-6 md:ml-64">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;