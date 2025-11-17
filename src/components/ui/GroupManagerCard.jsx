import { useNavigate } from 'react-router-dom';
import { FaUsersCog } from 'react-icons/fa';

const GroupManagerCard = () => {
  const navigate = useNavigate();

  return (
    <div
      className="flex-1 cursor-pointer bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition duration-200"
      onClick={() => navigate('/dashboard-page/group-manager')}
    >
      <div className="flex items-center gap-4">
        <FaUsersCog className="text-green-600 text-3xl" />
        <h3 className="text-xl font-semibold text-green-800">Group Manager</h3>
      </div>
      <p className="mt-2 text-sm text-gray-600">Oversee group roles, quorum, and member activity.</p>
    </div>
  );
};

export default GroupManagerCard;