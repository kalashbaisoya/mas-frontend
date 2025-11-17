import axios from 'axios';

const API_URL = 'http://10.145.90.153:8082/backend/api';

export const registerUser = async (formData) => {
  return axios.post(`${API_URL}/register`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};

export const verifyOTP = async (emailId, otpCode) => {
  return axios.post(`${API_URL}/verify-otp`, null, {
    params: { emailId, otpCode }
  });
};

export const loginUser = async (data) => {
  return axios.post(`${API_URL}/login`, data);
};

export const generateAndSendOTP = async (emailId) => {
  return axios.post(`${API_URL}/generateNewOtp`, null, {
    params: { emailId }
  });
};

export const getSecurityQuestions = async () => {
  return axios.get(`${API_URL}/security-questions`);
};



