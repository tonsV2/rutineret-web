import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const OAuthCallbackHandler: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { completeOAuthSignIn } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const processingRef = useRef(false);

  useEffect(() => {
    // Prevent re-execution if already processing
    if (processingRef.current) return;
    processingRef.current = true;
    const handleOAuthCallback = async () => {
      const code = searchParams.get('code');
      const error = searchParams.get('error');
      const accessToken = searchParams.get('access_token');
      const refreshToken = searchParams.get('refresh_token');

      if (error) {
        setStatus('error');
        setMessage(`Authentication failed: ${error}`);
        setTimeout(() => navigate('/login'), 3000);
        return;
      }

      if (!code || !accessToken) {
        setStatus('error');
        setMessage('Missing authorization code or tokens');
        setTimeout(() => navigate('/login'), 3000);
        return;
      }

      try {
        setStatus('loading');
        setMessage('Completing sign-in...');
        
        // Use the completeOAuthSignIn method
        const result = await completeOAuthSignIn(accessToken, refreshToken || '');
        
        if (result.success) {
          setStatus('success');
          setMessage('Sign-in successful! Redirecting...');
          
          // Redirect to dashboard after a short delay
          setTimeout(() => navigate('/dashboard'), 1500);
        } else {
          setStatus('error');
          setMessage(result.error || 'Failed to complete sign-in');
          setTimeout(() => navigate('/login'), 3000);
        }
        
      } catch (err) {
        console.error('OAuth callback error:', err);
        setStatus('error');
        setMessage('Failed to complete sign-in');
        setTimeout(() => navigate('/login'), 3000);
      }
    };

    handleOAuthCallback();

    // Cleanup function to reset processing ref
    return () => {
      processingRef.current = false;
    };
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full text-center p-8">
        {status === 'loading' && (
          <div>
            <div className="flex justify-center mb-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {message || 'Processing...'}
            </h2>
            <p className="text-gray-600">Please wait while we complete your sign-in.</p>
          </div>
        )}

        {status === 'success' && (
          <div>
            <div className="flex justify-center mb-4">
              <svg className="h-12 w-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {message || 'Success!'}
            </h2>
            <p className="text-gray-600">You'll be redirected shortly.</p>
          </div>
        )}

        {status === 'error' && (
          <div>
            <div className="flex justify-center mb-4">
              <svg className="h-12 w-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-red-600 mb-2">
              Authentication Error
            </h2>
            <p className="text-gray-600 mb-4">{message}</p>
            <button
              onClick={() => navigate('/login')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Back to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OAuthCallbackHandler;
