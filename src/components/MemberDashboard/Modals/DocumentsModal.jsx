import React from "react";

const DocumentsModal = ({
  groupId,
  groupName,
  documentsList = [],
  onClose,
  file,
  accessType,
  onFileChange,
  setAccessType,
  onUpload,
  onDownload,
  loading,
  isLocked = true,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
      <div className="bg-white rounded-lg p-6 max-w-3xl min-w-[300px] w-[95vw] max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Documents for {groupName}
          </h2>

          <span className="text-sm text-gray-700">
            Status:{" "}
            <span className="font-semibold">
              {isLocked ? "Locked" : "Unlocked"}
            </span>
          </span>
        </div>

        <div className="mb-4">
          <h3 className="text-lg font-medium mb-2">Upload New Document</h3>
          <div className="flex flex-col space-y-2">
            <input
              type="file"
              onChange={onFileChange}
              className="border rounded p-2 text-sm"
            />
            <select
              value={accessType}
              onChange={(e) => setAccessType(e.target.value)}
              className="border rounded p-2 text-sm"
            >
              <option value="READ">Read</option>
              <option value="WRITE">Write</option>
            </select>
            <button
              onClick={onUpload}
              disabled={!file || loading}
              className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors disabled:opacity-50"
            >
              Upload Document
            </button>
          </div>
        </div>

        <div className="overflow-x-hidden">
          <table className="w-full border-collapse bg-white shadow-sm rounded-lg">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-2 text-left text-gray-700 text-sm font-medium">
                  File Name
                </th>
                <th className="p-2 text-left text-gray-700 text-sm font-medium">
                  File Type
                </th>
                <th className="p-2 text-left text-gray-700 text-sm font-medium">
                  Access Type
                </th>
                <th className="p-2 text-left text-gray-700 text-sm font-medium">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {documentsList.map((doc) => (
                <tr key={doc.documentId} className="hover:bg-gray-50">
                  <td className="p-2 border-t text-sm truncate max-w-[200px]">
                    {doc.fileName}
                  </td>
                  <td className="p-2 border-t text-sm">{doc.fileType}</td>
                  <td className="p-2 border-t text-sm">{doc.accessType}</td>
                  <td className="p-2 border-t">
                    <button
                      disabled={isLocked}
                      onClick={() => {
                        if (!isLocked) onDownload(doc.documentId);
                      }}
                      className="px-2 py-1 bg-blue-500 text-white text-sm rounded-lg transition-colors
                                 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-500"
                    >
                      Download
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {documentsList.length === 0 && (
          <p className="mt-4 text-gray-600">No documents found for this group.</p>
        )}

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

export default DocumentsModal;
