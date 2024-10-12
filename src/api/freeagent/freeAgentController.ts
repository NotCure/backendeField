import { Request, RequestHandler, Response } from "express";
import { freeAgentService } from "@/api/freeagent/freeAgentService";
import { handleServiceResponse } from "@/common/utils/httpHandlers";
import { StatusCodes } from "http-status-codes";
import axios from "axios";
import { env } from "@/common/utils/envConfig";

class FreeAgentController {

  public createFreeAgent: RequestHandler = async (req: Request, res: Response) => {
    const { discordId, steamName, steamProfileLink, steamId } = req.body;

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
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: `This discord account ( ${discordUsername} ) is already linked to Steam ID: ${existingByDiscordId.responseObject.steamName} | ${existingByDiscordId.responseObject.steamId}. You can't verify.`,
        responseObject: null,
        statusCode: StatusCodes.BAD_REQUEST,
      });
    }

    const existingBySteamId = await freeAgentService.findBySteamId(steamId);
    if (existingBySteamId.success) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: `This Steam account is ( ${existingByDiscordId.responseObject.steamName} ) already linked to Discord User: ${discordUsername} | ${existingBySteamId.responseObject.discordId}. You can't verify.`,
        responseObject: null,
        statusCode: StatusCodes.BAD_REQUEST,
      });
    }

    const serviceResponse = await freeAgentService.createFreeAgent(discordId, steamName, steamProfileLink, steamId);

    if (serviceResponse.success) {
      try {
        await axios.post(`${env.BOT}/assign-role`, {
          discordId,
          roleName: 'Free Agent',
        });
      } catch (error) {
        console.error('Error assigning role via bot:', error);
        return res.status(500).json({ message: 'Failed to assign role on Discord' });
      }
    }
    return handleServiceResponse(serviceResponse, res);
  };

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
