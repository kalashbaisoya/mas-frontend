import React from 'react';

const GroupCard = ({ group, pendingCount, onAddMembers, onViewDetails, onViewRequests, onManageDocuments }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold text-gray-800">{group.groupName}</h3>
        {pendingCount > 0 && (
          <span className="relative flex items-center">
            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
              {pendingCount}
            </span>
          </span>
        )}
      </div>

      <p className="text-sm text-gray-600 mb-1">
        <span className="font-medium">Auth Type:</span> {group.groupAuthType}
      </p>
      <p className="text-sm text-gray-600 mb-4">
        <span className="font-medium">Created On:</span> {group.createdOn}
      </p>

      <div className="flex flex-wrap gap-3">
        <button onClick={onAddMembers} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
          Add Members
        </button>
        <button onClick={onViewDetails} className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
          View Details
        </button>
        <button onClick={onViewRequests} className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors">
          View Requests
        </button>
        <button onClick={onManageDocuments} className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors">
          Manage Documents
        </button>
      </div>
    </div>
  );
};

export default GroupCard;
