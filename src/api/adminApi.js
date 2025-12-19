import axios from 'axios';

const API_URL = 'http://10.14.75.10:8082/backend/api';

export const createGroup = async (groupData) => {
    const token = localStorage.getItem('token');
  return axios.post(`${API_URL}/group/create`, groupData, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
};

export const getAllVerifiedUserProfile = async () => {
    const token = localStorage.getItem('token');
  return axios.get(`${API_URL}/users`,{
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
};

export const deleteGroup = async (groupId) => {
    const token = localStorage.getItem('token');
  return axios.delete(`${API_URL}/group/${groupId}`,{
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
};

export const viewAllGroups = async () => {
    const token = localStorage.getItem('token');
  return axios.get(`${API_URL}/group/viewAll`,{
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
};

export const viewMembershipsByGroupId = async (groupId) => {
    const token = localStorage.getItem('token');
  return axios.get(`${API_URL}/memberships/group/${groupId}`,{
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
};


export const replaceManager = async (groupId, requestData) => {
    const token = localStorage.getItem('token');
  return axios.put(`${API_URL}/group/${groupId}/manager`, requestData, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
};



export const viewAllBecomeManagerRequests = async () => {
    const token = localStorage.getItem('token');
  return axios.get(`${API_URL}/become-manager-requests`,{
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
};

export const acceptBecomeManagerRequest = async (requestId) => {
    const token = localStorage.getItem('token');
  return axios.put(`${API_URL}/become-manager-requests/${requestId}/accept`,null,{
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
};

export const rejectBecomeManagerRequest = async (requestId) => {
    const token = localStorage.getItem('token');
  return axios.put(`${API_URL}/become-manager-requests/${requestId}/reject`,null,{
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
};

// const apiClient = axios.create({
//   baseURL: API_URL,
//   timeout: 10000,
//   headers: {
//     'Content-Type': 'application/json'
//   }
// });

// // 🔥 SIMPLIFIED + BULLETPROOF INTERCEPTOR
// apiClient.interceptors.request.use(
//   async (config) => {
//     // 🔍 STEP 1: Get token
//     const token = localStorage.getItem('token');
//     console.log('🔍 [INTERCEPTOR] Token found:', !!token);
    
//     // 🔍 STEP 2: Add Authorization header
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//       console.log('✅ [INTERCEPTOR] Added Authorization header');
//     } else {
//       console.error('❌ [INTERCEPTOR] NO TOKEN!');
//     }
    
//     // 🔍 STEP 3: Log full request
//     console.log('📤 [REQUEST]', config.method?.toUpperCase(), config.url);
//     console.log('📋 [HEADERS]', config.headers);
    
//     return config;
//   },
//   (error) => {
//     console.error('💥 [INTERCEPTOR ERROR]', error);
//     return Promise.reject(error);
//   }
// );

// // 🔥 RESPONSE INTERCEPTOR
// apiClient.interceptors.response.use(
//   (response) => {
//     console.log('📥 [SUCCESS]', response.status, response.config.url);
//     return response;
//   },
//   (error) => {
//     console.error('💥 [ERROR]', error.response?.status, error.config?.url);
//     console.error('📄 [ERROR DATA]', error.response?.data);
    
//     if (error.response?.status === 401 || error.response?.status === 403) {
//       console.error('🔐 [401/403] Auto-logout');
//       localStorage.removeItem('token');
//       window.location.href = '/login';
//     }
//     return Promise.reject(error);
//   }
// );