import { useNavigate } from 'react-router-dom';
import { FaUserShield } from 'react-icons/fa';

const AdminCard = () => {
  const navigate = useNavigate();

  return (
    <div
      className="flex-1 cursor-pointer bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition duration-200"
      onClick={() => navigate('/dashboard-page/admin')}
    >
      <div className="flex items-center gap-4">
        <FaUserShield className="text-red-600 text-3xl" />
        <h3 className="text-xl font-semibold text-red-800">Admin Panel</h3>
      </div>
      <p className="mt-2 text-sm text-gray-600">Manage system-wide configurations and users.</p>
    </div>
  );
};

export default AdminCard;