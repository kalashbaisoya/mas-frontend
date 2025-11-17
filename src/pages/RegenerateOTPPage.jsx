import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateAndSendOTP } from '../api/api';
import Card from '../components/layout/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import FormError from '../components/ui/FormError';
import Spinner from '../components/ui/Spinner';

function RegenerateOTPPage() {
  const [emailId, setEmailId] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!emailId) {
      setError('Please enter an email');
      return;
    }

    setLoading(true);
    try {
      const response = await generateAndSendOTP(emailId);
      setSuccess(response.data);
      setError('');
      navigate('/verify-otp');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate OTP');
      setSuccess('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <Card title="Generate New OTP">
        {error && <FormError message={error} />}
        {success && <p className="text-green-500 text-center">{success}</p>}
        {loading && <Spinner />}
        <div className="space-y-4">
          <Input
            type="email"
            value={emailId}
            onChange={(e) => setEmailId(e.target.value)}
            placeholder="Email"
          />
          <Button onClick={handleSubmit} disabled={loading}>
            Generate OTP
          </Button>
          <p className="text-center">
            Back to{' '}
            <span className="text-blue-500 cursor-pointer" onClick={() => navigate('/login')}>
              Login
            </span>
          </p>
        </div>
      </Card>
    </div>
  );
}

export default RegenerateOTPPage;