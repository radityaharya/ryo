/* eslint-disable @typescript-eslint/no-explicit-any */
import { Hono, Context, Next } from 'hono';
import {
  InteractionResponseType,
  InteractionType,
  verifyKey,
} from 'discord-interactions';
import { Interaction } from '../types/interactions';
import { Commands } from './commands';
import { email } from './mailForward';
import { env } from 'hono/adapter';

type Bindings = {
  DISCORD_APPLICATION_ID: string;
  DISCORD_WEBHOOK_URL: string;
  DISCORD_PUBLIC_KEY: string;
  DISCORD_TOKEN: string;
  BOT_SECRET: string;
};

export const app = new Hono<{ Bindings: Bindings }>();

type ContextWithEnv = Context & { env: Bindings };

const verifySignature = async (ctx: Context, next: Next) => {
  // Clone the body
  const body = await ctx.req.raw.clone().arrayBuffer();

  if (!ctx.env) {
    ctx.env = env;
  }

  const signature = ctx.req.header('x-signature-ed25519');
  const timestamp = ctx.req.header('x-signature-timestamp');
  if (!signature || !timestamp) {
    return ctx.text('Invalid signature', 401);
  }
  return !verifyKey(body, signature, timestamp, ctx.env.DISCORD_PUBLIC_KEY)
    ? ctx.text('Invalid signature', 401)
    : next();
};

/**
 * Error handler for bot commands
 */
const botErrHandler = (ctx: Context, err: unknown) =>
  ctx.json({
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: { content: `An error occurred: ${err}` },
  });

/**
 * 404 handler
 */
app.notFound((ctx) => ctx.text('Not found', 404));

/**
 * Error handler
 */
app.onError(
  (err, ctx) => (console.log(err), ctx.text(`An error occurred: ${err}`, 500)),
);

/**
 * Hello index
 */
app.get('/', (ctx: ContextWithEnv) => {
  const { DISCORD_APPLICATION_ID } = env<any>(ctx);
  return ctx.text(`Hello from Hono! App ID: ${DISCORD_APPLICATION_ID}`);
});

/**
 * Register slash commands with Discord. This is only required once (or when you update your commands)
 */
app.post('/register', async (ctx: ContextWithEnv) => {
  const { DISCORD_APPLICATION_ID, DISCORD_TOKEN, BOT_SECRET } = env<any>(ctx);
  if (ctx.req.header('Authorization') !== `Bearer ${BOT_SECRET}`) {
    return ctx.text('Unauthorized', 401);
  }

  const registerResponse = await fetch(
    `https://discord.com/api/v10/applications/${DISCORD_APPLICATION_ID}/commands`,
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bot ${DISCORD_TOKEN}`,
      },
      method: 'PUT',
      body: JSON.stringify(Commands),
    },
  );

  if (!registerResponse.ok) {
    const err = await registerResponse.json();
    return console.error(err), ctx.json(err, 500);
  }
  {
    const data = await registerResponse.json();
    console.log(data);
    return Response.json({ message: 'Commands registered' });
  }
});

/**
 * Interaction handler
 * https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object
 */
app.post('/interactions', verifySignature, (ctx) =>
  ctx.req
    .json()
    .then((interaction: Interaction) => {
      switch (interaction.type) {
        case InteractionType.PING:
          return ctx.json({ type: InteractionResponseType.PONG });
        case InteractionType.APPLICATION_COMMAND: {
          const command = Commands.find(
            (c) => c.name === interaction.data.name,
          );
          interaction.bindings = env(ctx);
          return !command
            ? botErrHandler(ctx, `Unknown command: ${interaction.data.name}`)
            : command
                .run(interaction)
                .then((response) =>
                  ctx.json({
                    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                    data: { content: response },
                  }),
                )
                .catch((err) => botErrHandler(ctx, err));
        }
        default:
          return botErrHandler(
            ctx,
            `Unknown interaction type: ${interaction.type}`,
          );
      }
    })
    .catch((err) => botErrHandler(ctx, err))
    .catch(
      (err) => (
        console.error(err), ctx.text(`Bot error handler failed: ${err}`, 500)
      ),
    ),
);

app.get('/test', (c) => c.text('Hello Cloudflare Workers!'));

export default {
  email,
  fetch: app.fetch.bind(app),
};
