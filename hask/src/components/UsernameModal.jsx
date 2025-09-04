import React, { useState } from "react";
import Button from "./Button";

export default function UsernameModal({ isOpen, onSubmit }) {
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!username.trim()) {
      setError("Username is required");
      return;
    }
    
    if (username.trim().length < 3) {
      setError("Username must be at least 3 characters");
      return;
    }
    
    // Save to localStorage
    localStorage.setItem("username", username.trim());
    onSubmit(username.trim());
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop with blur */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md mx-4 border border-gray-100">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-gradient-to-r from-[#fb6058] to-[#ff7a6b] rounded-xl mx-auto mb-4 flex items-center justify-center">
            <span className="text-white font-bold text-xl">@</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Handle</h2>
          <p className="text-gray-600">Create a unique handle to get started on the platform</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Username/Handle *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">@</span>
              <input
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setError("");
                }}
                placeholder="johndoe"
                className="w-full pl-8 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#fb6058]/40 focus:border-[#fb6058]/40 transition-all"
                autoFocus
              />
            </div>
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          </div>

          <div className="pt-4">
            <Button type="submit" variant="cta" className="w-full">
              Get Started
            </Button>
          </div>
        </form>

        <p className="text-xs text-gray-500 text-center mt-4">
          You can change your handle later in settings (coming soon)
        </p>
      </div>
    </div>
  );
}
