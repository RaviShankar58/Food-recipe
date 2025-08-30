import React from 'react';
import RecipeCard from './RecipeCard';

export default function RecipeGrid({ meals, onOpen, onToggleFav, favorites }) {
  if (!meals) return null;
  if (meals.length === 0) return <p className="text-center text-white text-xl mt-6">No recipes yet — try searching an ingredient.</p>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-8">
      {meals.map((m) => (
        <RecipeCard
          key={m.idMeal}
          meal={m}
          onOpen={onOpen}
          onToggleFav={onToggleFav}
          isFav={!!favorites.find(f => f.idMeal === m.idMeal)}
        />
      ))}
    </div>
  );
}
