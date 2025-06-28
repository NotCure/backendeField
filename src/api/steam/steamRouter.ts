import express, { Router } from "express";
import steamAuthController from "@/api/steam/steamController"; 
import steam from "steam-login";
import { env } from "@/common/utils/envConfig";

const steamRouter: Router = express.Router();

steamRouter.use(
  steam.middleware({
    realm: "https://backendefield.onrender.com/", 
    verify: `https://backendefield.onrender.com/steam/auth/steam/return`, 
    apiKey: process.env.STEAM_API_KEY!
  })
);

steamRouter.get("/auth/steam", steam.authenticate(), steamAuthController.login);

steamRouter.get("/auth/steam/return", steam.verify(), steamAuthController.steamCallback);

steamRouter.get("/verify/:token", steamAuthController.verify);


steamRouter.get("/auth/logout", steam.enforceLogin("/"), steamAuthController.logout);

export default steamRouter;
