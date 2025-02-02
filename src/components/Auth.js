import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

function Auth() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const { signInWithMagicLink, loading } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    
    try {
      await signInWithMagicLink(email);
      setMessage('Check your email for the login link!');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-airbnb shadow-airbnb">
      <h2 className="text-2xl font-bold text-airbnb-hof mb-6">
        Admin Sign In
      </h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-airbnb-rausch rounded-airbnb">
          {error}
        </div>
      )}

      {message && (
        <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-airbnb">
          {message}
        </div>
      )}

      <div className="mb-4 p-3 bg-blue-50 text-blue-700 rounded-airbnb">
        <p>Enter your admin email to receive a secure login link.</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label className="block text-airbnb-hof text-sm font-medium mb-2">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-airbnb focus:border-airbnb-babu focus:ring-1 focus:ring-airbnb-babu"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-airbnb-rausch text-white py-3 rounded-airbnb hover:bg-airbnb-rausch/90 transition disabled:opacity-50"
        >
          {loading ? 'Sending Link...' : 'Send Login Link'}
        </button>
      </form>
    </div>
  );
}

export default Auth; 