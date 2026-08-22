require("dotenv").config();
const express=require("express");
const cors=require("cors");
const db=require("./config/db");

const app=express();

app.use(cors());
app.use(express.json());
const regionRouter=require("./routes/regionRoutes");
app.get("/",async(req,res)=>{
        try{

            const [row]= await db.query("select region_id, region_name from regions where region_id>?",
                [1]
            )
            row.forEach(region => {
                console.log(region.region_name);
                });
            res.json({message:"Database connected successfully",
                result:row.map(x=>x.region_name)
            });
        }
        catch(err){
            console.error(err);
            res.status(500).json({message:"Database connection failed",
                error:err.message
            });
        }

});
app.use("/regions", regionRouter);
const streetRoutes = require("./routes/streetRoutes");

app.use("/streets", streetRoutes);


const houseRoutes = require("./routes/houseRoutes");

app.use("/houses", houseRoutes);



const customerRoutes = require("./routes/customerRoutes");

app.use("/customers", customerRoutes);

const ownerRoutes = require("./routes/ownerRoutes");

app.use("/owners", ownerRoutes);
const Port=process.env.PORT || 5000;
app.listen(Port,()=>{console.log(`server is running in port ${Port}`);

});