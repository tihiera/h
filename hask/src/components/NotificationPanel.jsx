import React, { useState, useEffect } from "react";
import Card from "./Card";
import Button from "./Button";
import Badge from "./Badge";

export default function NotificationPanel({ isOpen, onClose, username }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [processingDecisions, setProcessingDecisions] = useState(new Set());

  useEffect(() => {
    if (isOpen && username) {
      fetchNotifications();
      // Poll for new notifications every 10 seconds
      const interval = setInterval(fetchNotifications, 10000);
      return () => clearInterval(interval);
    }
  }, [isOpen, username]);

  const fetchNotifications = async () => {
    if (!username) return;
    
    try {
      setLoading(true);
      setError("");

      console.log('Fetching notifications for:', username);

      const response = await fetch(`http://localhost:8000/notifications?username=${username}`);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Notifications received:', data);

      setNotifications(data);

    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDecision = async (notification, decision) => {
    setProcessingDecisions(prev => new Set([...prev, notification.id]));
    
    try {
      console.log(`Processing ${decision} for notification:`, notification.id);

      const response = await fetch('http://localhost:8000/invest/decision', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          seller_username: username,
          notification_id: notification.id,
          accept: decision === 'accept'
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `Failed to ${decision} investment`);
      }

      const result = await response.json();
      console.log('Decision processed:', result);

      // Track investment if accepted
      if (decision === 'accept') {
        // Update investment tracking for the seller (current user)
        const currentInvestments = JSON.parse(localStorage.getItem(`investments_${username}`) || '[]');
        const currentTotal = JSON.parse(localStorage.getItem(`received_${username}`) || '0');
        
        const newInvestment = {
          type: 'received',
          otherUser: notification.from_username,
          amount: notification.amount,
          assetId: notification.asset_id,
          txid: result.txid,
          timestamp: new Date().toISOString()
        };
        
        currentInvestments.unshift(newInvestment); // Add to beginning
        const newTotal = currentTotal + notification.amount;
        
        localStorage.setItem(`investments_${username}`, JSON.stringify(currentInvestments));
        localStorage.setItem(`received_${username}`, JSON.stringify(newTotal));

        // Also update the investor's data
        const investorInvestments = JSON.parse(localStorage.getItem(`investments_${notification.from_username}`) || '[]');
        const investorTotal = JSON.parse(localStorage.getItem(`invested_${notification.from_username}`) || '0');
        
        const investorRecord = {
          type: 'invested',
          otherUser: username,
          amount: notification.amount,
          assetId: notification.asset_id,
          txid: result.txid,
          timestamp: new Date().toISOString()
        };
        
        investorInvestments.unshift(investorRecord);
        const newInvestorTotal = investorTotal + notification.amount;
        
        localStorage.setItem(`investments_${notification.from_username}`, JSON.stringify(investorInvestments));
        localStorage.setItem(`invested_${notification.from_username}`, JSON.stringify(newInvestorTotal));

        // Trigger UI updates
        window.dispatchEvent(new Event('investmentUpdate'));
      }

      // Show success message
      if (decision === 'accept') {
        alert(`🎉 Investment accepted!

✅ Asset transfer completed
💰 Amount: €${notification.amount.toLocaleString()}
🪙 Asset ID: ${notification.asset_id}
📄 Transaction ID: ${result.txid}

You can view the transaction on Lora Explorer.`);
      } else {
        alert(`❌ Investment request rejected.

The investor has been notified of your decision.`);
      }

      // Refresh notifications
      await fetchNotifications();

    } catch (error) {
      console.error('Decision error:', error);
      alert(`Failed to ${decision} investment: ${error.message}`);
    } finally {
      setProcessingDecisions(prev => {
        const newSet = new Set(prev);
        newSet.delete(notification.id);
        return newSet;
      });
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'INVEST_REQUEST': return '💰';
      case 'INVEST_ACCEPTED': return '✅';
      default: return '📢';
    }
  };

  const getNotificationColor = (type, status) => {
    if (status === 'pending') return 'bg-yellow-50 border-yellow-200';
    if (type === 'INVEST_ACCEPTED') return 'bg-green-50 border-green-200';
    return 'bg-gray-50 border-gray-200';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      {/* Panel */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Notifications</h2>
            <div className="flex items-center gap-2">
              <Badge className="bg-blue-100 text-blue-800">
                {notifications.length}
              </Badge>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100"
              >
                ✕
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-6 text-center text-gray-500">
              Loading notifications...
            </div>
          ) : error ? (
            <div className="p-6 text-center">
              <div className="text-red-600 mb-2">Failed to load notifications</div>
              <div className="text-sm text-gray-500 mb-4">{error}</div>
              <Button onClick={fetchNotifications} size="sm">
                Retry
              </Button>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <div className="text-4xl mb-2">🔔</div>
              <div>No notifications yet</div>
              <div className="text-sm text-gray-400 mt-1">
                Investment requests will appear here
              </div>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {notifications.map(notification => (
                <div
                  key={notification.id}
                  className={`p-4 rounded-xl border ${getNotificationColor(notification.type, notification.status)}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">
                          {notification.type === 'INVEST_REQUEST' 
                            ? 'Investment Request' 
                            : 'Investment Accepted'
                          }
                        </h4>
                        <Badge className={
                          notification.status === 'pending' 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-green-100 text-green-800'
                        }>
                          {notification.status}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-gray-700 mb-2">
                        {notification.type === 'INVEST_REQUEST'
                          ? `@${notification.from_username} wants to invest €${notification.amount.toLocaleString()} in your profile`
                          : `Your investment in @${notification.from_username} has been accepted`
                        }
                      </p>

                      <div className="text-xs text-gray-500 space-y-1">
                        <div>Asset ID: {notification.asset_id}</div>
                        <div>Amount: €{notification.amount.toLocaleString()}</div>
                        {notification.txid && (
                          <div>Transaction: {notification.txid.slice(0, 12)}...</div>
                        )}
                      </div>

                      {/* Action buttons for pending investment requests */}
                      {notification.type === 'INVEST_REQUEST' && notification.status === 'pending' && (
                        <div className="flex gap-2 mt-3">
                          <Button
                            onClick={() => handleDecision(notification, 'accept')}
                            disabled={processingDecisions.has(notification.id)}
                            variant="primary"
                            className="flex-1 bg-green-600 hover:bg-green-700 text-sm py-2"
                          >
                            {processingDecisions.has(notification.id) ? 'Processing...' : 'Accept'}
                          </Button>
                          <Button
                            onClick={() => handleDecision(notification, 'reject')}
                            disabled={processingDecisions.has(notification.id)}
                            variant="secondary"
                            className="flex-1 bg-red-100 text-red-700 hover:bg-red-200 text-sm py-2"
                          >
                            {processingDecisions.has(notification.id) ? 'Processing...' : 'Reject'}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <Button onClick={fetchNotifications} variant="secondary" className="w-full">
            🔄 Refresh Notifications
          </Button>
        </div>
      </div>
    </div>
  );
}
