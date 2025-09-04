import React from "react";
import Card from "./Card";
import Avatar from "./Avatar";
import Badge from "./Badge";

export default function ProfileHero({ me }) {
  return (
    <Card className="overflow-hidden">
      <div className="aspect-[21/7] w-full bg-gray-100">
        <img src={me.banner} alt="" className="w-full h-full object-cover" />
      </div>
      <div className="p-5 flex items-start gap-4">
        <Avatar src={me.avatar} alt={me.name} size={64} />
        <div className="min-w-0">
          <h3 className="text-xl font-semibold">{me.name}</h3>
          <p className="subtitle mt-1">{me.headline}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge>{me.coverage}</Badge>
            <Badge tone="neutral">Region: {me.region}</Badge>
          </div>
          <p className="mt-4 text-sm text-gray-700">{me.bio}</p>
        </div>
      </div>
    </Card>
  );
}
