import { supabase } from './supabaseClient';

class AuthService {
  async signInWithMagicLink(email) {
    try {
      // Check if user is authorized and get their registration status
      const { data: users, error: fetchError } = await supabase
        .from('authorized_users')
        .select('email, first_name, last_name')
        .eq('email', email.toLowerCase());

      if (fetchError) {
        console.error('Fetch error:', fetchError);
        throw new Error('Error checking authorization. Please try again.');
      }

      if (!users || users.length === 0) {
        console.log('No users found for email:', email);
        throw new Error('This email is not authorized. Please contact the administrator.');
      }

      const user = users[0];
      const isRegistered = user.first_name && user.last_name;
      console.log('User authorized, registration status:', { isRegistered });

      // Send magic link with appropriate redirect
      const { data, error } = await supabase.auth.signInWithOtp({
        email: user.email,
        options: {
          emailRedirectTo: isRegistered 
            ? `${window.location.origin}/` 
            : `${window.location.origin}/name-registration?email=${email}`,
        }
      });

      if (error) {
        console.error('OTP error:', error);
        throw error;
      }

      return data;
    } catch (err) {
      throw err;
    }
  }

  async signUp(email, password) {
    try {
      // First create the user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (error) throw error;

      // If user creation was successful, create the profile using service role
      if (data.user) {
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert([{
            user_id: data.user.id,
            email: email.toLowerCase(),
            is_admin: false
          }])
          .select()
          .single();

        if (profileError) {
          console.error('Profile creation error:', profileError);
          throw profileError;
        }
      }

      return data;
    } catch (err) {
      console.error('Signup error:', err);
      throw err;
    }
  }

  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    return data;
  }

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  }

  async getSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  }

  async verifyInvite(token) {
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash: token,
      type: 'invite'
    });
    if (error) throw error;
    return data;
  }
}

export const authService = new AuthService();