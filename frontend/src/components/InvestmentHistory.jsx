import React, { useState, useEffect } from "react";
import Card from "./Card";
import Badge from "./Badge";

export default function InvestmentHistory({ username }) {
  const [investments, setInvestments] = useState([]);
  const [totalReceived, setTotalReceived] = useState(0);
  const [totalInvested, setTotalInvested] = useState(0);

  useEffect(() => {
    if (username) {
      loadInvestmentData();
    }
  }, [username]);

  const loadInvestmentData = () => {
    // Load investment data from localStorage
    const investmentData = localStorage.getItem(`investments_${username}`);
    const receivedData = localStorage.getItem(`received_${username}`);
    const investedData = localStorage.getItem(`invested_${username}`);

    if (investmentData) {
      setInvestments(JSON.parse(investmentData));
    }

    if (receivedData) {
      setTotalReceived(JSON.parse(receivedData));
    }

    if (investedData) {
      setTotalInvested(JSON.parse(investedData));
    }
  };

  return (
    <Card className="p-4">
      <h4 className="font-semibold mb-3 flex items-center gap-2">
        <span>💼</span>
        Investment Overview
      </h4>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <div className="text-sm text-green-600 font-medium">Total Received</div>
          <div className="text-xl font-bold text-green-800">€{totalReceived.toLocaleString()}</div>
        </div>
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <div className="text-sm text-blue-600 font-medium">Total Invested</div>
          <div className="text-xl font-bold text-blue-800">€{totalInvested.toLocaleString()}</div>
        </div>
      </div>

      {investments.length > 0 && (
        <div>
          <h5 className="font-medium text-gray-800 mb-2">Recent Activity</h5>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {investments.slice(0, 5).map((investment, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className={investment.type === 'received' ? 'text-green-600' : 'text-blue-600'}>
                    {investment.type === 'received' ? '⬇️' : '⬆️'}
                  </span>
                  <div>
                    <div className="text-sm font-medium">
                      {investment.type === 'received' ? 'From' : 'To'} @{investment.otherUser}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(investment.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="text-sm font-semibold">
                  €{investment.amount.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
