import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase, supabaseAdmin } from '../services/supabaseClient';

function Admin() {
  const { user } = useAuth();
  const [authorizedUsers, setAuthorizedUsers] = useState([]);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [authLogs, setAuthLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAuthorizedUsers();
    fetchAuthLogs();
  }, []);

  const fetchAuthorizedUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('authorized_users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAuthorizedUsers(data);
    } catch (err) {
      setError('Failed to fetch authorized users: ' + err.message);
    }
  };

  const fetchAuthLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('auth_logs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAuthLogs(data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch auth logs: ' + err.message);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    
    try {
      // Check if email already exists in authorized_users
      const { data: existingUsers } = await supabase
        .from('authorized_users')
        .select('email')
        .eq('email', newUserEmail.toLowerCase());

      if (existingUsers?.length > 0) {
        setError('This email is already authorized');
        return;
      }

      // Check if user exists in auth system
      const { data: { users: existingAuthUsers }, error: userCheckError } = 
        await supabaseAdmin.auth.admin.listUsers();
      
      const userExists = existingAuthUsers.some(
        u => u.email.toLowerCase() === newUserEmail.toLowerCase()
      );

      // If user exists in auth but not in authorized_users, just add to authorized_users
      if (userExists) {
        // Add to authorized_users
        const { error: insertError } = await supabase
          .from('authorized_users')
          .insert([{
            email: newUserEmail.toLowerCase(),
            added_by: user.email,
            created_at: new Date().toISOString()
          }]);

        if (insertError) throw insertError;
      } else {
        // Create new user with invite
        const { error: authError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
          newUserEmail.toLowerCase(),
          {
            redirectTo: `${window.location.origin}/name-registration?email=${encodeURIComponent(newUserEmail.toLowerCase())}`,
          }
        );

        if (authError) throw authError;

        // Add to authorized_users
        const { error: insertError } = await supabase
          .from('authorized_users')
          .insert([{
            email: newUserEmail.toLowerCase(),
            added_by: user.email,
            created_at: new Date().toISOString()
          }]);

        if (insertError) throw insertError;
      }

      // Log the action
      const { error: logError } = await supabase
        .from('auth_logs')
        .insert([{
          action: 'add_user',
          target_email: newUserEmail.toLowerCase(),
          performed_by: user.email,
          created_at: new Date().toISOString()
        }]);

      if (logError) throw logError;

      setNewUserEmail('');
      fetchAuthorizedUsers();
      fetchAuthLogs();
    } catch (err) {
      setError('Failed to add user: ' + err.message);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center p-4 text-airbnb-foggy font-airbnb">Loading...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6 font-airbnb">
      <h1 className="text-3xl font-bold text-airbnb-hof mb-8">Admin Dashboard</h1>

      {/* Add User Form */}
      <div className="bg-white p-6 rounded-airbnb shadow-airbnb mb-8">
        <h2 className="text-xl font-semibold mb-4">Add Authorized User</h2>
        <form onSubmit={handleAddUser} className="flex gap-4">
          <input
            type="email"
            value={newUserEmail}
            onChange={(e) => setNewUserEmail(e.target.value)}
            placeholder="Enter email address"
            className="flex-1 p-3 border border-gray-300 rounded-airbnb focus:border-airbnb-babu focus:ring-1 focus:ring-airbnb-babu"
            required
          />
          <button
            type="submit"
            className="px-6 py-3 bg-airbnb-rausch text-white rounded-airbnb hover:bg-airbnb-rausch/90 transition"
          >
            Add User
          </button>
        </form>
        {error && (
          <p className="mt-2 text-airbnb-rausch text-sm">{error}</p>
        )}
      </div>

      {/* Authorized Users List */}
      <div className="bg-white rounded-airbnb shadow-airbnb overflow-hidden mb-8">
        <h2 className="text-xl font-semibold p-6 border-b">Authorized Users</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-xs font-medium text-airbnb-foggy uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-xs font-medium text-airbnb-foggy uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-xs font-medium text-airbnb-foggy uppercase tracking-wider">Date Added</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {authorizedUsers.map(authUser => (
                <tr key={authUser.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-airbnb-hof">
                    {authUser.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-airbnb-hof">
                    {authUser.first_name && authUser.last_name 
                      ? `${authUser.first_name} ${authUser.last_name}`
                      : 'Pending Registration'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-airbnb-foggy">
                    {new Date(authUser.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Authorization Logs */}
      <div className="bg-white rounded-airbnb shadow-airbnb overflow-hidden">
        <h2 className="text-xl font-semibold p-6 border-b">Authorization Logs</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-xs font-medium text-airbnb-foggy uppercase tracking-wider">Timestamp</th>
                <th className="px-6 py-3 text-xs font-medium text-airbnb-foggy uppercase tracking-wider">Action</th>
                <th className="px-6 py-3 text-xs font-medium text-airbnb-foggy uppercase tracking-wider">Target Email</th>
                <th className="px-6 py-3 text-xs font-medium text-airbnb-foggy uppercase tracking-wider">Performed By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {authLogs.map(log => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-airbnb-foggy">
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-airbnb-foggy">
                    {log.action === 'add_user' ? 'Added User' : log.action}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-airbnb-hof">
                    {log.target_email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-airbnb-foggy">
                    {log.performed_by}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Admin; 