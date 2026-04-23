// client/src/pages/CreateAccount.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from "react-hot-toast";
import { Leaf, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const CreateAccount = () => {
  const navigate = useNavigate();
  const { signup, error: authError } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validatePassword = (password) => {
    const errs = [];
    if (password.length < 8) errs.push('at least 8 characters');
    if (!/[A-Z]/.test(password)) errs.push('one uppercase letter');
    if (!/[a-z]/.test(password)) errs.push('one lowercase letter');
    if (!/[0-9]/.test(password)) errs.push('one number');
    if (!/[!@#$%^&*]/.test(password)) errs.push('one symbol');
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.username) newErrors.username = 'Username is required';
    if (!formData.email) newErrors.email = 'Email is required';

    const passwordErrors = validatePassword(formData.password);
    if (passwordErrors.length > 0) {
      newErrors.password = `Password must contain ${passwordErrors.join(', ')}`;
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setLoading(true);
      const result = await signup({
        username: formData.username,
        email: formData.email,
        password: formData.password
      });
      setLoading(false);

      if (!result.success) {
        toast.error(result.error || 'Signup failed', {
          duration: 5000,
          icon: '❌'
        });
        setErrors({ general: result.error || 'Signup failed' });
      } else {
        toast.success('Registration successful! Please wait for admin approval.', {
          duration: 6000,
          icon: '🎉'
        });
        navigate('/signin');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center px-4 py-4">
      <div className="w-full max-w-sm space-y-8">

        {/* Logo & Title */}
        <div className="text-center mt-6">
          <div className="inline-block bg-emerald-500 rounded-full p-4 mb-6">
            <Leaf className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Create Account</h2>
          <p className="text-gray-600 mt-1">Join ESG Dashboard today</p>
        </div>

        {/* Error */}
        {(errors.general || authError) && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-center text-sm">
            {errors.general || authError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
              placeholder="johndoe"
              disabled={loading}
              required
            />
            {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
              placeholder="you@example.com"
              disabled={loading}
              required
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                placeholder="••••••••"
                disabled={loading}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            <p className="text-xs text-gray-500 mt-1">
              Must contain: 8+ chars, uppercase, lowercase, number, symbol
            </p>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                placeholder="••••••••"
                disabled={loading}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-500 text-white py-2.5 rounded-lg hover:bg-emerald-600 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        {/* Sign In link */}
        <p className="text-center text-gray-600 text-sm">
          Already have an account?{' '}
          <button
            onClick={() => navigate('/signin')}
            className="text-emerald-500 hover:text-emerald-600 font-medium"
          >
            Sign In
          </button>
        </p>

      </div>
    </div>
  );
};

export default CreateAccount;