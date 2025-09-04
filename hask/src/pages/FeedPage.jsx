import React, { useState, useEffect } from "react";
import Card from "../components/Card";
import Button from "../components/Button";
import Badge from "../components/Badge";
import InvestmentModal from "../components/InvestmentModal";

export default function FeedPage() {
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showInvestmentModal, setShowInvestmentModal] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [pendingInvestments, setPendingInvestments] = useState(new Set());
  const [currentUserProfile, setCurrentUserProfile] = useState(null);

  useEffect(() => {
    fetchPeople();
    loadCurrentUserProfile();
  }, []);

  const loadCurrentUserProfile = () => {
    const storedProfile = localStorage.getItem("userProfile");
    if (storedProfile) {
      setCurrentUserProfile(JSON.parse(storedProfile));
    }
  };

  const fetchPeople = async () => {
    try {
      setLoading(true);
      setError("");

      console.log('Fetching people from backend...');

      const response = await fetch('http://localhost:8000/people');

      console.log('People fetch response status:', response.status);

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

      const data = await response.json();
      console.log('People data received:', data);

      // Filter out the current user from the feed
      const currentUsername = localStorage.getItem("username");
      const filteredPeople = data.filter(person => person.id !== currentUsername);

      setPeople(filteredPeople);

    } catch (err) {
      console.error('Error fetching people:', err);
      setError(err.message || 'Failed to load people');
    } finally {
      setLoading(false);
    }
  };

  const handleInvestClick = (person) => {
    // Check if current user has tokenized their profile
    if (!currentUserProfile?.assetId) {
      alert("⚠️ You need to tokenize your profile first!\n\nGo to Launch page → Review & Sign Agreement to create your profile token before you can invest in others.");
      return;
    }

    // Check if the person has an asset_id (tokenized profile)
    if (!person.asset_id) {
      alert(`❌ ${person.name} hasn't tokenized their profile yet.\n\nThey need to create their profile token before you can invest in them.`);
      return;
    }

    setSelectedPerson(person);
    setShowInvestmentModal(true);
  };

  const handleInvestment = async (person, amount) => {
    try {
      const currentUsername = localStorage.getItem("username");
      if (!currentUsername) {
        throw new Error("Please log in first");
      }

      console.log(`Processing investment of €${amount} in ${person.name}`);

      // Send investment request
      const response = await fetch('http://localhost:8000/invest/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          buyer_username: currentUsername,
          seller_username: person.id,
          asset_id: person.asset_id,
          amount: amount
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to send investment request');
      }

      const result = await response.json();
      console.log('Investment request sent:', result);

      // Track pending investment locally
      const pendingInvestments = JSON.parse(localStorage.getItem(`pending_investments_${currentUsername}`) || '[]');
      const pendingInvestment = {
        personId: person.id,
        personName: person.name,
        personHandle: person.handle,
        amount: amount,
        assetId: person.asset_id,
        timestamp: new Date().toISOString(),
        notificationId: result.notification_id
      };
      
      pendingInvestments.push(pendingInvestment);
      localStorage.setItem(`pending_investments_${currentUsername}`, JSON.stringify(pendingInvestments));

      // Add to pending investments
      setPendingInvestments(prev => new Set([...prev, person.id]));

      // Trigger notification refresh in header
      window.dispatchEvent(new Event('notificationUpdate'));

      alert(`🎉 Investment request sent successfully!

💰 Investment amount: €${amount.toLocaleString()}
🎯 Target: ${person.name}'s profile token (ASA #${person.asset_id})

📋 Next steps:
• Your investment request is now pending
• ${person.name} will be notified to accept your investment
• Once accepted, you'll receive their profile tokens

You can view the transaction details in your investment history.`);

    } catch (error) {
      console.error('Investment error:', error);
      throw error;
    }
  };

  const handleRefresh = () => {
    fetchPeople();
    loadCurrentUserProfile();
  };

  const isInvestmentPending = (personId) => {
    return pendingInvestments.has(personId);
  };

  const canInvest = (person) => {
    return currentUserProfile?.assetId && person.asset_id && !isInvestmentPending(person.id);
  };

  if (loading) {
    return (
      <div className="max-w-xl mx-auto space-y-4">
        <Card className="p-8 text-center">
          <div className="text-gray-500">Loading people...</div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-xl mx-auto space-y-4">
        <Card className="p-8 text-center">
          <div className="text-red-600 mb-4">Failed to load people</div>
          <div className="text-sm text-gray-500 mb-4">{error}</div>
          <Button onClick={handleRefresh} variant="primary">
            Try Again
          </Button>
        </Card>
      </div>
    );
  }

  if (people.length === 0) {
    return (
      <div className="max-w-xl mx-auto space-y-4">
        <Card className="p-8 text-center">
          <div className="text-gray-500 mb-4">No people found on the network</div>
          <div className="text-sm text-gray-400 mb-4">
            Be the first to create your profile and invite others!
          </div>
          <Button onClick={handleRefresh} variant="primary">
            Refresh
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-4">
      {/* Header with refresh button */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          People on the Network ({people.length})
        </h2>
        <button
          onClick={handleRefresh}
          className="text-sm text-gray-500 hover:text-gray-700 px-2 py-1 rounded hover:bg-gray-100"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Investment status notice */}
      {!currentUserProfile?.assetId && (
        <Card className="p-4 bg-yellow-50 border-yellow-200">
          <div className="flex items-start gap-3">
            <span className="text-yellow-600 text-lg">⚠️</span>
            <div>
              <div className="font-medium text-yellow-800">Tokenize your profile to invest</div>
              <div className="text-sm text-yellow-700 mt-1">
                You need to create your profile token before you can invest in others. 
                Go to Launch page and sign the agreement.
              </div>
            </div>
          </div>
        </Card>
      )}

      {people.map(person => {
        const isPending = isInvestmentPending(person.id);
        const canInvestInPerson = canInvest(person);
        
        return (
          <Card 
            key={person.id} 
            className={`p-4 ${isPending ? 'bg-green-50 border-green-200' : ''}`}
          >
            <div className="flex gap-3">
              <div className="w-14 h-14 border overflow-hidden rounded-lg bg-gray-100">
                <img 
                  src={person.image} 
                  alt={person.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = `https://i.pravatar.cc/200?img=${Math.floor(Math.random() * 70) + 1}`;
                  }}
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold truncate">{person.name}</h3>
                    <p className="text-xs text-gray-500">@{person.handle}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge>{person.confidence}% conf.</Badge>
                    {isPending && (
                      <Badge className="bg-green-100 text-green-800">
                        ⏳ Pending
                      </Badge>
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-1 line-clamp-1">{person.tagline}</p>
                
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-600">
                      Worth: <strong className="text-gray-900">€{person.price.toLocaleString()}</strong>
                    </span>
                    {person.asset_id ? (
                      <Badge className="bg-blue-100 text-blue-800 text-xs">
                        🪙 ASA #{person.asset_id}
                      </Badge>
                    ) : (
                      <Badge className="bg-gray-100 text-gray-600 text-xs">
                        Not tokenized
                      </Badge>
                    )}
                  </div>
                  
                  <Button 
                    onClick={() => handleInvestClick(person)}
                    disabled={!canInvestInPerson}
                    className={`${
                      isPending 
                        ? 'bg-green-600 hover:bg-green-700' 
                        : !canInvestInPerson
                          ? 'opacity-50 cursor-not-allowed'
                          : ''
                    }`}
                  >
                    {isPending ? '✓ Invested' : 'Invest'}
                  </Button>
                </div>

                {/* Additional info */}
                <div className="mt-2 text-xs text-gray-400">
                  {person.address && (
                    <span>Wallet: {person.address.slice(0, 8)}...{person.address.slice(-4)}</span>
                  )}
                </div>
              </div>
            </div>
          </Card>
        );
      })}

      {/* Investment Modal */}
      <InvestmentModal
        isOpen={showInvestmentModal}
        onClose={() => setShowInvestmentModal(false)}
        person={selectedPerson}
        onInvest={handleInvestment}
      />
    </div>
  );
}
