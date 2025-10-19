import { Outlet } from "react-router-dom";

function App() {
  return (
    <div className="min-h-screen bg-neutral-950 text-white/90">
      <Outlet />
    </div>
  );
}

export default App;
