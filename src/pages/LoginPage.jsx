import { useState , useEffect, useContext} from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser, getSecurityQuestions } from '../api/api';
import Card from '../components/layout/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import FormError from '../components/ui/FormError';
import Spinner from '../components/ui/Spinner';
import { RegistrationContext } from '../contexts/RegistrationContext';
import { AuthContext } from '../contexts/AuthContext';



function LoginPage() {
    const { securityQuestions, setSecurityQuestions } = useContext(RegistrationContext);
    const { setAuthData } = useContext(AuthContext);



  const [formData, setFormData] = useState({
    emailId: '',
    password: '',
    securityAnswerRequest: [
      { questionId: '', answer: '' }
    ]
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSecurityQuestionChange = (index, field, value) => {
    const newAnswers = [...formData.securityAnswerRequest];
    newAnswers[index] = { ...newAnswers[index], [field]: value };
    setFormData({ ...formData, securityAnswerRequest: newAnswers });
  };

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
              // console.log('Normalized Security Questions:', response.data);
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



  const handleSubmit = async () => {
    const { emailId, password, securityAnswerRequest } = formData;
    const { questionId, answer } = securityAnswerRequest[0];
    

    if (!emailId || !password || !questionId || !answer) {
      setError('Please fill all fields including security question and answer');
      return;
    }

    const payload = {
      emailId,
      password,
      securityQuestionId: parseInt(questionId), // ensure it's a Long
      securityAnswer: answer
    };

    console.log("Sent Payload: ",payload);


    setLoading(true);
    try {
      const response = await loginUser(payload);
      setSuccess(response.data.message);
      setError('');

      // // 🛠️ TRANSFORM THE DATA - EXTRACT STRINGS FROM OBJECTS
      // const transformedAuthData = {
      //   user: {
      //     ...response.data.user, // Keep all user data
      //     systemRole: response.data.user.systemRole.roleName // ← EXTRACT STRING!
      //   },
      //   membershipInfo: response.data.membershipInfo // Already correct format ✅
      // };
      localStorage.setItem('token', response.data.token);
      console.log("Login Response Data: ",response.data);
      // setAuthData(transformedAuthData);
      setAuthData(response.data);
      navigate('/dashboard-page');

    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      setSuccess('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <Card title="Login">
        {error && <FormError message={error} />}
        {success && <p className="text-green-500 text-center">{success}</p>}
        {loading && <Spinner />}
        <div className="space-y-4">
          <Input
            type="email"
            name="emailId"
            value={formData.emailId}
            onChange={handleChange}
            placeholder="Email"
          />
          <Input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Password"
          />
          {[0].map((index) => (
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
            Login
          </Button>
          <p className="text-center">
            Need an account?{' '}
            <span className="text-blue-500 cursor-pointer" onClick={() => navigate('/register')}>
              Register
            </span>
          </p>
          <p className="text-center">
            Forgot OTP?{' '}
            <span className="text-blue-500 cursor-pointer" onClick={() => navigate('/generate-otp')}>
              Generate New OTP
            </span>
          </p>
        </div>
      </Card>
    </div>
  );
}

export default LoginPage;