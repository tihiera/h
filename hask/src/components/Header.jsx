import React, { useState, useEffect } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import Button from "./Button";
import NotificationPanel from "./NotificationPanel";

export default function Header() {
  const navigate = useNavigate();
  const [profileImage, setProfileImage] = useState("https://i.pravatar.cc/200?img=60");
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [username, setUsername] = useState("");

  useEffect(() => {
    // Load username
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) {
      setUsername(storedUsername);
    }

    // Check for saved avatar in localStorage
    const savedAvatar = localStorage.getItem("profileAvatar");
    if (savedAvatar) {
      setProfileImage(`https://i.pravatar.cc/200?img=${savedAvatar}`);
    }

    // Check for existing wallet connection
    const savedAddress = localStorage.getItem("walletAddress");
    if (savedAddress) {
      setIsConnected(true);
      setWalletAddress(savedAddress);
    }

    // Listen for avatar changes (when user randomizes)
    const handleStorageChange = () => {
      const newAvatar = localStorage.getItem("profileAvatar");
      if (newAvatar) {
        setProfileImage(`https://i.pravatar.cc/200?img=${newAvatar}`);
      } else {
        setProfileImage("https://i.pravatar.cc/200?img=60"); // fallback
      }
    };

    // Listen for localStorage changes
    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom events (for same-page updates)
    window.addEventListener('avatarChanged', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('avatarChanged', handleStorageChange);
    };
  }, []);

  // Poll for notifications
  useEffect(() => {
    if (!username) return;

    const fetchNotificationCount = async () => {
      try {
        const response = await fetch(`http://localhost:8000/notifications?username=${username}`);
        if (response.ok) {
          const notifications = await response.json();
          const pendingCount = notifications.filter(n => n.status === 'pending').length;
          setUnreadCount(pendingCount);
        }
      } catch (error) {
        console.error('Error fetching notification count:', error);
      }
    };

    fetchNotificationCount();
    
    // Poll every 30 seconds
    const interval = setInterval(fetchNotificationCount, 30000);
    
    return () => clearInterval(interval);
  }, [username]);

  const handleConnectWallet = async () => {
    setIsConnecting(true);
    
    try {
      // Get username from localStorage
      const username = localStorage.getItem("username");
      if (!username) {
        throw new Error("No username found. Please create an account first.");
      }

      console.log('Connecting wallet for username:', username);

      // Call the localnet_account endpoint
      const response = await fetch('http://localhost:8000/localnet_account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username,
          fund_algo: 10.0
        })
      });

      console.log('Wallet connection response status:', response.status);

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
      console.log('Wallet connected successfully:', result);

      // Save wallet info to localStorage
      localStorage.setItem("walletAddress", result.address);
      localStorage.setItem("walletFunded", result.funded.toString());

      // Update state
      setIsConnected(true);
      setWalletAddress(result.address);

      // Show success message
      alert(`Wallet connected successfully!\nAddress: ${result.address}\nFunded: ${result.funded ? 'Yes' : 'No'}`);

    } catch (error) {
      console.error('Wallet connection error:', error);
      alert(`Failed to connect wallet: ${error.message}`);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnectWallet = () => {
    // Clear wallet data from localStorage
    localStorage.removeItem("walletAddress");
    localStorage.removeItem("walletFunded");
    
    // Update state
    setIsConnected(false);
    setWalletAddress("");
    
    alert("Wallet disconnected successfully!");
  };

  const formatAddress = (address) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <>
      <header className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-gray-100">
        <div className="h-14 flex items-center justify-end max-w-[800px] mx-auto px-6">
          <div className="flex items-center gap-3">
            {/* Notification Bell */}
            {username && (
              <button
                onClick={() => setShowNotifications(true)}
                className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <svg 
                  className="w-5 h-5 text-gray-600" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" 
                  />
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
            )}

            {/* Wallet Connection */}
            {isConnected ? (
              <div className="flex items-center gap-2">
                <div className="text-xs text-gray-600">
                  {formatAddress(walletAddress)}
                </div>
                <Button 
                  onClick={handleDisconnectWallet}
                  variant="secondary"
                  className="bg-gray-100 text-gray-700 hover:bg-gray-200 text-sm px-3 py-1"
                >
                  Disconnect
                </Button>
              </div>
            ) : (
              <Button 
                onClick={handleConnectWallet}
                disabled={isConnecting}
                className={isConnecting ? "opacity-50 cursor-not-allowed" : ""}
              >
                {isConnecting ? "Connecting..." : "Connect Wallet"}
              </Button>
            )}

            {/* Profile Avatar */}
            {profileImage && (
              <img
                src={profileImage}
                alt="me"
                width="34" height="34"
                onClick={() => navigate("/me")}
                className="rounded-full border border-gray-200 cursor-pointer object-cover"
              />
            )}
          </div>
        </div>
      </header>

      {/* Notification Panel */}
      <NotificationPanel
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
        username={username}
      />
    </>
  );
}
