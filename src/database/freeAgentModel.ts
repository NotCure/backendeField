import { Schema, model, Document } from 'mongoose';

interface IFreeAgent extends Document {
  discordId: string;
  steamName: string;
  steamProfileLink: string;
  steamId: string;
}

const FreeAgentSchema = new Schema<IFreeAgent>({
  discordId: {
    type: String,
    required: true,
    unique: true,
  },
  steamName: {
    type: String,
    required: true,
  },
  steamProfileLink: {
    type: String,
    required: true,
    validate: {
      validator: function (v: string) {
        return /^(http|https):\/\/steamcommunity.com\/profiles\/\d+$/.test(v);
      },
      message: 'Not a valid Steam profile link! ${}',
    },
  },
  steamId: {
    type: String,
    required: true,
    unique: true,
  },
});

const FreeAgent = model<IFreeAgent>('FreeAgent', FreeAgentSchema);

export default FreeAgent;
