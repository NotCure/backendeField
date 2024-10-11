import express, { Router, Request, Response } from "express";
import { freeAgentController } from "@/api/freeagent/freeAgentController";

const freeAgentRouter: Router = express.Router();

freeAgentRouter.post("/create", freeAgentController.createFreeAgent);
freeAgentRouter.get("/", freeAgentController.getFreeAgents);
freeAgentRouter.get("/discord/:discordId", freeAgentController.getFreeAgentByDiscordId);
freeAgentRouter.get("/steam/:steamId", freeAgentController.getFreeAgentBySteamId);

// New verification route for Discord ID
freeAgentRouter.get('/verify/:discordId', async (req: Request, res: Response) => {
    const { discordId } = req.params;
    const redirectUri = `http://localhost:3000/verify/${discordId}`; // Or replace with your frontend URL
    // Redirect to the Steam login/verification page
    res.redirect(redirectUri);
});

export default freeAgentRouter;
