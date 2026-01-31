import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const HomePage: React.FC = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-500 to-indigo-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-24 md:py-32">
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-extrabold text-white">
                Welcome to Rutineret
              </h1>
              <p className="mt-3 md:mt-6 text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto">
                Your comprehensive user management platform with role-based access control and JWT authentication.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">
              Platform Features
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Built with modern technologies and best practices
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="flex items-center justify-center h-16 w-16 mx-auto bg-blue-100 rounded-full">
                <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="mt-6 text-lg font-medium text-gray-900">Secure Authentication</h3>
              <p className="mt-2 text-base text-gray-500">
                JWT-based authentication with automatic token refresh and secure storage.
              </p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center h-16 w-16 mx-auto bg-green-100 rounded-full">
                <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="mt-6 text-lg font-medium text-gray-900">User Management</h3>
              <p className="mt-2 text-base text-gray-500">
                Comprehensive user profiles with roles, permissions, and customizable settings.
              </p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center h-16 w-16 mx-auto bg-purple-100 rounded-full">
                <svg className="h-8 w-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="mt-6 text-lg font-medium text-gray-900">Role-Based Access</h3>
              <p className="mt-2 text-base text-gray-500">
                Granular permissions and role management for secure access control.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gray-50">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {isAuthenticated ? (
              <div>
                <h2 className="text-3xl font-extrabold text-gray-900">
                  Welcome back, {user?.first_name || user?.username}!
                </h2>
                <p className="mt-4 text-lg text-gray-600">
                  You're already logged in. Ready to continue?
                </p>
                <div className="mt-8">
                  <Link
                    to="/dashboard"
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Go to Dashboard
                  </Link>
                  <Link
                    to="/profile"
                    className="ml-4 inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    View Profile
                  </Link>
                </div>
              </div>
            ) : (
              <div>
                <h2 className="text-3xl font-extrabold text-gray-900">
                  Get Started Today
                </h2>
                <p className="mt-4 text-lg text-gray-600">
                  Join thousands of users who trust Rutineret for their authentication needs.
                </p>
                <div className="mt-8">
                  <Link
                    to="/register"
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Sign Up Now
                  </Link>
                  <Link
                    to="/login"
                    className="ml-4 inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Sign In
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;