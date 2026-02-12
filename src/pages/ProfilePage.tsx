import React, { useState } from 'react';
import type { FormEvent } from 'react';
import { useAuth } from '../hooks/useAuth';
import type { UserProfileRequest } from '../types';
import Layout from '../components/layout/Layout';
import { getFullAvatarUrl } from '../utils/constants';

const ProfilePage: React.FC = () => {
  const { user, updateProfile, updateUser, isLoading } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'profile' | 'account'>('profile');
  const [profileData, setProfileData] = useState<Partial<UserProfileRequest>>({
    bio: user?.profile.bio || '',
    location: user?.profile.location || '',
    website: user?.profile.website || '',
    timezone: (user?.profile as any)?.timezone || 'UTC',
    is_public: user?.profile.is_public || false,
  });
  
  const [accountData, setAccountData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    phone: user?.phone || '',
    date_of_birth: user?.date_of_birth || '',
    password: '', // Required field for UserRequest but optional for updates
  });
  
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    user?.profile.avatar || null
  );
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const validateWebsite = (url: string): boolean => {
    if (!url) return true; // Empty website is allowed
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleProfileSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (profileData.website && !validateWebsite(profileData.website)) {
      setMessage({ type: 'error', text: 'Please enter a valid website URL' });
      return;
    }

    try {
      const submitData = { ...profileData };
      if (avatarFile) {
        submitData.avatar = avatarFile;
      }
      
      await updateProfile(submitData as UserProfileRequest);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch {
      setMessage({ type: 'error', text: 'Failed to update profile' });
    }
  };

  const handleAccountSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    try {
      await updateUser(accountData);
      setMessage({ type: 'success', text: 'Account information updated successfully!' });
    } catch {
      setMessage({ type: 'error', text: 'Failed to update account information' });
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ type: 'error', text: 'Avatar size must be less than 5MB' });
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        setMessage({ type: 'error', text: 'Avatar must be an image file' });
        return;
      }
      
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Layout>
      {/* Page Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
        <p className="mt-1 text-sm text-gray-600">
          Manage your profile and account information
        </p>
      </div>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('profile')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'profile'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Profile
              </button>
              <button
                onClick={() => setActiveTab('account')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'account'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Account
              </button>
            </nav>
          </div>

          {/* Message Alert */}
          {message && (
            <div className={`rounded-md p-4 mb-6 ${
              message.type === 'success' 
                ? 'bg-green-50 text-green-700' 
                : 'bg-red-50 text-red-700'
            }`}>
              <p className="text-sm">{message.text}</p>
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <form onSubmit={handleProfileSubmit} className="space-y-6">
              <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
                <div className="md:grid md:grid-cols-3 md:gap-6">
                  <div className="md:col-span-1">
                    <h3 className="text-lg font-medium leading-6 text-gray-900">
                      Profile Information
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      This information will be displayed publicly so be careful what you share.
                    </p>
                  </div>
                  
                  <div className="mt-5 md:mt-0 md:col-span-2">
                    <div className="grid grid-cols-6 gap-6">
                      {/* Avatar */}
                      <div className="col-span-6">
                        <label className="block text-sm font-medium text-gray-700">
                          Profile Picture
                        </label>
                        <div className="mt-1 flex items-center space-x-6">
                          <div className="shrink-0">
                            {avatarPreview ? (
                              <>
                                <img
                                  className="h-16 w-16 object-cover rounded-full"
                                  src={avatarPreview.startsWith('data:') ? avatarPreview : getFullAvatarUrl(avatarPreview)!}
                                  alt="Profile avatar"
                                  crossOrigin="anonymous"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                  }}
                                />
                                <div className="h-16 w-16 bg-gray-300 rounded-full flex items-center justify-center hidden">
                                  <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                  </svg>
                                </div>
                              </>
                            ) : (
                              <div className="h-16 w-16 bg-gray-300 rounded-full flex items-center justify-center">
                                <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                              </div>
                            )}
                          </div>
                          <label className="block">
                            <span className="sr-only">Choose profile photo</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleAvatarChange}
                              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            />
                          </label>
                        </div>
                      </div>

                      {/* Bio */}
                      <div className="col-span-6">
                        <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                          Bio
                        </label>
                        <div className="mt-1">
                          <textarea
                            id="bio"
                            name="bio"
                            rows={3}
                            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 mt-1 block w-full sm:text-sm border border-gray-300 rounded-md"
                            placeholder="Tell us about yourself"
                            value={profileData.bio}
                            onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                          />
                        </div>
                      </div>

                      {/* Location */}
                      <div className="col-span-6 sm:col-span-3">
                        <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                          Location
                        </label>
                        <input
                          type="text"
                          name="location"
                          id="location"
                          className="shadow-sm focus:ring-blue-500 focus:border-blue-500 mt-1 block w-full sm:text-sm border border-gray-300 rounded-md"
                          placeholder="City, Country"
                          value={profileData.location}
                          onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
                        />
                      </div>

                      {/* Website */}
                      <div className="col-span-6 sm:col-span-3">
                        <label htmlFor="website" className="block text-sm font-medium text-gray-700">
                          Website
                        </label>
                        <input
                          type="url"
                          name="website"
                          id="website"
                          className="shadow-sm focus:ring-blue-500 focus:border-blue-500 mt-1 block w-full sm:text-sm border border-gray-300 rounded-md"
                          placeholder="https://example.com"
                          value={profileData.website}
                          onChange={(e) => setProfileData(prev => ({ ...prev, website: e.target.value }))}
                        />
                      </div>

                      {/* Timezone */}
                      <div className="col-span-6 sm:col-span-3">
                        <label htmlFor="timezone" className="block text-sm font-medium text-gray-700">
                          Timezone
                        </label>
                        <select
                          id="timezone"
                          name="timezone"
                          className="shadow-sm focus:ring-blue-500 focus:border-blue-500 mt-1 block w-full sm:text-sm border border-gray-300 rounded-md"
                          value={profileData.timezone}
                          onChange={(e) => setProfileData(prev => ({ ...prev, timezone: e.target.value }))}
                        >
                          <option value="UTC">UTC (Coordinated Universal Time)</option>
                          <option value="America/New_York">Eastern Time (ET)</option>
                          <option value="America/Chicago">Central Time (CT)</option>
                          <option value="America/Denver">Mountain Time (MT)</option>
                          <option value="America/Los_Angeles">Pacific Time (PT)</option>
                          <option value="Europe/London">London (GMT/BST)</option>
                          <option value="Europe/Paris">Paris (CET/CEST)</option>
                          <option value="Europe/Berlin">Berlin (CET/CEST)</option>
                          <option value="Asia/Tokyo">Tokyo (JST)</option>
                          <option value="Asia/Shanghai">Shanghai (CST)</option>
                          <option value="Asia/Kolkata">India (IST)</option>
                          <option value="Australia/Sydney">Sydney (AEDT/AEST)</option>
                          <option value="America/Toronto">Toronto (ET)</option>
                          <option value="America/Vancouver">Vancouver (PT)</option>
                          <option value="America/Mexico_City">Mexico City (CT)</option>
                          <option value="America/Sao_Paulo">São Paulo (BRT)</option>
                          <option value="Africa/Cairo">Cairo (EET)</option>
                          <option value="Asia/Dubai">Dubai (GST)</option>
                        </select>
                        <p className="mt-1 text-xs text-gray-500">
                          Used for scheduling task alarm notifications
                        </p>
                      </div>

                      {/* Public Profile */}
                      <div className="col-span-6">
                        <div className="flex items-start">
                          <div className="flex items-center h-5">
                            <input
                              id="is_public"
                              name="is_public"
                              type="checkbox"
                              className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                              checked={profileData.is_public}
                              onChange={(e) => setProfileData(prev => ({ ...prev, is_public: e.target.checked }))}
                            />
                          </div>
                          <div className="ml-3 text-sm">
                            <label htmlFor="is_public" className="font-medium text-gray-700">
                              Public profile
                            </label>
                            <p className="text-gray-500">
                              Make your profile visible to other users
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {isLoading ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </form>
          )}

          {/* Account Tab */}
          {activeTab === 'account' && (
            <form onSubmit={handleAccountSubmit} className="space-y-6">
              <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
                <div className="md:grid md:grid-cols-3 md:gap-6">
                  <div className="md:col-span-1">
                    <h3 className="text-lg font-medium leading-6 text-gray-900">
                      Account Information
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Update your personal contact information.
                    </p>
                  </div>
                  
                  <div className="mt-5 md:mt-0 md:col-span-2">
                    <div className="grid grid-cols-6 gap-6">
                      {/* Username */}
                      <div className="col-span-6 sm:col-span-3">
                        <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                          Username
                        </label>
                        <input
                          type="text"
                          name="username"
                          id="username"
                          required
                          className="shadow-sm focus:ring-blue-500 focus:border-blue-500 mt-1 block w-full sm:text-sm border border-gray-300 rounded-md"
                          value={accountData.username}
                          onChange={(e) => setAccountData(prev => ({ ...prev, username: e.target.value }))}
                        />
                      </div>

                      {/* Email */}
                      <div className="col-span-6 sm:col-span-3">
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                          Email
                        </label>
                        <input
                          type="email"
                          name="email"
                          id="email"
                          required
                          className="shadow-sm focus:ring-blue-500 focus:border-blue-500 mt-1 block w-full sm:text-sm border border-gray-300 rounded-md"
                          value={accountData.email}
                          onChange={(e) => setAccountData(prev => ({ ...prev, email: e.target.value }))}
                        />
                      </div>

                      {/* First Name */}
                      <div className="col-span-6 sm:col-span-3">
                        <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">
                          First Name
                        </label>
                        <input
                          type="text"
                          name="first_name"
                          id="first_name"
                          className="shadow-sm focus:ring-blue-500 focus:border-blue-500 mt-1 block w-full sm:text-sm border border-gray-300 rounded-md"
                          value={accountData.first_name}
                          onChange={(e) => setAccountData(prev => ({ ...prev, first_name: e.target.value }))}
                        />
                      </div>

                      {/* Last Name */}
                      <div className="col-span-6 sm:col-span-3">
                        <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">
                          Last Name
                        </label>
                        <input
                          type="text"
                          name="last_name"
                          id="last_name"
                          className="shadow-sm focus:ring-blue-500 focus:border-blue-500 mt-1 block w-full sm:text-sm border border-gray-300 rounded-md"
                          value={accountData.last_name}
                          onChange={(e) => setAccountData(prev => ({ ...prev, last_name: e.target.value }))}
                        />
                      </div>

                      {/* Phone */}
                      <div className="col-span-6 sm:col-span-3">
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                          Phone
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          id="phone"
                          className="shadow-sm focus:ring-blue-500 focus:border-blue-500 mt-1 block w-full sm:text-sm border border-gray-300 rounded-md"
                          placeholder="+1 234 567 8900"
                          value={accountData.phone}
                          onChange={(e) => setAccountData(prev => ({ ...prev, phone: e.target.value }))}
                        />
                      </div>

                      {/* Date of Birth */}
                      <div className="col-span-6 sm:col-span-3">
                        <label htmlFor="date_of_birth" className="block text-sm font-medium text-gray-700">
                          Date of Birth
                        </label>
                        <input
                          type="date"
                          name="date_of_birth"
                          id="date_of_birth"
                          className="shadow-sm focus:ring-blue-500 focus:border-blue-500 mt-1 block w-full sm:text-sm border border-gray-300 rounded-md"
                          value={accountData.date_of_birth}
                          onChange={(e) => setAccountData(prev => ({ ...prev, date_of_birth: e.target.value }))}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {isLoading ? 'Saving...' : 'Save Account'}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
    </Layout>
  );
};

export default ProfilePage;