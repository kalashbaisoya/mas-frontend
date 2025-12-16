import axios from 'axios';

const API_URL = 'http://10.145.90.153:8082/backend/api';

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
 * @param
 *  {you will get this value after hitting viewAllActiveGroups} groupId 
 * @param 
 * { 
 * here is format for memberDataList : 
 * [
    {
        "userId":"5", // ID of user to add
        "groupRoleName":"PANELIST" // Optional: MEMBER or PANELIST (defaults to MEMBER)
    }
  ]
   } memberDataList 
 * @returns "Members added successfully"
 */
export const addMember = async (groupId, memberDataList) => {
    const token = localStorage.getItem('token');
  return axios.post(`${API_URL}/memberships/${groupId}/addMember`, memberDataList, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
};

/**
 * 
 * @returns 
 * [
    {
        "userId": 55,
        "firstName": "Jfgoker",
        "middleName": "",
        "lastName": "Kumar",
        "dateOfBirth": "2011-11-29",
        "emailId": "xyx@gmail.com",
        "contactNumber": "9565645645",
        "image": null,
        "systemRole": {
            "roleId": 1,
            "roleName": "ADMIN"
        },
        "isEmailVerified": null
    },
    {
        "userId": 333,
        "firstName": "Shiva",
        "middleName": "",
        "lastName": "Kumar",
        "dateOfBirth": "2011-11-29",
        "emailId": "215645@fsdgd.ac.in",
        "contactNumber": "9560721899",
        "image": null,
        "systemRole": {
            "roleId": 2,
            "roleName": "USER"
        },
        "isEmailVerified": null
    }
]
 */
export const getAllVerifiedUserProfile = async () => {
    const token = localStorage.getItem('token');
  return axios.get(`${API_URL}/users`,{
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
};


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
export const viewAllActiveGroups = async () => {
    const token = localStorage.getItem('token');
  return axios.get(`${API_URL}/group/viewAll`,{
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

export const suspendMember = async (groupId, emailId) => {
    const token = localStorage.getItem('token');
  return axios.put(`${API_URL}/memberships/${groupId}/suspend`, null, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    params: { emailId }
  });
};

export const unsuspendMember = async (groupId, emailId) => {
    const token = localStorage.getItem('token');
  return axios.put(`${API_URL}/memberships/${groupId}/unsuspend`, null, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    params: { emailId }
  });
};

export const removeMember = async (groupId, emailId) => {
    const token = localStorage.getItem('token');
  return axios.delete(`${API_URL}/memberships/${groupId}/remove`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    params: { emailId }
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
export const viewAllGroupJoinRequestByGroupId = async (groupId) => {
    const token = localStorage.getItem('token');
  return axios.get(`${API_URL}/groups/${groupId}/join-requests`,{
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
export const viewAllRemoveFromGroupRequests = async (groupId) => {
    const token = localStorage.getItem('token');
  return axios.get(`${API_URL}/groups/${groupId}/remove-requests`,{
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
};

export const acceptJoinRequest = async (requestId) => {
    const token = localStorage.getItem('token');
  return axios.put(`${API_URL}/groups/join-requests/${requestId}/accept`,null,{
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
};

export const rejectJoinRequest = async (requestId) => {
    const token = localStorage.getItem('token');
  return axios.put(`${API_URL}/groups/join-requests/${requestId}/reject`,null,{
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
};


export const acceptRemoveRequest = async (requestId) => {
    const token = localStorage.getItem('token');
  return axios.put(`${API_URL}/groups/remove-requests/${requestId}/accept`,null,{
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
};

export const rejectRemoveRequest = async (requestId) => {
    const token = localStorage.getItem('token');
  return axios.put(`${API_URL}/groups/remove-requests/${requestId}/reject`,null,{
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
        "documentId": 1,
        "fileName": "dd12edb2-0cab-43e7-b2a8-f3dc6979fb28.pdf",
        "fileType": "application/pdf",
        "accessType": "READ"
    }
]
 */
export const viewAllDocumentsByGroupId = async (groupId) => {
    const token = localStorage.getItem('token');
  return axios.get(`${API_URL}/documents/groups/${groupId}/view-all`,{
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
};

/**
 * 
 * @param {*} documentId 
 * @returns 
 * {
    private String downloadUrl;
    private String message;
}
 */
export const downloadDocument = async (documentId) => {
    const token = localStorage.getItem('token');
  return axios.get(`${API_URL}/documents/download/${documentId}`,{
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
 * format for upload is here:
 * {
    "groupId":12,
    "accessType": "READ"
}
    plus append file to this object above
 * upload any file
 * 
 * } docData 
 * @returns 
 * {
    private Long documentId;
    private String fileName;
    private String fileType;
    private AccessType accessType;
    private String fileId;
    private String message;
}
 */
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



/**
 * ----------------------------------------------------
 * CREATE AUTHENTICATION SESSION
 * POST /api/auth/groups/{groupId}/sessions
 * ----------------------------------------------------
 *
 * @param {Number} groupId
 *
 * @returns {
 *   sessionId,
 *   groupId,
 *   authType,
 *   status,
 *   requiredSignatures,
 *   expiresAt,
 *   initiator
 * }
 */
export const createAuthSession = async (groupId) => {
  const token = localStorage.getItem("token");

  return axios.post(
    `${API_URL}/auth/groups/${groupId}/sessions`,
    {},
    {
      headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    }
  );
};


/**
 * ----------------------------------------------------
 * SIGN AUTHENTICATION SESSION (BIOMETRIC)
 * PUT /api/auth/sessions/{sessionId}/sign
 * ----------------------------------------------------
 *
 * @param {
 *   sessionId: Number,
 *   biometricTemplateBase64: String
 * }
 *
 * @returns {
 *   sessionId,
 *   signatureStatus,        // VERIFIED / REJECTED
 *   sessionStatus,          // ACTIVE / COMPLETED
 *   verifiedCount,
 *   requiredCount,
 *   groupUnlocked,
 *   signedAt
 * }
 */
export const signAuthSession = async (sessionId,payload) => {
  const token = localStorage.getItem("token");

  return axios.put(
    `${API_URL}/auth/sessions/${sessionId}/sign`,
    payload,
    {
      headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
      },
    }
  );
};


/**
 * ----------------------------------------------------
 * CHECK GROUP ACCESS
 * GET /api/auth/groups/{groupId}/access
 * ----------------------------------------------------
 *
 * @param {Number} groupId
 *
 * @returns Boolean
 */
export const isGroupAccessAllowed = async (groupId) => {
  const token = localStorage.getItem("token");

  return axios.get(
    `${API_URL}/auth/groups/${groupId}/access`,
    {
      headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
      },
    }
  );
};


/**
 * ----------------------------------------------------
 * UPDATE AUTH INTENT (OPT-IN / OPT-OUT)
 * PUT /api/auth/groups/{groupId}/auth-intent
 * ----------------------------------------------------
 *
 * @param {
 *   groupId: Number,
 *   isWaiting: Boolean
 * }
 *
 * @returns void
 */
export const updateAuthIntent = async (groupId, isWaiting) => {
  const token = localStorage.getItem("token");

  return axios.put(
    `${API_URL}/auth/groups/${groupId}/auth-intent`,
    null,
    {
      headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
        },
      params: {
        isWaiting
      }
    }
  );
};
