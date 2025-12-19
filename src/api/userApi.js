import axios from 'axios';

const API_URL = 'http://10.14.75.10:8082/backend/api';

// used to get all group info
export const viewAllActiveGroups = async () => {
    const token = localStorage.getItem('token');
  return axios.get(`${API_URL}/group/viewAll`,{
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
};

// the below is used to subtract groups from all group list so
//  that we don't send request to the groups where we are already a part
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
 * @param 
 * {
 * {
 *  here is format for requestData : 

    "requestDescription":"why i should be added to the group "
}
 * } requestData 
 * @returns 
 * "Join request sent successfully"
 */
export const sendJoinRequest = async (groupId, requestData) => {
    const token = localStorage.getItem('token');
  return axios.post(`${API_URL}/groups/${groupId}/join-request`, requestData, {
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
        "requestId": 1,
        "requestUserId": 33,
        "requestUserFullName": "Shiv Kumar",
        "requestUserEmailId": "dfgdf@fghfdh.ac.in",
        "requestGroupId": 20,
        "requestGroupName": "Aye Aye Tea",
        "status": "PENDING",
        "requestedOn": "2025-10-23T12:04:35.325918",
        "requestDescription": "why i should be added to the group "
    }
] 
 */
export const viewMyJoinGroupRequests = async () => {
    const token = localStorage.getItem('token');
  return axios.get(`${API_URL}/my-join-requests`,{
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
};

/**
 * 
 * @param 
 * {
 * here is the format:
 * {
    "groupAuthType":"A",
    "requestDescription":"dear admin, plz create a group of authype A name as discussed in the last meeting",
    "groupName":"Team Marvel"
}
 * 
 * } requestData 
 * @returns 
 */
export const sendBecomeManagerRequest = async (requestData) => {
    const token = localStorage.getItem('token');
  return axios.post(`${API_URL}/become-manager-request`, requestData, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
};

/**
 * 
 * @returns 
 * {
    Long requestId;
    Long userId;
    String emailId;
    GroupAuthType groupAuthType;
    RequestStatus status;
    String requestDescription;
    String groupName;
}
 */
export const viewMyBecomeManagerRequests = async () => {
    const token = localStorage.getItem('token');
  return axios.get(`${API_URL}/my-become-manager`,{
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
};



