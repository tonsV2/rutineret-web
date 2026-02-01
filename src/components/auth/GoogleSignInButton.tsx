import React from 'react';
import apiService from '../../services/api';

interface GoogleSignInButtonProps {
    mode?: 'login' | 'register';
    className?: string;
}

export const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({className = ''}) => {
    const handleGoogleSignIn = async () => {
        try {
            const response = await apiService.getGoogleAuthUrl();
            const {authorization_url} = response.data;

            // Redirect to Google OAuth
            window.location.href = authorization_url;
        } catch (error) {
            console.error('Failed to get Google OAuth URL:', error);
        }
    };

    return (
        <div className={`w-full ${className}`}>

            <button
                type="button"
                onClick={handleGoogleSignIn}
                className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c-.88-2.99-2.26-5.74-6.89v5.05c4.95-2.05 6.41-5.54 6.41-3.75z"
                    />
                    <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C2 18.92 5.57 20.94 12 20.94c-5.37 0-9.6-4.93-9.6-9.6 0-1.81.21-3.54.65-5.03L12 14.19z"
                    />
                    <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09.35-2.09V9.27C2 4.8 3.99 5.47 3.99s3.47.81 4.8 1.91 1.46 1.46h3.64v2.84h-3.64c-.88-2.6-1.93-4.53-1.93v1.83c0 2.95 1.05 4.53 1.93s4.53-1.93 4.53-1.93v1.83zm3.05 0v2.95c0-2.65 2.15-4.8 4.8s4.8-2.15 4.8-4.8v2.95z"
                    />
                </svg>
                <span className="ml-2">Sign in with Google</span>
            </button>
            <div className="relative my-4">
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-full border-t border-gray-300"/>
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">or</span>
                </div>
            </div>
        </div>
    );
};
