import { Request, RequestHandler, Response } from "express";
import { freeAgentService } from "@/api/freeagent/freeAgentService";
import { handleServiceResponse } from "@/common/utils/httpHandlers";
import { StatusCodes } from "http-status-codes";
import axios from "axios";
import { env } from "@/common/utils/envConfig";

const LOG_TYPES = {
  ALTS_DETECTION: 1,          
  DISCORD_LINKS_NEW_STEAM: 3,   
  VERIFICATION_SUCCESS: 2,
};

class FreeAgentController {

  public createFreeAgent: RequestHandler = async (req: Request, res: Response) => {
    const { discordId, steamName, steamProfileLink, steamId } = req.body;
    console.log("Session in createFreeAgent route:", req.session);

    const sessionDiscordId = req.session.discordId;
    if (!sessionDiscordId) {
      return res.status(401).json({ message: "Unauthorized: No Discord session found." });
    }
    if (req.body.discordId !== sessionDiscordId) {
      return res.status(403).json({ message: "Forbidden: Discord ID mismatch." });
    }
    
    if (isNaN(Number(discordId))) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Discord ID must be a numeric string",
        responseObject: null,
        statusCode: StatusCodes.BAD_REQUEST,
      });
    }

    if (isNaN(Number(steamId))) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Steam ID must be a numeric string",
        responseObject: null,
        statusCode: StatusCodes.BAD_REQUEST,
      });
    }

    const discordLookupUrl = `https://discordlookup.mesalytic.moe/v1/user/${discordId}`;
    const response = await axios.get(discordLookupUrl);
    const discordUsername = response.data.username;

    const existingByDiscordId = await freeAgentService.findByDiscordId(discordId);
    if (existingByDiscordId.success) {
      await this.sendToBotLog(
        discordId,
        steamId,
        steamName,
        discordUsername,
        existingByDiscordId.responseObject.steamId, 
        existingByDiscordId.responseObject.steamName,
        existingByDiscordId.responseObject.discordId,
        LOG_TYPES.DISCORD_LINKS_NEW_STEAM  // New log type here
      );
    
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: `This Discord account (${discordUsername}) is already linked to Steam ID: ${existingByDiscordId.responseObject.steamName} | ${existingByDiscordId.responseObject.steamId}. You can't verify.`,
        responseObject: null,
        statusCode: StatusCodes.BAD_REQUEST,
      });
    }

    const existingBySteamId = await freeAgentService.findBySteamId(steamId);
    if (existingBySteamId.success) {
      const existingDiscordId = existingBySteamId.responseObject.discordId;
      const existingDiscordUsername = (await axios.get(`https://discordlookup.mesalytic.moe/v1/user/${existingDiscordId}`)).data.username;
    
      await this.sendToBotLog(
        discordId,
        steamId,
        steamName,
        discordUsername,
        existingBySteamId.responseObject.steamId, 
        existingBySteamId.responseObject.steamName,
        existingDiscordUsername,
        LOG_TYPES.ALTS_DETECTION  // Keep original log type here
      );
    
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: `This Steam account (${existingBySteamId.responseObject.steamName}) is already linked to Discord User: ${existingDiscordUsername} | ${existingBySteamId.responseObject.discordId}. You can't verify.`,
        responseObject: null,
        statusCode: StatusCodes.BAD_REQUEST,
      });
    }

    const serviceResponse = await freeAgentService.createFreeAgent(discordId, steamName, steamProfileLink, steamId);
    if (serviceResponse.success) {
      try {
        await axios.post(`https://efield.onrender.com/assign-role`, {
          discordId,
          roleId: '1297239782853836972',
        });

        await this.sendToBotLog(
          discordId,
          steamId,
          steamName,
          discordUsername,
          null, 
          null, 
          null,
          LOG_TYPES.VERIFICATION_SUCCESS
        );
      } catch (error) {
        console.error('Error assigning role via bot:', error);
        return res.status(500).json({ message: 'Failed to assign role on Discord' });
      }
    }

    return handleServiceResponse(serviceResponse, res);
  };

  private async sendToBotLog(
    discordId: string,
    steamId: string,
    steamName: string,
    discordUsername: string,
    oldSteamId: string | null,
    oldSteamName: string | null,
    oldDiscordUsername: string | null,
    logType: number
  ) {
    try {
      await axios.post(`https://efield.onrender.com/send-log`, {
        discordId,
        steamId,
        steamName,
        discordUsername,
        oldSteamId, 
        oldSteamName, 
        oldDiscordUsername,
        logType,
      });
    } catch (error) {
      console.error(`Failed to send log message to bot: ${error}`);
    }
  }

  public getFreeAgents: RequestHandler = async (_req: Request, res: Response) => {
    const serviceResponse = await freeAgentService.getAllFreeAgents();
    return handleServiceResponse(serviceResponse, res);
  };

  public getFreeAgentByDiscordId: RequestHandler = async (req: Request, res: Response) => {
    const { discordId } = req.params;
    if (isNaN(Number(discordId))) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Discord ID must be a numeric string",
        responseObject: null,
        statusCode: StatusCodes.BAD_REQUEST,
      });
    }

    const serviceResponse = await freeAgentService.findByDiscordId(discordId);
    return handleServiceResponse(serviceResponse, res);
  };

  public getFreeAgentBySteamId: RequestHandler = async (req: Request, res: Response) => {
    const { steamId } = req.params;
    if (isNaN(Number(steamId))) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Steam ID must be a numeric string",
        responseObject: null,
        statusCode: StatusCodes.BAD_REQUEST,
      });
    }

    const serviceResponse = await freeAgentService.findBySteamId(steamId);
    return handleServiceResponse(serviceResponse, res);
  };
}

export const freeAgentController = new FreeAgentController();
