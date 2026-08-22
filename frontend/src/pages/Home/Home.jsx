import "../../styles/home.css";
import { useNavigate } from "react-router-dom";

function Home(){
  
     const navigate=useNavigate()
     return(

                <div className="home-container">
                        <div className="home-copy">
                            <p className="eyebrow">Property operations, made clear</p>
                            <h1>Find the right<br /><em>place to belong.</em></h1>
                            <p className="home-intro">A bright, focused workspace for managing homes, owners, areas, and the people looking for their next address.</p>
                        </div>
                        <div className="home-actions">
                            <button onClick={()=> navigate("/houses")}>Browse houses <span>↗</span></button>
                            <button className="secondary-button" onClick={()=>navigate("/customers")}>Manage customers <span>↗</span></button>
                        </div>
                        <div className="home-stamp"><strong>RH</strong><span>Rental<br />House System</span></div>
        </div>
     );
    }

    export default Home;
