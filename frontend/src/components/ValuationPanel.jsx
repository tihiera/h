import React from "react";
import Card from "./Card";
import Badge from "./Badge";

export default function ValuationPanel({ valuation, confidence, coverage, notes }) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold">Worth</h4>
        <Badge>{confidence}% confidence</Badge>
      </div>
      <div className="mt-4">
        <p className="subtitle">Estimated Value</p>
        <p className="text-3xl font-semibold">€{valuation.toLocaleString()}</p>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="subtitle">Data Coverage</p>
          <p className="font-medium">{coverage}</p>
        </div>
        <div>
          <p className="subtitle">Last Update</p>
          <p className="font-medium">Just now</p>
        </div>
      </div>
      {notes && <p className="text-sm text-gray-600 mt-4">{notes}</p>}
      <button className="mt-5 w-full rounded-lg border border-gray-300 py-2 text-sm hover:bg-gray-50">
        Improve confidence
      </button>
    </Card>
  );
}
