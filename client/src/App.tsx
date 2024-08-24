import { Outlet } from "react-router-dom";

function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Outlet />
    </div>
  );
}

export default App;
