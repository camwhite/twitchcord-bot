# Twitchcord

*A bot linking twitch and discord*

### Setup

- the usernames for **both** twitch and discord must be the same
- [create](https://discordapp.com/developers/applications/me) a discord bot user
- authorize at `https://discordapp.com/oauth2/authorize?&client_id=<your-client-id>&scope=bot`

### Installation and Usage

`npm i -g twitchcord-bot`

```
twitchcord --token=<your-discord-token> --handle=<your-discord-and-twitch-username> --password=<your-twitch-oauth-password> --channel=<your-discord-channel>
```
