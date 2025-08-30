export async function searchByIngredient(ingredient) {

  if (!ingredient || !ingredient.trim()) return [];

  const ingridientToSearch = encodeURIComponent(ingredient.trim());

  const url = `https://www.themealdb.com/api/json/v1/1/filter.php?i=${ingridientToSearch}`;

  const res = await fetch(url);

  if (!res.ok) throw new Error('Ingredient search failed from TheMealdb');

  const data = await res.json();

  return data.meals || [];
}

export async function fetchMealDetails(id) {
  if (!id) throw new Error('Missing meal id');

  const url = `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${encodeURIComponent(id)}`;

  const res = await fetch(url);

  if (!res.ok) throw new Error('Failed to fetch meal details');

  const data = await res.json();
  
  return data.meals?.[0] ?? null;
}