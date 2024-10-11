import express, { Router } from "express";
import steamAuthController from "@/api/steam/steamController"; // Adjust path accordingly
import steam from "steam-login";

const steamRouter: Router = express.Router();

// Middleware for Steam
steamRouter.use(
  steam.middleware({
    realm: "http://localhost:8080/", // Your backend URL
    verify: "http://localhost:8080/steam/auth/steam/return", // The callback route after Steam login
    apiKey: process.env.STEAM_API_KEY!, // Your Steam API key
  })
);

// Steam login route
steamRouter.get("/auth/steam", steam.authenticate(), steamAuthController.login);

// Steam callback route after successful Steam login
steamRouter.get("/auth/steam/return", steam.verify(), steamAuthController.steamCallback);

// Route for initial verification with Discord ID
steamRouter.get("/verify/:discordId", steamAuthController.verify);

// Steam logout route
steamRouter.get("/auth/logout", steam.enforceLogin("/"), steamAuthController.logout);

export default steamRouter;
