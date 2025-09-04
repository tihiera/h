import React, { useState, useEffect } from "react";
import Card from "../components/Card";
import Badge from "../components/Badge";
import InvestmentHistory from "../components/InvestmentHistory";

export default function MePage() {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load user profile from localStorage
    const storedProfile = localStorage.getItem("userProfile");
    const storedAddress = localStorage.getItem("userAddress");
    const walletAddress = localStorage.getItem("walletAddress");
    
    if (storedProfile) {
      const profile = JSON.parse(storedProfile);
      // Add additional data that might come from backend
      const enhancedProfile = {
        ...profile,
        address: walletAddress || storedAddress || "Not connected",
        isWalletConnected: !!walletAddress,
        valuation: 250000, // Default from backend
        confidence: 70, // Default from backend
        coverage: "LinkedIn", // Default from backend
        region: profile.country || "Unknown",
        headline: profile.bio || "No bio available",
        banner: "https://images.unsplash.com/photo-1526948128573-703ee1aeb6fa?q=80&w=1600&auto=format&fit=crop"
      };
      setUserProfile(enhancedProfile);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    // Separate effect for listening to storage changes
    const handleStorageChange = () => {
      const newWalletAddress = localStorage.getItem("walletAddress");
      const updatedProfile = localStorage.getItem("userProfile");
      
      if (updatedProfile) {
        const newProfileData = JSON.parse(updatedProfile);
        setUserProfile(prev => {
          if (!prev) return null;
          
          return {
            ...prev,
            ...newProfileData,
            address: newWalletAddress || prev.address,
            isWalletConnected: !!newWalletAddress
          };
        });
      } else if (newWalletAddress) {
        // Only update wallet info if profile exists
        setUserProfile(prev => {
          if (!prev) return prev;
          
          return {
            ...prev,
            address: newWalletAddress,
            isWalletConnected: true
          };
        });
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom events for same-page updates
    window.addEventListener('profileUpdated', handleStorageChange);
    window.addEventListener('investmentUpdate', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('profileUpdated', handleStorageChange);
      window.removeEventListener('investmentUpdate', handleStorageChange);
    };
  }, []);

  if (loading) {
    return (
      <div className="max-w-xl mx-auto space-y-4">
        <Card className="p-8 text-center">
          <div className="text-gray-500">Loading profile...</div>
        </Card>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="max-w-xl mx-auto space-y-4">
        <Card className="p-8 text-center">
          <div className="text-gray-500">No profile found. Please create an account first.</div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-4">
      <Card className="overflow-hidden">
        <div className="aspect-[21/7] w-full bg-gray-100">
          <img src={userProfile.banner} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="p-4 flex items-start gap-3">
          <img 
            src={userProfile.avatar} 
            alt={userProfile.name} 
            className="w-14 h-14 rounded-full object-cover border border-gray-200" 
          />
          <div className="min-w-0">
            <h3 className="font-semibold">{userProfile.name}</h3>
            <p className="text-sm text-gray-500">@{userProfile.handle}</p>
            <div className="mt-2 flex gap-2 flex-wrap">
              <Badge>{userProfile.coverage}</Badge>
              {userProfile.country && <Badge>📍 {userProfile.country}</Badge>}
              {userProfile.city && <Badge>{userProfile.city}</Badge>}
              {userProfile.isWalletConnected && <Badge className="bg-green-100 text-green-800">🔗 Wallet Connected</Badge>}
              {userProfile.assetId && <Badge className="bg-blue-100 text-blue-800">🪙 Tokenized</Badge>}
            </div>
            <p className="mt-3 text-sm text-gray-700">{userProfile.headline}</p>
            <div className="mt-2 flex gap-3 text-xs text-gray-500">
              {userProfile.linkedin && (
                <a 
                  href={userProfile.linkedin.startsWith('http') ? userProfile.linkedin : `https://${userProfile.linkedin}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-blue-600"
                >
                  LinkedIn
                </a>
              )}
              {userProfile.github && (
                <a 
                  href={userProfile.github.startsWith('http') ? userProfile.github : `https://${userProfile.github}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-gray-800"
                >
                  GitHub
                </a>
              )}
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold">Worth</h4>
          <Badge>{userProfile.confidence}% confidence</Badge>
        </div>
        <div className="mt-2">
          <p className="text-sm text-gray-500">Estimated Value</p>
          <p className="text-2xl font-semibold">€{userProfile.valuation.toLocaleString()}</p>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-gray-500">Data Coverage</div>
            <div className="font-medium">{userProfile.coverage}</div>
          </div>
          <div>
            <div className="text-gray-500">
              {userProfile.isWalletConnected ? "LocalNet Wallet" : "Wallet Status"}
            </div>
            <div className={`font-medium text-xs ${userProfile.isWalletConnected ? 'text-green-600' : 'text-gray-500'}`}>
              {userProfile.isWalletConnected ? userProfile.address : "Not connected"}
            </div>
          </div>
        </div>
        <button className="mt-4 w-full rounded-lg border border-gray-300 py-2 text-sm hover:bg-gray-50">
          Improve confidence
        </button>
      </Card>

      {/* Investment History */}
      <InvestmentHistory username={userProfile.username} />

      {/* ASA Information Card */}
      {userProfile.assetId && (
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold flex items-center gap-2">
              <span>🪙</span>
              Profile Token
            </h4>
            <Badge className="bg-blue-100 text-blue-800">ASA</Badge>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Asset ID:</span>
              <span className="font-mono">{userProfile.assetId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Token Name:</span>
              <span>{userProfile.name} Profile Token</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Unit Name:</span>
              <span className="font-mono">{userProfile.handle.toUpperCase().slice(0, 8)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Total Supply:</span>
              <span>1,000,000</span>
            </div>
          </div>
          {userProfile.loraUrl && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <a 
                href={userProfile.loraUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                View on Lora Explorer →
              </a>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
