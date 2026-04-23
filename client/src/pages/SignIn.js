// client/src/pages/SignIn.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from "react-hot-toast";
import { Leaf, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const SignIn = () => {
  const navigate = useNavigate();
  const { login, error: authError } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login({
      email: formData.email,
      password: formData.password
    });

    setLoading(false);

    if (!result.success) {
      toast.error(result.error || 'Login failed', {
        duration: 5000,
        icon: '❌'
      });
      setError(result.error || 'Login failed');
      return;
    }

    toast.success('Login successful!', {
      duration: 3000,
      icon: '✅'
    });

    const role = result.user?.role;

    if (role === 'hq_admin') {
      navigate('/admin/pending');
    } else if (role === 'pending') {
      navigate('/pending');
    } else {
      navigate('/dashboard');
    }
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    // forgot password code create later (send reset email)
    e.preventDefault();
    toast('Forgot password feature coming soon! Please contact support for now.', {
      icon: '🔜',
      duration: 6000,
      style: {
        border: '1px solid #3b82f6',
        padding: '16px',
        color: '#1e40af',
        background: '#eff6ff'
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-8"> 

        {/* Logo */}
        <div className="flex flex-col items-center">
          <div className="bg-emerald-500 rounded-full p-4 mb-4">
            <Leaf className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800">Welcome Back</h2>
          <p className="text-gray-600 mt-2">Sign in to your ESG Dashboard</p>
        </div>

        {/* Error message */}
        {(error || authError) && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-center">
            {error || authError}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
              placeholder="you@example.com"
              disabled={loading}
              required
            />
          </div>

          {/* Password with visibility toggle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                placeholder="••••••••"
                disabled={loading}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Forgot Password */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-sm text-emerald-600 hover:text-emerald-800 font-medium"
            >
              Forgot password?
            </button>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-500 text-white py-3 rounded-lg hover:bg-emerald-600 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        {/* Create account link */}
        <p className="text-center text-gray-600 mt-6">
          Don't have an account?{' '}
          <button
            onClick={() => navigate('/signup')}
            className="text-emerald-500 hover:text-emerald-600 font-semibold"
          >
            Create Account
          </button>
        </p>

      </div>
    </div>
  );
};

export default SignIn;