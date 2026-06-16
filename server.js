import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";
import fs from "fs";
dotenv.config();
const app=express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));
const PORT=process.env.PORT||10000;
const delay=(ms)=>new Promise(r=>setTimeout(r,ms));
function saveLog(entry){const file="./logs/transactions.json";let logs=[];try{logs=JSON.parse(fs.readFileSync(file));}catch{} logs.push(entry);fs.writeFileSync(file,JSON.stringify(logs,null,2));}
app.post("/api/bulk-stk",async(req,res)=>{try{const {numbers,amount,reference}=req.body;const results=[];for(const phone of numbers){try{const response=await axios.post("https://paywavexpress.co.ke/v1/stkpush",{api_key:process.env.API_KEY,email:process.env.EMAIL,amount,msisdn:phone,reference});const result={phone,success:true,response:response.data,timestamp:new Date().toISOString()};results.push(result);saveLog(result);}catch(error){const result={phone,success:false,error:error.response?.data||error.message,timestamp:new Date().toISOString()};results.push(result);saveLog(result);}await delay(2000);}res.json({success:true,total:results.length,results});}catch(error){res.status(500).json({success:false,message:error.message});}});
app.listen(PORT,()=>console.log(`Server running on ${PORT}`));
