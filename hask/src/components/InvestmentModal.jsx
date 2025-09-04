import React, { useState } from "react";
import Button from "./Button";
import Badge from "./Badge";

export default function InvestmentModal({ isOpen, onClose, person, onInvest }) {
  const [investmentAmount, setInvestmentAmount] = useState(1000);
  const [isInvesting, setIsInvesting] = useState(false);
  const [error, setError] = useState("");

  const handleInvest = async () => {
    setIsInvesting(true);
    setError("");

    try {
      await onInvest(person, investmentAmount);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsInvesting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 border border-gray-100">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Invest in {person.name}</h2>
          <p className="text-gray-600 mt-1">@{person.handle}</p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Person Info */}
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
            <img 
              src={person.image} 
              alt={person.name}
              className="w-12 h-12 rounded-lg object-cover border border-gray-200"
            />
            <div className="flex-1">
              <div className="font-semibold text-gray-900">{person.name}</div>
              <div className="text-sm text-gray-500">{person.tagline}</div>
              <div className="flex items-center gap-2 mt-1">
                <Badge>{person.confidence}% conf.</Badge>
                {person.asset_id && (
                  <Badge className="bg-blue-100 text-blue-800">
                    🪙 ASA #{person.asset_id}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Investment Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Investment Amount (EUR)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">€</span>
              <input
                type="number"
                value={investmentAmount}
                onChange={(e) => setInvestmentAmount(Number(e.target.value))}
                min="100"
                max="100000"
                step="100"
                className="w-full pl-8 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#fb6058]/40 focus:border-[#fb6058]/40"
              />
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Minimum: €100 • Maximum: €100,000
            </div>
          </div>

          {/* Investment Details */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <h4 className="font-medium text-blue-900 mb-2">Investment Process</h4>
            <div className="text-sm text-blue-800 space-y-1">
              <div>1. You opt-in to receive their profile tokens</div>
              <div>2. Investment request is sent to {person.name}</div>
              <div>3. They can accept and transfer tokens to you</div>
              <div>4. Investment is completed on Algorand</div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
          <div className="flex gap-3">
            <Button
              onClick={onClose}
              variant="secondary"
              className="bg-gray-200 text-gray-800 hover:bg-gray-300"
            >
              Cancel
            </Button>
            <Button
              onClick={handleInvest}
              disabled={isInvesting || investmentAmount < 100}
              variant="cta"
              className="flex-1 disabled:opacity-50"
            >
              {isInvesting ? "Processing Investment..." : `Invest €${investmentAmount.toLocaleString()}`}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
