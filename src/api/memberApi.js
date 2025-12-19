import axios from 'axios';

const API_URL = 'http://10.14.75.10:8082/backend/api';

/**
 * 
 * @returns 
 * [
    {
        "groupId": 28,
        "groupName": "CNG_FUEL_TEAM",
        "groupAuthType": "A",
        "managerId": 33,
        "quorumK": 0,
        "managerName": "Shiva Kumar",
        "createdOn": "2025-10-21"
    }
]
 */
export const viewMyMembershipsGroupDetails = async () => {
    const token = localStorage.getItem('token');
  return axios.get(`${API_URL}/memberships/my-memberships`,{
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
};

/**
 * 
 * @param {*} groupId 
 * @returns 
 * [
    {
        "membershipId": 19,
        "memberName": "Mangal  Kumar",
        "emailId": "xyz6677@gmail.com",
        "groupRoleName": "GROUP_MANAGER",
        "status": "ACTIVE"
    }
]
 */
export const viewMembershipsByGroupId = async (groupId) => {
    const token = localStorage.getItem('token');
  return axios.get(`${API_URL}/memberships/group/${groupId}`,{
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
};

export const viewAllDocumentsByGroupId = async (groupId) => {
    const token = localStorage.getItem('token');
  return axios.get(`${API_URL}/documents/groups/${groupId}/view-all`,{
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
};

export const downloadDocument = async (documentId) => {
    const token = localStorage.getItem('token');
  return axios.get(`${API_URL}/documents/download/${documentId}`,{
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
};

export const uploadDocument = async (docData) => {
    const token = localStorage.getItem('token');
  return axios.post(`${API_URL}/documents/upload`, docData, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'multipart/form-data'
    }
  });
};

/**
 * 
 * @param {*} groupId 
 * @returns 
 * [
    {
        "requestId": 2,
        "reqMemberName": "Mangal Kumar",
        "reqMemberEmailId": "xyzy46456@gmail.com",
        "toGroupId": 20,
        "groupName": "Aye Aye Tea",
        "membershipId": 18,
        "groupRoleName": "MEMBER",
        "status": "PENDING"
    }
]
 */
export const viewMyRemoveFromGroupRequests = async () => {
    const token = localStorage.getItem('token');
  return axios.get(`${API_URL}/my-remove-requests`,{
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
};

/**
 * 
 * @param {*} groupId 
 * @param 
 * {
 * {
 *  here is format for requestData : 

    "requestDescription":"any reason why member wants to leave the group"
}
 * } requestData 
 * @returns 
 */
export const sendRemoveRequest = async (groupId, requestData) => {
    const token = localStorage.getItem('token');
  return axios.post(`${API_URL}/groups/${groupId}/remove-request`, requestData, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
};


/**
 * 
 * @param {*} groupId 
 * @returns 
 * 
 * [{
    Long userId;
    String userName;
    String emailId;
    String groupRoleName;
    IsOnline isOnline;
    LocalDateTime lastUpdated;
},{..}]
 */
export const viewMembershipStatusesByGroup = async (groupId) => {
    const token = localStorage.getItem('token');
    return axios.get(`${API_URL}/memberships/view-memberships-status`,{
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    params: { groupId }
  });
};