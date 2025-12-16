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







// import React, { useEffect, useState } from 'react';

// /**
//  * DocumentsModal – Final Working Version (No Infinite Loop)
//  *
//  * What this does:
//  * - When modal opens → session is already created in the parent
//  * - Shows "Sign with Biometric" button when session is active
//  * - Automatically fetches documents the moment groupUnlocked becomes true
//  * - Upload + Download only appear after authentication succeeds
//  * - Clean, beautiful, and safe
//  */
// const DocumentsModal = ({
//   groupId,
//   groupName = "Group",

//   // Auth props from hook
//   authState,                        // comes from WebSocket
//   onSignAuthSession,                // (sessionId) => Promise
//   checkGroupAccess,                 // () => Promise<boolean>
//   onFetchDocuments,                 // (groupId) => Promise

//   // Documents
//   documentsList = [],

//   // Upload / Download
//   file,
//   accessType,
//   onFileChange,
//   setAccessType,
//   onUpload,
//   onDownload,

//   loading,
//   onClose,
// }) => {
//   const [hasAccess, setHasAccess] = useState(false);
//   const [localLoading, setLocalLoading] = useState(false);

//   // Derived auth states
//   const isAuthCompleted = authState?.groupUnlocked === true || hasAccess;
//   const isAuthInProgress = authState && !isAuthCompleted;
//   const sessionId = authState?.sessionId;

//   // One-time access check + fetch documents when unlocked
//   useEffect(() => {
//     const verifyAccess = async () => {
//       if (isAuthCompleted) return;

//       try {
//         const allowed = await checkGroupAccess?.(groupId);
//         setHasAccess(allowed);
//         if (allowed) {
//           onFetchDocuments?.(groupId);
//         }
//       } catch (err) {
//         console.error("Access check failed", err);
//       }
//     };

//     verifyAccess();
//   }, [groupId, isAuthCompleted, checkGroupAccess, onFetchDocuments]);

//   // Fetch documents automatically once unlocked
//   useEffect(() => {
//     if (isAuthCompleted && onFetchDocuments) {
//       setLocalLoading(true);
//       onFetchDocuments(groupId).finally(() => setLocalLoading(false));
//     }
//   }, [isAuthCompleted, groupId, onFetchDocuments]);

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//       <div className="bg-white rounded-xl p-6 w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">

//         {/* Header */}
//         <div className="flex justify-between items-center mb-6">
//           <h2 className="text-2xl font-bold text-gray-800">
//             Documents – {groupName}
//           </h2>
//           <button
//             onClick={onClose}
//             className="text-gray-500 hover:text-gray-700 text-xl"
//           >
//             ×
//           </button>
//         </div>

//         {/* Auth Gate – Big beautiful lock screen */}
//         {!isAuthCompleted && (
//           <div className="mb-8 p-6 bg-gradient-to-r from-yellow-50 to-amber-50 border border-amber-300 rounded-xl text-center">
//             <div className="text-5xl mb-4">🔒</div>
//             <h3 className="text-xl font-semibold mb-3 text-amber-800">
//               Secure Access Required
//             </h3>
//             <p className="text-gray-700 mb-6">
//               This group's documents are protected by multi-party biometric authentication.
//             </p>

//             {isAuthInProgress && sessionId && (
//               <div className="space-y-4">
//                 <p className="text-sm text-gray-600">
//                   Authentication in progress • {authState?.verifiedCount || 0} / {authState?.requiredSignatures || '?'} signatures
//                 </p>
//                 <button
//                   onClick={() => onSignAuthSession(sessionId)}
//                   disabled={loading || localLoading}
//                   className="px-8 py-4 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 shadow-md transform hover:scale-105 transition"
//                 >
//                   {loading ? 'Signing...' : 'Sign with Your Biometric'}
//                 </button>
//               </div>
//             )}

//             {!authState && (
//               <p className="text-gray-500 italic">
//                 Initializing secure session... please wait
//               </p>
//             )}
//           </div>
//         )}

//         {/* Main Content – only shown when authenticated */}
//         {isAuthCompleted && (
//           <div className="space-y-8">
//             {/* Upload Box */}
//             <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
//               <h3 className="text-lg font-semibold mb-4 text-gray-800">Upload New Document</h3>
//               <div className="flex flex-col sm:flex-row sm:items-end gap-4">
//                 <input
//                   type="file"
//                   onChange={onFileChange}
//                   className="flex-1 border rounded-lg p-3 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
//                 />
//                 <select
//                   value={accessType}
//                   onChange={(e) => setAccessType?.(e.target.value)}
//                   className="border rounded-lg p-3 text-sm bg-white"
//                 >
//                   <option value="READ">Read Only</option>
//                   <option value="WRITE">Read + Write</option>
//                 </select>
//                 <button
//                   onClick={onUpload}
//                   disabled={!file || loading}
//                   className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium"
//                 >
//                   Upload
//                 </button>
//               </div>
//             </div>

//             {/* Documents List */}
//             <div>
//               <h3 className="text-lg font-semibold mb-4 text-gray-800">Group Documents</h3>

//               {localLoading ? (
//                 <div className="text-center py-10 text-gray-500">Loading documents...</div>
//               ) : documentsList.length === 0 ? (
//                 <div className="text-center py-10 text-gray-600 bg-gray-50 rounded-xl">
//                   No documents yet. Upload your first one above!
//                 </div>
//               ) : (
//                 <div className="overflow-x-auto">
//                   <table className="w-full text-left border-collapse">
//                     <thead>
//                       <tr className="bg-gray-100">
//                         <th className="p-3 text-sm font-semibold">File Name</th>
//                         <th className="p-3 text-sm font-semibold">Type</th>
//                         <th className="p-3 text-sm font-semibold">Access</th>
//                         <th className="p-3 text-sm font-semibold">Action</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {documentsList.map((doc) => (
//                         <tr key={doc.documentId} className="border-t hover:bg-gray-50">
//                           <td className="p-3 text-sm truncate max-w-xs">{doc.fileName}</td>
//                           <td className="p-3 text-sm">{doc.fileType.split('/')[1]?.toUpperCase() || doc.fileType}</td>
//                           <td className="p-3 text-sm">{doc.accessType}</td>
//                           <td className="p-3">
//                             <button
//                               onClick={() => onDownload(doc.documentId)}
//                               className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
//                             >
//                               Download
//                             </button>
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>
//               )}
//             </div>
//           </div>
//         )}

//         {/* Footer */}
//         <div className="mt-8 flex justify-end">
//           <button
//             onClick={onClose}
//             className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-medium"
//           >
//             Close
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default DocumentsModal;


// import React, { useEffect } from 'react';

// /**
//  * DocumentsModal
//  *
//  * Flow:
//  * 1. Modal opens → authIntent already true
//  * 2. If auth not completed → show auth UI only
//  * 3. When auth completes (via WS authState) → fetch documents
//  * 4. Upload / Download enabled ONLY after auth
//  */
// const DocumentsModal = ({
//   groupId,
//   groupName,

//   /* 🔐 Auth-related */
//   authState,                 // WS-driven auth state for this group
//   onSignAuthSession,         // (sessionId) => void
//   checkGroupAccess,          // optional safety check
//   onFetchDocuments,          // (groupId) => void

//   /* 📄 Documents */
//   documentsList = [],

//   /* Upload / Download */
//   file,
//   accessType,
//   onFileChange,
//   setAccessType,
//   onUpload,
//   onDownload,

//   loading,
//   onClose,
// }) => {

//   /* ------------------ AUTH DERIVED STATE ------------------ */

// const isAuthCompleted = authState?.groupUnlocked === true || authState?.status === 'COMPLETED';
// const isAuthInProgress = authState && !isAuthCompleted;

// // Only fetch documents after auth success
// useEffect(() => {
//   if (isAuthCompleted && onFetchDocuments) {
//     onFetchDocuments(groupId);
//   }
// }, [isAuthCompleted, groupId, onFetchDocuments]);

//   /* ------------------ UI ------------------ */


//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
//       <div className="bg-white rounded-lg p-6 max-w-3xl w-[95vw] max-h-[80vh] overflow-y-auto">

//         <h2 className="text-xl font-semibold mb-4 text-gray-800">
//           Documents for {groupName}
//         </h2>

//         {/* 🔐 AUTH GATE */}
//         {!isAuthCompleted && (
//           <div className="mb-6 p-4 bg-yellow-50 border border-yellow-300 rounded">
//             <p className="text-sm text-gray-700 mb-3">
//               🔒 Documents are locked. Complete authentication to access them.
//             </p>

//             {authState?.sessionId && (
//               <button
//                 onClick={() => onSignAuthSession(authState.sessionId)}
//                 disabled={loading}
//                 className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
//               >
//                 Sign Authentication Challenge
//               </button>
//             )}

//             {!authState && (
//               <p className="text-sm text-gray-500">
//                 Waiting for authentication session to start…
//               </p>
//             )}
//           </div>
//         )}

//         {/* 🔓 AUTHORIZED CONTENT */}
//         {isAuthCompleted && (
//           <>
//             {/* Upload Section */}
//             <div className="mb-4">
//               <h3 className="text-lg font-medium mb-2">Upload New Document</h3>
//               <div className="flex flex-col space-y-2">
//                 <input
//                   type="file"
//                   onChange={onFileChange}
//                   className="border rounded p-2 text-sm"
//                 />

//                 <select
//                   value={accessType}
//                   onChange={(e) => setAccessType?.(e.target.value)}
//                   className="border rounded p-2 text-sm"
//                 >
//                   <option value="READ">Read</option>
//                   <option value="WRITE">Write</option>
//                 </select>

//                 <button
//                   onClick={onUpload}
//                   disabled={!file || loading}
//                   className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 disabled:opacity-50"
//                 >
//                   Upload Document
//                 </button>
//               </div>
//             </div>

//             {/* Documents Table */}
//             <div className="overflow-x-hidden">
//               <table className="w-full border-collapse bg-white shadow-sm rounded-lg">
//                 <thead>
//                   <tr className="bg-gray-200">
//                     <th className="p-2 text-left text-sm">File Name</th>
//                     <th className="p-2 text-left text-sm">File Type</th>
//                     <th className="p-2 text-left text-sm">Access</th>
//                     <th className="p-2 text-left text-sm">Action</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {documentsList.map((doc) => (
//                     <tr key={doc.documentId} className="hover:bg-gray-50">
//                       <td className="p-2 border-t text-sm truncate max-w-[200px]">
//                         {doc.fileName}
//                       </td>
//                       <td className="p-2 border-t text-sm">
//                         {doc.fileType}
//                       </td>
//                       <td className="p-2 border-t text-sm">
//                         {doc.accessType}
//                       </td>
//                       <td className="p-2 border-t">
//                         <button
//                           onClick={() => onDownload(doc.documentId)}
//                           className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
//                         >
//                           Download
//                         </button>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>

//             {documentsList.length === 0 && (
//               <p className="mt-4 text-gray-600">
//                 No documents available for this group.
//               </p>
//             )}
//           </>
//         )}

//         {/* Close */}
//         <div className="mt-6 flex justify-end">
//           <button
//             onClick={onClose}
//             className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
//           >
//             Close
//           </button>
//         </div>

//       </div>
//     </div>
//   );
// };

// export default DocumentsModal;




// // import { useEffect } from 'react';
// // const DocumentsModal = ({
// //   groupId,
// //   groupName,
// //   documentsList = [],
// //   authState,onSignAuthSession,checkGroupAccess,onFetchDocuments,
// //   onClose,
// //   file,
// //   accessType,
// //   onFileChange,
// //   setAccessType,
// //   onUpload,
// //   onDownload,
// //   loading,
// // }) => {
// //   const isAuthCompleted =
// //   authState?.status === 'COMPLETED';
// //   const isAuthInProgress =
// //   authState && !isAuthCompleted;


// //   return (
// //     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
// //       <div className="bg-white rounded-lg p-6 max-w-3xl min-w-[300px] w-[95vw] max-h-[80vh] overflow-y-auto">
// //         <h2 className="text-xl font-semibold mb-4 text-gray-800">
// //           Documents for {groupName}
// //         </h2>

// //         <div className="mb-4">
// //           <h3 className="text-lg font-medium mb-2">Upload New Document</h3>
// //           <div className="flex flex-col space-y-2">
// //             <input type="file" onChange={onFileChange} className="border rounded p-2 text-sm" />
// //             <select value={accessType} onChange={(e) => setAccessType?.(e.target.value)} className="border rounded p-2 text-sm">
// //               <option value="READ">Read</option>
// //               <option value="WRITE">Write</option>
// //             </select>
// //             <button
// //               onClick={onUpload}
// //               disabled={!file || loading}
// //               className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors disabled:opacity-50"
// //             >
// //               Upload Document
// //             </button>
// //           </div>
// //         </div>

// //         <div className="overflow-x-hidden">
// //           <table className="w-full border-collapse bg-white shadow-sm rounded-lg">
// //             <thead>
// //               <tr className="bg-gray-200">
// //                 <th className="p-2 text-left text-gray-700 text-sm font-medium">File Name</th>
// //                 <th className="p-2 text-left text-gray-700 text-sm font-medium">File Type</th>
// //                 <th className="p-2 text-left text-gray-700 text-sm font-medium">Access Type</th>
// //                 <th className="p-2 text-left text-gray-700 text-sm font-medium">Actions</th>
// //               </tr>
// //             </thead>
// //             <tbody>
// //               {documentsList.map((doc) => (
// //                 <tr key={doc.documentId} className="hover:bg-gray-50">
// //                   <td className="p-2 border-t text-sm truncate max-w-[200px]">{doc.fileName}</td>
// //                   <td className="p-2 border-t text-sm">{doc.fileType}</td>
// //                   <td className="p-2 border-t text-sm">{doc.accessType}</td>
// //                   <td className="p-2 border-t">
// //                     <button onClick={() => onDownload(doc.documentId)} className="px-2 py-1 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors">Download</button>
// //                   </td>
// //                 </tr>
// //               ))}
// //             </tbody>
// //           </table>
// //         </div>

// //         {documentsList.length === 0 && <p className="mt-4 text-gray-600">No documents found for this group.</p>}

// //         <div className="mt-4 flex justify-end">
// //           <button onClick={onClose} className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 transition-colors">Close</button>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // };

// // export default DocumentsModal;
