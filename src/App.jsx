import MapComponent from "./components/MapComponent";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <div className="App">
      <MapComponent />
      <Toaster position="top-center" reverseOrder={false} />
    </div>
  );
}

export default App;
