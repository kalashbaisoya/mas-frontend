
import {useState, useEffect, useContext, useRef } from 'react';
import {
  viewMyMembershipsGroupDetails,
  viewMembershipsByGroupId,
  viewAllDocumentsByGroupId,
  downloadDocument,
  uploadDocument,
  viewMyRemoveFromGroupRequests,
  sendRemoveRequest,viewMembershipStatusesByGroup, 
  createAuthSession,signAuthSession,isGroupAccessAllowed,updateAuthIntent,
} from '../api/memberApi';
import { AuthContext } from '../contexts/AuthContext';
import { createWebSocketClient } from '../websocketService';
import {
  connectWebSocket,
  subscribeToGroupPresence,
  unsubscribeFromGroupPresence,
  disconnectWebSocket,
    subscribeToGroupAuthState, unsubscribeFromGroupAuthState

} from '../websocketManager';
  import { captureBiometric } from '../api/api.js';


const useMemberDashboard = () => {
  // ====== STATE ======
  const { authData } = useContext(AuthContext);
  const [groups, setGroups] = useState([]);
  const [members, setMembers] = useState({});
  const [documents, setDocuments] = useState({});
  const [removeRequests, setRemoveRequests] = useState([]);
  const [viewMembersGroupId, setViewMembersGroupId] = useState(null);
  const [viewDocumentsGroupId, setViewDocumentsGroupId] = useState(null);
  const [viewRemoveRequests, setViewRemoveRequests] = useState(false);
  const [removeRequestGroupId, setRemoveRequestGroupId] = useState(null);
  const [requestDescription, setRequestDescription] = useState('');
  const [file, setFile] = useState(null);
  const [accessType, setAccessType] = useState('READ');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const wsClientRef = useRef(null);
  
const [presenceByGroup, setPresenceByGroup] = useState({});
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

  // Handle WebSocket connection toggle
  const handleToggleConnection = async(groupId) => {
    if (isConnected) {
      // 🔴 Disconnect
      if (wsClientRef.current) {
        wsClientRef.current.disconnect();
        wsClientRef.current = null;
        setIsConnected(false);
        setError(null);
      }
    } else {
      // 🟢 Connect
      const token = localStorage.getItem('token');
      const groupId = 20; // <-- make sure this comes from your state / props

      const client = createWebSocketClient(
        token,
        groupId,
        (connected) => setIsConnected(connected), // ✅ onConnect
        (errorMsg) => setError(errorMsg),         // ✅ onError
        (presenceUpdate) => {
          // optional but recommended for debugging / future UI updates
          console.log('Presence Update:', presenceUpdate);
        }                                          // ✅ onPresenceUpdate
      );

      if (client) {
        wsClientRef.current = client;
        client.activate(); // ⬅ direct activate (no need for wrapper)
      }
    }
  };

  // Fetch groups, filter out GROUP_MANAGER roles, and fetch remove requests
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [groupsResponse, removeRequestsResponse] = await Promise.all([
          viewMyMembershipsGroupDetails(),
          viewMyRemoveFromGroupRequests(),
        ]);

        const filteredGroups = [];
        // const documentPromises = [];
        for (const group of groupsResponse.data) {
          const membershipResponse = await viewMembershipsByGroupId(group.groupId);
          const userMembership = membershipResponse.data.find(
            (member) => member.emailId === authData?.user?.emailId
          );
          if (userMembership && userMembership.groupRoleName !== 'GROUP_MANAGER') {
            filteredGroups.push(group);
            // documentPromises.push(fetchDocuments(group.groupId));
          }
        }

        // await Promise.all(documentPromises);
        setGroups(filteredGroups);
        setRemoveRequests(removeRequestsResponse.data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch groups or remove requests');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (authData?.user?.userId && authData?.user?.emailId) {
      fetchData();
    } else {
      setError('User data not available. Please log in again.');
    }
  }, [authData]);

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

  // Fetch documents for a specific group
  const fetchDocuments = async (groupId) => {
    try {
      const response = await viewAllDocumentsByGroupId(groupId);
      setDocuments((prev) => ({ ...prev, [groupId]: response.data }));
    } catch (err) {
      console.error(`Failed to fetch documents for group ${groupId}:`, err);
      throw err;
    }
  };

  // Handle view members modal open
  const handleViewMembersClick = async (groupId) => {
    setViewMembersGroupId(groupId);
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

  // Handle view documents modal open
  const handleViewDocumentsClick = async (groupId) => {
    setViewDocumentsGroupId(groupId);
    await fetchDocuments(groupId);
  };

  // Handle view remove requests modal open
  const handleViewRemoveRequestsClick = () => {
    setViewRemoveRequests(true);
  };

  // Handle send remove request modal open
  const handleSendRemoveRequestClick = (groupId) => {
    setRemoveRequestGroupId(groupId);
    setRequestDescription('');
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
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = '';
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

  // Handle send remove request
  const handleSendRemoveRequest = async () => {
    if (!removeRequestGroupId || !requestDescription.trim()) return;
    try {
      setLoading(true);
      const requestData = { requestDescription };
      await sendRemoveRequest(removeRequestGroupId, requestData);
      alert('Remove request sent successfully');
      setRemoveRequestGroupId(null);
      setRequestDescription('');
      const response = await viewMyRemoveFromGroupRequests();
      setRemoveRequests(response.data);
    } catch (err) {
      setError('Failed to send remove request');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate pending remove requests for a group
  const getPendingRemoveRequestsCount = (groupId) => {
    return removeRequests.filter(
      (request) => request.toGroupId === groupId && request.status === 'PENDING'
    ).length;
  };

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
          const signData = await signAuthSession(sessionId,payload);
  
          console.log("✅ Authentication Response:",signData?.data);
  
          if (!signData) {
            throw new Error("Empty sign response");
          }
  
          // ✅ STORE AUTH STATE PER GROUP
          setAuthStateByGroup((prev) => ({
            ...prev,
            [viewDocumentsGroupId]: {
              ...prev[viewDocumentsGroupId],
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
  
  
  


  return {
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
    presenceByGroup,
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
    getPendingRemoveRequestsCount,
    authStateByGroup,

    handleCreateAuthSession,
    handleSignAuthSession,
    handleUpdateAuthIntent,
    checkGroupAccess,
    cleanupAuthSubscription, handleViewDocumentsClick,
  };
};

export default useMemberDashboard;
