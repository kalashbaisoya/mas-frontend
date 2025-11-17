import { useState } from 'react';
import { testViewAllGroups, viewAllGroupsSimple } from '../../services/adminService';

const TestAdminApi = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  const testManualFetch = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await testViewAllGroups();
      setData(result.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const testAxios = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await viewAllGroupsSimple();
      setData(result.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">🧪 API TEST</h2>
      
      <div className="space-y-4 mb-8">
        <button
          onClick={testManualFetch}
          disabled={loading}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? '⏳ Testing...' : '🧪 Test Manual Fetch'}
        </button>
        
        <button
          onClick={testAxios}
          disabled={loading}
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400"
        >
          {loading ? '⏳ Testing...' : '🔍 Test Axios'}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg mb-4">
          💥 {error}
        </div>
      )}

      {data && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="font-semibold mb-2">✅ SUCCESS!</h3>
          <pre className="text-sm bg-white p-3 rounded text-green-800">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default TestAdminApi;