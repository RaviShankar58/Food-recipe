import RecipeModal from "../components/RecipeModal";
import SearchBar from "../components/SearchBar";
import RecipeGrid from "../components/RecipeGrid";
import Spinner from "../components/Spinner";
import { useRecipe } from "../context/RecipeContext";

export default function Home() {
  const { meals, loading, err, favorites, lastQuery, doSearch, toggleFav, openMeal } = useRecipe();

  return (
    <>
    <div className="min-h-screen bg-gray-600 p-6">
        <div className="max-w-5xl mx-auto">
            <header className="mb-6">
              <div className="max-w-2xl mx-auto text-center">
                <h1
                  className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white drop-shadow-md"
                  aria-label="Taylor's Recipe Ideas"
                >
                  RAVI's Recipe Ideas
                </h1>

                <p className="mt-3 text-lg sm:text-xl text-white/90">
                  Search by name or ingredient — get AI step-by-step guides and smart substitutes.
                </p>

                <p className="mt-2 text-sm text-white/70">
                  Quick, delicious ideas for every kitchen.
                </p>

                <div className="mt-5 mx-auto w-20 h-1 rounded-full bg-gradient-to-r from-primary to-blue-400" />
              </div>
            </header>

            <SearchBar onSearch={doSearch} />

            <div className="mt-4">
            {loading && (
                <div className="flex items-center gap-3 text-sm text-gray-600">
                <Spinner size={20} />
                <span>Searching {lastQuery ? `for "${lastQuery}"` : ''}…</span>
                </div>
            )}

            {err && <p className="text-red-500 mt-3">{err}</p>}

            <RecipeGrid meals={meals} onOpen={openMeal} onToggleFav={toggleFav} favorites={favorites} />
            </div>

            <section className="mt-8">
            <h2 className="text-2xl text-white font-semibold">Saved</h2>
            <div className="mt-3">
                {favorites.length === 0 ? (
                <p className="text-xl text-white">
                    No saved recipes yet. Save favorites from the results.
                </p>
                ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {favorites.map(f => (
                    <div key={f.idMeal} className="bg-white rounded-lg p-2 card-shadow overflow-hidden">
                        <img src={f.strMealThumb} alt={f.strMeal} className="w-full h-24 object-cover rounded" />
                        <p className="mt-1 text-sm font-medium">{f.strMeal}</p>
                        <div className="flex gap-2 mt-2">
                        <button onClick={() => openMeal(f)} className="text-xs px-2 py-1 border rounded">Open</button>
                        <button onClick={() => toggleFav(f)} className="text-xs px-2 py-1 border rounded">Remove</button>
                        </div>
                    </div>
                    ))}
                </div>
                )}
            </div>
            </section>
        </div>
    </div>


    <RecipeModal />
    
    </>
    
  );
}
