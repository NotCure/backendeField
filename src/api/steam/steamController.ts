import { Request, Response } from "express";
import { env } from "@/common/utils/envConfig";

interface SteamRequest extends Request {
  user?: {
    steamid: string;
    username: string;
  };
  logout?: () => void;
}

declare module "express-session" {
  interface SessionData {
    discordId?: string;
  }
}

class SteamAuthController {
  public login = (_req: Request, res: Response) => {
    res.send("Redirecting to Steam login...");
  };

  public steamCallback = (req: SteamRequest, res: Response) => {
      console.log("Session in steamCallback route:", req.session); // Log session here

    if (req.user && req.session.discordId) { // Ensure Steam and Discord IDs are both in session
      const steamId = req.user.steamid;
      const steamName = req.user.username;
      const discordId = req.session.discordId;

      res.redirect(
        `${env.FRONTEND}/verify/complete?steamId=${steamId}&steamName=${steamName}&discordId=${discordId}`
      );
    } else {
      res.status(400).send("Authentication failed. Please try again.");
    }
  };

  public verify = (req: Request, res: Response) => {
    const { discordId } = req.params;
    req.session.discordId = discordId; 
    const redirectUri = `https://${env.HOST}/steam/auth/steam`; 
    res.redirect(redirectUri);
  };
  public logout = (req: SteamRequest, res: Response) => {
    req.logout?.(); 
    req.session.destroy(() => { 
      res.redirect("/");
    });
  };
}

export default new SteamAuthController();
