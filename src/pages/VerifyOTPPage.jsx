import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { verifyOTP,generateAndSendOTP } from '../api/api';
import Card from '../components/layout/Card';
import Stepper from '../components/layout/Stepper';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import FormError from '../components/ui/FormError';
import Spinner from '../components/ui/Spinner';

function VerifyOTPPage() {
  const [emailId, setEmailId] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!emailId || !otpCode) {
      setError('Please enter both email and OTP code');
      return;
    }

    setLoading(true);
    try {
      const response = await verifyOTP(emailId, otpCode);
      setSuccess(response.data);
      setError('');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'OTP verification failed');
      setSuccess('');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitGenOtp = async() => {
    if (!emailId) {
      setError('Please enter email');
      return;
    }
    setLoading(true);
    try {
      const response = await generateAndSendOTP(emailId);
      setSuccess(response.data);
      setError('');
    } catch (error) {
      setError(error.response?.data?.message || 'Failled to Generate OTP');
      setSuccess('');
    } finally{
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <Card title="Verify OTP">
        <Stepper step={2} />
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
          <Input
            type="text"
            value={otpCode}
            onChange={(e) => setOtpCode(e.target.value)}
            placeholder="OTP Code"
          />
          <Button onClick={handleSubmitGenOtp} disabled={loading}>
            Generate New OTP
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            Verify OTP
          </Button>
        </div>
      </Card>
    </div>
  );
}

export default VerifyOTPPage;