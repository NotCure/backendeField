import { Schema, model, Document, Model } from "mongoose";

// Define the Token interface
interface IToken extends Document {
  token: string;           // Unique token string
  discordId: string;       // Discord ID associated with the token
  expiresAt: Date;         // Expiration time of the token
}

// Define the schema for the token
const TokenSchema = new Schema<IToken>({
  token: { type: String, required: true, unique: true },
  discordId: { type: String, required: true },
  expiresAt: { type: Date, required: true },
});

// Index the expiresAt field to automatically delete expired documents
TokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Create and export the Token model
const TokenModel: Model<IToken> = model<IToken>("Token", TokenSchema);
export default TokenModel;
