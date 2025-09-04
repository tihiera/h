import React, { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import AccountCreationModal from "./components/AccountCreationModal";

export default function App() {
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user profile exists in localStorage
    const storedUsername = localStorage.getItem("username");
    const storedProfile = localStorage.getItem("userProfile");
    
    if (storedUsername && storedProfile) {
      setUserProfile(JSON.parse(storedProfile));
      setShowAccountModal(false);
    } else {
      setShowAccountModal(true);
    }
  }, []);

  const handleAccountCreation = (profileData) => {
    setUserProfile(profileData);
    setShowAccountModal(false);
    // Redirect to /me page after account creation
    navigate('/me');
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex justify-center px-4">
      <div className="w-full max-w-4xl flex bg-white shadow-lg rounded-lg overflow-hidden my-4">
        <Sidebar />
        <div className="flex-1 min-w-0">
          <Header />
          <main className="py-8 max-w-[800px] mx-auto">
            <Outlet />
          </main>
        </div>
      </div>

      {/* Account Creation Modal */}
      <AccountCreationModal 
        isOpen={showAccountModal} 
        onSubmit={handleAccountCreation}
      />
    </div>
  );
}
