import React from 'react';

const AddMemberModal = ({ groupId, users = [], selectedUsers = [], onUserSelect, onAddMembers, onClose, loading }) => {
  const isSelected = (userId) => selectedUsers.some((u) => u.userId === userId);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
      <div className="bg-white rounded-lg p-6 max-w-3xl min-w-[300px] w-[95vw] max-h-[80vh] overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Add Members to Group</h2>

        <div className="overflow-x-hidden">
          <table className="w-full border-collapse mb-4">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-2 text-left text-gray-700 text-sm font-medium">Select</th>
                <th className="p-2 text-left text-gray-700 text-sm font-medium">Name</th>
                <th className="p-2 text-left text-gray-700 text-sm font-medium">Email</th>
                <th className="p-2 text-left text-gray-700 text-sm font-medium">Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.userId} className="hover:bg-gray-50">
                  <td className="p-2 border-t">
                    <input
                      type="checkbox"
                      checked={isSelected(user.userId)}
                      onChange={() => onUserSelect(user.userId, 'MEMBER')}
                    />
                  </td>
                  <td className="p-2 border-t text-sm truncate max-w-[150px]">{user.firstName} {user.lastName}</td>
                  <td className="p-2 border-t text-sm truncate max-w-[200px]">{user.emailId}</td>
                  <td className="p-2 border-t text-sm">
                    <select
                      onChange={(e) => onUserSelect(user.userId, e.target.value)}
                      value={selectedUsers.find((u) => u.userId === user.userId)?.groupRoleName || 'MEMBER'}
                      className="border rounded p-1 w-full text-sm"
                    >
                      <option value="MEMBER">Member</option>
                      <option value="PANELIST">Panelist</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {users.length === 0 && <p className="mt-4 text-gray-600">No new users available to add.</p>}

        <div className="flex justify-end space-x-2">
          <button onClick={onClose} className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 transition-colors">
            Cancel
          </button>
          <button
            onClick={onAddMembers}
            disabled={selectedUsers.length === 0 || loading}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
          >
            Add Selected
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddMemberModal;
