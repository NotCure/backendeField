import { StatusCodes } from "http-status-codes";
import FreeAgent from "@/database/freeAgentModel";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { logger } from "@/server";

export class FreeAgentService {

  async createFreeAgent(discordId: string, steamName: string, steamProfileLink: string, steamId: string): Promise<ServiceResponse<any>> {
    try {
      const freeAgent = new FreeAgent({ discordId, steamName, steamProfileLink, steamId });
      await freeAgent.save();
      return ServiceResponse.success("Free agent created successfully", freeAgent, StatusCodes.CREATED);
    } catch (error) {
      const errorMessage = `Error creating free agent: ${(error as Error).message}`;
      logger.error(errorMessage);
      return ServiceResponse.failure("An error occurred while creating the free agent.", null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async getAllFreeAgents(): Promise<ServiceResponse<any>> {
    try {
      const freeAgents = await FreeAgent.find();
      if (!freeAgents || freeAgents.length === 0) {
        return ServiceResponse.failure("No free agents found", null, StatusCodes.NOT_FOUND);
      }
      return ServiceResponse.success("Free agents retrieved successfully", freeAgents);
    } catch (error) {
      const errorMessage = `Error retrieving free agents: ${(error as Error).message}`;
      logger.error(errorMessage);
      return ServiceResponse.failure("An error occurred while retrieving free agents.", null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async findByDiscordId(discordId: string): Promise<ServiceResponse<any>> {
    try {
      const freeAgent = await FreeAgent.findOne({ discordId });
      if (!freeAgent) {
        return ServiceResponse.failure("Free agent not found", null, StatusCodes.NOT_FOUND);
      }
      return ServiceResponse.success("Free agent retrieved successfully", freeAgent);
    } catch (error) {
      const errorMessage = `Error retrieving free agent: ${(error as Error).message}`;
      logger.error(errorMessage);
      return ServiceResponse.failure("An error occurred while retrieving the free agent.", null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }
  async findBySteamId(steamId: string): Promise<ServiceResponse<any>> {
    try {
      const freeAgent = await FreeAgent.findOne({ steamId });
      if (!freeAgent) {
        return ServiceResponse.failure("Free agent not found", null, StatusCodes.NOT_FOUND);
      }
      return ServiceResponse.success("Free agent retrieved successfully", freeAgent);
    } catch (error) {
      const errorMessage = `Error retrieving free agent by steamId: ${(error as Error).message}`;
      logger.error(errorMessage);
      return ServiceResponse.failure("An error occurred while retrieving the free agent.", null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

}

export const freeAgentService = new FreeAgentService();
