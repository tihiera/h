import React from "react";
import PersonCard from "./PersonCard";

export default function PeopleGrid({ people }) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {people.map(p => <PersonCard key={p.id} person={p} />)}
    </div>
  );
}
