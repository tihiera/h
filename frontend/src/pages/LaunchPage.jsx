import React, { useState, useEffect } from "react";
import Card from "../components/Card";
import TextField from "../components/TextField";
import TermsModal from "../components/TermsModal";
import Button from "../components/Button";

export default function LaunchPage() {
  const [userProfile, setUserProfile] = useState(null);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [isCreatingAsa, setIsCreatingAsa] = useState(false);

  useEffect(() => {
    // Load user profile from localStorage
    const storedProfile = localStorage.getItem("userProfile");
    if (storedProfile) {
      setUserProfile(JSON.parse(storedProfile));
    }
  }, []);

  const handleReviewAndSign = () => {
    setShowTermsModal(true);
  };

  const handleTermsAccept = async () => {
    setIsCreatingAsa(true);
    
    try {
      // Check if user has a wallet connected
      const walletAddress = localStorage.getItem("walletAddress");
      if (!walletAddress) {
        throw new Error("Please connect your wallet first before creating an ASA.");
      }

      console.log('Creating ASA for user:', userProfile.username);

      // Prepare ASA creation request
      const asaRequest = {
        username: userProfile.username,
        asset_name: `${userProfile.name} Profile Token`,
        unit_name: `${userProfile.handle.toUpperCase().slice(0, 8)}`, // Max 8 characters for unit name
        total: 1000000, // 1 million tokens
        decimals: 0, // Non-divisible tokens
        url: `https://launch.app/profile/${userProfile.handle}`,
        note: `Profile token for ${userProfile.name} (@${userProfile.handle})`
      };

      console.log('ASA request data:', asaRequest);

      // Call the create_asa endpoint
      const response = await fetch('http://localhost:8000/profile/create_asa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(asaRequest)
      });

      console.log('ASA creation response status:', response.status);

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorData.message || errorMessage;
        } catch (jsonError) {
          try {
            const errorText = await response.text();
            if (errorText) {
              errorMessage = `${errorMessage} - ${errorText}`;
            }
          } catch (textError) {
            console.error('Could not parse error response:', textError);
          }
        }
        
        throw new Error(errorMessage);
      }

      // Parse successful response
      const result = await response.json();
      console.log('ASA created successfully:', result);

      // Save ASA information to localStorage
      const updatedProfile = {
        ...userProfile,
        assetId: result.asset_id,
        assetUrl: result.url,
        loraUrl: result.lora_url
      };
      
      localStorage.setItem("userProfile", JSON.stringify(updatedProfile));
      localStorage.setItem("userAssetId", result.asset_id.toString());
      localStorage.setItem("userAssetTxId", result.txid);

      // Update local state
      setUserProfile(updatedProfile);

      // Show success message with asset details
      alert(`🎉 Terms accepted and Profile ASA created successfully!

Asset Details:
• Asset ID: ${result.asset_id}
• Asset Name: ${asaRequest.asset_name}
• Unit Name: ${asaRequest.unit_name}
• Total Supply: ${asaRequest.total.toLocaleString()}
• Transaction ID: ${result.txid}

Your profile is now live and tokenized on Algorand!`);

    } catch (error) {
      console.error('ASA creation error:', error);
      alert(`Failed to create profile ASA: ${error.message}`);
    } finally {
      setIsCreatingAsa(false);
    }
  };

  if (!userProfile) {
    return (
      <div className="max-w-xl mx-auto">
        <Card className="p-8 text-center">
          <div className="text-gray-500">Loading profile...</div>
        </Card>
      </div>
    );
  }

  // Check if user already has an ASA
  const hasAsa = userProfile.assetId;

  return (
    <div className="max-w-xl mx-auto">
      <Card className="p-5">
        <h2 className="text-lg font-semibold mb-4">Your Profile</h2>

        <div className="grid grid-cols-2 gap-3">
          <TextField 
            label="Full Name" 
            value={userProfile.name}
            readOnly={true}
          />
          <TextField 
            label="@Handle" 
            value={userProfile.handle}
            readOnly={true}
          />
        </div>

        <TextField 
          label="Bio" 
          value={userProfile.bio}
          readOnly={true}
        />
        
        <div className="grid grid-cols-2 gap-3">
          <TextField 
            label="LinkedIn" 
            value={userProfile.linkedin || "Not provided"}
            readOnly={true}
          />
          <TextField 
            label="GitHub" 
            value={userProfile.github || "Not provided"}
            readOnly={true}
          />
          <TextField 
            label="City" 
            value={userProfile.city || "Not provided"}
            readOnly={true}
          />
          <TextField 
            label="Country" 
            value={userProfile.country}
            readOnly={true}
          />
        </div>

        <div className="mt-3">
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <div className="flex items-center gap-4">
              <img 
                src={userProfile.avatar} 
                alt="Profile Avatar" 
                className="w-12 h-12 rounded-lg object-cover border border-gray-200"
              />
              <div className="flex-1">
                <div className="font-medium text-gray-700 text-sm">Profile Picture</div>
                <div className="text-gray-400 text-xs">Set during account creation</div>
              </div>
            </div>
          </div>
        </div>

        {/* ASA Status Display */}
        {hasAsa && (
          <div className="mt-3">
            <div className="rounded-xl border border-green-200 bg-green-50 p-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-green-600 font-bold">🪙</span>
                </div>
                <div className="flex-1">
                  <div className="font-medium text-green-800 text-sm">Profile ASA Created</div>
                  <div className="text-green-600 text-xs">Asset ID: {userProfile.assetId}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-gray-50 border border-gray-200 p-3">
            <div className="text-sm font-medium">X Verification</div>
            <div className="text-xs text-gray-500">Link your X account (optional)</div>
            <button className="mt-2 w-full rounded-lg bg-black text-white text-sm py-2">
              Verify X
            </button>
          </div>
          <div className="rounded-lg bg-gray-50 border border-gray-200 p-3">
            <div className="text-sm font-medium">Creator Agreement</div>
            <div className="text-xs text-gray-500">
              {hasAsa ? "Agreement signed ✓" : "Review & sign the agreement"}
            </div>
            <button 
              onClick={handleReviewAndSign}
              disabled={hasAsa}
              className={`mt-2 w-full rounded-lg text-white text-sm py-2 ${
                hasAsa 
                  ? "bg-green-500 cursor-not-allowed" 
                  : "bg-black hover:bg-gray-800"
              }`}
            >
              {hasAsa ? "Completed" : "Review"}
            </button>
          </div>
        </div>
      </Card>

      <div className="mt-4 flex justify-center">
        <Button 
          onClick={handleReviewAndSign}
          disabled={hasAsa || isCreatingAsa}
          variant="cta"
          className={`px-6 py-3 text-base ${
            (hasAsa || isCreatingAsa) ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {isCreatingAsa 
            ? "Creating Profile ASA..." 
            : hasAsa 
              ? "Agreement Signed & ASA Created" 
              : "Review & Sign Agreement"
          }
        </Button>
      </div>

      <TermsModal
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
        onAccept={handleTermsAccept}
      />
    </div>
  );
}
