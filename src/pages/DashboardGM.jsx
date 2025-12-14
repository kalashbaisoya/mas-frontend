import React from 'react';
import useGmDashboard from '../hooks/useGmDashboard.js';
import GroupCard from '../components/GmDashboard/GroupCard';
import LoadingOverlay from '../components/GmDashboard/LoadingOverlay';
import ErrorAlert from '../components/Shared/ErrorAlert';
import AddMemberModal from '../components/GmDashboard/Modals/AddMemberModal';
import MembersModal from '../components/GmDashboard/Modals/MembersModal';
import RequestsModal from '../components/GmDashboard/Modals/RequestsModal';
import DocumentsModal from '../components/GmDashboard/Modals/DocumentsModal.jsx';
// Group Manager Dashboard with card-based UI, responsive modals, and tabbed requests

const GMDashboard = () => {
const {
    groups,
    users,
    members,
    joinRequests,
    removeRequests,
    documents,
    selectedGroupId,
    selectedUsers,
    viewDetailsGroupId,
    viewRequestsGroupId,
    viewDocumentsGroupId,
    activeRequestTab,
    activeJoinStatusTab,
    activeRemoveStatusTab,
    loading,error,
    file,accessType, presenceByGroup,
    handleAcceptJoinRequest,handleAcceptRemoveRequest,
    handleAddMemberClick,handleAddMembers,
    handleDownloadDocument,handleFileChange,handleUploadDocument,
    handleRejectJoinRequest,handleRejectRemoveRequest,handleRemoveMember,
    handleSuspendMember,handleUnsuspendMember,
    handleUserSelect,handleViewDetailsClick,handleViewDocumentsClick,handleViewRequestsClick,
    hasPendingRequests,getPendingRequestsCount,segregateRequests,
    setViewDocumentsGroupId,setActiveJoinStatusTab,setActiveRemoveStatusTab,
    setActiveRequestTab,setSelectedGroupId,setViewDetailsGroupId,setViewRequestsGroupId,
  } = useGmDashboard() ;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Group Manager Dashboard</h1>

      {error && <ErrorAlert message={error} />}

      {loading && <LoadingOverlay />}

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-gray-700">My Groups</h2>
        {Array.isArray(groups) && groups.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group) => (
            <GroupCard
              key={group.groupId}
              group={group}
              pendingCount={getPendingRequestsCount(group.groupId)}
              onAddMembers={() => handleAddMemberClick(group.groupId)}
              onViewDetails={() => handleViewDetailsClick(group.groupId)}
              onViewRequests={() => handleViewRequestsClick(group.groupId)}
              onManageDocuments={() => handleViewDocumentsClick(group.groupId)}
            />
          ))}
        </div> 
        ): (
            !loading && <p className="mt-4 text-gray-600">No groups found where you are the manager.</p>
        )}

        {/* {groups.length === 0 && !loading && (
          <p className="mt-4 text-gray-600">No groups found where you are the manager.</p>
        )} */}
      </div>

      {/* Modals */}
      {viewDetailsGroupId && (
        <MembersModal
          groupId={viewDetailsGroupId}
          membersList={members[viewDetailsGroupId] || []}
          groupName={groups.find((g) => g.groupId === viewDetailsGroupId)?.groupName}
          presenceByGroup={presenceByGroup}
          onClose={() => setViewDetailsGroupId(null)}
          onSuspend={handleSuspendMember}
          onUnsuspend={handleUnsuspendMember}
          onRemove={handleRemoveMember}
        />
      )}

      {selectedGroupId && (
        <AddMemberModal
          groupId={selectedGroupId}
          users={users}
          selectedUsers={selectedUsers}
          onUserSelect={handleUserSelect}
          onAddMembers={handleAddMembers}
          onClose={() => setSelectedGroupId(null)}
          loading={loading}
        />
      )}

      {viewRequestsGroupId && (
        <RequestsModal
          groupId={viewRequestsGroupId}
          joinRequests={joinRequests[viewRequestsGroupId] || []}
          removeRequests={removeRequests[viewRequestsGroupId] || []}
          activeRequestTab={activeRequestTab}
          activeJoinStatusTab={activeJoinStatusTab}
          activeRemoveStatusTab={activeRemoveStatusTab}
          setActiveRequestTab={setActiveRequestTab}
          setActiveJoinStatusTab={setActiveJoinStatusTab}
          setActiveRemoveStatusTab={setActiveRemoveStatusTab}
          onAcceptJoin={handleAcceptJoinRequest}
          onRejectJoin={handleRejectJoinRequest}
          onAcceptRemove={handleAcceptRemoveRequest}
          onRejectRemove={handleRejectRemoveRequest}
          hasPendingRequests={hasPendingRequests}
          segregateRequests={segregateRequests}
          onClose={() => setViewRequestsGroupId(null)}
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
          setAccessType={(v) => {} /* hook doesn't expose setter; keep if you add one */}
          onUpload={handleUploadDocument}
          onDownload={handleDownloadDocument}
          loading={loading}
        />
      )}
    </div>
  );
};

export default GMDashboard;


// import React, { useState, useEffect, useContext } from 'react';
// import { AuthContext } from '../contexts/AuthContext.jsx';
// import {
//   // viewAllActiveGroups,
//   getAllVerifiedUserProfile,
//   addMember,
//   viewMembershipsByGroupId,
//   suspendMember,
//   unsuspendMember,
//   removeMember,
//   viewAllGroupJoinRequestByGroupId,
//   viewAllRemoveFromGroupRequests,
//   acceptJoinRequest,
//   rejectJoinRequest,
//   acceptRemoveRequest,
//   rejectRemoveRequest,
//   viewAllDocumentsByGroupId,
//   downloadDocument,
//   uploadDocument, viewMyMembershipsGroupDetails,
// } from '../api/gmApi'; // Updated import to include document APIs

// // Group Manager Dashboard with card-based UI, responsive modals, and tabbed requests
// const GMDashboard = () => {
//   const { authData } = useContext(AuthContext); // Get logged-in user data
//   const [groups, setGroups] = useState([]); // Store groups where user is manager
//   const [users, setUsers] = useState([]); // Store verified users for adding
//   const [members, setMembers] = useState({}); // Store members by groupId
//   const [joinRequests, setJoinRequests] = useState({}); // Store join requests by groupId
//   const [removeRequests, setRemoveRequests] = useState({}); // Store remove requests by groupId
//   const [documents, setDocuments] = useState({}); // Store documents by groupId
//   const [selectedGroupId, setSelectedGroupId] = useState(null); // For add member modal
//   const [selectedUsers, setSelectedUsers] = useState([]); // Users to add
//   const [viewDetailsGroupId, setViewDetailsGroupId] = useState(null); // For view details modal
//   const [viewRequestsGroupId, setViewRequestsGroupId] = useState(null); // For view requests modal
//   const [viewDocumentsGroupId, setViewDocumentsGroupId] = useState(null); // For document management modal
//   const [activeRequestTab, setActiveRequestTab] = useState('join'); // 'join' or 'remove'
//   const [activeJoinStatusTab, setActiveJoinStatusTab] = useState('PENDING'); // Join status
//   const [activeRemoveStatusTab, setActiveRemoveStatusTab] = useState('PENDING'); // Remove status
//   const [loading, setLoading] = useState(false); // Loading state
//   const [error, setError] = useState(null); // Error state
//   const [file, setFile] = useState(null); // Store selected file for upload
//   const [accessType, setAccessType] = useState('READ'); // Default access type for upload

//   // Fetch groups where user is manager on mount
//   useEffect(() => {
//     const fetchGroups = async () => {
//       try {
//         setLoading(true);
//         const response = await viewMyMembershipsGroupDetails();
//         // Filter groups where managerId matches authData.user.userId
//         const userGroups = response.data.filter(
//           (group) => group.managerId === authData?.user?.userId
//         );
//         setGroups(userGroups);
//         // Fetch requests and documents for all groups
//         for (const group of userGroups) {
//           await Promise.all([
//             fetchRequests(group.groupId),
//             fetchDocuments(group.groupId),
//           ]);
//         }
//         setError(null);
//       } catch (err) {
//         setError('Failed to fetch groups');
//         console.error(err);
//       } finally {
//         setLoading(false);
//       }
//     };
//     if (authData?.user?.userId) fetchGroups();
//   }, [authData]);

//   // Fetch verified users for add member modal, excluding existing group members
//   const fetchUsers = async (groupId) => {
//     try {
//       setLoading(true);
//       const [usersResponse, membersResponse] = await Promise.all([
//         getAllVerifiedUserProfile(),
//         viewMembershipsByGroupId(groupId),
//       ]);
//       const groupMembers = membersResponse.data || [];
//       const memberEmails = new Set(groupMembers.map((member) => member.emailId));
//       // Filter out users already in the group by emailId
//       const filteredUsers = usersResponse.data.filter(
//         (user) => !memberEmails.has(user.emailId)
//       );
//       setUsers(filteredUsers);
//       setMembers((prev) => ({ ...prev, [groupId]: groupMembers }));
//       setError(null);
//     } catch (err) {
//       setError('Failed to fetch users or members');
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

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

//   // Fetch join and remove requests for a specific group
//   const fetchRequests = async (groupId) => {
//     try {
//       setLoading(true);
//       const [joinResponse, removeResponse] = await Promise.all([
//         viewAllGroupJoinRequestByGroupId(groupId),
//         viewAllRemoveFromGroupRequests(groupId),
//       ]);
//       setJoinRequests((prev) => ({ ...prev, [groupId]: joinResponse.data }));
//       setRemoveRequests((prev) => ({ ...prev, [groupId]: removeResponse.data }));
//       setError(null);
//     } catch (err) {
//       setError(`Failed to fetch requests for group ${groupId}`);
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

//   // Handle add member modal open
//   const handleAddMemberClick = async (groupId) => {
//     setSelectedGroupId(groupId);
//     await fetchUsers(groupId);
//   };

//   // Handle user selection for adding
//   const handleUserSelect = (userId, groupRoleName) => {
//     setSelectedUsers((prev) => {
//       const existing = prev.find((u) => u.userId === userId);
//       if (existing) {
//         return prev.map((u) =>
//           u.userId === userId ? { ...u, groupRoleName } : u
//         );
//       }
//       return [...prev, { userId, groupRoleName: groupRoleName || 'MEMBER' }];
//     });
//   };

//   // Submit selected users to add to group
//   const handleAddMembers = async () => {
//     if (!selectedGroupId || selectedUsers.length === 0) return;
//     try {
//       setLoading(true);
//       await addMember(selectedGroupId, selectedUsers);
//       alert('Members added successfully');
//       setSelectedUsers([]);
//       setSelectedGroupId(null);
//       await fetchMembers(selectedGroupId); // Refresh members
//     } catch (err) {
//       setError('Failed to add members');
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Handle view details modal open
//   const handleViewDetailsClick = async (groupId) => {
//     setViewDetailsGroupId(groupId);
//     await fetchMembers(groupId);
//   };

//   // Handle view requests modal open
//   const handleViewRequestsClick = async (groupId) => {
//     setViewRequestsGroupId(groupId);
//     setActiveRequestTab('join'); // Default to join requests
//     setActiveJoinStatusTab('PENDING'); // Default to PENDING
//     setActiveRemoveStatusTab('PENDING'); // Default to PENDING
//     await fetchRequests(groupId);
//   };

//   // Handle view documents modal open
//   const handleViewDocumentsClick = async (groupId) => {
//     setViewDocumentsGroupId(groupId);
//     await fetchDocuments(groupId);
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
//       // Trigger download
//       const link = document.createElement('a');
//       link.href = downloadUrl;
//       link.download = ''; // Browser will use the file name from the URL
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

//   // Handle suspend member
//   const handleSuspendMember = async (groupId, emailId) => {
//     try {
//       setLoading(true);
//       await suspendMember(groupId, emailId);
//       alert('Member suspended successfully');
//       await fetchMembers(groupId); // Refresh members
//     } catch (err) {
//       setError('Failed to suspend member');
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Handle unsuspend member
//   const handleUnsuspendMember = async (groupId, emailId) => {
//     try {
//       setLoading(true);
//       await unsuspendMember(groupId, emailId);
//       alert('Member unsuspended successfully');
//       await fetchMembers(groupId); // Refresh members
//     } catch (err) {
//       setError('Failed to unsuspend member');
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Handle remove member
//   const handleRemoveMember = async (groupId, emailId) => {
//     try {
//       setLoading(true);
//       await removeMember(groupId, emailId);
//       alert('Member removed successfully');
//       await fetchMembers(groupId); // Refresh members
//     } catch (err) {
//       setError('Failed to remove member');
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Handle accept join request
//   const handleAcceptJoinRequest = async (groupId, requestId) => {
//     try {
//       setLoading(true);
//       await acceptJoinRequest(requestId);
//       alert('Join request accepted');
//       await Promise.all([fetchRequests(groupId), fetchMembers(groupId)]); // Refresh requests and members
//     } catch (err) {
//       setError('Failed to accept join request');
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Handle reject join request
//   const handleRejectJoinRequest = async (groupId, requestId) => {
//     try {
//       setLoading(true);
//       await rejectJoinRequest(requestId);
//       alert('Join request rejected');
//       await fetchRequests(groupId); // Refresh requests
//     } catch (err) {
//       setError('Failed to reject join request');
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Handle accept remove request
//   const handleAcceptRemoveRequest = async (groupId, requestId) => {
//     try {
//       setLoading(true);
//       await acceptRemoveRequest(requestId);
//       alert('Remove request accepted');
//       await Promise.all([fetchRequests(groupId), fetchMembers(groupId)]); // Refresh requests and members
//     } catch (err) {
//       setError('Failed to accept remove request');
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Handle reject remove request
//   const handleRejectRemoveRequest = async (groupId, requestId) => {
//     try {
//       setLoading(true);
//       await rejectRemoveRequest(requestId);
//       alert('Remove request rejected');
//       await fetchRequests(groupId); // Refresh requests
//     } catch (err) {
//       setError('Failed to reject remove request');
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Segregate requests by status
//   const segregateRequests = (requests) => {
//     return {
//       PENDING: requests?.filter((r) => r.status === 'PENDING') || [],
//       ACCEPTED: requests?.filter((r) => r.status === 'ACCEPTED') || [],
//       REJECTED: requests?.filter((r) => r.status === 'REJECTED') || [],
//     };
//   };

//   // Calculate pending requests for a group
//   const getPendingRequestsCount = (groupId) => {
//     const pendingJoin = (joinRequests[groupId] || []).filter((r) => r.status === 'PENDING').length;
//     const pendingRemove = (removeRequests[groupId] || []).filter((r) => r.status === 'PENDING').length;
//     return pendingJoin + pendingRemove;
//   };

//   // Check if a tab has pending requests
//   const hasPendingRequests = (groupId, type) => {
//     if (type === 'join') {
//       return (joinRequests[groupId] || []).some((r) => r.status === 'PENDING');
//     }
//     if (type === 'remove') {
//       return (removeRequests[groupId] || []).some((r) => r.status === 'PENDING');
//     }
//     return false;
//   };

//   return (
//     <div className="p-6 bg-gray-100 min-h-screen">
//       {/* Header */}
//       <h1 className="text-3xl font-bold mb-6 text-gray-800">Group Manager Dashboard</h1>

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
//         <h2 className="text-2xl font-semibold mb-4 text-gray-700">My Groups</h2>
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
//           {groups.map((group) => (
//             <div
//               key={group.groupId}
//               className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
//             >
//               <div className="flex items-center justify-between mb-2">
//                 <h3 className="text-lg font-semibold text-gray-800">{group.groupName}</h3>
//                 {getPendingRequestsCount(group.groupId) > 0 && (
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
//                       {getPendingRequestsCount(group.groupId)}
//                     </span>
//                   </span>
//                 )}
//               </div>
//               <p className="text-sm text-gray-600 mb-1">
//                 <span className="font-medium">Group Type:</span> {group.groupAuthType}
//               </p>
//               <p className="text-sm text-gray-600 mb-4">
//                 <span className="font-medium">Created On:</span> {group.createdOn}
//               </p>
//               <div className="flex flex-wrap gap-3">
//                 <button
//                   onClick={() => handleAddMemberClick(group.groupId)}
//                   className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
//                 >
//                   Add Members
//                 </button>
//                 <button
//                   onClick={() => handleViewDetailsClick(group.groupId)}
//                   className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
//                 >
//                   View Details
//                 </button>
//                 <button
//                   onClick={() => handleViewRequestsClick(group.groupId)}
//                   className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
//                 >
//                   View Requests
//                 </button>
//                 <button
//                   onClick={() => handleViewDocumentsClick(group.groupId)}
//                   className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
//                 >
//                   Manage Documents
//                 </button>
//               </div>
//             </div>
//           ))}
//         </div>
//         {groups.length === 0 && !loading && (
//           <p className="mt-4 text-gray-600">No groups found where you are the manager.</p>
//         )}
//       </div>

//       {/* View Details Modal */}
//       {viewDetailsGroupId && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
//           <div className="bg-white rounded-lg p-6 max-w-3xl min-w-[300px] w-[95vw] max-h-[80vh] overflow-y-auto">
//             <h2 className="text-xl font-semibold mb-4 text-gray-800">
//               Members of {groups.find((g) => g.groupId === viewDetailsGroupId)?.groupName}
//             </h2>
//             <div className="overflow-x-hidden">
//               <table className="w-full border-collapse bg-white shadow-sm rounded-lg">
//                 <thead>
//                   <tr className="bg-gray-200">
//                     <th className="p-2 text-left text-gray-700 text-sm font-medium">
//                       Member Name
//                     </th>
//                     <th className="p-2 text-left text-gray-700 text-sm font-medium">
//                       Email
//                     </th>
//                     <th className="p-2 text-left text-gray-700 text-sm font-medium">
//                       Role
//                     </th>
//                     <th className="p-2 text-left text-gray-700 text-sm font-medium">
//                       Status
//                     </th>
//                     <th className="p-2 text-left text-gray-700 text-sm font-medium">
//                       Actions
//                     </th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {members[viewDetailsGroupId]?.map((member) => (
//                     <tr key={member.membershipId} className="hover:bg-gray-50">
//                       <td className="p-2 border-t text-sm truncate max-w-[150px]">
//                         {member.memberName}
//                       </td>
//                       <td className="p-2 border-t text-sm truncate max-w-[200px]">
//                         {member.emailId}
//                       </td>
//                       <td className="p-2 border-t text-sm">{member.groupRoleName}</td>
//                       <td className="p-2 border-t text-sm">{member.status}</td>
//                       <td className="p-2 border-t flex flex-wrap gap-2">
//                         {member.status === 'ACTIVE' && (
//                           <button
//                             onClick={() => handleSuspendMember(viewDetailsGroupId, member.emailId)}
//                             className="px-2 py-1 bg-yellow-500 text-white text-sm rounded-lg hover:bg-yellow-600 transition-colors"
//                           >
//                             Suspend
//                           </button>
//                         )}
//                         {member.status === 'SUSPENDED' && (
//                           <button
//                             onClick={() => handleUnsuspendMember(viewDetailsGroupId, member.emailId)}
//                             className="px-2 py-1 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-colors"
//                           >
//                             Unsuspend
//                           </button>
//                         )}
//                         <button
//                           onClick={() => handleRemoveMember(viewDetailsGroupId, member.emailId)}
//                           className="px-2 py-1 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-colors"
//                         >
//                           Remove
//                         </button>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//             {members[viewDetailsGroupId]?.length === 0 && (
//               <p className="mt-4 text-gray-600">No members in this group.</p>
//             )}
//             <div className="mt-4 flex justify-end">
//               <button
//                 onClick={() => setViewDetailsGroupId(null)}
//                 className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 transition-colors"
//               >
//                 Close
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Add Member Modal */}
//       {selectedGroupId && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
//           <div className="bg-white rounded-lg p-6 max-w-3xl min-w-[300px] w-[95vw] max-h-[80vh] overflow-y-auto">
//             <h2 className="text-xl font-semibold mb-4 text-gray-800">Add Members to Group</h2>
//             <div className="overflow-x-hidden">
//               <table className="w-full border-collapse mb-4">
//                 <thead>
//                   <tr className="bg-gray-200">
//                     <th className="p-2 text-left text-gray-700 text-sm font-medium">Select</th>
//                     <th className="p-2 text-left text-gray-700 text-sm font-medium">Name</th>
//                     <th className="p-2 text-left text-gray-700 text-sm font-medium">Email</th>
//                     <th className="p-2 text-left text-gray-700 text-sm font-medium">Role</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {users.map((user) => (
//                     <tr key={user.userId} className="hover:bg-gray-50">
//                       <td className="p-2 border-t">
//                         <input
//                           type="checkbox"
//                           checked={selectedUsers.some((u) => u.userId === user.userId)}
//                           onChange={() => handleUserSelect(user.userId, 'MEMBER')}
//                         />
//                       </td>
//                       <td className="p-2 border-t text-sm truncate max-w-[150px]">
//                         {user.firstName} {user.lastName}
//                       </td>
//                       <td className="p-2 border-t text-sm truncate max-w-[200px]">
//                         {user.emailId}
//                       </td>
//                       <td className="p-2 border-t text-sm">
//                         <select
//                           onChange={(e) => handleUserSelect(user.userId, e.target.value)}
//                           value={
//                             selectedUsers.find((u) => u.userId === user.userId)?.groupRoleName || 'MEMBER'
//                           }
//                           className="border rounded p-1 w-full text-sm"
//                         >
//                           <option value="MEMBER">Member</option>
//                           <option value="PANELIST">Panelist</option>
//                         </select>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//             {users.length === 0 && (
//               <p className="mt-4 text-gray-600">No new users available to add.</p>
//             )}
//             <div className="flex justify-end space-x-2">
//               <button
//                 onClick={() => setSelectedGroupId(null)}
//                 className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 transition-colors"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleAddMembers}
//                 disabled={selectedUsers.length === 0 || loading}
//                 className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
//               >
//                 Add Selected
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* View Requests Modal */}
//       {viewRequestsGroupId && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
//           <div className="bg-white rounded-lg p-6 max-w-3xl min-w-[300px] w-[95vw] max-h-[80vh] overflow-y-auto">
//             <h2 className="text-xl font-semibold mb-4 text-gray-800">
//               Requests for {groups.find((g) => g.groupId === viewRequestsGroupId)?.groupName}
//             </h2>

//             {/* Top-Level Tabs: Join vs Remove Requests */}
//             <div className="flex border-b border-gray-200 mb-4">
//               <button
//                 className={`px-4 py-2 text-sm font-medium flex items-center space-x-2 ${
//                   activeRequestTab === 'join'
//                     ? 'border-b-2 border-blue-500 text-blue-500'
//                     : 'text-gray-600 hover:text-blue-500'
//                 }`}
//                 onClick={() => setActiveRequestTab('join')}
//               >
//                 <span>Join Requests</span>
//                 {hasPendingRequests(viewRequestsGroupId, 'join') && (
//                   <span className="w-2 h-2 bg-green-500 rounded-full"></span>
//                 )}
//               </button>
//               <button
//                 className={`px-4 py-2 text-sm font-medium flex items-center space-x-2 ${
//                   activeRequestTab === 'remove'
//                     ? 'border-b-2 border-blue-500 text-blue-500'
//                     : 'text-gray-600 hover:text-blue-500'
//                 }`}
//                 onClick={() => setActiveRequestTab('remove')}
//               >
//                 <span>Remove Requests</span>
//                 {hasPendingRequests(viewRequestsGroupId, 'remove') && (
//                   <span className="w-2 h-2 bg-green-500 rounded-full"></span>
//                 )}
//               </button>
//             </div>

//             {/* Join Requests Content */}
//             {activeRequestTab === 'join' && (
//               <div>
//                 {/* Status Tabs for Join Requests */}
//                 <div className="flex border-b border-gray-200 mb-4">
//                   {['PENDING', 'ACCEPTED', 'REJECTED'].map((status) => (
//                     <button
//                       key={status}
//                       className={`px-4 py-2 text-sm font-medium ${
//                         activeJoinStatusTab === status
//                           ? 'border-b-2 border-blue-500 text-blue-500'
//                           : 'text-gray-600 hover:text-blue-500'
//                       }`}
//                       onClick={() => setActiveJoinStatusTab(status)}
//                     >
//                       {status}
//                     </button>
//                   ))}
//                 </div>
//                 <div className="overflow-x-hidden">
//                   <table className="w-full border-collapse bg-white shadow-sm rounded-lg">
//                     <thead>
//                       <tr className="bg-gray-200">
//                         <th className="p-2 text-left text-gray-700 text-sm font-medium">User Name</th>
//                         <th className="p-2 text-left text-gray-700 text-sm font-medium">Email</th>
//                         <th className="p-2 text-left text-gray-700 text-sm font-medium">Requested On</th>
//                         <th className="p-2 text-left text-gray-700 text-sm font-medium">Description</th>
//                         <th className="p-2 text-left text-gray-700 text-sm font-medium">Status</th>
//                         {activeJoinStatusTab === 'PENDING' && (
//                           <th className="p-2 text-left text-gray-700 text-sm font-medium">Actions</th>
//                         )}
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {segregateRequests(joinRequests[viewRequestsGroupId])[activeJoinStatusTab].map(
//                         (request) => (
//                           <tr key={request.requestId} className="hover:bg-gray-50">
//                             <td className="p-2 border-t text-sm truncate max-w-[150px]">
//                               {request.requestUserFullName}
//                             </td>
//                             <td className="p-2 border-t text-sm truncate max-w-[200px]">
//                               {request.requestUserEmailId}
//                             </td>
//                             <td className="p-2 border-t text-sm">{request.requestedOn.split('T')[0]}</td>
//                             <td className="p-2 border-t text-sm truncate max-w-[200px]">
//                               {request.requestDescription}
//                             </td>
//                             <td className="p-2 border-t text-sm">{request.status}</td>
//                             {activeJoinStatusTab === 'PENDING' && (
//                               <td className="p-2 border-t flex flex-wrap gap-2">
//                                 <button
//                                   onClick={() => handleAcceptJoinRequest(viewRequestsGroupId, request.requestId)}
//                                   className="px-2 py-1 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-colors"
//                                 >
//                                   Accept
//                                 </button>
//                                 <button
//                                   onClick={() => handleRejectJoinRequest(viewRequestsGroupId, request.requestId)}
//                                   className="px-2 py-1 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-colors"
//                                 >
//                                   Reject
//                                 </button>
//                               </td>
//                             )}
//                           </tr>
//                         )
//                       )}
//                     </tbody>
//                   </table>
//                   {segregateRequests(joinRequests[viewRequestsGroupId])[activeJoinStatusTab].length === 0 && (
//                     <p className="mt-4 text-gray-600">
//                       No {activeJoinStatusTab.toLowerCase()} join requests.
//                     </p>
//                   )}
//                 </div>
//               </div>
//             )}

//             {/* Remove Requests Content */}
//             {activeRequestTab === 'remove' && (
//               <div>
//                 {/* Status Tabs for Remove Requests */}
//                 <div className="flex border-b border-gray-200 mb-4">
//                   {['PENDING', 'ACCEPTED', 'REJECTED'].map((status) => (
//                     <button
//                       key={status}
//                       className={`px-4 py-2 text-sm font-medium ${
//                         activeRemoveStatusTab === status
//                           ? 'border-b-2 border-blue-500 text-blue-500'
//                           : 'text-gray-600 hover:text-blue-500'
//                       }`}
//                       onClick={() => setActiveRemoveStatusTab(status)}
//                     >
//                       {status}
//                     </button>
//                   ))}
//                 </div>
//                 <div className="overflow-x-hidden">
//                   <table className="w-full border-collapse bg-white shadow-sm rounded-lg">
//                     <thead>
//                       <tr className="bg-gray-200">
//                         <th className="p-2 text-left text-gray-700 text-sm font-medium">Member Name</th>
//                         <th className="p-2 text-left text-gray-700 text-sm font-medium">Email</th>
//                         <th className="p-2 text-left text-gray-700 text-sm font-medium">Role</th>
//                         <th className="p-2 text-left text-gray-700 text-sm font-medium">Status</th>
//                         {activeRemoveStatusTab === 'PENDING' && (
//                           <th className="p-2 text-left text-gray-700 text-sm font-medium">Actions</th>
//                         )}
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {segregateRequests(removeRequests[viewRequestsGroupId])[activeRemoveStatusTab].map(
//                         (request) => (
//                           <tr key={request.requestId} className="hover:bg-gray-50">
//                             <td className="p-2 border-t text-sm truncate max-w-[150px]">
//                               {request.reqMemberName}
//                             </td>
//                             <td className="p-2 border-t text-sm truncate max-w-[200px]">
//                               {request.reqMemberEmailId}
//                             </td>
//                             <td className="p-2 border-t text-sm">{request.groupRoleName}</td>
//                             <td className="p-2 border-t text-sm">{request.status}</td>
//                             {activeRemoveStatusTab === 'PENDING' && (
//                               <td className="p-2 border-t flex flex-wrap gap-2">
//                                 <button
//                                   onClick={() => handleAcceptRemoveRequest(viewRequestsGroupId, request.requestId)}
//                                   className="px-2 py-1 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-colors"
//                                 >
//                                   Accept
//                                 </button>
//                                 <button
//                                   onClick={() => handleRejectRemoveRequest(viewRequestsGroupId, request.requestId)}
//                                   className="px-2 py-1 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-colors"
//                                 >
//                                   Reject
//                                 </button>
//                               </td>
//                             )}
//                           </tr>
//                         )
//                       )}
//                     </tbody>
//                   </table>
//                   {segregateRequests(removeRequests[viewRequestsGroupId])[activeRemoveStatusTab].length === 0 && (
//                     <p className="mt-4 text-gray-600">
//                       No {activeRemoveStatusTab.toLowerCase()} remove requests.
//                     </p>
//                   )}
//                 </div>
//               </div>
//             )}

//             <div className="mt-4 flex justify-end">
//               <button
//                 onClick={() => setViewRequestsGroupId(null)}
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
//     </div>
//   );
// };

// export default GMDashboard;

