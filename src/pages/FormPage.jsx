import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RegistrationContext } from '../contexts/RegistrationContext';
import { getSecurityQuestions, registerUser } from '../api/api';
import Card from '../components/layout/Card';
import Stepper from '../components/layout/Stepper';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import FormError from '../components/ui/FormError';
import Spinner from '../components/ui/Spinner';
import useFormValidation from '../hooks/useFormValidation';

function FormPage() {
  const { formData, setFormData, securityQuestions, setSecurityQuestions } = useContext(RegistrationContext);
  const { error, setError, validateForm } = useFormValidation();
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await getSecurityQuestions();
        // console.log('Raw Security Questions Response:', response.data);
        if (Array.isArray(response.data)) {
          
          // Check for duplicate IDs
          const idSet = new Set(response.data.map(q => q.questionId,));
          if (idSet.size !== response.data.length) {
            console.warn('Duplicate question IDs detected:', response.data);
            setError('Duplicate security question IDs detected');
          } else {
            console.log('Normalized Security Questions:', response.data);
            setSecurityQuestions(response.data);
          }
        } else {
          console.error('Security questions response is not an array:', response.data);
          setError('Invalid security questions data from server');
        }
      } catch (err) {
        console.error('Error fetching security questions:', err);
        setError('Failed to fetch security questions');
      }
    };
    fetchQuestions();
  }, [setSecurityQuestions, setError]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, image: e.target.files[0] });
  };

  const handleSecurityQuestionChange = (index, field, value) => {
    const newAnswers = [...formData.securityAnswerRequest];
    newAnswers[index] = { ...newAnswers[index], [field]: value };
    setFormData({ ...formData, securityAnswerRequest: newAnswers });
  };

  const handleSubmit = async () => {
  console.log('Form Data:', formData); // Debug formData
  if (!validateForm(formData)) {
    console.log('Validation Failed. Form Data:', formData); // Debug failure
    setError('Please fill all fields and select three different security questions');
    return;
  }

    setLoading(true);
    try {
      const formDataToSend = new FormData();
      // Create JSON object for UserRegisterRequest
      const requestData = {
        firstName: formData.firstName,
        middleName: formData.middleName,
        lastName: formData.lastName,
        dateOfBirth: formData.dateOfBirth,
        emailId: formData.emailId,
        contactNumber: formData.contactNumber,
        password: formData.password,
        securityAnswerRequest: formData.securityAnswerRequest.map(answer => ({
          questionId: answer.questionId,
          answer: answer.answer
        }))
      };
      // Append JSON as Blob with application/json type
      formDataToSend.append('request', new Blob([JSON.stringify(requestData)], { type: 'application/json' }));
      // Append image if present
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }

      const response = await registerUser(formDataToSend);
      setSuccess(response.data);
      setError('');
      navigate('/verify-otp');
    } catch (err) {
      setError(err.response?.data || 'Registration failed');
      setSuccess('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <Card title="Register">
        <Stepper step={1} />
        {error && <FormError message={error} />}
        {success && <p className="text-green-500 text-center">{success}</p>}
        {loading && <Spinner />}
        <div className="space-y-4">
          <Input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            placeholder="First Name"
          />
          <Input
            type="text"
            name="middleName"
            value={formData.middleName}
            onChange={handleChange}
            placeholder="Middle Name"
          />
          <Input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            placeholder="Last Name"
          />
          <Input
            type="date"
            name="dateOfBirth"
            value={formData.dateOfBirth}
            onChange={handleChange}
            placeholder="Date of Birth"
          />
          <Input
            type="email"
            name="emailId"
            value={formData.emailId}
            onChange={handleChange}
            placeholder="Email"
          />
          <Input
            type="tel"
            name="contactNumber"
            value={formData.contactNumber}
            onChange={handleChange}
            placeholder="Contact Number"
          />
          <Input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Password"
          />
          <Input
            type="file"
            name="image"
            onChange={handleFileChange}
            accept="image/*"
          />
          {[0, 1, 2].map((index) => (
            <div key={`security-question-${index}`} className="space-y-2">
              <select
                value={formData.securityAnswerRequest[index].questionId || ''} // Use normalized id
                onChange={(e) => handleSecurityQuestionChange(index, 'questionId', e.target.value)}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option key={`default-${index}`} value="">
                  Select Security Question {index + 1}
                </option>
                {securityQuestions.length > 0 ? (
                  securityQuestions.map((question, qIndex) => (
                    <option
                      key={`question-${question.questionId}-${index}-${qIndex}`}
                      value={question.questionId}
                    >
                      {question.questionText}
                    </option>

                  ))
                ) : (
                  <option key={`no-questions-${index}`} value="" disabled>
                    No questions available
                  </option>
                )}
              </select>
              <Input
                type="text"
                value={formData.securityAnswerRequest[index].answer}
                onChange={(e) => handleSecurityQuestionChange(index, 'answer', e.target.value)}
                placeholder={`Answer for Security Question ${index + 1}`}
              />
            </div>
          ))}
          <Button onClick={handleSubmit} disabled={loading}>
            Register
          </Button>
          <p className="text-center">
            Already have an account?{' '}
            <span className="text-blue-500 cursor-pointer" onClick={() => navigate('/capture', { state:  formData.emailId })}>
              Login
            </span>
          </p>
        </div>
      </Card>
    </div>
  );
}

export default FormPage;