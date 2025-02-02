import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import { useAuth } from '../context/AuthContext';

function NameRegistration() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Get email from URL parameters or hash
      const urlParams = new URLSearchParams(location.search);
      const hashParams = new URLSearchParams(location.hash.substring(1));
      const email = urlParams.get('email') || hashParams.get('email');
      
      if (!email) {
        throw new Error('Email parameter missing');
      }

      // Update authorized_users with name
      const { error: updateError } = await supabase
        .from('authorized_users')
        .update({
          first_name: firstName,
          last_name: lastName
        })
        .eq('email', email);

      if (updateError) throw updateError;

      // If user is already authenticated, redirect to home
      if (user) {
        navigate('/');
        return;
      }

      // Otherwise, create a magic link session
      const { error: signInError } = await supabase.auth.signInWithOtp({
        email: email,
        options: {
          shouldCreateUser: false, // Don't create a new user since they already exist
          emailRedirectTo: `${window.location.origin}/`
        }
      });

      if (signInError) throw signInError;

      // Redirect to home and show success message
      navigate('/', { 
        state: { 
          message: 'Registration complete! Check your email for the login link.' 
        }
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-airbnb shadow-airbnb">
      <h2 className="text-2xl font-bold text-airbnb-hof mb-6">Complete Your Registration</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-airbnb-rausch rounded-airbnb">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-airbnb-hof text-sm font-medium mb-2">
            First Name
          </label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-airbnb focus:border-airbnb-babu focus:ring-1 focus:ring-airbnb-babu"
            required
          />
        </div>

        <div className="mb-6">
          <label className="block text-airbnb-hof text-sm font-medium mb-2">
            Last Name
          </label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-airbnb focus:border-airbnb-babu focus:ring-1 focus:ring-airbnb-babu"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-airbnb-rausch text-white py-3 rounded-airbnb hover:bg-airbnb-rausch/90 transition disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Complete Registration'}
        </button>
      </form>
    </div>
  );
}

export default NameRegistration;