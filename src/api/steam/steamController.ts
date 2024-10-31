import { Request, Response } from "express";
import { env } from "@/common/utils/envConfig";
import TokenModel from "../../database/TokenModel";

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

public verify = async (req: Request, res: Response) => {
  const { token } = req.params;

  try {
    const tokenData = await TokenModel.findOne({ token });
    if (!tokenData) {
      console.log("Token not found or expired:", token); // Log token issues
      return res.status(401).send("Invalid or expired token.");
    }

    // Set discordId in session and delete token to prevent reuse
    req.session.discordId = tokenData.discordId;
    await TokenModel.deleteOne({ token });

    const redirectUri = `https://${env.HOST}/steam/auth/steam`;
    res.redirect(redirectUri);
  } catch (error) {
    console.error("Error verifying token:", error); // Detailed logging
    res.status(500).send("Internal server error.");
  }
};

  public logout = (req: SteamRequest, res: Response) => {
    req.logout?.(); 
    req.session.destroy(() => { 
      res.redirect("/");
    });
  };
}

export default new SteamAuthController();
