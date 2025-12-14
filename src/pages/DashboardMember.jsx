import React from 'react';
import useMemberDashboard from '../hooks/useMemberDashboard';
import GroupCard from '../components/MemberDashboard/GroupCard';
import LoadingOverlay from '../components/MemberDashboard/LoadingOverlay';
import ErrorAlert from '../components/Shared/ErrorAlert';
import MembersModal from '../components/MemberDashboard/Modals/MembersModal';
import DocumentsModal from '../components/MemberDashboard/Modals/DocumentsModal';
import RemoveRequestsModal from '../components/MemberDashboard/Modals/RemoveRequestsModal';
import SendRemoveRequestModal from '../components/MemberDashboard/Modals/SendRemoveRequestModal';

const MemberDashboard = () => {
  const {
    groups,
    members,
    documents,
    removeRequests,
    loading,
    error,
    isConnected,
    viewMembersGroupId,
    viewDocumentsGroupId,
    viewRemoveRequests,
    removeRequestGroupId,
    requestDescription,
    accessType,
    file,
    handleToggleConnection,
    handleViewMembersClick,
    handleViewDocumentsClick,
    handleViewRemoveRequestsClick,
    handleSendRemoveRequestClick,
    handleUploadDocument,
    handleDownloadDocument,
    handleFileChange,
    handleSendRemoveRequest,
    setRequestDescription,
    setAccessType,
    setViewMembersGroupId,
    setViewDocumentsGroupId,
    setViewRemoveRequests,
    setRemoveRequestGroupId,
    getPendingRemoveRequestsCount,presenceByGroup
  } = useMemberDashboard();

return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Member Dashboard</h1>

      <div className="flex justify-between items-center mb-6">
        <button
          onClick={handleToggleConnection}
          className={`px-4 py-2 rounded-lg text-white transition-colors ${
            isConnected ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
          }`}
        >
          {isConnected ? 'Disconnect' : 'Connect to Real-Time Updates'}
        </button>
      </div>

      {error && <ErrorAlert message={error} />}
      {loading && <LoadingOverlay />}

      {!isConnected && (
        <div className="mb-6 p-4 bg-yellow-100 text-yellow-700 rounded-lg shadow">
          Not connected to real-time updates. Click the button to connect.
        </div>
      )}

      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-gray-700">My Groups</h2>
          <button
            onClick={handleViewRemoveRequestsClick}
            className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
          >
            View My Remove Requests
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group) => (
            <GroupCard
              key={group.groupId}
              group={group}
              pendingCount={getPendingRemoveRequestsCount(group.groupId)}
              onViewMembers={() => handleViewMembersClick(group.groupId)}
              onViewDocuments={() => handleViewDocumentsClick(group.groupId)}
              onRequestRemoval={() => handleSendRemoveRequestClick(group.groupId)}
            />
          ))}
        </div>

        {groups.length === 0 && !loading && (
          <p className="mt-4 text-gray-600">You are not a member of any non-manager groups.</p>
        )}
      </div>

      {/* Modals — pass minimal props each needs */}
      {viewMembersGroupId && (
        <MembersModal
          groupId={viewMembersGroupId}
          membersList={members[viewMembersGroupId] || []}
          groupName={groups.find((g) => g.groupId === viewMembersGroupId)?.groupName}
          presenceByGroup={presenceByGroup}
          onClose={() => setViewMembersGroupId(null)}
        />
      )}

      {viewDocumentsGroupId && (
        <DocumentsModal
          groupId={viewDocumentsGroupId}
          documentsList={documents[viewDocumentsGroupId] || []}
          groupName={groups.find((g) => g.groupId === viewDocumentsGroupId)?.groupName}
          onClose={() => setViewDocumentsGroupId(null)}
          file={file}
          accessType={accessType}
          onFileChange={handleFileChange}
          setAccessType={setAccessType}
          onUpload={handleUploadDocument}
          onDownload={handleDownloadDocument}
          loading={loading}
        />
      )}

      {viewRemoveRequests && (
        <RemoveRequestsModal
          removeRequests={removeRequests}
          onClose={() => setViewRemoveRequests(false)}
        />
      )}

      {removeRequestGroupId && (
        <SendRemoveRequestModal
          groupId={removeRequestGroupId}
          groupName={groups.find((g) => g.groupId === removeRequestGroupId)?.groupName}
          requestDescription={requestDescription}
          setRequestDescription={setRequestDescription}
          onSend={handleSendRemoveRequest}
          onClose={() => setRemoveRequestGroupId(null)}
          loading={loading}
        />
      )}
    </div>
  );
};

export default MemberDashboard;



// import React, { useState, useEffect, useContext } from 'react';
// import { AuthContext } from '../contexts/AuthContext.jsx';
// import {
//   viewMyMembershipsGroupDetails,
//   viewMembershipsByGroupId,
//   viewAllDocumentsByGroupId,
//   downloadDocument,
//   uploadDocument,
//   viewMyRemoveFromGroupRequests,
//   sendRemoveRequest,
// } from '../api/memberApi';

// // Member Dashboard with card-based UI, modals for group details, documents, and remove requests
// const MemberDashboard = () => {
//   const { authData } = useContext(AuthContext); // Get logged-in user data
//   const [groups, setGroups] = useState([]); // Store groups where user is a member (non-manager)
//   const [members, setMembers] = useState({}); // Store members by groupId
//   const [documents, setDocuments] = useState({}); // Store documents by groupId
//   const [removeRequests, setRemoveRequests] = useState([]); // Store user's remove requests
//   const [viewMembersGroupId, setViewMembersGroupId] = useState(null); // For view members modal
//   const [viewDocumentsGroupId, setViewDocumentsGroupId] = useState(null); // For document management modal
//   const [viewRemoveRequests, setViewRemoveRequests] = useState(false); // For view remove requests modal
//   const [removeRequestGroupId, setRemoveRequestGroupId] = useState(null); // For send remove request modal
//   const [requestDescription, setRequestDescription] = useState(''); // For remove request description
//   const [file, setFile] = useState(null); // Store selected file for upload
//   const [accessType, setAccessType] = useState('READ'); // Default access type for upload
//   const [loading, setLoading] = useState(false); // Loading state
//   const [error, setError] = useState(null); // Error state

//   // Fetch groups, filter out GROUP_MANAGER roles, and fetch remove requests on mount
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         setLoading(true);
//         const [groupsResponse, removeRequestsResponse] = await Promise.all([
//           viewMyMembershipsGroupDetails(),
//           viewMyRemoveFromGroupRequests(),
//         ]);

//         // Fetch membership details for each group to check user's role
//         const filteredGroups = [];
//         for (const group of groupsResponse.data) {
//           const membershipResponse = await viewMembershipsByGroupId(group.groupId);
//           const userMembership = membershipResponse.data.find(
//             (member) => member.emailId === authData?.user?.emailId
//           );
//           // Only include groups where user is not GROUP_MANAGER
//           if (userMembership && userMembership.groupRoleName !== 'GROUP_MANAGER') {
//             filteredGroups.push(group);
//             // Fetch documents for non-manager groups
//             await fetchDocuments(group.groupId);
//           }
//         }

//         setGroups(filteredGroups);
//         setRemoveRequests(removeRequestsResponse.data);
//         setError(null);
//       } catch (err) {
//         setError('Failed to fetch groups or remove requests');
//         console.error(err);
//       } finally {
//         setLoading(false);
//       }
//     };
//     if (authData?.user?.userId && authData?.user?.emailId) fetchData();
//   }, [authData]);

//   // Fetch members for a specific group
//   const fetchMembers = async (groupId) => {
//     try {
//       setLoading(true);
//       const response = await viewMembershipsByGroupId(groupId);
//       setMembers((prev) => ({ ...prev, [groupId]: response.data }));
//       setError(null);
//     } catch (err) {
//       setError(`Failed to fetch members for group ${groupId}`);
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Fetch documents for a specific group
//   const fetchDocuments = async (groupId) => {
//     try {
//       setLoading(true);
//       const response = await viewAllDocumentsByGroupId(groupId);
//       setDocuments((prev) => ({ ...prev, [groupId]: response.data }));
//       setError(null);
//     } catch (err) {
//       setError(`Failed to fetch documents for group ${groupId}`);
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Handle view members modal open
//   const handleViewMembersClick = async (groupId) => {
//     setViewMembersGroupId(groupId);
//     await fetchMembers(groupId);
//   };

//   // Handle view documents modal open
//   const handleViewDocumentsClick = async (groupId) => {
//     setViewDocumentsGroupId(groupId);
//     await fetchDocuments(groupId);
//   };

//   // Handle view remove requests modal open
//   const handleViewRemoveRequestsClick = () => {
//     setViewRemoveRequests(true);
//   };

//   // Handle send remove request modal open
//   const handleSendRemoveRequestClick = (groupId) => {
//     setRemoveRequestGroupId(groupId);
//     setRequestDescription('');
//   };

//   // Handle file selection for upload
//   const handleFileChange = (event) => {
//     setFile(event.target.files[0]);
//   };

//   // Handle document upload
//   const handleUploadDocument = async () => {
//     if (!file || !viewDocumentsGroupId) return;
//     try {
//       setLoading(true);
//       const formData = new FormData();
//       const docData = {
//         groupId: viewDocumentsGroupId,
//         accessType: accessType,
//       };
//       formData.append('request', JSON.stringify(docData));
//       formData.append('file', file);
//       await uploadDocument(formData);
//       alert('Document uploaded successfully');
//       setFile(null);
//       setAccessType('READ');
//       await fetchDocuments(viewDocumentsGroupId); // Refresh documents
//     } catch (err) {
//       setError('Failed to upload document');
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Handle document download
//   const handleDownloadDocument = async (documentId) => {
//     try {
//       setLoading(true);
//       const response = await downloadDocument(documentId);
//       const { downloadUrl } = response.data;
//       const link = document.createElement('a');
//       link.href = downloadUrl;
//       link.download = '';
//       document.body.appendChild(link);
//       link.click();
//       document.body.removeChild(link);
//       alert('Document download initiated');
//     } catch (err) {
//       setError('Failed to download document');
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Handle send remove request
//   const handleSendRemoveRequest = async () => {
//     if (!removeRequestGroupId || !requestDescription.trim()) return;
//     try {
//       setLoading(true);
//       const requestData = { requestDescription };
//       await sendRemoveRequest(removeRequestGroupId, requestData);
//       alert('Remove request sent successfully');
//       setRemoveRequestGroupId(null);
//       setRequestDescription('');
//       const response = await viewMyRemoveFromGroupRequests();
//       setRemoveRequests(response.data); // Refresh remove requests
//     } catch (err) {
//       setError('Failed to send remove request');
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Calculate pending remove requests for a group
//   const getPendingRemoveRequestsCount = (groupId) => {
//     return removeRequests.filter(
//       (request) => request.toGroupId === groupId && request.status === 'PENDING'
//     ).length;
//   };

//   return (
//     <div className="p-6 bg-gray-100 min-h-screen">
//       {/* Header */}
//       <h1 className="text-3xl font-bold mb-6 text-gray-800">Member Dashboard</h1>

//       {/* Error Display */}
//       {error && (
//         <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg shadow">
//           {error}
//         </div>
//       )}

//       {/* Loading Overlay */}
//       {loading && (
//         <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-30">
//           <div className="bg-white p-4 rounded-lg shadow-lg flex items-center space-x-2">
//             <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
//             <span className="text-gray-700">Loading...</span>
//           </div>
//         </div>
//       )}

//       {/* Groups Cards */}
//       <div className="mb-8">
//         <div className="flex justify-between items-center mb-4">
//           <h2 className="text-2xl font-semibold text-gray-700">My Groups</h2>
//           <button
//             onClick={handleViewRemoveRequestsClick}
//             className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
//           >
//             View My Remove Requests
//           </button>
//         </div>
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
//           {groups.map((group) => (
//             <div
//               key={group.groupId}
//               className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
//             >
//               <div className="flex items-center justify-between mb-2">
//                 <h3 className="text-lg font-semibold text-gray-800">{group.groupName}</h3>
//                 {getPendingRemoveRequestsCount(group.groupId) > 0 && (
//                   <span className="relative flex items-center">
//                     <svg
//                       className="w-5 h-5 text-red-500"
//                       fill="none"
//                       stroke="currentColor"
//                       viewBox="0 0 24 24"
//                       xmlns="http://www.w3.org/2000/svg"
//                     >
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         strokeWidth="2"
//                         d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
//                       ></path>
//                     </svg>
//                     <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
//                       {getPendingRemoveRequestsCount(group.groupId)}
//                     </span>
//                   </span>
//                 )}
//               </div>
//               <p className="text-sm text-gray-600 mb-1">
//                 <span className="font-medium">Group Type:</span> {group.groupAuthType}
//               </p>
//               <p className="text-sm text-gray-600 mb-1">
//                 <span className="font-medium">Manager:</span> {group.managerName}
//               </p>
//               <p className="text-sm text-gray-600 mb-4">
//                 <span className="font-medium">Created On:</span> {group.createdOn}
//               </p>
//               <div className="flex flex-wrap gap-3">
//                 <button
//                   onClick={() => handleViewMembersClick(group.groupId)}
//                   className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
//                 >
//                   View Members
//                 </button>
//                 <button
//                   onClick={() => handleViewDocumentsClick(group.groupId)}
//                   className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
//                 >
//                   Manage Documents
//                 </button>
//                 <button
//                   onClick={() => handleSendRemoveRequestClick(group.groupId)}
//                   className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
//                 >
//                   Request Removal
//                 </button>
//               </div>
//             </div>
//           ))}
//         </div>
//         {groups.length === 0 && !loading && (
//           <p className="mt-4 text-gray-600">You are not a member of any non-manager groups.</p>
//         )}
//       </div>

//       {/* View Members Modal */}
//       {viewMembersGroupId && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
//           <div className="bg-white rounded-lg p-6 max-w-3xl min-w-[300px] w-[95vw] max-h-[80vh] overflow-y-auto">
//             <h2 className="text-xl font-semibold mb-4 text-gray-800">
//               Members of {groups.find((g) => g.groupId === viewMembersGroupId)?.groupName}
//             </h2>
//             <div className="overflow-x-hidden">
//               <table className="w-full border-collapse bg-white shadow-sm rounded-lg">
//                 <thead>
//                   <tr className="bg-gray-200">
//                     <th className="p-2 text-left text-gray-700 text-sm font-medium">Member Name</th>
//                     <th className="p-2 text-left text-gray-700 text-sm font-medium">Email</th>
//                     <th className="p-2 text-left text-gray-700 text-sm font-medium">Role</th>
//                     <th className="p-2 text-left text-gray-700 text-sm font-medium">Status</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {members[viewMembersGroupId]?.map((member) => (
//                     <tr key={member.membershipId} className="hover:bg-gray-50">
//                       <td className="p-2 border-t text-sm truncate max-w-[150px]">
//                         {member.memberName}
//                       </td>
//                       <td className="p-2 border-t text-sm truncate max-w-[200px]">
//                         {member.emailId}
//                       </td>
//                       <td className="p-2 border-t text-sm">{member.groupRoleName}</td>
//                       <td className="p-2 border-t text-sm">{member.status}</td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//             {members[viewMembersGroupId]?.length === 0 && (
//               <p className="mt-4 text-gray-600">No members in this group.</p>
//             )}
//             <div className="mt-4 flex justify-end">
//               <button
//                 onClick={() => setViewMembersGroupId(null)}
//                 className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 transition-colors"
//               >
//                 Close
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* View Documents Modal */}
//       {viewDocumentsGroupId && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
//           <div className="bg-white rounded-lg p-6 max-w-3xl min-w-[300px] w-[95vw] max-h-[80vh] overflow-y-auto">
//             <h2 className="text-xl font-semibold mb-4 text-gray-800">
//               Documents for {groups.find((g) => g.groupId === viewDocumentsGroupId)?.groupName}
//             </h2>
//             <div className="mb-4">
//               <h3 className="text-lg font-medium mb-2">Upload New Document</h3>
//               <div className="flex flex-col space-y-2">
//                 <input
//                   type="file"
//                   onChange={handleFileChange}
//                   className="border rounded p-2 text-sm"
//                 />
//                 <select
//                   value={accessType}
//                   onChange={(e) => setAccessType(e.target.value)}
//                   className="border rounded p-2 text-sm"
//                 >
//                   <option value="READ">Read</option>
//                   <option value="WRITE">Write</option>
//                 </select>
//                 <button
//                   onClick={handleUploadDocument}
//                   disabled={!file || loading}
//                   className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors disabled:opacity-50"
//                 >
//                   Upload Document
//                 </button>
//               </div>
//             </div>
//             <div className="overflow-x-hidden">
//               <table className="w-full border-collapse bg-white shadow-sm rounded-lg">
//                 <thead>
//                   <tr className="bg-gray-200">
//                     <th className="p-2 text-left text-gray-700 text-sm font-medium">File Name</th>
//                     <th className="p-2 text-left text-gray-700 text-sm font-medium">File Type</th>
//                     <th className="p-2 text-left text-gray-700 text-sm font-medium">Access Type</th>
//                     <th className="p-2 text-left text-gray-700 text-sm font-medium">Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {documents[viewDocumentsGroupId]?.map((doc) => (
//                     <tr key={doc.documentId} className="hover:bg-gray-50">
//                       <td className="p-2 border-t text-sm truncate max-w-[200px]">
//                         {doc.fileName}
//                       </td>
//                       <td className="p-2 border-t text-sm">{doc.fileType}</td>
//                       <td className="p-2 border-t text-sm">{doc.accessType}</td>
//                       <td className="p-2 border-t">
//                         <button
//                           onClick={() => handleDownloadDocument(doc.documentId)}
//                           className="px-2 py-1 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors"
//                         >
//                           Download
//                         </button>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//             {documents[viewDocumentsGroupId]?.length === 0 && (
//               <p className="mt-4 text-gray-600">No documents found for this group.</p>
//             )}
//             <div className="mt-4 flex justify-end">
//               <button
//                 onClick={() => setViewDocumentsGroupId(null)}
//                 className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 transition-colors"
//               >
//                 Close
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* View Remove Requests Modal */}
//       {viewRemoveRequests && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
//           <div className="bg-white rounded-lg p-6 max-w-3xl min-w-[300px] w-[95vw] max-h-[80vh] overflow-y-auto">
//             <h2 className="text-xl font-semibold mb-4 text-gray-800">My Remove Requests</h2>
//             <div className="overflow-x-hidden">
//               <table className="w-full border-collapse bg-white shadow-sm rounded-lg">
//                 <thead>
//                   <tr className="bg-gray-200">
//                     <th className="p-2 text-left text-gray-700 text-sm font-medium">Group Name</th>
//                     <th className="p-2 text-left text-gray-700 text-sm font-medium">Member Name</th>
//                     <th className="p-2 text-left text-gray-700 text-sm font-medium">Email</th>
//                     <th className="p-2 text-left text-gray-700 text-sm font-medium">Role</th>
//                     <th className="p-2 text-left text-gray-700 text-sm font-medium">Status</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {removeRequests.map((request) => (
//                     <tr key={request.requestId} className="hover:bg-gray-50">
//                       <td className="p-2 border-t text-sm truncate max-w-[150px]">
//                         {request.groupName}
//                       </td>
//                       <td className="p-2 border-t text-sm truncate max-w-[150px]">
//                         {request.reqMemberName}
//                       </td>
//                       <td className="p-2 border-t text-sm truncate max-w-[200px]">
//                         {request.reqMemberEmailId}
//                       </td>
//                       <td className="p-2 border-t text-sm">{request.groupRoleName}</td>
//                       <td className="p-2 border-t text-sm">{request.status}</td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//             {removeRequests.length === 0 && (
//               <p className="mt-4 text-gray-600">No remove requests found.</p>
//             )}
//             <div className="mt-4 flex justify-end">
//               <button
//                 onClick={() => setViewRemoveRequests(false)}
//                 className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 transition-colors"
//               >
//                 Close
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Send Remove Request Modal */}
//       {removeRequestGroupId && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
//           <div className="bg-white rounded-lg p-6 max-w-md min-w-[300px] w-[95vw]">
//             <h2 className="text-xl font-semibold mb-4 text-gray-800">
//               Request Removal from{' '}
//               {groups.find((g) => g.groupId === removeRequestGroupId)?.groupName}
//             </h2>
//             <div className="mb-4">
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Reason for Removal
//               </label>
//               <textarea
//                 value={requestDescription}
//                 onChange={(e) => setRequestDescription(e.target.value)}
//                 className="w-full border rounded p-2 text-sm"
//                 rows="4"
//                 placeholder="Enter the reason for requesting removal"
//               />
//             </div>
//             <div className="flex justify-end space-x-2">
//               <button
//                 onClick={() => setRemoveRequestGroupId(null)}
//                 className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 transition-colors"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleSendRemoveRequest}
//                 disabled={!requestDescription.trim() || loading}
//                 className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
//               >
//                 Send Request
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default MemberDashboard;

// import React, { useState, useEffect, useContext, useRef } from 'react';
// import { AuthContext } from '../contexts/AuthContext.jsx';
// import SockJS from 'sockjs-client';
// import { Client } from '@stomp/stompjs';
// import {
//   viewMyMembershipsGroupDetails,
//   viewMembershipsByGroupId,
//   viewAllDocumentsByGroupId,
//   downloadDocument,
//   uploadDocument,
//   viewMyRemoveFromGroupRequests,
//   sendRemoveRequest,
// } from '../api/memberApi';

// const API_URL = 'http://localhost:8080/api';

// // Member Dashboard with card-based UI, modals, and periodic heartbeat for online status
// const MemberDashboard = () => {
//   const { authData } = useContext(AuthContext);
//   const [groups, setGroups] = useState([]);
//   const [members, setMembers] = useState({});
//   const [documents, setDocuments] = useState({});
//   const [removeRequests, setRemoveRequests] = useState([]);
//   const [viewMembersGroupId, setViewMembersGroupId] = useState(null);
//   const [viewDocumentsGroupId, setViewDocumentsGroupId] = useState(null);
//   const [viewRemoveRequests, setViewRemoveRequests] = useState(false);
//   const [removeRequestGroupId, setRemoveRequestGroupId] = useState(null);
//   const [requestDescription, setRequestDescription] = useState('');
//   const [file, setFile] = useState(null);
//   const [accessType, setAccessType] = useState('READ');
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const stompClientRef = useRef(null);
//   const heartbeatIntervalRef = useRef(null);

//   // Initialize WebSocket connection and heartbeat
//   useEffect(() => {
//     if (!authData?.user?.userId) return;

//     const socket = new SockJS(`${API_URL}/ws`);
//     const stompClient = new Client({
//       webSocketFactory: () => socket,
//       connectHeaders: { Authorization: `Bearer ${localStorage.getItem('token')}` },
//       reconnectDelay: 5000,
//       heartbeatIncoming: 4000,
//       heartbeatOutgoing: 4000,
//     });

//     stompClient.onConnect = () => {
//       console.log('WebSocket connected for Member');
//       stompClientRef.current = stompClient;
//       // Start sending heartbeats every 30 seconds
//       heartbeatIntervalRef.current = setInterval(() => {
//         if (stompClient.connected) {
//           stompClient.send('/app/heartbeat', {}, JSON.stringify({}));
//         }
//       }, 30000);
//     };

//     stompClient.onStompError = (frame) => {
//       console.error('WebSocket error:', frame);
//       setError('WebSocket connection failed');
//     };

//     stompClient.activate();

//     return () => {
//       if (stompClientRef.current) {
//         stompClientRef.current.deactivate();
//         console.log('WebSocket disconnected for Member');
//       }
//       if (heartbeatIntervalRef.current) {
//         clearInterval(heartbeatIntervalRef.current);
//       }
//     };
//   }, [authData]);

//   // Fetch groups, filter out GROUP_MANAGER roles, and fetch remove requests
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         setLoading(true);
//         const [groupsResponse, removeRequestsResponse] = await Promise.all([
//           viewMyMembershipsGroupDetails(),
//           viewMyRemoveFromGroupRequests(),
//         ]);

//         const filteredGroups = [];
//         for (const group of groupsResponse.data) {
//           const membershipResponse = await viewMembershipsByGroupId(group.groupId);
//           const userMembership = membershipResponse.data.find(
//             (member) => member.emailId === authData?.user?.emailId
//           );
//           if (userMembership && userMembership.groupRoleName !== 'GROUP_MANAGER') {
//             filteredGroups.push(group);
//             await fetchDocuments(group.groupId);
//           }
//         }

//         setGroups(filteredGroups);
//         setRemoveRequests(removeRequestsResponse.data);
//         setError(null);
//       } catch (err) {
//         setError('Failed to fetch groups or remove requests');
//         console.error(err);
//       } finally {
//         setLoading(false);
//       }
//     };
//     if (authData?.user?.userId && authData?.user?.emailId) fetchData();
//   }, [authData]);

//   // Fetch members for a specific group
//   const fetchMembers = async (groupId) => {
//     try {
//       setLoading(true);
//       const response = await viewMembershipsByGroupId(groupId);
//       setMembers((prev) => ({ ...prev, [groupId]: response.data }));
//       setError(null);
//     } catch (err) {
//       setError(`Failed to fetch members for group ${groupId}`);
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Fetch documents for a specific group
//   const fetchDocuments = async (groupId) => {
//     try {
//       setLoading(true);
//       const response = await viewAllDocumentsByGroupId(groupId);
//       setDocuments((prev) => ({ ...prev, [groupId]: response.data }));
//       setError(null);
//     } catch (err) {
//       setError(`Failed to fetch documents for group ${groupId}`);
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Handle view members modal open
//   const handleViewMembersClick = async (groupId) => {
//     setViewMembersGroupId(groupId);
//     await fetchMembers(groupId);
//   };

//   // Handle view documents modal open
//   const handleViewDocumentsClick = async (groupId) => {
//     setViewDocumentsGroupId(groupId);
//     await fetchDocuments(groupId);
//   };

//   // Handle view remove requests modal open
//   const handleViewRemoveRequestsClick = () => {
//     setViewRemoveRequests(true);
//   };

//   // Handle send remove request modal open
//   const handleSendRemoveRequestClick = (groupId) => {
//     setRemoveRequestGroupId(groupId);
//     setRequestDescription('');
//   };

//   // Handle file selection for upload
//   const handleFileChange = (event) => {
//     setFile(event.target.files[0]);
//   };

//   // Handle document upload
//   const handleUploadDocument = async () => {
//     if (!file || !viewDocumentsGroupId) return;
//     try {
//       setLoading(true);
//       const formData = new FormData();
//       const docData = {
//         groupId: viewDocumentsGroupId,
//         accessType: accessType,
//       };
//       formData.append('request', JSON.stringify(docData));
//       formData.append('file', file);
//       await uploadDocument(formData);
//       alert('Document uploaded successfully');
//       setFile(null);
//       setAccessType('READ');
//       await fetchDocuments(viewDocumentsGroupId);
//     } catch (err) {
//       setError('Failed to upload document');
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Handle document download
//   const handleDownloadDocument = async (documentId) => {
//     try {
//       setLoading(true);
//       const response = await downloadDocument(documentId);
//       const { downloadUrl } = response.data;
//       const link = document.createElement('a');
//       link.href = downloadUrl;
//       link.download = '';
//       document.body.appendChild(link);
//       link.click();
//       document.body.removeChild(link);
//       alert('Document download initiated');
//     } catch (err) {
//       setError('Failed to download document');
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Handle send remove request
//   const handleSendRemoveRequest = async () => {
//     if (!removeRequestGroupId || !requestDescription.trim()) return;
//     try {
//       setLoading(true);
//       const requestData = { requestDescription };
//       await sendRemoveRequest(removeRequestGroupId, requestData);
//       alert('Remove request sent successfully');
//       setRemoveRequestGroupId(null);
//       setRequestDescription('');
//       const response = await viewMyRemoveFromGroupRequests();
//       setRemoveRequests(response.data);
//     } catch (err) {
//       setError('Failed to send remove request');
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Calculate pending remove requests for a group
//   const getPendingRemoveRequestsCount = (groupId) => {
//     return removeRequests.filter(
//       (request) => request.toGroupId === groupId && request.status === 'PENDING'
//     ).length;
//   };

//   return (
//     <div className="p-6 bg-gray-100 min-h-screen">
//       <h1 className="text-3xl font-bold mb-6 text-gray-800">Member Dashboard</h1>
//       {error && (
//         <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg shadow">
//           {error}
//         </div>
//       )}
//       {loading && (
//         <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-30">
//           <div className="bg-white p-4 rounded-lg shadow-lg flex items-center space-x-2">
//             <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
//             <span className="text-gray-700">Loading...</span>
//           </div>
//         </div>
//       )}
//       <div className="mb-8">
//         <div className="flex justify-between items-center mb-4">
//           <h2 className="text-2xl font-semibold text-gray-700">My Groups</h2>
//           <button
//             onClick={handleViewRemoveRequestsClick}
//             className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
//           >
//             View My Remove Requests
//           </button>
//         </div>
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
//           {groups.map((group) => (
//             <div
//               key={group.groupId}
//               className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
//             >
//               <div className="flex items-center justify-between mb-2">
//                 <h3 className="text-lg font-semibold text-gray-800">{group.groupName}</h3>
//                 {getPendingRemoveRequestsCount(group.groupId) > 0 && (
//                   <span className="relative flex items-center">
//                     <svg
//                       className="w-5 h-5 text-red-500"
//                       fill="none"
//                       stroke="currentColor"
//                       viewBox="0 0 24 24"
//                       xmlns="http://www.w3.org/2000/svg"
//                     >
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         strokeWidth="2"
//                         d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
//                       ></path>
//                     </svg>
//                     <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
//                       {getPendingRemoveRequestsCount(group.groupId)}
//                     </span>
//                   </span>
//                 )}
//               </div>
//               <p className="text-sm text-gray-600 mb-1">
//                 <span className="font-medium">Group Type:</span> {group.groupAuthType}
//               </p>
//               <p className="text-sm text-gray-600 mb-1">
//                 <span className="font-medium">Manager:</span> {group.managerName}
//               </p>
//               <p className="text-sm text-gray-600 mb-4">
//                 <span className="font-medium">Created On:</span> {group.createdOn}
//               </p>
//               <div className="flex flex-wrap gap-3">
//                 <button
//                   onClick={() => handleViewMembersClick(group.groupId)}
//                   className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
//                 >
//                   View Members
//                 </button>
//                 <button
//                   onClick={() => handleViewDocumentsClick(group.groupId)}
//                   className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
//                 >
//                   Manage Documents
//                 </button>
//                 <button
//                   onClick={() => handleSendRemoveRequestClick(group.groupId)}
//                   className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
//                 >
//                   Request Removal
//                 </button>
//               </div>
//             </div>
//           ))}
//         </div>
//         {groups.length === 0 && !loading && (
//           <p className="mt-4 text-gray-600">You are not a member of any non-manager groups.</p>
//         )}
//       </div>
//       {viewMembersGroupId && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
//           <div className="bg-white rounded-lg p-6 max-w-3xl min-w-[300px] w-[95vw] max-h-[80vh] overflow-y-auto">
//             <h2 className="text-xl font-semibold mb-4 text-gray-800">
//               Members of {groups.find((g) => g.groupId === viewMembersGroupId)?.groupName}
//             </h2>
//             <div className="overflow-x-hidden">
//               <table className="w-full border-collapse bg-white shadow-sm rounded-lg">
//                 <thead>
//                   <tr className="bg-gray-200">
//                     <th className="p-2 text-left text-gray-700 text-sm font-medium">Member Name</th>
//                     <th className="p-2 text-left text-gray-700 text-sm font-medium">Email</th>
//                     <th className="p-2 text-left text-gray-700 text-sm font-medium">Role</th>
//                     <th className="p-2 text-left text-gray-700 text-sm font-medium">Status</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {members[viewMembersGroupId]?.map((member) => (
//                     <tr key={member.membershipId} className="hover:bg-gray-50">
//                       <td className="p-2 border-t text-sm truncate max-w-[150px]">
//                         {member.memberName}
//                       </td>
//                       <td className="p-2 border-t text-sm truncate max-w-[200px]">
//                         {member.emailId}
//                       </td>
//                       <td className="p-2 border-t text-sm">{member.groupRoleName}</td>
//                       <td className="p-2 border-t text-sm">{member.status}</td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//             {members[viewMembersGroupId]?.length === 0 && (
//               <p className="mt-4 text-gray-600">No members in this group.</p>
//             )}
//             <div className="mt-4 flex justify-end">
//               <button
//                 onClick={() => setViewMembersGroupId(null)}
//                 className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 transition-colors"
//               >
//                 Close
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//       {viewDocumentsGroupId && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
//           <div className="bg-white rounded-lg p-6 max-w-3xl min-w-[300px] w-[95vw] max-h-[80vh] overflow-y-auto">
//             <h2 className="text-xl font-semibold mb-4 text-gray-800">
//               Documents for {groups.find((g) => g.groupId === viewDocumentsGroupId)?.groupName}
//             </h2>
//             <div className="mb-4">
//               <h3 className="text-lg font-medium mb-2">Upload New Document</h3>
//               <div className="flex flex-col space-y-2">
//                 <input
//                   type="file"
//                   onChange={handleFileChange}
//                   className="border rounded p-2 text-sm"
//                 />
//                 <select
//                   value={accessType}
//                   onChange={(e) => setAccessType(e.target.value)}
//                   className="border rounded p-2 text-sm"
//                 >
//                   <option value="READ">Read</option>
//                   <option value="WRITE">Write</option>
//                 </select>
//                 <button
//                   onClick={handleUploadDocument}
//                   disabled={!file || loading}
//                   className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors disabled:opacity-50"
//                 >
//                   Upload Document
//                 </button>
//               </div>
//             </div>
//             <div className="overflow-x-hidden">
//               <table className="w-full border-collapse bg-white shadow-sm rounded-lg">
//                 <thead>
//                   <tr className="bg-gray-200">
//                     <th className="p-2 text-left text-gray-700 text-sm font-medium">File Name</th>
//                     <th className="p-2 text-left text-gray-700 text-sm font-medium">File Type</th>
//                     <th className="p-2 text-left text-gray-700 text-sm font-medium">Access Type</th>
//                     <th className="p-2 text-left text-gray-700 text-sm font-medium">Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {documents[viewDocumentsGroupId]?.map((doc) => (
//                     <tr key={doc.documentId} className="hover:bg-gray-50">
//                       <td className="p-2 border-t text-sm truncate max-w-[200px]">
//                         {doc.fileName}
//                       </td>
//                       <td className="p-2 border-t text-sm">{doc.fileType}</td>
//                       <td className="p-2 border-t text-sm">{doc.accessType}</td>
//                       <td className="p-2 border-t">
//                         <button
//                           onClick={() => handleDownloadDocument(doc.documentId)}
//                           className="px-2 py-1 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors"
//                         >
//                           Download
//                         </button>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//             {documents[viewDocumentsGroupId]?.length === 0 && (
//               <p className="mt-4 text-gray-600">No documents found for this group.</p>
//             )}
//             <div className="mt-4 flex justify-end">
//               <button
//                 onClick={() => setViewDocumentsGroupId(null)}
//                 className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 transition-colors"
//               >
//                 Close
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//       {viewRemoveRequests && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
//           <div className="bg-white rounded-lg p-6 max-w-3xl min-w-[300px] w-[95vw] max-h-[80vh] overflow-y-auto">
//             <h2 className="text-xl font-semibold mb-4 text-gray-800">My Remove Requests</h2>
//             <div className="overflow-x-hidden">
//               <table className="w-full border-collapse bg-white shadow-sm rounded-lg">
//                 <thead>
//                   <tr className="bg-gray-200">
//                     <th className="p-2 text-left text-gray-700 text-sm font-medium">Group Name</th>
//                     <th className="p-2 text-left text-gray-700 text-sm font-medium">Member Name</th>
//                     <th className="p-2 text-left text-gray-700 text-sm font-medium">Email</th>
//                     <th className="p-2 text-left text-gray-700 text-sm font-medium">Role</th>
//                     <th className="p-2 text-left text-gray-700 text-sm font-medium">Status</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {removeRequests.map((request) => (
//                     <tr key={request.requestId} className="hover:bg-gray-50">
//                       <td className="p-2 border-t text-sm truncate max-w-[150px]">
//                         {request.groupName}
//                       </td>
//                       <td className="p-2 border-t text-sm truncate max-w-[150px]">
//                         {request.reqMemberName}
//                       </td>
//                       <td className="p-2 border-t text-sm truncate max-w-[200px]">
//                         {request.reqMemberEmailId}
//                       </td>
//                       <td className="p-2 border-t text-sm">{request.groupRoleName}</td>
//                       <td className="p-2 border-t text-sm">{request.status}</td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//             {removeRequests.length === 0 && (
//               <p className="mt-4 text-gray-600">No remove requests found.</p>
//             )}
//             <div className="mt-4 flex justify-end">
//               <button
//                 onClick={() => setViewRemoveRequests(false)}
//                 className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 transition-colors"
//               >
//                 Close
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//       {removeRequestGroupId && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
//           <div className="bg-white rounded-lg p-6 max-w-md min-w-[300px] w-[95vw]">
//             <h2 className="text-xl font-semibold mb-4 text-gray-800">
//               Request Removal from{' '}
//               {groups.find((g) => g.groupId === removeRequestGroupId)?.groupName}
//             </h2>
//             <div className="mb-4">
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Reason for Removal
//               </label>
//               <textarea
//                 value={requestDescription}
//                 onChange={(e) => setRequestDescription(e.target.value)}
//                 className="w-full border rounded p-2 text-sm"
//                 rows="4"
//                 placeholder="Enter the reason for requesting removal"
//               />
//             </div>
//             <div className="flex justify-end space-x-2">
//               <button
//                 onClick={() => setRemoveRequestGroupId(null)}
//                 className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 transition-colors"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleSendRemoveRequest}
//                 disabled={!requestDescription.trim() || loading}
//                 className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
//               >
//                 Send Request
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default MemberDashboard;




// import React, { useState, useEffect, useContext, useRef } from 'react';
// import { AuthContext } from '../contexts/AuthContext.jsx';
// import {
//   viewMyMembershipsGroupDetails,
//   viewMembershipsByGroupId,
//   viewAllDocumentsByGroupId,
//   downloadDocument,
//   uploadDocument,
//   viewMyRemoveFromGroupRequests,
//   sendRemoveRequest,
// } from '../api/memberApi';
// import { createWebSocketClient } from '../websocketService';

// const MemberDashboard = () => {
//   const { authData } = useContext(AuthContext);
//   const [groups, setGroups] = useState([]);
//   const [members, setMembers] = useState({});
//   const [documents, setDocuments] = useState({});
//   const [removeRequests, setRemoveRequests] = useState([]);
//   const [viewMembersGroupId, setViewMembersGroupId] = useState(null);
//   const [viewDocumentsGroupId, setViewDocumentsGroupId] = useState(null);
//   const [viewRemoveRequests, setViewRemoveRequests] = useState(false);
//   const [removeRequestGroupId, setRemoveRequestGroupId] = useState(null);
//   const [requestDescription, setRequestDescription] = useState('');
//   const [file, setFile] = useState(null);
//   const [accessType, setAccessType] = useState('READ');
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [isConnected, setIsConnected] = useState(false);
//   const wsClientRef = useRef(null);

//   // Handle WebSocket connection toggle
//   const handleToggleConnection = () => {
//     if (isConnected) {
//       // 🔴 Disconnect
//       if (wsClientRef.current) {
//         wsClientRef.current.disconnect();
//         wsClientRef.current = null;
//         setIsConnected(false);
//         setError(null);
//       }
//     } else {
//       // 🟢 Connect
//       const token = localStorage.getItem('token');
//       const groupId = 20; // <-- make sure this comes from your state / props

//       const client = createWebSocketClient(
//         token,
//         groupId,
//         (connected) => setIsConnected(connected), // ✅ onConnect
//         (errorMsg) => setError(errorMsg),         // ✅ onError
//         (presenceUpdate) => {
//           // optional but recommended for debugging / future UI updates
//           console.log('Presence Update:', presenceUpdate);
//         }                                          // ✅ onPresenceUpdate
//       );

//       if (client) {
//         wsClientRef.current = client;
//         client.activate(); // ⬅ direct activate (no need for wrapper)
//       }
//     }
//   };

//   // Fetch groups, filter out GROUP_MANAGER roles, and fetch remove requests
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         setLoading(true);
//         const [groupsResponse, removeRequestsResponse] = await Promise.all([
//           viewMyMembershipsGroupDetails(),
//           viewMyRemoveFromGroupRequests(),
//         ]);

//         const filteredGroups = [];
//         // const documentPromises = [];
//         for (const group of groupsResponse.data) {
//           const membershipResponse = await viewMembershipsByGroupId(group.groupId);
//           const userMembership = membershipResponse.data.find(
//             (member) => member.emailId === authData?.user?.emailId
//           );
//           if (userMembership && userMembership.groupRoleName !== 'GROUP_MANAGER') {
//             filteredGroups.push(group);
//             // documentPromises.push(fetchDocuments(group.groupId));
//           }
//         }

//         // await Promise.all(documentPromises);
//         setGroups(filteredGroups);
//         setRemoveRequests(removeRequestsResponse.data);
//         setError(null);
//       } catch (err) {
//         setError('Failed to fetch groups or remove requests');
//         console.error(err);
//       } finally {
//         setLoading(false);
//       }
//     };
//     if (authData?.user?.userId && authData?.user?.emailId) {
//       fetchData();
//     } else {
//       setError('User data not available. Please log in again.');
//     }
//   }, [authData]);

//   // Fetch members for a specific group
//   const fetchMembers = async (groupId) => {
//     try {
//       setLoading(true);
//       const response = await viewMembershipsByGroupId(groupId);
//       setMembers((prev) => ({ ...prev, [groupId]: response.data }));
//       setError(null);
//     } catch (err) {
//       setError(`Failed to fetch members for group ${groupId}`);
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Fetch documents for a specific group
//   const fetchDocuments = async (groupId) => {
//     try {
//       const response = await viewAllDocumentsByGroupId(groupId);
//       setDocuments((prev) => ({ ...prev, [groupId]: response.data }));
//     } catch (err) {
//       console.error(`Failed to fetch documents for group ${groupId}:`, err);
//       throw err;
//     }
//   };

//   // Handle view members modal open
//   const handleViewMembersClick = async (groupId) => {
//     setViewMembersGroupId(groupId);
//     await fetchMembers(groupId);
//   };

//   // Handle view documents modal open
//   const handleViewDocumentsClick = async (groupId) => {
//     setViewDocumentsGroupId(groupId);
//     await fetchDocuments(groupId);
//   };

//   // Handle view remove requests modal open
//   const handleViewRemoveRequestsClick = () => {
//     setViewRemoveRequests(true);
//   };

//   // Handle send remove request modal open
//   const handleSendRemoveRequestClick = (groupId) => {
//     setRemoveRequestGroupId(groupId);
//     setRequestDescription('');
//   };

//   // Handle file selection for upload
//   const handleFileChange = (event) => {
//     setFile(event.target.files[0]);
//   };

//   // Handle document upload
//   const handleUploadDocument = async () => {
//     if (!file || !viewDocumentsGroupId) return;
//     try {
//       setLoading(true);
//       const formData = new FormData();
//       // Create JSON object for groupId and accessType
//       const request = {
//         groupId: viewDocumentsGroupId,
//         accessType: accessType,
//       };
//       formData.append('request', new Blob([JSON.stringify(request)], { type: 'application/json' }));
//       formData.append('file', file);
//       await uploadDocument(formData);
//       alert('Document uploaded successfully');
//       setFile(null);
//       setAccessType('READ');
//       await fetchDocuments(viewDocumentsGroupId); // Refresh documents
//     } catch (err) {
//       setError('Failed to upload document');
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Handle document download
//   const handleDownloadDocument = async (documentId) => {
//     try {
//       setLoading(true);
//       const response = await downloadDocument(documentId);
//       const { downloadUrl } = response.data;
//       const link = document.createElement('a');
//       link.href = downloadUrl;
//       link.download = '';
//       document.body.appendChild(link);
//       link.click();
//       document.body.removeChild(link);
//       alert('Document download initiated');
//     } catch (err) {
//       setError('Failed to download document');
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Handle send remove request
//   const handleSendRemoveRequest = async () => {
//     if (!removeRequestGroupId || !requestDescription.trim()) return;
//     try {
//       setLoading(true);
//       const requestData = { requestDescription };
//       await sendRemoveRequest(removeRequestGroupId, requestData);
//       alert('Remove request sent successfully');
//       setRemoveRequestGroupId(null);
//       setRequestDescription('');
//       const response = await viewMyRemoveFromGroupRequests();
//       setRemoveRequests(response.data);
//     } catch (err) {
//       setError('Failed to send remove request');
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Calculate pending remove requests for a group
//   const getPendingRemoveRequestsCount = (groupId) => {
//     return removeRequests.filter(
//       (request) => request.toGroupId === groupId && request.status === 'PENDING'
//     ).length;
//   };

//   return (
//     <div className="p-6 bg-gray-100 min-h-screen">
//       <h1 className="text-3xl font-bold mb-6 text-gray-800">Member Dashboard</h1>
//       <div className="flex justify-between items-center mb-6">
//         <button
//           onClick={handleToggleConnection}
//           className={`px-4 py-2 rounded-lg text-white transition-colors ${
//             isConnected
//               ? 'bg-red-500 hover:bg-red-600'
//               : 'bg-green-500 hover:bg-green-600'
//           }`}
//         >
//           {isConnected ? 'Disconnect' : 'Connect to Real-Time Updates'}
//         </button>
//       </div>
//       {error && (
//         <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg shadow">
//           {error}
//         </div>
//       )}
//       {loading && (
//         <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-30">
//           <div className="bg-white p-4 rounded-lg shadow-lg flex items-center space-x-2">
//             <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
//             <span className="text-gray-700">Loading...</span>
//           </div>
//         </div>
//       )}
//       {!isConnected && (
//         <div className="mb-6 p-4 bg-yellow-100 text-yellow-700 rounded-lg shadow">
//           Not connected to real-time updates. Click the button to connect.
//         </div>
//       )}
//       <div className="mb-8">
//         <div className="flex justify-between items-center mb-4">
//           <h2 className="text-2xl font-semibold text-gray-700">My Groups</h2>
//           <button
//             onClick={handleViewRemoveRequestsClick}
//             className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
//           >
//             View My Remove Requests
//           </button>
//         </div>
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
//           {groups.map((group) => (
//             <div
//               key={group.groupId}
//               className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
//             >
//               <div className="flex items-center justify-between mb-2">
//                 <h3 className="text-lg font-semibold text-gray-800">{group.groupName}</h3>
//                 {getPendingRemoveRequestsCount(group.groupId) > 0 && (
//                   <span className="relative flex items-center">
//                     <svg
//                       className="w-5 h-5 text-red-500"
//                       fill="none"
//                       stroke="currentColor"
//                       viewBox="0 0 24 24"
//                       xmlns="http://www.w3.org/2000/svg"
//                     >
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         strokeWidth="2"
//                         d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
//                       ></path>
//                     </svg>
//                     <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
//                       {getPendingRemoveRequestsCount(group.groupId)}
//                     </span>
//                   </span>
//                 )}
//               </div>
//               <p className="text-sm text-gray-600 mb-1">
//                 <span className="font-medium">Group Type:</span> {group.groupAuthType}
//               </p>
//               <p className="text-sm text-gray-600 mb-1">
//                 <span className="font-medium">Manager:</span> {group.managerName}
//               </p>
//               <p className="text-sm text-gray-600 mb-4">
//                 <span className="font-medium">Created On:</span> {group.createdOn}
//               </p>
//               <div className="flex flex-wrap gap-3">
//                 <button
//                   onClick={() => handleViewMembersClick(group.groupId)}
//                   className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
//                 >
//                   View Members
//                 </button>
//                 <button
//                   onClick={() => handleViewDocumentsClick(group.groupId)}
//                   className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
//                 >
//                   Manage Documents
//                 </button>
//                 <button
//                   onClick={() => handleSendRemoveRequestClick(group.groupId)}
//                   className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
//                 >
//                   Request Removal
//                 </button>
//               </div>
//             </div>
//           ))}
//         </div>
//         {groups.length === 0 && !loading && (
//           <p className="mt-4 text-gray-600">You are not a member of any non-manager groups.</p>
//         )}
//       </div>
//       {viewMembersGroupId && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
//           <div className="bg-white rounded-lg p-6 max-w-3xl min-w-[300px] w-[95vw] max-h-[80vh] overflow-y-auto">
//             <h2 className="text-xl font-semibold mb-4 text-gray-800">
//               Members of {groups.find((g) => g.groupId === viewMembersGroupId)?.groupName}
//             </h2>
//             <div className="overflow-x-hidden">
//               <table className="w-full border-collapse bg-white shadow-sm rounded-lg">
//                 <thead>
//                   <tr className="bg-gray-200">
//                     <th className="p-2 text-left text-gray-700 text-sm font-medium">Member Name</th>
//                     <th className="p-2 text-left text-gray-700 text-sm font-medium">Email</th>
//                     <th className="p-2 text-left text-gray-700 text-sm font-medium">Role</th>
//                     <th className="p-2 text-left text-gray-700 text-sm font-medium">Status</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {members[viewMembersGroupId]?.map((member) => (
//                     <tr key={member.membershipId} className="hover:bg-gray-50">
//                       <td className="p-2 border-t text-sm truncate max-w-[150px]">
//                         {member.memberName}
//                       </td>
//                       <td className="p-2 border-t text-sm truncate max-w-[200px]">
//                         {member.emailId}
//                       </td>
//                       <td className="p-2 border-t text-sm">{member.groupRoleName}</td>
//                       <td className="p-2 border-t text-sm">{member.status}</td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//             {members[viewMembersGroupId]?.length === 0 && (
//               <p className="mt-4 text-gray-600">No members in this group.</p>
//             )}
//             <div className="mt-4 flex justify-end">
//               <button
//                 onClick={() => setViewMembersGroupId(null)}
//                 className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 transition-colors"
//               >
//                 Close
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//       {viewDocumentsGroupId && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
//           <div className="bg-white rounded-lg p-6 max-w-3xl min-w-[300px] w-[95vw] max-h-[80vh] overflow-y-auto">
//             <h2 className="text-xl font-semibold mb-4 text-gray-800">
//               Documents for {groups.find((g) => g.groupId === viewDocumentsGroupId)?.groupName}
//             </h2>
//             <div className="mb-4">
//               <h3 className="text-lg font-medium mb-2">Upload New Document</h3>
//               <div className="flex flex-col space-y-2">
//                 <input
//                   type="file"
//                   onChange={handleFileChange}
//                   className="border rounded p-2 text-sm"
//                 />
//                 <select
//                   value={accessType}
//                   onChange={(e) => setAccessType(e.target.value)}
//                   className="border rounded p-2 text-sm"
//                 >
//                   <option value="READ">Read</option>
//                   <option value="WRITE">Write</option>
//                 </select>
//                 <button
//                   onClick={handleUploadDocument}
//                   disabled={!file || loading}
//                   className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors disabled:opacity-50"
//                 >
//                   Upload Document
//                 </button>
//               </div>
//             </div>
//             <div className="overflow-x-hidden">
//               <table className="w-full border-collapse bg-white shadow-sm rounded-lg">
//                 <thead>
//                   <tr className="bg-gray-200">
//                     <th className="p-2 text-left text-gray-700 text-sm font-medium">File Name</th>
//                     <th className="p-2 text-left text-gray-700 text-sm font-medium">File Type</th>
//                     <th className="p-2 text-left text-gray-700 text-sm font-medium">Access Type</th>
//                     <th className="p-2 text-left text-gray-700 text-sm font-medium">Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {documents[viewDocumentsGroupId]?.map((doc) => (
//                     <tr key={doc.documentId} className="hover:bg-gray-50">
//                       <td className="p-2 border-t text-sm truncate max-w-[200px]">
//                         {doc.fileName}
//                       </td>
//                       <td className="p-2 border-t text-sm">{doc.fileType}</td>
//                       <td className="p-2 border-t text-sm">{doc.accessType}</td>
//                       <td className="p-2 border-t">
//                         <button
//                           onClick={() => handleDownloadDocument(doc.documentId)}
//                           className="px-2 py-1 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors"
//                         >
//                           Download
//                         </button>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//             {documents[viewDocumentsGroupId]?.length === 0 && (
//               <p className="mt-4 text-gray-600">No documents found for this group.</p>
//             )}
//             <div className="mt-4 flex justify-end">
//               <button
//                 onClick={() => setViewDocumentsGroupId(null)}
//                 className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 transition-colors"
//               >
//                 Close
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//       {viewRemoveRequests && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
//           <div className="bg-white rounded-lg p-6 max-w-3xl min-w-[300px] w-[95vw] max-h-[80vh] overflow-y-auto">
//             <h2 className="text-xl font-semibold mb-4 text-gray-800">My Remove Requests</h2>
//             <div className="overflow-x-hidden">
//               <table className="w-full border-collapse bg-white shadow-sm rounded-lg">
//                 <thead>
//                   <tr className="bg-gray-200">
//                     <th className="p-2 text-left text-gray-700 text-sm font-medium">Group Name</th>
//                     <th className="p-2 text-left text-gray-700 text-sm font-medium">Member Name</th>
//                     <th className="p-2 text-left text-gray-700 text-sm font-medium">Email</th>
//                     <th className="p-2 text-left text-gray-700 text-sm font-medium">Role</th>
//                     <th className="p-2 text-left text-gray-700 text-sm font-medium">Status</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {removeRequests.map((request) => (
//                     <tr key={request.requestId} className="hover:bg-gray-50">
//                       <td className="p-2 border-t text-sm truncate max-w-[150px]">
//                         {request.groupName}
//                       </td>
//                       <td className="p-2 border-t text-sm truncate max-w-[150px]">
//                         {request.reqMemberName}
//                       </td>
//                       <td className="p-2 border-t text-sm truncate max-w-[200px]">
//                         {request.reqMemberEmailId}
//                       </td>
//                       <td className="p-2 border-t text-sm">{request.groupRoleName}</td>
//                       <td className="p-2 border-t text-sm">{request.status}</td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//             {removeRequests.length === 0 && (
//               <p className="mt-4 text-gray-600">No remove requests found.</p>
//             )}
//             <div className="mt-4 flex justify-end">
//               <button
//                 onClick={() => setViewRemoveRequests(false)}
//                 className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 transition-colors"
//               >
//                 Close
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//       {removeRequestGroupId && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
//           <div className="bg-white rounded-lg p-6 max-w-md min-w-[300px] w-[95vw]">
//             <h2 className="text-xl font-semibold mb-4 text-gray-800">
//               Request Removal from{' '}
//               {groups.find((g) => g.groupId === removeRequestGroupId)?.groupName}
//             </h2>
//             <div className="mb-4">
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Reason for Removal
//               </label>
//               <textarea
//                 value={requestDescription}
//                 onChange={(e) => setRequestDescription(e.target.value)}
//                 className="w-full border rounded p-2 text-sm"
//                 rows="4"
//                 placeholder="Enter the reason for requesting removal"
//               />
//             </div>
//             <div className="flex justify-end space-x-2">
//               <button
//                 onClick={() => setRemoveRequestGroupId(null)}
//                 className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 transition-colors"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleSendRemoveRequest}
//                 disabled={!requestDescription.trim() || loading}
//                 className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
//               >
//                 Send Request
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default MemberDashboard;



// ---

// ### Changes Made
// 1. **Hardcoded API_URL**:
//    - Replaced `const API_URL = 'http://localhost:8080'` with `process.env.REACT_APP_API_URL || 'http://localhost:8080'`.
//    - Add to your `.env` file: `REACT_APP_API_URL=https://your-production-url` for production.
//    - Ensures the WebSocket URL (`${API_URL}/api/ws`) is environment-agnostic.

// 2. **Incorrect Heartbeat Payload**:
//    - Changed `stompClient.send('/app/heartbeat', {}, JSON.stringify({}))` to `stompClient.send('/app/heartbeat', {}, '')`, sending an empty payload as expected by `HeartbeatController`.

// 3. **Heartbeat Error Handling**:
//    - Wrapped `stompClient.send` in a `try-catch` block to catch send failures.
//    - Set error messages via `setError` (e.g., “Failed to send heartbeat”) to inform the user.

// 4. **WebSocket Reconnection Handling**:
//    - Added `isConnected` state to track WebSocket status.
//    - Added `onWebSocketClose` handler to update `isConnected` and show errors.
//    - Added a UI warning (`bg-yellow-100`) when `!isConnected` to indicate connection issues.
//    - Pause heartbeats when `!stompClient.connected` in the `setInterval`.

// 5. **Cleanup of Previous Connections**:
//    - Made `stompClient.deactivate()` synchronous in the cleanup function using `.then()`.
//    - Ensures only one WebSocket connection is active per component mount.

// 6. **Validation for `authData` and Token**:
//    - Added checks for `authData?.user?.userId`, `authData?.user?.emailId`, and `localStorage.getItem('token')` before creating `stompClient`.
//    - Set error messages if either is missing, prompting re-login.

// 7. **Heartbeat Timing Mismatch**:
//    - Set `heartbeatIncoming: 0` and `heartbeatOutgoing: 0` in `stompClient` config to disable STOMP heartbeats, relying solely on application-level heartbeats (`/app/heartbeat`).

// 8. **Race Condition in Data Fetching**:
//    - Moved `fetchDocuments` calls into a `Promise.all` array (`documentPromises`) to handle concurrent fetches safely.
//    - Added error handling in `fetchDocuments` to propagate errors to `Promise.all`, preventing state inconsistencies.

// ---

// ### Testing the Updated Flow
// To verify the changes work with the backend (`/api/ws`, `/app/heartbeat`), follow these steps using `wscat` (as described previously) to simulate the backend interaction, then run the frontend:

// 1. **Backend Verification**:
//    - Connect as a member (`user2@example.com` with `ROLE_USER` JWT):
//      ```bash
//      wscat -c ws://localhost:8080/api/ws -H "Authorization: Bearer <member-jwt>"
//      ```
//      - Send `CONNECT` and periodic `SEND` to `/app/heartbeat`:
//        ```
//        SEND
//        destination:/app/heartbeat
//        content-length:0

//        ^@
//        ```
//      - Check `GroupAuthState` table: `isOnline=Y`, `lastUpdated=now`.
//      - Stop heartbeats, wait 60 seconds, verify `isOnline=N`.

// 2. **Frontend Testing**:
//    - Add to `.env`: `REACT_APP_API_URL=http://localhost:8080`.
//    - Run the React app: `npm start`.
//    - Log in as a member (`user2@example.com`) to load `MemberDashboard`.
//    - Check browser console for logs: “WebSocket connected for Member”, “Sent heartbeat” every 30 seconds.
//    - If the JWT is invalid or missing, expect an error: “Authentication token missing. Please log in again.”
//    - Disconnect the network temporarily; expect a UI warning: “Connecting to real-time updates...” and console log: “WebSocket closed”.
//    - Check `GroupAuthState` table to confirm `isOnline` updates.
//    - Verify no subscription attempts to `/topic/group/{groupId}/membership-status` (GM-only).

// 3. **Error Handling**:
//    - Use an invalid JWT in `localStorage.setItem('token', '<invalid-jwt>')` and reload; expect an error in the UI.
//    - Stop the backend and send heartbeats; expect “Failed to send heartbeat” in the UI.

// ---

// ### Notes
// - **Member-Only Focus**: No GM subscription logic added, as confirmed this is for members only. GMs need a separate component (e.g., `GroupManagerDashboard`) to subscribe to `/topic/group/{groupId}/membership-status`.
// - **Alignment with Flow**: The updated code ensures members send heartbeats every 30 seconds to `/app/heartbeat`, updating `GroupAuthState` as expected. GMs track statuses via a separate dashboard, aligning with your statement.
// - **UI Addition**: Added a connection status warning to improve user experience, but kept the existing UI intact.
// - **Environment**: Use `.env` for `REACT_APP_API_URL` in production (e.g., `https://your-app.com` with `wss://` for WebSocket).

// ---

// ### Clarifications Needed
// 1. **JWT Structure**: Confirm `authData` contains `user.userId` and `user.emailId`, and `localStorage.getItem('token')` matches your JWT setup.
// 2. **Environment Setup**: Is `.env` with `REACT_APP_API_URL` suitable, or do you prefer a relative URL (`/api/ws`)?
// 3. **Error Display**: Is the `bg-yellow-100` warning for connection issues okay, or do you want a different UI approach?
// 4. **Testing**: Need help setting up `wscat` or a Python script for backend testing?
// 5. **Next Steps**: Implement `GroupManagerDashboard` for GM status tracking, add request approval/rejection APIs, or another feature?

// Let me know if the changes look good or need tweaks, and what’s next, bro! 😎