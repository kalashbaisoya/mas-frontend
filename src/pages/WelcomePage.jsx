import { useNavigate } from 'react-router-dom';
import Card from '../components/layout/Card';
import Button from '../components/ui/Button';

function WelcomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <Card title="Welcome to MAS">
        <div className="space-y-4">
          <Button onClick={() => navigate('/register')} className="w-full">
            Sign Up
          </Button>
          <Button onClick={() => navigate('/login')} className="w-full">
            Login
          </Button>
        </div>
      </Card>
    </div>
  );
}

export default WelcomePage;