import { useNavigate } from 'react-router-dom';
import { FaUser } from 'react-icons/fa';

const UserCard = () => {
  const navigate = useNavigate();

  return (
    <div
      className="flex-1 cursor-pointer bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition duration-200"
      onClick={() => navigate('/dashboard-page/user')}
    >
      <div className="flex items-center gap-4">
        <FaUser className="text-blue-600 text-3xl" />
        <h3 className="text-xl font-semibold text-blue-800">User Panel</h3>
      </div>
      <p className="mt-2 text-sm text-gray-600">Access your personal dashboard and settings.</p>
    </div>
  );
};

export default UserCard;