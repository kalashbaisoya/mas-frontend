import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext.jsx';
import {
  viewAllActiveGroups,
  viewMyMembershipsGroupDetails,
  sendJoinRequest,
  viewMyJoinGroupRequests,
  sendBecomeManagerRequest,
  viewMyBecomeManagerRequests,
} from '../api/userApi';

// User Dashboard with card-based UI, modals for join requests and become manager requests
const UserDashboard = () => {
  const { authData } = useContext(AuthContext); // Get logged-in user data
  const [availableGroups, setAvailableGroups] = useState([]); // Store groups user is not a member of
  const [joinRequests, setJoinRequests] = useState([]); // Store user's join requests
  const [becomeManagerRequests, setBecomeManagerRequests] = useState([]); // Store user's become manager requests
  const [joinRequestGroupId, setJoinRequestGroupId] = useState(null); // For send join request modal
  const [viewJoinRequests, setViewJoinRequests] = useState(false); // For view join requests modal
  const [viewBecomeManagerRequests, setViewBecomeManagerRequests] = useState(false); // For view become manager requests modal
  const [sendBecomeManagerModal, setSendBecomeManagerModal] = useState(false); // For send become manager request modal
  const [joinRequestDescription, setJoinRequestDescription] = useState(''); // For join request description
  const [becomeManagerData, setBecomeManagerData] = useState({
    groupAuthType: 'B',
    requestDescription: '',
    groupName: '',
  }); // For become manager request form
  const [loading, setLoading] = useState(false); // Loading state
  const [error, setError] = useState(null); // Error state

  // Fetch available groups and requests on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [allGroupsResponse, myGroupsResponse, joinRequestsResponse, becomeManagerRequestsResponse] = await Promise.all([
          viewAllActiveGroups(),
          viewMyMembershipsGroupDetails(),
          viewMyJoinGroupRequests(),
          viewMyBecomeManagerRequests(),
        ]);

        // Filter out groups where user is already a member
        const myGroupIds = new Set(myGroupsResponse.data.map((group) => group.groupId));
        const filteredGroups = allGroupsResponse.data.filter((group) => !myGroupIds.has(group.groupId));

        setAvailableGroups(filteredGroups);
        setJoinRequests(joinRequestsResponse.data);
        setBecomeManagerRequests(becomeManagerRequestsResponse.data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch groups or requests');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (authData?.user?.userId) fetchData();
  }, [authData]);

  // Handle send join request modal open
  const handleSendJoinRequestClick = (groupId) => {
    setJoinRequestGroupId(groupId);
    setJoinRequestDescription('');
  };

  // Handle send join request
  const handleSendJoinRequest = async () => {
    if (!joinRequestGroupId || !joinRequestDescription.trim()) return;
    try {
      setLoading(true);
      const requestData = { requestDescription: joinRequestDescription };
      await sendJoinRequest(joinRequestGroupId, requestData);
      alert('Join request sent successfully');
      setJoinRequestGroupId(null);
      setJoinRequestDescription('');
      const response = await viewMyJoinGroupRequests();
      setJoinRequests(response.data); // Refresh join requests
    } catch (err) {
      setError('Failed to send join request');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle view join requests modal open
  const handleViewJoinRequestsClick = () => {
    setViewJoinRequests(true);
  };

  // Handle send become manager request modal open
  const handleSendBecomeManagerClick = () => {
    setSendBecomeManagerModal(true);
    setBecomeManagerData({ groupAuthType: 'A', requestDescription: '', groupName: '' });
  };

  // Handle become manager form input changes
  const handleBecomeManagerInputChange = (e) => {
    const { name, value } = e.target;
    setBecomeManagerData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle send become manager request
  const handleSendBecomeManagerRequest = async () => {
    if (!becomeManagerData.groupName.trim() || !becomeManagerData.requestDescription.trim()) return;
    try {
      setLoading(true);
      await sendBecomeManagerRequest(becomeManagerData);
      alert('Become manager request sent successfully');
      setSendBecomeManagerModal(false);
      setBecomeManagerData({ groupAuthType: 'A', requestDescription: '', groupName: '' });
      const response = await viewMyBecomeManagerRequests();
      setBecomeManagerRequests(response.data); // Refresh become manager requests
    } catch (err) {
      setError('Failed to send become manager request');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate pending join requests for a group
  const getPendingJoinRequestsCount = (groupId) => {
    return joinRequests.filter(
      (request) => request.requestGroupId === groupId && request.status === 'PENDING'
    ).length;
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Header */}
      <h1 className="text-3xl font-bold mb-6 text-gray-800">User Dashboard</h1>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg shadow">
          {error}
        </div>
      )}

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-30">
          <div className="bg-white p-4 rounded-lg shadow-lg flex items-center space-x-2">
            <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-gray-700">Loading...</span>
          </div>
        </div>
      )}

      {/* Groups Cards */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-gray-700">Available Groups</h2>
          <div className="flex space-x-2">
            <button
              onClick={handleViewJoinRequestsClick}
              className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
            >
              View My Join Requests
            </button>
            <button
              onClick={handleSendBecomeManagerClick}
              className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
            >
              Request to Become Manager
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableGroups.map((group) => (
            <div
              key={group.groupId}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-800">{group.groupName}</h3>
                {getPendingJoinRequestsCount(group.groupId) > 0 && (
                  <span className="relative flex items-center">
                    <svg
                      className="w-5 h-5 text-red-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                      ></path>
                    </svg>
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
                      {getPendingJoinRequestsCount(group.groupId)}
                    </span>
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 mb-1">
                <span className="font-medium">Auth Type:</span> {group.groupAuthType}
              </p>
              <p className="text-sm text-gray-600 mb-1">
                <span className="font-medium">Manager:</span> {group.managerName}
              </p>
              <p className="text-sm text-gray-600 mb-4">
                <span className="font-medium">Created On:</span> {group.createdOn}
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => handleSendJoinRequestClick(group.groupId)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Send Join Request
                </button>
              </div>
            </div>
          ))}
        </div>
        {availableGroups.length === 0 && !loading && (
          <p className="mt-4 text-gray-600">No groups available to join.</p>
        )}
      </div>

      {/* Send Join Request Modal */}
      {joinRequestGroupId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
          <div className="bg-white rounded-lg p-6 max-w-md min-w-[300px] w-[95vw]">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              Join Request for{' '}
              {availableGroups.find((g) => g.groupId === joinRequestGroupId)?.groupName}
            </h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Joining
              </label>
              <textarea
                value={joinRequestDescription}
                onChange={(e) => setJoinRequestDescription(e.target.value)}
                className="w-full border rounded p-2 text-sm"
                rows="4"
                placeholder="Enter why you should be added to the group"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setJoinRequestGroupId(null)}
                className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSendJoinRequest}
                disabled={!joinRequestDescription.trim() || loading}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
              >
                Send Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Join Requests Modal */}
      {viewJoinRequests && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
          <div className="bg-white rounded-lg p-6 max-w-3xl min-w-[300px] w-[95vw] max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">My Join Requests</h2>
            <div className="overflow-x-hidden">
              <table className="w-full border-collapse bg-white shadow-sm rounded-lg">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="p-2 text-left text-gray-700 text-sm font-medium">Group Name</th>
                    <th className="p-2 text-left text-gray-700 text-sm font-medium">User Name</th>
                    <th className="p-2 text-left text-gray-700 text-sm font-medium">Email</th>
                    <th className="p-2 text-left text-gray-700 text-sm font-medium">Requested On</th>
                    <th className="p-2 text-left text-gray-700 text-sm font-medium">Description</th>
                    <th className="p-2 text-left text-gray-700 text-sm font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {joinRequests.map((request) => (
                    <tr key={request.requestId} className="hover:bg-gray-50">
                      <td className="p-2 border-t text-sm truncate max-w-[150px]">
                        {request.requestGroupName}
                      </td>
                      <td className="p-2 border-t text-sm truncate max-w-[150px]">
                        {request.requestUserFullName}
                      </td>
                      <td className="p-2 border-t text-sm truncate max-w-[200px]">
                        {request.requestUserEmailId}
                      </td>
                      <td className="p-2 border-t text-sm">{request.requestedOn.split('T')[0]}</td>
                      <td className="p-2 border-t text-sm truncate max-w-[200px]">
                        {request.requestDescription}
                      </td>
                      <td className="p-2 border-t text-sm">{request.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {joinRequests.length === 0 && (
              <p className="mt-4 text-gray-600">No join requests found.</p>
            )}
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setViewJoinRequests(false)}
                className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Send Become Manager Request Modal */}
      {sendBecomeManagerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
          <div className="bg-white rounded-lg p-6 max-w-md min-w-[300px] w-[95vw]">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Request to Become Manager</h2>
            <div className="flex flex-col space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Group Name</label>
                <input
                  type="text"
                  name="groupName"
                  value={becomeManagerData.groupName}
                  onChange={handleBecomeManagerInputChange}
                  className="w-full border rounded p-2 text-sm"
                  placeholder="Enter group name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Auth Type</label>
                <select
                  name="groupAuthType"
                  value={becomeManagerData.groupAuthType}
                  onChange={handleBecomeManagerInputChange}
                  className="w-full border rounded p-2 text-sm"
                >
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                  <option value="D">D</option>

                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  name="requestDescription"
                  value={becomeManagerData.requestDescription}
                  onChange={handleBecomeManagerInputChange}
                  className="w-full border rounded p-2 text-sm"
                  rows="4"
                  placeholder="Enter why you want to create this group"
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end space-x-2">
              <button
                onClick={() => setSendBecomeManagerModal(false)}
                className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSendBecomeManagerRequest}
                disabled={!becomeManagerData.groupName.trim() || !becomeManagerData.requestDescription.trim() || loading}
                className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors disabled:opacity-50"
              >
                Send Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Become Manager Requests Modal */}
      {viewBecomeManagerRequests && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
          <div className="bg-white rounded-lg p-6 max-w-3xl min-w-[300px] w-[95vw] max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">My Become Manager Requests</h2>
            <div className="overflow-x-hidden">
              <table className="w-full border-collapse bg-white shadow-sm rounded-lg">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="p-2 text-left text-gray-700 text-sm font-medium">Group Name</th>
                    <th className="p-2 text-left text-gray-700 text-sm font-medium">Auth Type</th>
                    <th className="p-2 text-left text-gray-700 text-sm font-medium">Email</th>
                    <th className="p-2 text-left text-gray-700 text-sm font-medium">Description</th>
                    <th className="p-2 text-left text-gray-700 text-sm font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {becomeManagerRequests.map((request) => (
                    <tr key={request.requestId} className="hover:bg-gray-50">
                      <td className="p-2 border-t text-sm truncate max-w-[150px]">
                        {request.groupName}
                      </td>
                      <td className="p-2 border-t text-sm">{request.groupAuthType}</td>
                      <td className="p-2 border-t text-sm truncate max-w-[200px]">
                        {request.emailId}
                      </td>
                      <td className="p-2 border-t text-sm truncate max-w-[200px]">
                        {request.requestDescription}
                      </td>
                      <td className="p-2 border-t text-sm">{request.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {becomeManagerRequests.length === 0 && (
              <p className="mt-4 text-gray-600">No become manager requests found.</p>
            )}
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setViewBecomeManagerRequests(false)}
                className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;