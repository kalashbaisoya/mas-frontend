import React, { useState } from "react";

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
  onAuthenticate, // optional
  isLocked = true, // add this prop from parent (defaulting to Locked)
}) => {
  const [showAuthPopup, setShowAuthPopup] = useState(false);

  const handleAuthenticateClick = () => {
    console.log("Authenticate clicked");
    setShowAuthPopup(true);
    if (onAuthenticate) onAuthenticate(groupId);
  };

  return (
    <>
      {/* Main documents modal */}
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
        <div className="bg-white rounded-lg p-6 max-w-3xl min-w-[300px] w-[95vw] max-h-[80vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              Documents for {groupName}
            </h2>

            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-700">
                Status:{" "}
                <span className="font-semibold">
                  {isLocked ? "Locked" : "Unlocked"}
                </span>
              </span>

              <button
                type="button"
                onClick={handleAuthenticateClick}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Authenticate
              </button>
            </div>
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
                onChange={(e) => setAccessType?.(e.target.value)}
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

      {/* Auth popup (rendered as sibling with higher z-index) */}
      {showAuthPopup && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center">
          <button
            type="button"
            aria-label="Close authentication popup"
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setShowAuthPopup(false)}
          />

          <div className="relative bg-white rounded-xl shadow-lg w-[90vw] max-w-sm p-6">
            <button
              type="button"
              onClick={() => setShowAuthPopup(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
              aria-label="Close"
            >
              ✕
            </button>

            <div className="flex flex-col items-center gap-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-12 w-12 text-indigo-600"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 11a3 3 0 0 0-3 3v1.5a7.5 7.5 0 0 1-1.2 4.1M12 8a6 6 0 0 0-6 6v2a9 9 0 0 1-1.5 5M12 5a9 9 0 0 1 9 9v1a11 11 0 0 1-2 6.5M15 11a3 3 0 0 1 3 3v1.5a7.5 7.5 0 0 0 1.2 4.1"
                />
              </svg>

              <p className="text-gray-800 font-semibold text-center">
                Fingerprint Authentication
              </p>
              <p className="text-gray-600 text-sm text-center">
                Place your finger on the sensor to continue.
              </p>

              <button
                type="button"
                onClick={() => setShowAuthPopup(false)}
                className="mt-2 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DocumentsModal;
