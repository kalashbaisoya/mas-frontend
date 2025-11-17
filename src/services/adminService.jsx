import axios from 'axios';

// 🔍 DEBUG - Test with MANUAL fetch first
export const testViewAllGroups = async () => {
  console.log('🧪 MANUAL FETCH TEST');
  
  const token = localStorage.getItem('token');
  console.log('🔑 TOKEN:', token ? `${token.substring(0, 20)}...` : 'MISSING');
  
  try {
    const response = await fetch('http://localhost:8080/api/group/viewAll', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('📊 MANUAL STATUS:', response.status);
    console.log('📊 MANUAL HEADERS:', [...response.headers.entries()]);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('💥 MANUAL ERROR:', errorText);
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    
    const data = await response.json();
    console.log('✅ MANUAL SUCCESS:', data);
    return { data, status: response.status };
  } catch (error) {
    console.error('💥 MANUAL FAILED:', error);
    throw error;
  }
};

// 🔍 Simple axios version
export const viewAllGroupsSimple = async () => {
  console.log('🔍 SIMPLE AXIOS TEST');
  
  const token = localStorage.getItem('token');
  const response = await axios.get('http://localhost:8080/api/group/viewAll', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  console.log('✅ SIMPLE SUCCESS:', response.data);
  return response;
};