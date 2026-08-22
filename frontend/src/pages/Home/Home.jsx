import "../../styles/home.css";
import { useNavigate } from "react-router-dom";

function Home(){
  
     const navigate=useNavigate()
     return(

        <div className="home-container ">
            <h1>RENTAL HOUSE SYSTEM</h1>
            <button onClick={()=> navigate("/houses")}>HOUSES</button>
            <button onClick={()=>navigate("/customers")}>CUSTOMERS</button>
        </div>
     );
    }

    export default Home;
