
import {
  createContext,
  useState,
  useEffect,
  useContext
} from 'react';

import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

const API_URL = 'http://localhost:5000/api/auth';

// Support common API response structures.
const getUserFromResponse = (data) => {
  return data?.user ?? data?.data?.user ?? data?.data ?? null;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkLoggedIn = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        setLoading(false);
        return;
      }

      axios.defaults.headers.common.Authorization = `Bearer ${token}`;

      try {
        const res = await axios.get(`${API_URL}/me`);
        const currentUser = getUserFromResponse(res.data);

        if (!currentUser) {
          throw new Error('User data missing from /me response');
        }

        setUser(currentUser);
      } catch (error) {
        console.error(
          'Failed to restore authenticated user:',
          error.response?.data || error.message
        );

        localStorage.removeItem('token');
        delete axios.defaults.headers.common.Authorization;
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkLoggedIn();
  }, []);

  const login = async (email, password) => {
    const res = await axios.post(`${API_URL}/login`, {
      email,
      password
    });

    const token = res.data.token;
    const loggedInUser = getUserFromResponse(res.data);

    if (!token) {
      throw new Error('Login response did not include a token');
    }

    localStorage.setItem('token', token);
    axios.defaults.headers.common.Authorization = `Bearer ${token}`;

    // Verify the actual account associated with the token.
    try {
      const meResponse = await axios.get(`${API_URL}/me`);
      const currentUser = getUserFromResponse(meResponse.data);

      if (!currentUser) {
        throw new Error('User data missing from /me response');
      }

      setUser(currentUser);
    } catch (error) {
      // Do not keep an invalid or unverified session.
      localStorage.removeItem('token');
      delete axios.defaults.headers.common.Authorization;
      setUser(null);
      throw error;
    }

    console.log('Login response user:', loggedInUser);
  };

  const signup = async (name, email, password) => {
    const res = await axios.post(`${API_URL}/register`, {
      name,
      email,
      password
    });

    const token = res.data.token;

    if (!token) {
      throw new Error('Signup response did not include a token');
    }

    localStorage.setItem('token', token);
    axios.defaults.headers.common.Authorization = `Bearer ${token}`;

    try {
      const meResponse = await axios.get(`${API_URL}/me`);
      const currentUser = getUserFromResponse(meResponse.data);

      if (!currentUser) {
        throw new Error('User data missing from /me response');
      }

      setUser(currentUser);
    } catch (error) {
      localStorage.removeItem('token');
      delete axios.defaults.headers.common.Authorization;
      setUser(null);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common.Authorization;
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, signup, logout }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};