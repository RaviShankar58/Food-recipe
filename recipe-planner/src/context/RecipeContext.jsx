import { createContext, useContext, useState } from "react";
import { useLocalStorage } from "../utils/localStorage.js";
import { searchByIngredient } from "../api/mealdb";
import { fetchMealDetails } from "../api/mealdb";
import { getLLMInstructions  } from "../api/llmService"; 

const RecipeContext = createContext();

export function RecipeProvider({ children }) {
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [favorites, setFavorites] = useLocalStorage('favRecipes', []);
  const [lastQuery, setLastQuery] = useState('');

  // modals state
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [mealDetails, setMealDetails] = useState(null);
  const [llmOutput, setLLMOutput] = useState('');
  const [modalLoading, setModalLoading] = useState(false);
  const [llmLoading, setLLMLoading] = useState(false);

  const doSearch = async (ingredient) => {
    setErr('');
    setLoading(true);
    setMeals([]);
    setLastQuery(ingredient);
    try {
      const results = await searchByIngredient(ingredient);
      setMeals(results);
      if (!results || results.length === 0) {
        setErr(`No recipes found for "${ingredient}". Try another ingredient.`);
      }
    } catch (e) {
      setErr(e.message || 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  const toggleFav = (meal) => {
    const exists = favorites.find(f => f.idMeal === meal.idMeal);
    if (exists) {
      setFavorites(favorites.filter(f => f.idMeal !== meal.idMeal));
    } else {
      setFavorites([meal, ...favorites]);
    }
  };

  // reusable LLM runner for prompts used by modal buttons or initial fetch
  const runLLM = async (prompt, opts = {}) => {
    setLLMLoading(true);
    try {
      const text = await getLLMInstructions(prompt, opts);
      setLLMOutput(text);
      return text;
    } catch (e) {
      const msg = `LLM error: ${e.message || e}`;
      setLLMOutput(msg);
      return msg;
    } finally {
      setLLMLoading(false);
    }
  };

  // open modal & fetch details
  const openMeal = async (meal) => {
    setSelectedMeal(meal);
    setModalLoading(true);
    setMealDetails(null);
    setLLMOutput('');
    try {
      const details = await fetchMealDetails(meal.idMeal);
      if (!details) throw new Error('No details found');
      setMealDetails(details);

      // initial LLM simplification (uses real LLM helper)
      // const initialPrompt = `You are a friendly cooking assistant. Convert the following recipe instructions into a concise numbered list (max 8 steps) for a busy home cook. Mention prep steps and estimate total time.\n\nTitle: ${details.strMeal}\n\nInstructions:\n${details.strInstructions}`;
      // const llmResult = await getLLMInstructions(initialPrompt);
      // setLLMOutput(llmResult);

      // OPTIONAL: initial quick simplification on open (comment out if you prefer user-initiated)
      // const initialPrompt = `Convert this into a concise numbered list (max 8 steps)... Title: ${details.strMeal} Instructions:${details.strInstructions}`;
      // await runLLM(initialPrompt, { temperature: 0.2, max_tokens: 450 });

    } catch (e) {
      setErr('Failed to load recipe details');
    } finally {
      setModalLoading(false);
    }
  };

  const closeModal = () => {
    setSelectedMeal(null);
    setMealDetails(null);
    setLLMOutput('');
  };

  return (
    <RecipeContext.Provider value={{ 
      meals, 
      loading, 
      err, 
      favorites, 
      lastQuery, 
      selectedMeal,
      mealDetails,
      llmOutput,
      modalLoading,
      llmLoading,
      doSearch, 
      toggleFav, 
      openMeal,
      closeModal,
      runLLM,
      setLLMOutput,//optional
      }}>
      {children}
    </RecipeContext.Provider>
  );
}

export const useRecipe = () => useContext(RecipeContext);
