import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home/Home";
import HousesMenu from "./pages/Houses/HousesMenu";
import HouseList from "./pages/Houses/HouseList";
import CustomerList from "./pages/Customers/CustomerList";
import HouseDetails from "./pages/Houses/HouseDetails";
import HouseForm from "./pages/Houses/HouseForm";
import OwnerList from "./pages/Owners/OwnerList";
import Areas from "./pages/Areas/Areas";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/houses" element={<HousesMenu />} />

        <Route path="/houses/list" element={<HouseList />} />

        <Route path="/customers" element={<CustomerList />} />
        <Route  path="/houses/details/:id"  element={<HouseDetails />}/>
        <Route path="/houses/add" element={<HouseForm />} />
        <Route path="/houses/edit" element={<HouseForm />} />
        <Route path="/owners" element={<OwnerList />} />
        <Route path="/areas" element={<Areas />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;