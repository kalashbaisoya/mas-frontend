import { useNavigate } from 'react-router-dom';
import { FaUserFriends } from 'react-icons/fa';

const MemberCard = () => {
  const navigate = useNavigate();

  return (
    <div
      className="flex-1 cursor-pointer bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition duration-200"
      onClick={() => navigate('/dashboard-page/member')}
    >
      <div className="flex items-center gap-4">
        <FaUserFriends className="text-purple-600 text-3xl" />
        <h3 className="text-xl font-semibold text-purple-800">Member Panel</h3>
      </div>
      <p className="mt-2 text-sm text-gray-600">Participate in group activities and discussions.</p>
    </div>
  );
};

export default MemberCard;