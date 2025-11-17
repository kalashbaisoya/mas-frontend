import { createContext, useState } from 'react';

export const RegistrationContext = createContext();

export const RegistrationProvider = ({ children }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    dateOfBirth: '',
    emailId: '',
    contactNumber: '',
    password: '',
    securityAnswerRequest: [
      { questionId: '', answer: '' },
      { questionId: '', answer: '' },
      { questionId: '', answer: '' }
    ]
  });
  const [securityQuestions, setSecurityQuestions] = useState([]);

  return (
    <RegistrationContext.Provider value={{ formData, setFormData, securityQuestions, setSecurityQuestions }}>
      {children}
    </RegistrationContext.Provider>
  );
};