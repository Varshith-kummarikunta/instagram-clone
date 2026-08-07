const express=require("express");
const {searchUsers}=require("../controllers/search.controller");


const searchRouter=express.Router();


searchRouter.get("/",searchUsers);


module.exports={
    searchRouter
};