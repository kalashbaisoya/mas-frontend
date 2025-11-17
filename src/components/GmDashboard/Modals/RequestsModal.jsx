import React from 'react';

const RequestsModal = ({
  groupId,
  joinRequests = [],
  removeRequests = [],
  activeRequestTab = 'join',
  activeJoinStatusTab = 'PENDING',
  activeRemoveStatusTab = 'PENDING',
  setActiveRequestTab,
  setActiveJoinStatusTab,
  setActiveRemoveStatusTab,
  onAcceptJoin,
  onRejectJoin,
  onAcceptRemove,
  onRejectRemove,
  hasPendingRequests,
  segregateRequests,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
      <div className="bg-white rounded-lg p-6 max-w-3xl min-w-[300px] w-[95vw] max-h-[80vh] overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          Requests for Group
        </h2>


        {/* Top-Level Tabs */}
        <div className="flex border-b border-gray-200 mb-4">
          <button
            className={`px-4 py-2 text-sm font-medium flex items-center space-x-2 ${
              activeRequestTab === 'join'
                ? 'border-b-2 border-blue-500 text-blue-500'
                : 'text-gray-600 hover:text-blue-500'
            }`}
            onClick={() => setActiveRequestTab('join')}
          >
            <span>Join Requests</span>
            {hasPendingRequests(groupId, 'join') && <span className="w-2 h-2 bg-green-500 rounded-full" />}
          </button>

          <button
            className={`px-4 py-2 text-sm font-medium flex items-center space-x-2 ${
              activeRequestTab === 'remove'
                ? 'border-b-2 border-blue-500 text-blue-500'
                : 'text-gray-600 hover:text-blue-500'
            }`}
            onClick={() => setActiveRequestTab('remove')}
          >
            <span>Remove Requests</span>
            {hasPendingRequests(groupId, 'remove') && <span className="w-2 h-2 bg-green-500 rounded-full" />}
          </button>
        </div>

        {/* Join Requests */}
        {activeRequestTab === 'join' && (
          <div>
            <div className="flex border-b border-gray-200 mb-4">
              {['PENDING', 'ACCEPTED', 'REJECTED'].map((status) => (
                <button
                  key={status}
                  className={`px-4 py-2 text-sm font-medium ${
                    activeJoinStatusTab === status ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-600 hover:text-blue-500'
                  }`}
                  onClick={() => setActiveJoinStatusTab(status)}
                >
                  {status}
                </button>
              ))}
            </div>

            <div className="overflow-x-hidden">
              <table className="w-full border-collapse bg-white shadow-sm rounded-lg">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="p-2 text-left text-gray-700 text-sm font-medium">User Name</th>
                    <th className="p-2 text-left text-gray-700 text-sm font-medium">Email</th>
                    <th className="p-2 text-left text-gray-700 text-sm font-medium">Requested On</th>
                    <th className="p-2 text-left text-gray-700 text-sm font-medium">Description</th>
                    <th className="p-2 text-left text-gray-700 text-sm font-medium">Status</th>
                    {activeJoinStatusTab === 'PENDING' && <th className="p-2 text-left text-gray-700 text-sm font-medium">Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {segregateRequests(joinRequests)[activeJoinStatusTab].map((request) => (
                    <tr key={request.requestId} className="hover:bg-gray-50">
                      <td className="p-2 border-t text-sm truncate max-w-[150px]">{request.requestUserFullName}</td>
                      <td className="p-2 border-t text-sm truncate max-w-[200px]">{request.requestUserEmailId}</td>
                      <td className="p-2 border-t text-sm">{request.requestedOn?.split?.('T')?.[0] || ''}</td>
                      <td className="p-2 border-t text-sm truncate max-w-[200px]">{request.requestDescription}</td>
                      <td className="p-2 border-t text-sm">{request.status}</td>
                      {activeJoinStatusTab === 'PENDING' && (
                        <td className="p-2 border-t flex flex-wrap gap-2">
                          <button onClick={() => onAcceptJoin(groupId, request.requestId)} className="px-2 py-1 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-colors">Accept</button>
                          <button onClick={() => onRejectJoin(groupId, request.requestId)} className="px-2 py-1 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-colors">Reject</button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
              {segregateRequests(joinRequests)[activeJoinStatusTab].length === 0 && (
                <p className="mt-4 text-gray-600">No {activeJoinStatusTab.toLowerCase()} join requests.</p>
              )}
            </div>
          </div>
        )}

        {/* Remove Requests */}
        {activeRequestTab === 'remove' && (
          <div>
            <div className="flex border-b border-gray-200 mb-4">
              {['PENDING', 'ACCEPTED', 'REJECTED'].map((status) => (
                <button
                  key={status}
                  className={`px-4 py-2 text-sm font-medium ${
                    activeRemoveStatusTab === status ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-600 hover:text-blue-500'
                  }`}
                  onClick={() => setActiveRemoveStatusTab(status)}
                >
                  {status}
                </button>
              ))}
            </div>

            <div className="overflow-x-hidden">
              <table className="w-full border-collapse bg-white shadow-sm rounded-lg">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="p-2 text-left text-gray-700 text-sm font-medium">Member Name</th>
                    <th className="p-2 text-left text-gray-700 text-sm font-medium">Email</th>
                    <th className="p-2 text-left text-gray-700 text-sm font-medium">Role</th>
                    <th className="p-2 text-left text-gray-700 text-sm font-medium">Status</th>
                    {activeRemoveStatusTab === 'PENDING' && <th className="p-2 text-left text-gray-700 text-sm font-medium">Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {segregateRequests(removeRequests)[activeRemoveStatusTab].map((request) => (
                    <tr key={request.requestId} className="hover:bg-gray-50">
                      <td className="p-2 border-t text-sm truncate max-w-[150px]">{request.reqMemberName}</td>
                      <td className="p-2 border-t text-sm truncate max-w-[200px]">{request.reqMemberEmailId}</td>
                      <td className="p-2 border-t text-sm">{request.groupRoleName}</td>
                      <td className="p-2 border-t text-sm">{request.status}</td>
                      {activeRemoveStatusTab === 'PENDING' && (
                        <td className="p-2 border-t flex flex-wrap gap-2">
                          <button onClick={() => onAcceptRemove(groupId, request.requestId)} className="px-2 py-1 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-colors">Accept</button>
                          <button onClick={() => onRejectRemove(groupId, request.requestId)} className="px-2 py-1 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-colors">Reject</button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
              {segregateRequests(removeRequests)[activeRemoveStatusTab].length === 0 && (
                <p className="mt-4 text-gray-600">No {activeRemoveStatusTab.toLowerCase()} remove requests.</p>
              )}
            </div>
          </div>
        )}

        <div className="mt-4 flex justify-end">
          <button onClick={ onClose /* no-op to keep lint happy */} className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 transition-colors" onClickCapture={() => { /* preserve if parent wants */ }}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default RequestsModal;
