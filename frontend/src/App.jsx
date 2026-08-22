import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home/Home";
import HousesMenu from "./pages/Houses/HousesMenu";
import CustomerList from "./pages/Customers/CustomerList";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/houses" element={<HousesMenu />} />
        <Route path="/customers" element={<CustomerList />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;