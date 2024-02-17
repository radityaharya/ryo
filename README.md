# Ryo

Ryo is a Discord bot that uses the [Discord Interactions API](https://discord.com/developers/docs/interactions/receiving-and-responding) to respond to slash commands. It's built using [Hono](https://hono.dev/) for [Cloudflare Workers](https://workers.cloudflare.com/), which allows you to run serverless functions at the edge of Cloudflare's network.

## Features
- [x] Slash commands
- [x] Reddit Hot Posts from a Subreddit
- [x] Forwards Email to Discord using Cloudflare Email Routing


## Configuring project

Before starting, you'll need a [Discord app](https://discord.com/developers/applications) with the following permissions:

- `bot` with the `Send Messages` and `Use Slash Command` permissions
- `applications.commands` scope

> ⚙️ Permissions can be configured by clicking on the `OAuth2` tab and using the `URL Generator`. After a URL is generated, you can install the app by pasting that URL into your browser and following the installation flow.

## Email to Discord

This bot also has the ability to forward emails to a Discord channel. The worker will be registered as an Email Routing rule in Cloudflare. When an email is sent to the custom email address, it will be forwarded to the Discord channel using the Webhook URL (how to get Webhook URL [[Doc](https://support.discord.com/hc/en-us/articles/228383668-Intro-to-Webhooks)])

**Prerequisites:**
1. Have email routing enabled on a cloudflare Website [[Doc](https://developers.cloudflare.com/email-routing/get-started/enable-email-routing/)]
2. Authenticated Wrangler CLI setup [[Doc](https://developers.cloudflare.com/workers/wrangler)]

**Setup:**
1. Adding Webhook URL as Secret
  - Using Wrangler CLI
    ```bash
    wrangler secret put DISCORD_WEBHOOK_URL
    ```
    Paste Webhook URL
    ```bash
    ? Enter a secret value: ›
    ```
2. Setting Worker as a rule for custom address
    1. In Cloudflare dashboard go to Email > Email Routing > Routes.
    2. Select Create address.
    3. In Custom address, enter the custom email address you want to use (for example, 'ryo').
    4. In the Action drop-down menu, choose "send to worker"
    5. Select "ryo" as the destination

## Deploying

```bash
git clone https://github.com/radityaharya/ryo.git
cd ryo
```

To install the dependencies, run the following command:

```bash
npm install
```

Set up your environment variables by creating a `.env` file in the root of the project. You can use the `example.env` file as a template.

To deploy the app, you'll need to install the [Wrangler CLI](https://developers.cloudflare.com/workers/cli-wrangler/install-update). Once installed, you can deploy the app using the following command:

```bash
wrangler deploy
```

The credentials in `.env` are only applied locally. The production service needs access to credentials from your app:

```bash
wrangler secret put DISCORD_TOKEN
wrangler secret put DISCORD_PUBLIC_KEY
wrangler secret put DISCORD_APPLICATION_ID
wrangler secret put DISCORD_WEBHOOK_URL
wrangler secret put BOT_SECRET
```

## Setting up the bot

After deploying the app, you'll need to register the bot with Discord. You can do this by inputting your `interactions` URL into the `Interactions Endpoint URL` field in the `General Information` tab of the Discord Developer Portal.

**Registering Commands**

Commands should be registered with Discord using the `register` command after the bot has been deployed or when commands are updated.

```bash
npm run register
```