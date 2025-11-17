import React from 'react';

const RemoveRequestsModal = ({ removeRequests = [], onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
      <div className="bg-white rounded-lg p-6 max-w-3xl min-w-[300px] w-[95vw] max-h-[80vh] overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">My Remove Requests</h2>

        <div className="overflow-x-hidden">
          <table className="w-full border-collapse bg-white shadow-sm rounded-lg">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-2 text-left text-gray-700 text-sm font-medium">Group Name</th>
                <th className="p-2 text-left text-gray-700 text-sm font-medium">Member Name</th>
                <th className="p-2 text-left text-gray-700 text-sm font-medium">Email</th>
                <th className="p-2 text-left text-gray-700 text-sm font-medium">Role</th>
                <th className="p-2 text-left text-gray-700 text-sm font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {removeRequests.map((request) => (
                <tr key={request.requestId} className="hover:bg-gray-50">
                  <td className="p-2 border-t text-sm truncate max-w-[150px]">{request.groupName}</td>
                  <td className="p-2 border-t text-sm truncate max-w-[150px]">{request.reqMemberName}</td>
                  <td className="p-2 border-t text-sm truncate max-w-[200px]">{request.reqMemberEmailId}</td>
                  <td className="p-2 border-t text-sm">{request.groupRoleName}</td>
                  <td className="p-2 border-t text-sm">{request.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {removeRequests.length === 0 && <p className="mt-4 text-gray-600">No remove requests found.</p>}

        <div className="mt-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default RemoveRequestsModal;
