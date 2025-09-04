import React, { useState, useEffect } from "react";

const AVATAR_COUNT = 70; // pravatar has avatars from 1 to 70

export default function UploadBox({ label = "Upload profile image*", onFileSelect }) {
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(null);

  useEffect(() => {
    // Check if there's a saved avatar in localStorage
    const savedAvatar = localStorage.getItem("profileAvatar");
    if (savedAvatar) {
      const avatarNumber = parseInt(savedAvatar);
      setSelectedAvatar(avatarNumber);
      setAvatarUrl(`https://i.pravatar.cc/200?img=${avatarNumber}`);
    }
  }, []);

  const handleRandomizeAvatar = () => {
    // Generate random number between 1 and AVATAR_COUNT
    const randomNumber = Math.floor(Math.random() * AVATAR_COUNT) + 1;
    const newAvatarUrl = `https://i.pravatar.cc/200?img=${randomNumber}`;
    
    setSelectedAvatar(randomNumber);
    setAvatarUrl(newAvatarUrl);
    
    // Save to localStorage
    localStorage.setItem("profileAvatar", randomNumber.toString());
    
    // Call parent callback with avatar info
    onFileSelect?.({
      type: 'avatar',
      avatarNumber: randomNumber,
      url: newAvatarUrl
    });
  };

  const handleRemoveAvatar = () => {
    setSelectedAvatar(null);
    setAvatarUrl(null);
    localStorage.removeItem("profileAvatar");
    onFileSelect?.(null);
  };

  return (
    <div className="rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 px-4 py-4">
      {selectedAvatar ? (
        <div className="flex items-center gap-4">
          <img 
            src={avatarUrl} 
            alt="Profile Avatar" 
            className="w-12 h-12 rounded-lg object-cover border border-gray-200"
          />
          <div className="flex-1">
            <div className="font-medium text-gray-700 text-sm">Avatar #{selectedAvatar}</div>
            <div className="text-gray-400 text-xs">
              Randomly generated profile picture
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleRandomizeAvatar}
              className="rounded-lg border border-blue-300 bg-blue-50 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-100 transition-colors"
            >
              Randomize
            </button>
            <button
              onClick={handleRemoveAvatar}
              className="rounded-lg border border-red-300 bg-red-50 px-3 py-1.5 text-sm text-red-600 hover:bg-red-100 transition-colors"
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <div className="text-sm">
            <div className="font-medium text-gray-700">{label}</div>
            <div className="text-gray-400">Click to generate a random avatar</div>
          </div>
          <button 
            onClick={handleRandomizeAvatar}
            className="rounded-lg border border-[#fb6058] bg-[#fb6058]/10 px-4 py-2 text-sm text-[#fb6058] hover:bg-[#fb6058]/20 transition-colors font-medium"
          >
            Randomize Profile Picture
          </button>
        </div>
      )}
    </div>
  );
}
