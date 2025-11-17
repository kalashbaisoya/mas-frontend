import { useState, useCallback  } from 'react';

const useFormValidation = () => {
  const [error, setError] = useState('');

  const validateForm = useCallback((formData) => {
    // Check required fields
    const requiredFields = ['firstName', 'lastName', 'dateOfBirth', 'emailId', 'contactNumber', 'password'];
    for (const field of requiredFields) {
      if (!formData[field] || formData[field].trim() === '') {
        return false;
      }
    }

    // Check securityAnswerRequest: must have exactly 3 entries
    if (!Array.isArray(formData.securityAnswerRequest) || formData.securityAnswerRequest.length !== 3) {
      return false;
    }

    // Check each security answer for id and answer
    for (const answer of formData.securityAnswerRequest) {
      if (!answer.questionId || !answer.answer || answer.answer.trim() === '') {
        return false;
      }
    }

    // Check for unique security question IDs
    const selectedQuestionIds = formData.securityAnswerRequest.map(req => req.questionId);
    const uniqueQuestionIds = new Set(selectedQuestionIds);
    if (uniqueQuestionIds.size !== selectedQuestionIds.length) {
      return false;
    }

    

    return true;
  },[]);

  return { error, setError, validateForm };
};

export default useFormValidation;