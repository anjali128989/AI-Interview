
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, Loader } from 'lucide-react';
import { auth, provider } from '../firebase';
import { signInWithPopup } from 'firebase/auth';
import { FaGoogle, FaGithub } from 'react-icons/fa';
import axios from 'axios';

const API_URL = "https://your-backend-domain.vercel.app/api";

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  // Email and password login
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await login(email, password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      console.error('Login error:', err);

      setError(
        err.response?.data?.message ||
          err.message ||
          'Failed to login. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Google login
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError('');

    try {
      // Authenticate with Firebase
      const result = await signInWithPopup(auth, provider);

      // Obtain Firebase ID token
      const firebaseToken = await result.user.getIdToken();

      // Exchange Firebase token for your backend JWT
      const response = await axios.post(
        `${API_URL}/auth/google`,
        { firebaseToken },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const backendToken = response.data?.token;
      const backendUser =
        response.data?.user ??
        response.data?.data?.user ??
        response.data?.data ??
        null;

      if (!backendToken) {
        throw new Error(
          'Backend did not return a JWT. Check your Google authentication endpoint.'
        );
      }

      // Save the backend JWT
      localStorage.setItem('token', backendToken);

      // Synchronize the default Axios authorization header
      axios.defaults.headers.common.Authorization =
        `Bearer ${backendToken}`;

      // Verify the backend session and update AuthContext.
      // This is important because ProtectedRoute checks AuthContext.user.
      try {
        const meResponse = await axios.get(`${API_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${backendToken}`,
          },
        });

        const currentUser =
          meResponse.data?.user ??
          meResponse.data?.data?.user ??
          meResponse.data?.data ??
          backendUser;

        if (!currentUser) {
          throw new Error(
            'Backend authentication succeeded, but user data was not returned.'
          );
        }

        // Reloading ensures AuthContext restores the authenticated user
        // from the saved JWT before the protected route is rendered.
        window.location.replace('/dashboard');
      } catch (verificationError) {
        localStorage.removeItem('token');
        delete axios.defaults.headers.common.Authorization;

        throw new Error(
          verificationError.response?.data?.message ||
            verificationError.message ||
            'Could not verify your backend session.'
        );
      }
    } catch (err) {
      console.error(
        'Google sign-in error:',
        err.response?.data || err
      );

      setError(
        err.response?.data?.message ||
          err.message ||
          'Failed to sign in with Google.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // GitHub OAuth login
  const handleGitHubSignIn = () => {
    setIsLoading(true);
    setError('');

    window.location.href = `${API_URL}/auth/github`;
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />

        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full bg-slate-900/60 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-800 p-8 z-10"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-2">
            Welcome Back
          </h2>

          <p className="text-slate-400">
            Sign in to continue your interview prep
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm text-center"
          >
            {error}
          </div>
        )}

        {/* Email and password form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-slate-300 mb-2"
            >
              Email Address
            </label>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-slate-500" />
              </div>

              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-slate-700 rounded-xl bg-slate-800/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-slate-300 mb-2"
            >
              Password
            </label>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-slate-500" />
              </div>

              <input
                id="password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-slate-700 rounded-xl bg-slate-800/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center py-3 px-4 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isLoading ? (
              <Loader className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Sign In
                <ArrowRight className="ml-2 w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-700" />
          </div>

          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-slate-900 text-slate-400">
              Or continue with
            </span>
          </div>
        </div>

        {/* Google login */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="w-full flex items-center justify-center py-3 px-4 border border-slate-700 rounded-xl text-sm font-medium text-slate-300 bg-slate-800/50 hover:bg-slate-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isLoading ? (
            <Loader className="mr-2 w-5 h-5 animate-spin" />
          ) : (
            <FaGoogle className="mr-2 w-5 h-5" />
          )}
          Sign in with Google
        </button>

        {/* GitHub login */}
        <button
          type="button"
          onClick={handleGitHubSignIn}
          disabled={isLoading}
          className="mt-3 w-full flex items-center justify-center py-3 px-4 border border-slate-700 rounded-xl text-sm font-medium text-slate-300 bg-slate-800/50 hover:bg-slate-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <FaGithub className="mr-2 w-5 h-5" />
          Sign in with GitHub
        </button>

        <p className="mt-8 text-center text-sm text-slate-400">
          Don't have an account?{' '}
          <Link
            to="/signup"
            className="font-medium text-blue-400 hover:text-blue-300 transition-colors"
          >
            Sign up now
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;