import React, { useState, useEffect } from 'react';
import apiService from '../../services/api';
import type { SocialAccount } from '../../types';

export const SocialAccountManager: React.FC = () => {
  const [socialAccounts, setSocialAccounts] = useState<SocialAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSocialAccounts();
  }, []);

  const loadSocialAccounts = async () => {
    try {
      const response = await apiService.getSocialAccounts();
      setSocialAccounts(response.data.social_accounts);
    } catch (err) {
      setError('Failed to load social accounts');
      console.error('Failed to load social accounts:', err);
    } finally {
      setLoading(false);
    }
  };

  const unlinkAccount = async (accountId: number, provider: string) => {
    if (!confirm(`Are you sure you want to unlink your ${provider} account?`)) {
      return;
    }

    try {
      await apiService.unlinkSocialAccount(accountId);
      setSocialAccounts(prev => prev.filter(acc => acc.id !== accountId));
    } catch (err) {
      setError(`Failed to unlink ${provider} account`);
      console.error('Failed to unlink account:', err);
    }
  };

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'google':
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
        );
      default:
        return null;
    }
  };

  const isProviderLinked = (provider: string) => {
    return socialAccounts.some(account => account.provider === provider);
  };

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Social Accounts</h3>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="space-y-4">
        {/* Google Account */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center space-x-3">
            {getProviderIcon('google')}
            <div>
              <p className="font-medium text-gray-900">Google</p>
              {isProviderLinked('google') ? (
                <p className="text-sm text-green-600">Connected</p>
              ) : (
                <p className="text-sm text-gray-500">Not connected</p>
              )}
            </div>
          </div>
          
          {isProviderLinked('google') ? (
            <button
              onClick={() => {
                const googleAccount = socialAccounts.find(acc => acc.provider === 'google');
                if (googleAccount) {
                  unlinkAccount(googleAccount.id, 'Google');
                }
              }}
              className="px-3 py-1 text-sm text-red-600 border border-red-300 rounded hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              Unlink
            </button>
          ) : (
            <button
              className="px-3 py-1 text-sm text-blue-600 border border-blue-300 rounded hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Connect
            </button>
          )}
        </div>

        {/* Placeholder for other providers */}
        <div className="text-center text-sm text-gray-500 mt-6">
          More social providers coming soon...
        </div>
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="text-sm font-medium text-blue-900 mb-2">About Social Sign-In</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Quick and secure authentication</li>
          <li>• No need to remember another password</li>
          <li>• You can still use your email/password to sign in</li>
          <li>• Unlink accounts at any time</li>
        </ul>
      </div>
    </div>
  );
};