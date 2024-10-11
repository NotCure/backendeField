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

  // Callback route after successful Steam authentication
  public steamCallback = (req: SteamRequest, res: Response) => {
    if (req.user) {
      const steamId = req.user.steamid;
      const steamName = req.user.username;
      const discordId = req.session.discordId; // Get Discord ID from session
      console.log(`1 - Discord ID stored in session: ${discordId}`);

      if (!discordId) {
        return res.status(400).send("Discord ID is missing.");
      }

      res.redirect(
        `https://${env.HOST}/verify/complete?steamId=${steamId}&steamName=${steamName}&discordId=${discordId}`
      );
    } else {
      res.redirect("/login-failed");
    }
  };

  public verify = (req: Request, res: Response) => {
    const { discordId } = req.params;
    req.session.discordId = discordId; 
    console.log(`2 - Discord ID stored in session: ${discordId}`);
    console.log(`Session content: ${JSON.stringify(req.session)}`); // Log session contents
    const redirectUri = `https://${env.HOST}/steam/auth/steam`; // Correct URL
    res.redirect(redirectUri);
  };
  public logout = (req: SteamRequest, res: Response) => {
    req.logout?.(); // Optional chaining to ensure logout is a function
    res.redirect("/");
  };
}

export default new SteamAuthController();
