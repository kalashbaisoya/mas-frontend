import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext.jsx';
import {
  // viewAllActiveGroups,
  getAllVerifiedUserProfile,
  addMember,
  viewMembershipsByGroupId,
  suspendMember,
  unsuspendMember,
  removeMember,
  viewAllGroupJoinRequestByGroupId,
  viewAllRemoveFromGroupRequests,
  acceptJoinRequest,
  rejectJoinRequest,
  acceptRemoveRequest,
  rejectRemoveRequest,
  viewAllDocumentsByGroupId,
  downloadDocument,
  uploadDocument, viewMyMembershipsGroupDetails,viewMembershipStatusesByGroup,
  createAuthSession,signAuthSession,isGroupAccessAllowed,updateAuthIntent
} from '../api/gmApi'; // Updated import to include document APIs
  import { captureBiometric } from '../api/api.js';

import {
  connectWebSocket,
  subscribeToGroupPresence,
  unsubscribeFromGroupPresence,
  disconnectWebSocket,
  subscribeToGroupAuthState, unsubscribeFromGroupAuthState
} from '../websocketManager';

const useGmDashboard = () => {
  const { authData } = useContext(AuthContext); // Get logged-in user data
  const [groups, setGroups] = useState([]); // Store groups where user is manager
  const [users, setUsers] = useState([]); // Store verified users for adding
  const [members, setMembers] = useState({}); // Store members by groupId
  const [joinRequests, setJoinRequests] = useState({}); // Store join requests by groupId
  const [removeRequests, setRemoveRequests] = useState({}); // Store remove requests by groupId
  const [documents, setDocuments] = useState({}); // Store documents by groupId
  const [selectedGroupId, setSelectedGroupId] = useState(null); // For add member modal
  const [selectedUsers, setSelectedUsers] = useState([]); // Users to add
  const [viewDetailsGroupId, setViewDetailsGroupId] = useState(null); // For view details modal
  const [viewRequestsGroupId, setViewRequestsGroupId] = useState(null); // For view requests modal
  const [viewDocumentsGroupId, setViewDocumentsGroupId] = useState(null); // For document management modal
  const [activeRequestTab, setActiveRequestTab] = useState('join'); // 'join' or 'remove'
  const [activeJoinStatusTab, setActiveJoinStatusTab] = useState('PENDING'); // Join status
  const [activeRemoveStatusTab, setActiveRemoveStatusTab] = useState('PENDING'); // Remove status
  const [loading, setLoading] = useState(false); // Loading state
  const [error, setError] = useState(null); // Error state
  const [file, setFile] = useState(null); // Store selected file for upload
  const [accessType, setAccessType] = useState('READ'); // Default access type for upload

  const [presenceByGroup, setPresenceByGroup] = useState({});
    // 🔐 Auth session state per group
  const [authStateByGroup, setAuthStateByGroup] = useState({});



  useEffect(() => {
        const token = localStorage.getItem('token');
        const client = connectWebSocket(
            token,
            () => console.log('WebSocket connected globally'),
            (err) => setError(err)
        );

        return () => {
            disconnectWebSocket();
        };
    }, []);

  // Fetch groups where user is manager on mount
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        setLoading(true);
        const response = await viewMyMembershipsGroupDetails();
        // Filter groups where managerId matches authData.user.userId
        const userGroups = response.data.filter(
          (group) => group.managerId === authData?.user?.userId
        );
        setGroups(userGroups);
        // Fetch requests and documents for all groups
        for (const group of userGroups) {
          await Promise.all([
            fetchRequests(group.groupId),
            // fetchDocuments(group.groupId),
          ]);
        }
        setError(null);
      } catch (err) {
        setError('Failed to fetch groups');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (authData?.user?.userId) fetchGroups();
  }, [authData]);

    const handleSignAuthSession = async (sessionId) => {
      console.group("🔐 handleSignAuthSession");
      console.log("▶ sessionId:", sessionId);

      try {
        setLoading(true);

        // -----------------------------
        // Step 0: Validate sessionId
        // -----------------------------
        if (!sessionId) {
          throw new Error("Missing sessionId");
        }

        // -----------------------------
        // Step 1: Capture biometric
        // -----------------------------
        console.log("🧬 Capturing biometric...");

        const bioResponse = await captureBiometric();

        console.log("🧬 Biometric raw response:", {
          status: bioResponse?.status,
          keys: Object.keys(bioResponse?.data || {}),
        });

        const biometricTemplateBase64 =
          bioResponse?.data?.template;

        if (!biometricTemplateBase64) {
          console.error("❌ biometricTemplateBase64 missing", bioResponse?.data);
          throw new Error("Biometric capture failed");
        }

        console.log(
          "✅ Biometric captured (length):",
          biometricTemplateBase64.length
        );

        // -----------------------------
        // Step 2: Sign authentication session
        // -----------------------------
        console.log("🔐 Signing authentication session...");
        const payload = {
          biometricTemplateBase64: biometricTemplateBase64,
        };
        const signResponse = await signAuthSession(sessionId,payload);

        console.log("✅ Authentication Response:",signResponse?.data);

        if (!signData) {
          throw new Error("Empty sign response");
        }

        // ✅ STORE AUTH STATE PER GROUP
        setAuthStateByGroup((prev) => ({
          ...prev,
          [groupId]: {
            ...prev[groupId],
            ...signData,              // sessionStatus, verifiedCount, etc.
          },
        }));

      } catch (err) {
        console.error("❌ handleSignAuthSession error:", err);

        setError(
          err?.response?.data?.message ||
          err?.message ||
          "Authentication failed"
        );
      } finally {
        setLoading(false);
        console.groupEnd();
      }
    };


    const handleCreateAuthSession = async (groupId, authType) => {
      try {
        setLoading(true);
        const response = await createAuthSession(groupId);

        alert('Auth session created');

        // Subscribe to live auth-state updates (except TYPE_A)
        if (authType !== 'TYPE_A') {
          subscribeToGroupAuthState(groupId, (payload) => {
            setAuthStateByGroup((prev) => ({
              ...prev,
              [groupId]: payload,
            }));
          });
        }

        return response.data;
      } catch (err) {
        console.error(err);
        setError('Failed to create auth session');
      } finally {
        setLoading(false);
      }
    };

    const handleUpdateAuthIntent = async (sessionId, intent) => {
      try {
        setLoading(true);
        await updateAuthIntent(sessionId, intent); // ALLOW / DENY
      } catch (err) {
        console.error(err);
        setError('Failed to update auth intent');
      } finally {
        setLoading(false);
      }
    };

    const checkGroupAccess = async (groupId) => {
      try {
        const response = await isGroupAccessAllowed(groupId);
        return response.data; // true / false
      } catch (err) {
        console.error(err);
        return false;
      }
    };

    const cleanupAuthSubscription = (groupId) => {
      unsubscribeFromGroupAuthState(groupId);
      setAuthStateByGroup((prev) => {
        const copy = { ...prev };
        delete copy[groupId];
        return copy;
      });
    };






  // Fetch verified users for add member modal, excluding existing group members
  const fetchUsers = async (groupId) => {
    try {
      setLoading(true);
      const [usersResponse, membersResponse] = await Promise.all([
        getAllVerifiedUserProfile(),
        viewMembershipsByGroupId(groupId),
      ]);
      const groupMembers = membersResponse.data || [];
      const memberEmails = new Set(groupMembers.map((member) => member.emailId));
      // Filter out users already in the group by emailId
      const filteredUsers = usersResponse.data.filter(
        (user) => !memberEmails.has(user.emailId)
      );
      setUsers(filteredUsers);
      setMembers((prev) => ({ ...prev, [groupId]: groupMembers }));
      setError(null);
    } catch (err) {
      setError('Failed to fetch users or members');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch members for a specific group
  const fetchMembers = async (groupId) => {
    try {
      setLoading(true);
      const response = await viewMembershipsByGroupId(groupId);
      setMembers((prev) => ({ ...prev, [groupId]: response.data }));
      setError(null);
    } catch (err) {
      setError(`Failed to fetch members for group ${groupId}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch join and remove requests for a specific group
  const fetchRequests = async (groupId) => {
    try {
      setLoading(true);
      const [joinResponse, removeResponse] = await Promise.all([
        viewAllGroupJoinRequestByGroupId(groupId),
        viewAllRemoveFromGroupRequests(groupId),
      ]);
      setJoinRequests((prev) => ({ ...prev, [groupId]: joinResponse.data }));
      setRemoveRequests((prev) => ({ ...prev, [groupId]: removeResponse.data }));
      setError(null);
    } catch (err) {
      setError(`Failed to fetch requests for group ${groupId}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch documents for a specific group
  const fetchDocuments = async (groupId) => {
    try {
      setLoading(true);
      const response = await viewAllDocumentsByGroupId(groupId);
      setDocuments((prev) => ({ ...prev, [groupId]: response.data }));
      setError(null);
    } catch (err) {
      setError(`Failed to fetch documents for group ${groupId}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle add member modal open
  const handleAddMemberClick = async (groupId) => {
    setSelectedGroupId(groupId);
    await fetchUsers(groupId);
  };

  // Handle user selection for adding
  const handleUserSelect = (userId, groupRoleName) => {
    setSelectedUsers((prev) => {
      const existing = prev.find((u) => u.userId === userId);
      if (existing) {
        return prev.map((u) =>
          u.userId === userId ? { ...u, groupRoleName } : u
        );
      }
      return [...prev, { userId, groupRoleName: groupRoleName || 'MEMBER' }];
    });
  };

  // Submit selected users to add to group
  const handleAddMembers = async () => {
    if (!selectedGroupId || selectedUsers.length === 0) return;
    try {
      setLoading(true);
      await addMember(selectedGroupId, selectedUsers);
      alert('Members added successfully');
      setSelectedUsers([]);
      setSelectedGroupId(null);
      await fetchMembers(selectedGroupId); // Refresh members
    } catch (err) {
      setError('Failed to add members');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle view details modal open
  const handleViewDetailsClick = async (groupId) => {
    setViewDetailsGroupId(groupId);
    await fetchMembers(groupId);

    //get and set initial presence of members
    const response = await viewMembershipStatusesByGroup(groupId);
    setPresenceByGroup((prev)=> ({...prev,[groupId]:response.data}));
    
    // ✅ Subscribe for presence updates for this group
        subscribeToGroupPresence(groupId, (gid, presenceUpdate) => {
          setPresenceByGroup((prev) => 
            ({...prev,[gid]: presenceUpdate,}));
          });
  };

  // Handle view requests modal open
  const handleViewRequestsClick = async (groupId) => {
    setViewRequestsGroupId(groupId);
    setActiveRequestTab('join'); // Default to join requests
    setActiveJoinStatusTab('PENDING'); // Default to PENDING
    setActiveRemoveStatusTab('PENDING'); // Default to PENDING
    await fetchRequests(groupId);
  };

  // Handle view documents modal open
  const handleViewDocumentsClick = async (groupId) => {
    setViewDocumentsGroupId(groupId);
    await fetchDocuments(groupId);
  };

  // Handle file selection for upload
  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  // Handle document upload
  const handleUploadDocument = async () => {
    if (!file || !viewDocumentsGroupId) return;
    try {
      setLoading(true);
      const formData = new FormData();
      // Create JSON object for groupId and accessType
      const request = {
        groupId: viewDocumentsGroupId,
        accessType: accessType,
      };
      formData.append('request', new Blob([JSON.stringify(request)], { type: 'application/json' }));
      formData.append('file', file);
      await uploadDocument(formData);
      alert('Document uploaded successfully');
      setFile(null);
      setAccessType('READ');
      await fetchDocuments(viewDocumentsGroupId); // Refresh documents
    } catch (err) {
      setError('Failed to upload document');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle document download
  const handleDownloadDocument = async (documentId) => {
    try {
      setLoading(true);
      const response = await downloadDocument(documentId);
      const { downloadUrl } = response.data;
      // Trigger download
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = ''; // Browser will use the file name from the URL
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      alert('Document download initiated');
    } catch (err) {
      setError('Failed to download document');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle suspend member
  const handleSuspendMember = async (groupId, emailId) => {
    try {
      setLoading(true);
      await suspendMember(groupId, emailId);
      alert('Member suspended successfully');
      await fetchMembers(groupId); // Refresh members
    } catch (err) {
      setError('Failed to suspend member');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle unsuspend member
  const handleUnsuspendMember = async (groupId, emailId) => {
    try {
      setLoading(true);
      await unsuspendMember(groupId, emailId);
      alert('Member unsuspended successfully');
      await fetchMembers(groupId); // Refresh members
    } catch (err) {
      setError('Failed to unsuspend member');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle remove member
  const handleRemoveMember = async (groupId, emailId) => {
    try {
      setLoading(true);
      await removeMember(groupId, emailId);
      alert('Member removed successfully');
      await fetchMembers(groupId); // Refresh members
    } catch (err) {
      setError('Failed to remove member');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle accept join request
  const handleAcceptJoinRequest = async (groupId, requestId) => {
    try {
      setLoading(true);
      await acceptJoinRequest(requestId);
      alert('Join request accepted');
      await Promise.all([fetchRequests(groupId), fetchMembers(groupId)]); // Refresh requests and members
    } catch (err) {
      setError('Failed to accept join request');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle reject join request
  const handleRejectJoinRequest = async (groupId, requestId) => {
    try {
      setLoading(true);
      await rejectJoinRequest(requestId);
      alert('Join request rejected');
      await fetchRequests(groupId); // Refresh requests
    } catch (err) {
      setError('Failed to reject join request');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle accept remove request
  const handleAcceptRemoveRequest = async (groupId, requestId) => {
    try {
      setLoading(true);
      await acceptRemoveRequest(requestId);
      alert('Remove request accepted');
      await Promise.all([fetchRequests(groupId), fetchMembers(groupId)]); // Refresh requests and members
    } catch (err) {
      setError('Failed to accept remove request');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle reject remove request
  const handleRejectRemoveRequest = async (groupId, requestId) => {
    try {
      setLoading(true);
      await rejectRemoveRequest(requestId);
      alert('Remove request rejected');
      await fetchRequests(groupId); // Refresh requests
    } catch (err) {
      setError('Failed to reject remove request');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Segregate requests by status
  const segregateRequests = (requests) => {
    return {
      PENDING: requests?.filter((r) => r.status === 'PENDING') || [],
      ACCEPTED: requests?.filter((r) => r.status === 'ACCEPTED') || [],
      REJECTED: requests?.filter((r) => r.status === 'REJECTED') || [],
    };
  };

  // Calculate pending requests for a group
  const getPendingRequestsCount = (groupId) => {
    const pendingJoin = (joinRequests[groupId] || []).filter((r) => r.status === 'PENDING').length;
    const pendingRemove = (removeRequests[groupId] || []).filter((r) => r.status === 'PENDING').length;
    return pendingJoin + pendingRemove;
  };

  // Check if a tab has pending requests
  const hasPendingRequests = (groupId, type) => {
    if (type === 'join') {
      return (joinRequests[groupId] || []).some((r) => r.status === 'PENDING');
    }
    if (type === 'remove') {
      return (removeRequests[groupId] || []).some((r) => r.status === 'PENDING');
    }
    return false;
  };

  return {
    authData,
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
    loading,
    error,
    file,
    accessType,
    handleAcceptJoinRequest,handleAcceptRemoveRequest,
    handleRejectJoinRequest,handleRejectRemoveRequest,handleRemoveMember,
    handleAddMemberClick,handleAddMembers,
    handleDownloadDocument,handleUploadDocument,handleFileChange,
    
    handleSuspendMember,handleUnsuspendMember,
    handleUserSelect,handleViewDetailsClick,handleViewRequestsClick,
    hasPendingRequests,getPendingRequestsCount,
    segregateRequests,
    setViewDocumentsGroupId,setActiveJoinStatusTab,setActiveRemoveStatusTab,
    setActiveRequestTab,setSelectedGroupId,setViewDetailsGroupId,setViewRequestsGroupId,presenceByGroup,
    authStateByGroup,

    handleCreateAuthSession,
    handleSignAuthSession,
    handleUpdateAuthIntent,
    checkGroupAccess,
    cleanupAuthSubscription, handleViewDocumentsClick
  };
};

export default useGmDashboard;