import { Command } from '../types/interactions';
import { ApplicationCommandOptionType } from './enums';
import { getRedditUrl } from './reddit';

const HelloCommand: Command = {
  name: 'hello',
  description: 'Says hello back to you',
  run: (interaction) => {
    const user = interaction.member.user.id;
    return Promise.resolve(`Hello <@${user}>!`);
  },
};

const RedditHot: Command = {
  name: 'reddit-hot',
  description:
    'Gives you a random image or video from the hot section of a subreddit',
  options: [
    {
      name: 'subreddit',
      description: 'The subreddit to get the image from',
      type: ApplicationCommandOptionType.STRING,
      required: true,
    },
  ],
  run: (interaction) => {
    const subreddit =
      interaction.data.options?.find((option) => option.name === 'subreddit')
        ?.value ?? 'aww';
    return getRedditUrl(subreddit);
  },
};

const InviteCommand: Command = {
  name: 'invite',
  description: 'Get an invite link to add the bot to your server',
  run: async (interaction) => {
    const applicationId = interaction.bindings.DISCORD_APPLICATION_ID;
    const INVITE_URL = `https://discord.com/oauth2/authorize?client_id=${applicationId}&scope=applications.commands&permissions=8&scope=bot+applications.commands`;
    return INVITE_URL;
  },
};

export const Commands = [HelloCommand, RedditHot, InviteCommand];
