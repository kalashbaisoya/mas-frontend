
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { captureBiometric, registerBiometric } from '../api/api';

import Card from '../components/layout/Card';
import Stepper from '../components/layout/Stepper';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import FormError from '../components/ui/FormError';
import Spinner from '../components/ui/Spinner';

function CaptureBiometric() {
  const location = useLocation();
  const navigate = useNavigate();

  // 1. Initialize formData with emailId from state
  const [formData, setFormData] = useState({
    emailId: location.state?.emailId || ''
  });

  const [fingerprints, setFingerprints] = useState([]);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  // You should likely keep this check to ensure user comes from register page
  useEffect(() => {
    if (!formData.emailId) {
      navigate('/capture');
    }
  }, [formData.emailId, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCapture = async () => {
    if (fingerprints.length >= 5) return;

    setLoading(true);
    setError('');
    setStatus('Waiting for fingerprint...');

    try {
      const res = await captureBiometric();

      if (!res.data?.success || !res.data?.template) {
        throw new Error(res.data?.message || 'Fingerprint capture failed');
      }

      const updatedPrints = [...fingerprints, res.data.template];
      setFingerprints(updatedPrints);
      setStatus(`Fingerprint ${updatedPrints.length} captured successfully`);

      // 🔥 AUTO REGISTER AFTER 5 CAPTURES
      if (updatedPrints.length === 5) {
        await registerFingerprints(updatedPrints);
      }

    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Capture failed');
      setStatus('');
    } finally {
      setLoading(false);
    }
  };

  const registerFingerprints = async (prints) => {
    // 2. Optional: Basic validation
    if (!formData.emailId.trim()) {
        setError('Email ID cannot be empty.');
        setStatus('');
        return;
    }
    
    setLoading(true);
    setStatus('Registering biometric...');
    setError('');

    try {
      const payload = {
        // 3. Use the mutable value from formData state
        email: formData.emailId, 
        fingerprints: prints,
      };

      await registerBiometric(payload);

      setStatus('Biometric registered successfully');
      navigate('/verify-otp', { state: { emailId: formData.emailId } });

    } catch (err) {
      setError(err.response?.data?.message || 'Biometric registration failed');
      setStatus('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <Card title="Capture Biometric">
        <Stepper step={2} />

        {error && <FormError message={error} />}
        {status && <p className="text-blue-600 text-center">{status}</p>}
        {loading && <Spinner />}

        <div className="space-y-4">
          {/* Email (now editable) */}
          <Input
            type="email"
            value={formData.emailId} // <-- Uses mutable state
            name="emailId"
            onChange={handleChange}
            placeholder="Email"
          />

          <p className="text-sm text-gray-600 text-center">
            Captured fingerprints: {fingerprints.length} / 5
          </p>

          <Button
            onClick={handleCapture}
            disabled={loading || fingerprints.length >= 5}
          >
            Capture Fingerprint
          </Button>
        </div>
      </Card>
    </div>
  );
}

export default CaptureBiometric;

// import { useEffect, useState } from 'react';
// import { useLocation, useNavigate } from 'react-router-dom';
// import { captureBiometric, registerBiometric } from '../api/api';

// import Card from '../components/layout/Card';
// import Stepper from '../components/layout/Stepper';
// import Input from '../components/ui/Input';
// import Button from '../components/ui/Button';
// import FormError from '../components/ui/FormError';
// import Spinner from '../components/ui/Spinner';

// function CaptureBiometric() {
//   const location = useLocation();
//   const navigate = useNavigate();

//   const emailId = location.state?.emailId || '';

//   const [fingerprints, setFingerprints] = useState([]);
//   const [error, setError] = useState('');
//   const [status, setStatus] = useState('');
//   const [loading, setLoading] = useState(false);

// //   useEffect(() => {
// //     if (!emailId) {
// //       navigate('/register');
// //     }
// //   }, [emailId, navigate]);

//   const handleCapture = async () => {
//     if (fingerprints.length >= 5) return;

//     setLoading(true);
//     setError('');
//     setStatus('Waiting for fingerprint...');

//     try {
//       const res = await captureBiometric();

//       if (!res.data?.success || !res.data?.template) {
//         throw new Error(res.data?.message || 'Fingerprint capture failed');
//       }

//       const updatedPrints = [...fingerprints, res.data.template];
//       setFingerprints(updatedPrints);
//       setStatus(`Fingerprint ${updatedPrints.length} captured successfully`);

//       // 🔥 AUTO REGISTER AFTER 5 CAPTURES
//       if (updatedPrints.length === 5) {
//         await registerFingerprints(updatedPrints);
//       }

//     } catch (err) {
//       setError(err.response?.data?.message || err.message || 'Capture failed');
//       setStatus('');
//     } finally {
//       setLoading(false);
//     }
//   };

//     const handleChange = (e) => {
//         const { name, value } = e.target;
//         setFormData({ ...formData, [name]: value });
//     };

//   const registerFingerprints = async (prints) => {
//     setLoading(true);
//     setStatus('Registering biometric...');
//     setError('');

//     try {
//       const payload = {
//         email: emailId,
//         fingerprints: prints,
//       };

//       await registerBiometric(payload);

//       setStatus('Biometric registered successfully');
//       navigate('/verify-otp', { state: { emailId } });

//     } catch (err) {
//       setError(err.response?.data?.message || 'Biometric registration failed');
//       setStatus('');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-100 flex items-center justify-center">
//       <Card title="Capture Biometric">
//         <Stepper step={2} />

//         {error && <FormError message={error} />}
//         {status && <p className="text-blue-600 text-center">{status}</p>}
//         {loading && <Spinner />}

//         <div className="space-y-4">
//           {/* Email (read-only) */}
//           <Input
//             type="email"
//             value={emailId}
//             name="emailId"
//             onChange={handleChange}
//             placeholder="Email"
//           />

//           <p className="text-sm text-gray-600 text-center">
//             Captured fingerprints: {fingerprints.length} / 5
//           </p>

//           <Button
//             onClick={handleCapture}
//             disabled={loading || fingerprints.length >= 5}
//           >
//             Capture Fingerprint
//           </Button>
//         </div>
//       </Card>
//     </div>
//   );
// }

// export default CaptureBiometric;
