import React from 'react';

export default function RecipeCard({ meal, onOpen, onToggleFav, isFav }) {

  return (
    <div
      className="bg-white rounded-lg card-shadow overflow-hidden transform transition hover:scale-105"
      role="article"
    >
      <div className="w-full h-44 overflow-hidden">
        <img
          src={meal.strMealThumb}
          alt={meal.strMeal}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>

      <div className="p-3">
        <h3 className="font-semibold text-sm">{meal.strMeal}</h3>
        <p className="text-xs text-gray-400">ID: {meal.idMeal}</p>

        <div className="mt-3 flex justify-between items-center gap-2">
          <button
            onClick={() => onOpen(meal)}
            className="text-xs px-3 py-1 border rounded-md hover:bg-yellow-200 transition"
          >
            Open
          </button>

          <button
            onClick={() => onToggleFav(meal)}
            className={`text-xs px-3 py-1 hover:bg-yellow-200 rounded-md transition ${isFav ? 'bg-yellow-200' : 'bg-gray-100'}`}
            aria-pressed={isFav}
          >
            {isFav ? 'Saved' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
