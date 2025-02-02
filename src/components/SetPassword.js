import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';

function SetPassword() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleVerification = async () => {
      const params = new URLSearchParams(location.search);
      const token = params.get('token');
      const type = params.get('type');

      if (type === 'invite' && token) {
        // Store the token for use when setting password
        sessionStorage.setItem('inviteToken', token);
      }
    };

    handleVerification();
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const token = sessionStorage.getItem('inviteToken');
      if (!token) {
        throw new Error('Invalid or expired invite link');
      }

      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) throw error;

      // Clear the stored token
      sessionStorage.removeItem('inviteToken');
      navigate('/auth');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-airbnb shadow-airbnb">
      <h2 className="text-2xl font-bold text-airbnb-hof mb-6">
        Set Your Password
      </h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-airbnb-rausch rounded-airbnb">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label className="block text-airbnb-hof text-sm font-medium mb-2">
            New Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-airbnb focus:border-airbnb-babu focus:ring-1 focus:ring-airbnb-babu"
            required
            minLength={6}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-airbnb-rausch text-white py-3 rounded-airbnb hover:bg-airbnb-rausch/90 transition disabled:opacity-50"
        >
          {loading ? 'Setting Password...' : 'Set Password'}
        </button>
      </form>
    </div>
  );
}

export default SetPassword; 