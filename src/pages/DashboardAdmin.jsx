import { useState, useEffect, useCallback } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { useContext } from 'react';
import { 
  viewAllGroups, 
  createGroup,
  viewMembershipsByGroupId,
  getAllVerifiedUserProfile,
  deleteGroup,
  viewAllBecomeManagerRequests,
  acceptBecomeManagerRequest,rejectBecomeManagerRequest,replaceManager
} from '../api/adminApi';

const AdminDashboard = () => {
  const { authData } = useContext(AuthContext);
  
  // =====================================================
  // 📊 STATE SECTION - All component states
  // =====================================================
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // 🆕 CREATE GROUP STATES
  const [createForm, setCreateForm] = useState({
    groupName: '',
    groupAuthType: 'B',
    managerId: ''
  });
  const [isCreating, setIsCreating] = useState(false);
  
  // 👥 MANAGERS STATES
  const [managers, setManagers] = useState([]);
  const [isLoadingManagers, setIsLoadingManagers] = useState(false);
  
  // 👁️ GROUP DETAILS STATES
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupMembers, setGroupMembers] = useState([]);
  const [loadingGroupId, setLoadingGroupId] = useState(null); // 🆕 GROUP-SPECIFIC!  

  // 🆕 DELETE GROUP STATES
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deletingGroupId, setDeletingGroupId] = useState(null);

// 🆕 MANAGER REQUESTS STATES
const [managerRequests, setManagerRequests] = useState([]);
const [isLoadingRequests, setIsLoadingRequests] = useState(false);
const [activeRequestTab, setActiveRequestTab] = useState('PENDING'); // 🆕 Tab state
const [acceptingRequestId, setAcceptingRequestId] = useState(null); // 🆕 For Accept
const [rejectingRequestId, setRejectingRequestId] = useState(null); // 🆕 For Reject

// 🆕 REPLACE MANAGER STATES
const [showReplaceConfirm, setShowReplaceConfirm] = useState(false);
const [replacingGroupId, setReplacingGroupId] = useState(null);
const [newManagerId, setNewManagerId] = useState('');

  // =====================================================
  // 🔄 API CALLS SECTION - All data loading functions
  // =====================================================
  
  // 📂 Load All Groups
  const loadGroups = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await viewAllGroups();
      setGroups(response.data || []);
      console.log('✅ Groups loaded:', response.data?.length);
    } catch (err) {
      console.error('💥 Groups load failed:', err);
      setError('Failed to load groups');
    } finally {
      setLoading(false);
    }
  }, []);
  
  // 👥 Load All Managers/Users
  const loadManagers = useCallback(async () => {
    try {
      setIsLoadingManagers(true);
      console.log('👥 Loading managers...');
      const response = await getAllVerifiedUserProfile();
      setManagers(response.data || []);
      console.log('✅ Managers loaded:', response.data?.length);
    } catch (err) {
      console.error('💥 Managers load failed:', err);
      setError('Failed to load users for manager selection');
    } finally {
      setIsLoadingManagers(false);
    }
  }, []);
  
  // 👁️ Load Group Members
  const handleViewGroupDetails = useCallback(async (groupId) => {
    try {
      setLoadingGroupId(groupId); // 🆕 Set SPECIFIC group loading
      setError('');
      console.log('👁️ Loading members for group:', groupId);
      const response = await viewMembershipsByGroupId(groupId);
      setGroupMembers(response.data || []);
      setSelectedGroup(groups.find(g => g.groupId === parseInt(groupId)));
      console.log('✅ Members loaded:', response.data?.length);
    } catch (err) {
      setError('Failed to load group members');
      console.error('💥 Members load failed:', err);
    } finally {
      setLoadingGroupId(null); // 🆕 Clear loading
    }
  }, [groups]);
  
  // 🚀 Create New Group
  const handleCreateGroup = useCallback(async (e) => {
    e.preventDefault();
    
    // ✅ VALIDATE ALL 3 FIELDS
    if (!createForm.groupName.trim() || !createForm.groupAuthType || !createForm.managerId) {
      setError('Please fill all fields: Group Name, Type, and Manager');
      return;
    }
    
    try {
      setIsCreating(true);
      setError('');
      
      // ✅ EXACT BACKEND PAYLOAD
      const payload = {
        groupName: createForm.groupName.trim(),
        groupAuthType: createForm.groupAuthType,
        managerId: parseInt(createForm.managerId)
      };
      
      console.log('🚀 Creating group:', payload);
      await createGroup(payload);
      
      // Reset form
      setCreateForm({ groupName: '', groupAuthType: 'B', managerId: '' });
      
      // Refresh groups
      await loadGroups();
      console.log('✅ Group created successfully!');
      
    } catch (err) {
      console.error('💥 Create failed:', err);
      setError(err.response?.data?.message || 'Failed to create group');
    } finally {
      setIsCreating(false);
    }
  }, [createForm, loadGroups]);

  // 🆕 Delete Group Handler
const handleDeleteGroup = useCallback(async (groupId) => {
  try {
    setDeletingGroupId(groupId); // 🆕 Set deleting state
    console.log('🗑️ Deleting group:', groupId);
    await deleteGroup(groupId); // ✅ YOUR API!
    console.log('✅ Group deleted successfully!');
    
    // Refresh groups list
    await loadGroups();
    
    // Close modal and confirmation
    setSelectedGroup(null);
    setGroupMembers([]);
    setShowDeleteConfirm(false);
  } catch (err) {
    console.error('💥 Delete failed:', err);
    setError(err.response?.data?.message || 'Failed to delete group');
  } finally {
    setDeletingGroupId(null); // 🆕 Clear deleting state
  }
}, [loadGroups]);

// 🆕 Load Manager Requests
const loadManagerRequests = useCallback(async () => {
try {
    setIsLoadingRequests(true);
    setError('');
    console.log('📋 Loading manager requests...');
    const response = await viewAllBecomeManagerRequests(); // ✅ YOUR API!
    setManagerRequests(response.data || []);
    console.log('✅ Manager requests loaded:', response.data?.length);
} catch (err) {
    console.error('💥 Manager requests load failed:', err);
    setError('Failed to load manager requests');
} finally {
    setIsLoadingRequests(false);
}
}, []);

// 🆕 Accept Manager Request - FIXED
const handleAcceptRequest = useCallback(async (requestId) => {
  try {
    setAcceptingRequestId(requestId); // 🆕 Specific to Accept
    setError('');
    console.log('✅ Accepting request:', requestId);
    await acceptBecomeManagerRequest(requestId); // ✅ YOUR API!
    console.log('✅ Request accepted!');
    await loadManagerRequests(); // Refresh requests
  } catch (err) {
    console.error('💥 Accept failed:', err);
    setError(err.response?.data?.message || 'Failed to accept request');
  } finally {
    setAcceptingRequestId(null); // 🆕 Clear Accept loading
  }
}, [loadManagerRequests]);

// 🆕 Reject Manager Request - FIXED
const handleRejectRequest = useCallback(async (requestId) => {
  try {
    setRejectingRequestId(requestId); // 🆕 Specific to Reject
    setError('');
    console.log('❌ Rejecting request:', requestId);
    await rejectBecomeManagerRequest(requestId); // ✅ YOUR API!
    console.log('✅ Request rejected!');
    await loadManagerRequests(); // Refresh requests
  } catch (err) {
    console.error('💥 Reject failed:', err);
    setError(err.response?.data?.message || 'Failed to reject request');
  } finally {
    setRejectingRequestId(null); // 🆕 Clear Reject loading
  }
}, [loadManagerRequests]);

// 🆕 Replace Manager Handler
const handleReplaceManager = useCallback(async (groupId, newManagerId) => {
  try {
    setReplacingGroupId(groupId);
    setError('');
    console.log('👑 Replacing manager for group:', groupId, 'with manager:', newManagerId);
    const requestData = { newManagerId: parseInt(newManagerId) }; // ✅ Matches API payload
    await replaceManager(groupId, requestData); // ✅ YOUR API!
    console.log('✅ Manager replaced successfully!');
    await loadGroups(); // Refresh groups to update manager
    setSelectedGroup(null);
    setGroupMembers([]);
    setShowReplaceConfirm(false);
    setNewManagerId('');
  } catch (err) {
    console.error('💥 Replace manager failed:', err);
    setError(err.response?.data?.message || 'Failed to replace manager');
  } finally {
    setReplacingGroupId(null);
  }
}, [loadGroups]);
  
  // =====================================================
  // 🎨 UTILITY FUNCTIONS SECTION
  // =====================================================
  const getAuthTypeBadge = (authType) => {
    const badges = {
      'A': { color: 'bg-green-100 text-green-800', label: 'A' },
      'B': { color: 'bg-blue-100 text-blue-800', label: 'B' },
      'C': { color: 'bg-purple-100 text-purple-800', label: 'C' },
      'D': { color: 'bg-orange-100 text-orange-800', label: 'D' }
    };
    return badges[authType] || { color: 'bg-gray-100 text-gray-800', label: 'Unknown' };
  };
  
  // =====================================================
  // 🚀 INITIALIZATION SECTION - useEffect hooks
  // =====================================================
  useEffect(() => {
    loadGroups();
    loadManagers(); // Load managers on mount
    loadManagerRequests(); // 🆕 Load requests on mount
  }, [loadGroups, loadManagers,loadManagerRequests]);
  
  // =====================================================
  // 🖼️ RENDER SECTION - Loading State
  // =====================================================
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh] bg-gray-100">
        <div className="text-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg font-medium text-gray-700">Loading Admin Dashboard...</p>
        </div>
      </div>
    );
  }
  
  // =====================================================
  // 🖼️ MAIN DASHBOARD RENDER
  // =====================================================
  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      
      {/* ==================================================== */}
      {/* 📋 HEADER SECTION */}
      {/* ==================================================== */}
      <header className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
            <p className="text-gray-600 text-lg">Welcome back, {authData?.user?.firstName}!</p>
          </div>
          <button
            onClick={loadGroups}
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:bg-gray-400 flex items-center gap-2"
          >
            🔄 Refresh
          </button>
        </div>
        
        {/* ERROR BANNER */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex justify-between items-center">
            <span>{error}</span>
            <button 
              onClick={() => setError('')}
              className="ml-4 px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
            >
              ✕
            </button>
          </div>
        )}
      </header>

      {/* ==================================================== */}
      {/* 📝 CREATE GROUP SECTION */}
      {/* ==================================================== */}
      <section className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
        <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
          <span className="text-green-600">📝</span>
          Create New Group
        </h2>
        
        <form onSubmit={handleCreateGroup} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* GROUP NAME */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Group Name *</label>
            <input
              type="text"
              placeholder="Enter group name (e.g. 'Rocket Team')"
              value={createForm.groupName}
              onChange={(e) => setCreateForm({...createForm, groupName: e.target.value})}
              className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              disabled={isCreating || isLoadingManagers}
              required
            />
          </div>

          {/* AUTH TYPE */}
          <div className="lg:col-span-1">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Type *</label>
            <select
              value={createForm.groupAuthType}
              onChange={(e) => setCreateForm({...createForm, groupAuthType: e.target.value})}
              className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              disabled={isCreating || isLoadingManagers}
              required
            >
              <option value="">Select Type</option>
              <option value="A">🔐 Type A</option>
              <option value="B">🔐 Type B</option>
              <option value="C">🔐 Type C</option>
              <option value="D">🔐 Type D</option>
            </select>
          </div>

          {/* MANAGER SELECTION */}
          <div className="lg:col-span-1">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Group Manager *</label>
            {isLoadingManagers ? (
              <div className="w-full p-4 border border-gray-200 rounded-xl bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600"></div>
                <span className="ml-2 text-sm text-gray-600">Loading users...</span>
              </div>
            ) : (
              <select
                value={createForm.managerId}
                onChange={(e) => setCreateForm({...createForm, managerId: e.target.value})}
                className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                disabled={isCreating}
                required
              >
                <option value="">Select Manager</option>
                {managers.map((user) => (
                  <option key={user.userId} value={user.userId}>
                    {user.firstName} {user.lastName} ({user.emailId})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* SUBMIT BUTTON */}
          <div className="lg:col-span-3 flex items-end pt-2">
            <button
              type="submit"
              disabled={
                isCreating || 
                isLoadingManagers || 
                !createForm.groupName.trim() || 
                !createForm.groupAuthType || 
                !createForm.managerId
              }
              className="w-full lg:w-auto px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold rounded-xl hover:from-green-700 hover:to-green-800 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed shadow-lg transition-all flex items-center gap-3 justify-center"
            >
              {isCreating ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Creating...
                </>
              ) : (
                <>🚀 Create Group</>
              )}
            </button>
          </div>
        </form>

        {/* MANAGER PREVIEW */}
        {managers.length > 0 && createForm.managerId && (
          <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
            <p className="text-sm text-blue-800">
              <span className="font-semibold">Selected Manager:</span>{' '}
              {managers.find(u => u.userId === createForm.managerId)?.firstName}{' '}
              {managers.find(u => u.userId === createForm.managerId)?.lastName}
            </p>
          </div>
        )}
      </section>


        {/* ==================================================== */}
        {/* 📋 MANAGER REQUESTS SECTION - With Tabs */}
        {/* ==================================================== */}
        <section className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <span className="text-blue-600">📋</span>
            Manager Requests ({managerRequests.length})
            </h2>
            <button
            onClick={loadManagerRequests}
            disabled={isLoadingRequests}
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:bg-gray-400 flex items-center gap-2"
            >
            {isLoadingRequests ? (
                <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Refreshing...
                </>
            ) : (
                <>🔄 Refresh</>
            )}
            </button>
        </div>

        {/* 🆕 TABS */}
        <div className="flex border-b border-gray-200 mb-6">
            {['PENDING', 'ACCEPTED', 'REJECTED'].map((tab) => (
            <button
                key={tab}
                onClick={() => setActiveRequestTab(tab)}
                className={`px-6 py-3 text-sm font-semibold ${
                activeRequestTab === tab
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600 hover:text-blue-600'
                } transition-all`}
            >
                {tab} ({managerRequests.filter(req => req.status === tab).length})
            </button>
            ))}
        </div>

        {isLoadingRequests ? (
            <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        ) : managerRequests.filter(req => req.status === activeRequestTab).length === 0 ? (
            <div className="text-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
            <div className="text-4xl text-gray-400 mb-4">📭</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No {activeRequestTab.toLowerCase()} requests
            </h3>
            <p className="text-gray-500">No {activeRequestTab.toLowerCase()} requests at the moment.</p>
            </div>
        ) : (
            <div className="grid gap-6">
            {managerRequests
                .filter(req => req.status === activeRequestTab)
                .map((request) => {
                const statusColor = {
                    ACCEPTED: 'bg-green-100 text-green-800',
                    REJECTED: 'bg-red-100 text-red-800',
                    PENDING: 'bg-yellow-100 text-yellow-800'
                }[request.status] || 'bg-gray-100 text-gray-800';

                const authColor = {
                    A: 'bg-green-100 text-green-800',
                    B: 'bg-blue-100 text-blue-800',
                    C: 'bg-purple-100 text-purple-800',
                    D: 'bg-orange-100 text-orange-800'
                }[request.groupAuthType] || 'bg-gray-100 text-gray-800';

                return (
                    <div
                        key={request.requestId}
                        className="p-6 bg-gray-50 rounded-xl border border-gray-200 hover:shadow-md transition-all"
                        >
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900">{request.groupName}</h3>
                            <p className="text-sm text-gray-600 mt-1 truncate" title={request.emailId}>
                                Requested by: {request.emailId}
                            </p>
                            </div>
                            <div className="flex gap-2">
                            <span className={`px-3 py-1 ${statusColor} text-xs font-semibold rounded-full`}>
                                {request.status}
                            </span>
                            <span className={`px-3 py-1 ${authColor} text-xs font-semibold rounded-full`}>
                                Type {request.groupAuthType}
                            </span>
                            </div>
                        </div>
                        <div className="bg-white p-4 rounded-lg border border-gray-100 mb-4">
                            <p className="text-sm text-gray-700">{request.requestDescription}</p>
                        </div>

                        {/* Accept/Reject Buttons for PENDING */}
                        {/* 🆕 Accept/Reject Buttons for PENDING - FIXED */}
                        {request.status === 'PENDING' && (
                        <div className="flex gap-3 justify-end">
                            <button
                            onClick={() => handleAcceptRequest(request.requestId)}
                            disabled={acceptingRequestId === request.requestId}
                            className="px-4 py-2 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 disabled:bg-green-400 flex items-center gap-2"
                            >
                            {acceptingRequestId === request.requestId ? (
                                <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                Accepting...
                                </>
                            ) : (
                                <>✅ Accept</>
                            )}
                            </button>
                            <button
                            onClick={() => handleRejectRequest(request.requestId)}
                            disabled={rejectingRequestId === request.requestId}
                            className="px-4 py-2 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 disabled:bg-red-400 flex items-center gap-2"
                            >
                            {rejectingRequestId === request.requestId ? (
                                <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                Rejecting...
                                </>
                            ) : (
                                <>❌ Reject</>
                            )}
                            </button>
                        </div>
                        )}
                    </div>
                );
                })}
            </div>
        )}
        </section>


        {/* ==================================================== */}
        {/* 🗂️ GROUPS LIST SECTION - AUTH TYPE SECTIONS */}
        {/* ==================================================== */}
        <section className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <span className="text-indigo-600">🏢</span>
                Groups ({groups.length})
                </h2>
                <button
                onClick={loadGroups}
                disabled={loading}
                className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:bg-gray-400 flex items-center gap-2"
                >
                🔄 Refresh
                </button>
            </div>
        
            {groups.length === 0 ? (
                <div className="text-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                <div className="text-4xl text-gray-400 mb-4">📭</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No groups found</h3>
                <p className="text-gray-500">Create your first group above!</p>
                </div>
            ) : (
                <>
                {/* 🆕 GROUPED BY AUTH TYPE SECTIONS */}
                {['A', 'B', 'C', 'D'].map((authType) => {
                    // Filter groups by current AuthType
                    const authGroups = groups.filter(group => group.groupAuthType === authType);
                    
                    // Skip if no groups for this AuthType
                    if (authGroups.length === 0) return null;
                    
                    const badge = getAuthTypeBadge(authType);
                    
                    return (
                    <div key={authType} className="mb-8 last:mb-0">
                        {/* 🆕 BOLD SECTION HEADING */}
                        <div className="flex items-center gap-4 mb-6 pb-4 border-b-2 border-gray-100">
                        <div className={`w-3 h-3 rounded-full ${badge.color.replace('text-', 'bg-')}`}></div>
                        <h3 className="text-2xl font-bold text-gray-900">
                            Group Type: {badge.label}
                        </h3>
                        <div className="ml-auto text-sm text-gray-500 font-medium">
                            {authGroups.length} group{authGroups.length !== 1 ? 's' : ''}
                        </div>
                        </div>
                        
                        {/* 🆕 GROUP CARDS GRID */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        {authGroups
                            // Sort by Group ID within section
                            .sort((a, b) => a.groupId - b.groupId)
                            .map((group) => {
                            const groupBadge = getAuthTypeBadge(group.groupAuthType);
                            return (
                                <div 
                                key={group.groupId} 
                                className="group-card bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-xl hover:border-gray-300 transition-all duration-300 hover:-translate-y-1"
                                >
                                {/* GROUP HEADER */}
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex-1 min-w-0">
                                    <h3 className="text-xl font-bold text-gray-900 truncate" title={group.groupName}>
                                        {group.groupName}
                                    </h3>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className={`px-3 py-1 ${groupBadge.color} text-xs rounded-full font-bold`}>
                                        {groupBadge.label}
                                        </span>
                                        <span className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs font-medium rounded-full">
                                        ID: {group.groupId}
                                        </span>
                                    </div>
                                    </div>
                                    
                                    {/* QUORUM BADGE */}
                                    {group.quorumK > 0 && (
                                    <div className="ml-3 flex-shrink-0">
                                        <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                                        <span className="text-purple-600 font-bold text-sm">{group.quorumK}</span>
                                        </div>
                                    </div>
                                    )}
                                </div>

                                {/* MANAGER INFO */}
                                <div className="mb-4 p-3 bg-gray-50 rounded-xl">
                                    <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                                        <span className="text-white font-semibold text-sm">
                                        {group.managerName?.[0]?.toUpperCase() || 'M'}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-sm text-gray-900 truncate" title={group.managerName}>
                                        {group.managerName}
                                        </p>
                                        <p className="text-xs text-gray-500">Manager</p>
                                    </div>
                                    </div>
                                </div>

                                {/* ACTIONS */}
                                <div className="flex gap-3 pt-4 border-t border-gray-100">
                                    <button
                                        onClick={() => handleViewGroupDetails(group.groupId)}
                                        disabled={loadingGroupId === group.groupId}  // ✅ SPECIFIC GROUP!
                                        className="flex-1 px-4 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 disabled:bg-indigo-400 transition-all flex items-center justify-center gap-2"
                                        >
                                        {loadingGroupId === group.groupId ? (  // ✅ ONLY THIS BUTTON SPINS!
                                            <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            Loading...
                                            </>
                                        ) : (
                                            <>👁️ View Details</>
                                        )}
                                    </button>
                                </div>
                                </div>
                            );
                            })}
                        </div>
                    </div>
                    );
                })}
                </>
            )}
        </section>

{/* ==================================================== */}
{/* 👥 GROUP DETAILS MODAL SECTION - Fixed Rendering */}
{/* ==================================================== */}
{selectedGroup && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
      {/* MODAL HEADER */}
      <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{selectedGroup.groupName}</h2>
            <p className="text-gray-600 mt-1">Group Details & Members</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowReplaceConfirm(true)}
              className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 hover:text-blue-700 transition-all flex items-center gap-2"
              disabled={isLoadingManagers || replacingGroupId === selectedGroup.groupId}
            >
              👑 Replace Manager
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 hover:text-red-700 transition-all flex items-center gap-2"
              disabled={deletingGroupId === selectedGroup.groupId}
            >
              🗑️ Delete Group
            </button>
            <button
              onClick={() => {
                setSelectedGroup(null);
                setGroupMembers([]);
                setNewManagerId('');
                setShowReplaceConfirm(false); // 🆕 Ensure reset
                setShowDeleteConfirm(false); // 🆕 Ensure reset
              }}
              className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-all"
            >
              ✕
            </button>
          </div>
        </div>
      </div>

      {/* MEMBERS LIST - Always Visible */}
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <h3 className="text-xl font-semibold">
            Members ({groupMembers.length})
          </h3>
        </div>

        {loadingGroupId === selectedGroup.groupId ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : groupMembers.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No members in this group yet
          </div>
        ) : (
          <div className="grid gap-4">
            {groupMembers.map((member) => (
              <div key={member.membershipId} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {member.memberName?.[0]?.toUpperCase() || 'M'}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{member.memberName}</p>
                    <p className="text-sm text-gray-500">{member.emailId}</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <span className="block font-semibold text-sm">
                    {member.groupRoleName}
                  </span>
                  <span className={`inline-block px-3 py-1 text-xs rounded-full ${
                    member.status === 'ACTIVE' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {member.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  </div>
)}

{/* 🆕 DELETE CONFIRMATION MODAL */}
{showDeleteConfirm && selectedGroup && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
          <span className="text-red-600 text-xl">⚠️</span>
        </div>
        <h3 className="text-xl font-bold text-gray-900">Delete Group</h3>
      </div>
      
      <p className="text-gray-600 mb-6">
        Are you sure you want to delete <span className="font-semibold">{selectedGroup.groupName}</span> (ID: {selectedGroup.groupId})?
        This action cannot be undone.
      </p>
      
      <div className="flex gap-4 justify-end">
        <button
          onClick={() => setShowDeleteConfirm(false)}
          className="px-4 py-2 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all"
          disabled={deletingGroupId === selectedGroup.groupId}
        >
          Cancel
        </button>
        <button
          onClick={() => handleDeleteGroup(selectedGroup.groupId)}
          disabled={deletingGroupId === selectedGroup.groupId}
          className="px-4 py-2 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 disabled:bg-red-400 transition-all flex items-center gap-2"
        >
          {deletingGroupId === selectedGroup.groupId ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Deleting...
            </>
          ) : (
            <>🗑️ Delete</>
          )}
        </button>
      </div>
    </div>
  </div>
)}

{/* 🆕 REPLACE MANAGER MODAL */}
{showReplaceConfirm && selectedGroup && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
          <span className="text-blue-600 text-xl">👑</span>
        </div>
        <h3 className="text-xl font-bold text-gray-900">Replace Manager</h3>
      </div>
      
      <p className="text-gray-600 mb-4">
        Select a new manager for <span className="font-semibold">{selectedGroup.groupName}</span> (ID: {selectedGroup.groupId}).
      </p>
      
      {isLoadingManagers ? (
        <div className="w-full p-4 border border-gray-200 rounded-xl bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600"></div>
          <span className="ml-2 text-sm text-gray-600">Loading users...</span>
        </div>
      ) : (
        <select
          value={newManagerId}
          onChange={(e) => setNewManagerId(e.target.value)}
          className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all mb-4"
          disabled={replacingGroupId === selectedGroup.groupId}
        >
          <option value="">Select New Manager</option>
          {managers
            .filter(user => user.userId !== selectedGroup.managerId) // Exclude current manager
            .map((user) => (
              <option key={user.userId} value={user.userId}>
                {user.firstName} {user.lastName} ({user.emailId})
              </option>
            ))}
        </select>
      )}
      
      <div className="flex gap-4 justify-end">
        <button
          onClick={() => {
            setShowReplaceConfirm(false);
            setNewManagerId('');
          }}
          className="px-4 py-2 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all"
          disabled={replacingGroupId === selectedGroup.groupId}
        >
          Cancel
        </button>
        <button
          onClick={() => handleReplaceManager(selectedGroup.groupId, newManagerId)}
          disabled={!newManagerId || replacingGroupId === selectedGroup.groupId}
          className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:bg-blue-400 transition-all flex items-center gap-2"
        >
          {replacingGroupId === selectedGroup.groupId ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Replacing...
            </>
          ) : (
            <>👑 Replace</>
          )}
        </button>
      </div>
    </div>
  </div>
)}        

    </div>
  );
};

export default AdminDashboard;