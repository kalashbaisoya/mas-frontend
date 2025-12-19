import { useEffect, useState, useRef } from "react";

const DocumentsModal = ({
  groupId,
  groupName = "Group",

  // 🔐 Auth
  authState,                    // from WebSocket
  onCreateAuthSession,           // (groupId) => Promise<session>
  onSignAuthSession,             // (sessionId) => Promise
  checkGroupAccess,              // (groupId) => Promise<boolean>

  // 📄 Documents
  documentsList = [],
  onFetchDocuments,              // (groupId) => Promise

  // ⬆️ Upload / ⬇️ Download
  file,
  accessType,
  onFileChange,
  onUpload,
  onDownload,

  loading,
  onClose,
}) => {
  const [hasAccess, setHasAccess] = useState(false);
  const [localLoading, setLocalLoading] = useState(false);
  const [authSession, setAuthSession] = useState(null);
  const [initiatingAuth, setInitiatingAuth] = useState(false);

  // 🔒 Guards to prevent infinite calls
  const hasFetchedDocumentsRef = useRef(false);
  const hasCheckedAccessRef = useRef(false);

  // ----------------------------------------
  // Derived auth state (SINGLE SOURCE OF TRUTH)
  // ----------------------------------------
  const sessionId = authSession?.sessionId || authState?.sessionId;

  const isAuthCompleted =
    authSession?.status === "COMPLETED" ||
    authState?.groupUnlocked === true ||
    hasAccess === true;

  const isAuthInProgress =
    authSession?.status === "ACTIVE" ||
    (!!authState && !isAuthCompleted);

  // ----------------------------------------
  // One-time access check (NO document fetch)
  // ----------------------------------------
  useEffect(() => {
    if (isAuthCompleted) return;
    if (hasCheckedAccessRef.current) return;

    hasCheckedAccessRef.current = true;

    const verifyAccess = async () => {
      try {
        const allowed = await checkGroupAccess?.(groupId);
        if (allowed) setHasAccess(true);
      } catch (err) {
        console.error("Access check failed", err);
      }
    };

    verifyAccess();
  }, [groupId, isAuthCompleted]);

  // ----------------------------------------
  // Fetch documents ONCE after unlock
  // ----------------------------------------
  useEffect(() => {
    if (!isAuthCompleted) return;
    if (!onFetchDocuments) return;
    if (hasFetchedDocumentsRef.current) return;

    hasFetchedDocumentsRef.current = true;

    setLocalLoading(true);
    onFetchDocuments(groupId)
      .catch((err) => {
        console.error("Failed to fetch documents", err);
      })
      .finally(() => {
        setLocalLoading(false);
      });
  }, [isAuthCompleted, groupId]);

  // ----------------------------------------
  // Reset guards when group changes
  // ----------------------------------------
  useEffect(() => {
    hasFetchedDocumentsRef.current = false;
    hasCheckedAccessRef.current = false;
    setHasAccess(false);
    setAuthSession(null);
  }, [groupId]);

  // ----------------------------------------
  // Initiate Authentication (INSIDE MODAL)
  // ----------------------------------------
  const handleInitiateAuthentication = async () => {
    try {
      setInitiatingAuth(true);

      const session = await onCreateAuthSession(groupId);
      setAuthSession(session);

      // Already completed → unlock immediately
      if (session?.status === "COMPLETED") {
        setHasAccess(true);
      }
    } catch (err) {
      console.error("Failed to initiate authentication", err);
      alert("Failed to initiate authentication");
    } finally {
      setInitiatingAuth(false);
    }
  };

  // ----------------------------------------
  // UI
  // ----------------------------------------
  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-xl p-6 w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            Documents – {groupName}
          </h2>
          <button
            onClick={() => onClose(groupId)}
            className="text-xl text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>

        {/* ================= AUTH GATE ================= */}
        {!isAuthCompleted && (
          <div className="mb-8 p-6 bg-yellow-50 border border-yellow-300 rounded-xl text-center">
            <div className="text-5xl mb-4">🔒</div>

            <h3 className="text-xl font-semibold mb-3">
              Secure Access Required
            </h3>

            <p className="text-gray-700 mb-6">
              Documents are protected by multi-party biometric authentication.
            </p>

            {/* Start Challenge */}
            {!isAuthInProgress && (
              <button
                onClick={handleInitiateAuthentication}
                disabled={initiatingAuth}
                className="px-8 py-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                {initiatingAuth ? "Initiating..." : "Initiate Authentication"}
              </button>
            )}

            {/* Signing */}
            {isAuthInProgress && sessionId && (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Authentication in progress •{" "}
                  {authState?.verifiedCount || 0} /{" "}
                  {authSession?.requiredSignatures ||
                    authState?.requiredSignatures ||
                    "?"}
                </p>

                {authSession?.status === "ACTIVE" && (
                  <button
                    onClick={() => onSignAuthSession(sessionId)}
                    disabled={loading}
                    className="px-8 py-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {loading ? "Signing..." : "Sign with Your Biometric"}
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* ================= MAIN CONTENT ================= */}
        {isAuthCompleted && (
          <div className="space-y-8">

            {/* Upload */}
            <div className="bg-gray-50 p-6 rounded-xl border">
              <h3 className="text-lg font-semibold mb-4">
                Upload New Document
              </h3>

              <div className="flex flex-col sm:flex-row gap-4">
                <input
                  type="file"
                  onChange={onFileChange}
                  className="flex-1 border rounded-lg p-3 text-sm"
                />

                {/* Read-only select to avoid setter crash */}
                <select
                  value={accessType}
                  disabled
                  className="border rounded-lg p-3 text-sm disabled:opacity-50"
                >
                  <option value="READ">Read Only</option>
                  <option value="WRITE">Read + Write</option>
                </select>

                <button
                  onClick={onUpload}
                  disabled={!file || loading}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  Upload
                </button>
              </div>
            </div>

            {/* Documents */}
            <div>
              <h3 className="text-lg font-semibold mb-4">
                Group Documents
              </h3>

              {localLoading ? (
                <div className="text-center py-10 text-gray-500">
                  Loading documents...
                </div>
              ) : documentsList.length === 0 ? (
                <div className="text-center py-10 bg-gray-50 rounded-xl">
                  No documents yet.
                </div>
              ) : (
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="p-3">File</th>
                      <th className="p-3">Type</th>
                      <th className="p-3">Access</th>
                      <th className="p-3">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {documentsList.map((doc) => (
                      <tr key={doc.documentId} className="border-t">
                        <td className="p-3 truncate max-w-xs">
                          {doc.fileName}
                        </td>
                        <td className="p-3">
                          {doc.fileType?.split("/")[1]?.toUpperCase()}
                        </td>
                        <td className="p-3">{doc.accessType}</td>
                        <td className="p-3">
                          <button
                            onClick={() => onDownload(doc.documentId)}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                          >
                            Download
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={() => onClose(groupId)}
            className="px-6 py-3 bg-gray-200 rounded-lg hover:bg-gray-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default DocumentsModal;




// import React from 'react';

// const DocumentsModal = ({
//   groupId,
//   groupName,
//   documentsList = [],
//   onClose,
//   file,
//   accessType,
//   onFileChange,
//   setAccessType,
//   onUpload,
//   onDownload,
//   loading,
// }) => {
//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
//       <div className="bg-white rounded-lg p-6 max-w-3xl min-w-[300px] w-[95vw] max-h-[80vh] overflow-y-auto">
//         <h2 className="text-xl font-semibold mb-4 text-gray-800">
//           Documents for {groupName}
//         </h2>

//         <div className="mb-4">
//           <h3 className="text-lg font-medium mb-2">Upload New Document</h3>
//           <div className="flex flex-col space-y-2">
//             <input type="file" onChange={onFileChange} className="border rounded p-2 text-sm" />
//             <select value={accessType} onChange={(e) => setAccessType(e.target.value)} className="border rounded p-2 text-sm">
//               <option value="READ">Read</option>
//               <option value="WRITE">Write</option>
//             </select>
//             <button
//               onClick={onUpload}
//               disabled={!file || loading}
//               className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors disabled:opacity-50"
//             >
//               Upload Document
//             </button>
//           </div>
//         </div>

//         <div className="overflow-x-hidden">
//           <table className="w-full border-collapse bg-white shadow-sm rounded-lg">
//             <thead>
//               <tr className="bg-gray-200">
//                 <th className="p-2 text-left text-gray-700 text-sm font-medium">File Name</th>
//                 <th className="p-2 text-left text-gray-700 text-sm font-medium">File Type</th>
//                 <th className="p-2 text-left text-gray-700 text-sm font-medium">Access Type</th>
//                 <th className="p-2 text-left text-gray-700 text-sm font-medium">Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {documentsList.map((doc) => (
//                 <tr key={doc.documentId} className="hover:bg-gray-50">
//                   <td className="p-2 border-t text-sm truncate max-w-[200px]">{doc.fileName}</td>
//                   <td className="p-2 border-t text-sm">{doc.fileType}</td>
//                   <td className="p-2 border-t text-sm">{doc.accessType}</td>
//                   <td className="p-2 border-t">
//                     <button
//                       onClick={() => onDownload(doc.documentId)}
//                       className="px-2 py-1 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors"
//                     >
//                       Download
//                     </button>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>

//         {documentsList.length === 0 && <p className="mt-4 text-gray-600">No documents found for this group.</p>}

//         <div className="mt-4 flex justify-end">
//           <button
//             onClick={onClose}
//             className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 transition-colors"
//           >
//             Close
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default DocumentsModal;
