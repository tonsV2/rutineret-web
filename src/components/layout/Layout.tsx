import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header is already included in individual pages */}
      <main>{children}</main>
      
      {/* Footer */}
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="text-center text-sm text-gray-500">
            <p>&copy; 2024 Rutineret. All rights reserved.</p>
            <p className="mt-1">
              Built with React, TypeScript, Tailwind CSS, and Django REST Framework.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;