import Home from "./pages/Home";
import { RecipeProvider } from "./context/RecipeContext";

export default function App() {
  return (
    <RecipeProvider>
      <Home />
    </RecipeProvider>
  );
}
