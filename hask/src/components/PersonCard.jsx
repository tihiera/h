import React from "react";
import Card from "./Card";
import Badge from "./Badge";
import Button from "./Button";

export default function PersonCard({ person }) {
  return (
    <Card className="overflow-hidden">
      <div className="aspect-[16/9] bg-gray-100">
        <img src={person.image} alt="" className="w-full h-full object-cover" />
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold truncate">{person.name}</h3>
          <Badge>{person.confidence}%</Badge>
        </div>
        <p className="subtitle mt-1 line-clamp-2">{person.tagline}</p>
        <div className="mt-3 text-sm flex items-center justify-between">
          <span className="text-gray-500">Price</span>
          <span className="font-medium">€{person.price.toLocaleString()}</span>
        </div>
        <Button className="w-full mt-4" onClick={()=>{ /* hook to invest flow */ }}>
          Invest
        </Button>
      </div>
    </Card>
  );
}
