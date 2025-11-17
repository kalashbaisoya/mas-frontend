import React from 'react';

const SendRemoveRequestModal = ({
  groupId,
  groupName,
  requestDescription,
  setRequestDescription,
  onSend,
  onClose,
  loading,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
      <div className="bg-white rounded-lg p-6 max-w-md min-w-[300px] w-[95vw]">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          Request Removal from {groupName}
        </h2>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Reason for Removal</label>
          <textarea
            value={requestDescription}
            onChange={(e) => setRequestDescription(e.target.value)}
            className="w-full border rounded p-2 text-sm"
            rows="4"
            placeholder="Enter the reason for requesting removal"
          />
        </div>

        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onSend}
            disabled={!requestDescription.trim() || loading}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
          >
            Send Request
          </button>
        </div>
      </div>
    </div>
  );
};

export default SendRemoveRequestModal;
