/* eslint-disable @typescript-eslint/no-unused-vars */
import { Bindings } from 'hono/types';
import PostalMime, { Email } from 'postal-mime';
import { convert } from 'html-to-text';

const DISCORD_EMBED_LIMIT = 4096;
const DISCORD_FILE_LIMIT = 8000000;

function trimToLimit(input: string, limit: number) {
  return input.length > limit
    ? `${input.substring(0, limit - 12)}...(TRIMMED)`
    : input;
}

function createEmbedBody(
  email: Email,
  message: ForwardableEmailMessage,
  emailText: string,
) {
  return JSON.stringify({
    embeds: [
      {
        title: trimToLimit(email.subject || 'No Subject', 256),
        description: trimToLimit(emailText, DISCORD_EMBED_LIMIT),
        author: {
          name: `${trimToLimit(email.from.name, 100)}${
            email.from.name.length > 64 ? '\n' : ' '
          }<${trimToLimit(email.from.address, 100)}>`,
        },
        footer: {
          text: `This email was sent to ${trimToLimit(
            message.to,
            100,
          )}\nEnvelope From: ${trimToLimit(message.from, 100)}`,
        },
      },
    ],
  });
}

async function handleDiscordResponse(discordResponse: Response) {
  if (discordResponse.ok == false) {
    console.log('Discord Webhook Failed');
    console.log(
      `Discord Response: ${discordResponse.status} ${discordResponse.statusText}`,
    );
    console.log(await discordResponse.json());
  }
}

export async function email(
  message: ForwardableEmailMessage,
  env: Bindings,
  ctx: ExecutionContext,
): Promise<void> {
  const rawEmail = new Response(message.raw);
  const arrayBuffer = await rawEmail.arrayBuffer();
  const parser = new PostalMime();
  const email = await parser.parse(arrayBuffer);
  const emailText = email.text || convert(email.html!);
  const embedBody = createEmbedBody(email, message, emailText);
  const formData = new FormData();
  formData.append('payload_json', embedBody);
  if (emailText.length > DISCORD_EMBED_LIMIT) {
    const newTextBlob = new Blob([emailText], {
      type: 'text/plain',
    });
    // If the text is too big, we need truncate the blob.
    if (newTextBlob.size < DISCORD_FILE_LIMIT) {
      formData.append('files[0]', newTextBlob, 'email.txt');
    } else {
      formData.append(
        'files[0]',
        newTextBlob.slice(0, DISCORD_FILE_LIMIT, 'text/plain'),
        'email-trimmed.txt',
      );
    }
  }
  const discordResponse = (await fetch(env.DISCORD_WEBHOOK_URL as string, {
    method: 'POST',
    body: formData,
  })) as unknown as Response;
  await handleDiscordResponse(discordResponse);
}
