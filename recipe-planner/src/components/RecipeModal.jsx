import React, {useState} from "react";
import { useRecipe } from "../context/RecipeContext";
import Spinner from "./Spinner";
import { FaYoutube } from 'react-icons/fa';
// import { getLLMInstructions } from "../api/llmService"; 

export default function RecipeModal() {
  const { selectedMeal, mealDetails, llmOutput, modalLoading, llmLoading, runLLM, closeModal, setLLMOutput  } = useRecipe();
  const [missing, setMissing] = useState('');

  if (!selectedMeal) return null;


  const buildBasePrompt = (details) => {
    const ingredients = Array.from({ length: 20 })
      .map((_, i) => {
        const ing = details[`strIngredient${i+1}`];
        const meas = details[`strMeasure${i+1}`];
        return ing && ing.trim() ? `${meas ? meas + ' ' : ''}${ing}` : null;
      })
      .filter(Boolean)
      .join(', ');
    return `Title: ${details.strMeal}\nIngredients: ${ingredients}\nOriginal instructions: ${details.strInstructions}`;
  };

  const handleSimplifyFor = async (minutes) => {
    if (!mealDetails) return;
    setLLMOutput(''); 
    const base = buildBasePrompt(mealDetails);
    const prompt = `${base}

    INSTRUCTIONS:
    Convert the recipe into ONLY numbered steps. Provide between 8 and 10 steps .
    Each step must be one short sentence on its own line, starting with "1." "2." etc.
    Include an estimated duration for EACH step in parentheses, e.g. (5 min).
    The sum of all estimated durations should be approximately ${minutes} minutes.
    If a step can be shortened, include a single-line shortcut in square brackets immediately after that step (e.g. [Shortcut: use canned tomatoes]).
    You can include intro text, headings, commentary, or explanations for user interactive response`;

    const opts = { temperature: 0.6, max_tokens: 2000 };
    try {
      await runLLM(prompt, opts); 
    } catch (e) {
      setLLMOutput(`LLM error: ${e.message || e}`);
    }
  };

  const handleSubstitute = async () => {
    // if (!mealDetails || !missing.trim()) {
    //   await runLLM('Please provide a valid missing ingredient to suggest substitutes.');
    //   return;
    // }
    if (!mealDetails || !missing.trim()) {
      setLLMOutput('Please enter a missing ingredient or your query to suggest.');
      return;
    }
    setLLMOutput('');

    const base = buildBasePrompt(mealDetails);

    const prompt = `${base}
      INSTRUCTIONS:
      User is missing "${missing.trim()}" or has got this query "${missing.trim()}".
      Suggest 3 practical substitutes (if it is missing item) or solutions to query specifically for this recipe.
      Output ONLY a numbered list (1., 2., 3.). For each item include:
      - substitute ingredient or answer to asked query,
      - approximate quantity to use,
      - one short note about taste/texture/when to use it.
      Add interactive response.`;
    
    const opts = { temperature: 0.6, max_tokens: 1200 };
    try {
      await runLLM(prompt, opts);
    } catch (e) {
      setLLMOutput(`LLM error: ${e.message || e}`);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black bg-opacity-40 flex justify-center items-start pt-10 overflow-auto"
      onClick={(e) => e.target === e.currentTarget && closeModal()}
    >
      <div className="bg-white rounded-lg max-w-3xl w-full p-6 relative shadow-lg transform transition-transform animate-fade-in">
        <button
          onClick={closeModal}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 font-bold text-lg"
        >
          &times;
        </button>

        {modalLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Spinner size={32} />
            <p className="mt-3 text-gray-600">Loading recipe...</p>
          </div>
        ) : mealDetails ? (
          <>
            <h2 className="text-2xl font-bold mb-3">{mealDetails.strMeal}</h2>
            <img src={mealDetails.strMealThumb} alt={mealDetails.strMeal} className="w-full h-64 object-cover rounded mb-4" />

            <div className="mb-4">
              <h3 className="font-semibold">Ingredients</h3>
              <ul className="list-disc list-inside text-sm">
                {Array.from({ length: 20 }).map((_, i) => {
                  const ing = mealDetails[`strIngredient${i+1}`];
                  const meas = mealDetails[`strMeasure${i+1}`];
                  if (ing && ing.trim()) return <li key={i}>{meas} {ing}</li>;
                  return null;
                })}
              </ul>
            </div>

            {/* <div className="mb-4">
              <h3 className="font-semibold">Instructions (raw)</h3>
              <p className="text-sm whitespace-pre-wrap">{mealDetails.strInstructions}</p>
            </div> */}
            <div className="mb-4">
              <h3 className="font-semibold">Basic Instructions</h3>
              <div className="text-sm">
                {(mealDetails?.strInstructions || '')
                  .replace(/\.\s*/g, '.\n')   // insert newline after every dot
                  .split(/\n/)               // split into lines
                  .map(l => l.trim())        // trim whitespace
                  .filter(Boolean)           // drop empty lines
                  .map((line, i) => (
                    <p key={i} className="mb-1 whitespace-pre-line">{line}</p>
                  ))
                }
              </div>
            </div>

            <div className="mb-4 mt-2">
              <h3 className="font-semibold text-2xl">Want to cook faster || get steps here to cook in :</h3>
              <div className="flex gap-2 mb-3 mt-3 p-4">
                <button onClick={()=>handleSimplifyFor(15)} className="px-3 py-1 bg-blue-600 text-white rounded">15 min</button>
                <button onClick={()=>handleSimplifyFor(30)} className="px-3 py-1 bg-blue-600 text-white rounded">30 min</button>
                <button onClick={()=>handleSimplifyFor(45)} className="px-3 py-1 bg-blue-600 text-white rounded">45 min</button>
                <button onClick={()=>handleSimplifyFor(60)} className="px-3 py-1 bg-blue-600 text-white rounded">60 min</button>
              </div>

              {/* <div className="mb-3 flex gap-2 items-center">
                <input placeholder="missing ingredient (e.g., eggs)" value={missing} onChange={(e)=>setMissing(e.target.value)} className="p-2 border rounded flex-1" />
                <button onClick={handleSubstitute} className="px-3 py-1 bg-green-600 text-white rounded">Suggest substitutes</button>
              </div> */}
              <div className="mb-4">
                <h3 className="text-xl text-black mb-3 px-2">
                  Forgot something? Need alternatives? Drop your any query and we’ll find the best match for your dish!
                </h3>

                <div className="mb-3 flex gap-2 items-center">
                  <input
                    placeholder="Missing ingredient or Got any Query || Type here"
                    value={missing}
                    onChange={(e) => setMissing(e.target.value)}
                    className="p-5 text-base border rounded h-16 w-4/5"
                  />
                  <button
                    onClick={() => {
                      handleSubstitute(missing);    
                      setMissing('');           
                    }}
                    className="h-16 px-5 bg-green-600 text-white rounded text-base"
                  >
                    Search
                  </button>
                </div>
              </div>

              {llmLoading ? (
                <div className="flex items-center gap-2 text-sm text-gray-600"><Spinner size={18} /> Processing...</div>
              ) : (
                <pre className="whitespace-pre-wrap bg-gray-50 p-3 rounded text-sm">{llmOutput || 'Use the buttons above to generate stepwise instructions or search any query.'}</pre>
              )}
            </div>



            {/* <div className="mb-4">
              <h3 className="font-semibold mb-1">Instructions:</h3>
              {llmLoading ? (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Spinner size={20} /> Processing...
                </div>
              ) : (
                <pre className="text-sm whitespace-pre-wrap">{llmOutput || mealDetails.strInstructions}</pre>
              )}
            </div>

            <div className="flex gap-2 mb-4">
              <button onClick={() => handleLLMClick("time15")} className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition">15 min</button>
              <button onClick={() => handleLLMClick("time30")} className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition">30 min</button>
              <button onClick={() => handleLLMClick("time60")} className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition">60 min</button>
              <button onClick={() => handleLLMClick("substitute")} className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition">Suggest substitutes</button>
            </div> */}

            {/* <div className="mb-4">
              <h3 className="font-semibold mb-1">Instructions (LLM-simplified):</h3>
              <pre className="text-sm whitespace-pre-wrap">{llmOutput}</pre>
            </div> */}

            {mealDetails.strYoutube && (
              <a
                href={mealDetails.strYoutube}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-red-600 font-semibold hover:text-red-700 hover:underline mt-4"
              >
                <FaYoutube size={20} /> 
                Watch on YouTube
              </a>
            )}
          </>
        ) : (
          <p className="text-red-500">No details found.</p>
        )}
      </div>
    </div>
  );
}
