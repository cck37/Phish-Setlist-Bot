# Discord Phish Bot

Allows people to guess songs for an upcoming show based on https://phish.net

## How does it work?

This bot is built using javascript with heavy use and influence from [discord.js](https://discord.js.org/).

You first register your commands with your server and then you run your app. When Discord sees someone has ran one of your commands, your app is notified and your code is ran.

You can respond to this using a variety of different built in components Discord offers. You can also chain these `interactions` like a command spawning a modal which has a series of inputs and a button to submit the user's response back to your app.

This app:

- Determines when the next show is playing
- Takes in guesses from users
- Validates the inputs are real songs
- Tallies up scores once the guessing has been ended

This project currently has 4 commands:

1. `/nextShow` - Finds the next show playing based on https://phish.net's API
2. `/startGuess` - Begins the game and allows users to start guessing
3. `/guess` - Provides users with a from to make their guesses
4. `/stopGuess` - Ends the current game, tallies scores, and displays the leaderboard

## Project structure

Below is a basic overview of the project structure:

```txt
│   .gitignore -> tells git what to ignore like config.json and node_modules
│   api.js -> wrapper for phish.net api
│   config.json -> config file where secrets are stored
│   config.sample.json -> template to use when putting in your secrets
│   deploy-commands.js -> file to deploy new commands to Discord. Reliant on the `commands` folder below
│   index.js -> entry point for the app
│   LICENSE -> legal crap i don't care about
│   package-lock.json -> npm stuff you shouldn't care about
│   package.json -> config for npm
│   README.md -> this file
├───commands -> folder where commands are registered
│   └───utility -> idk why this is a sub directory
│           guess.js -> `/guess` command logic
│           nextShow.js -> `/nextshow` command logic
│           startGuess.js -> `/startguess` command logic
│           stopGuess.js -> `/stopguess` command logic
├───data -> static data
│       songs.js -> list of songs used for validation
├───events -> discord events
│       interactionCreate.js -> can't remember if this is used
│       ready.js -> can't remember how this is used
├───modalResponses -> modal renderl logic
│       guessModal.js -> logic for the guess modal
└───utils -> utilities to make life easier
        responseMappers.js -> mapper to deal with responses
```

## Running app locally

Before you start, you'll need to install [NodeJS](https://nodejs.org/en/download/).

### Setup project

First clone the project:

```
git clone https://github.com/cck37/Phish-Setlist-Bot.git
```

Then navigate to its directory and install dependencies:

```
cd Phish-Setlist-Bot
npm install
```

### Get app credentials

Fetch the credentials from your app's settings and add them to a `config.json` file (see `config.sample.json` for an example).
You'll need to get the following:

1. `clientId` - See [here](https://discordjs.guide/preparations/adding-your-bot-to-servers.html#bot-invite-links)
2. `guildId` - See [here](https://discordjs.guide/preparations/adding-your-bot-to-servers.html#bot-invite-links)
3. `token` - See [here](https://discordjs.guide/preparations/adding-your-bot-to-servers.html#bot-invite-links)
4. `phishNetToken` - Token generated for phish.net found [here](https://api.phish.net/keys/)

### Install slash commands

The commands for the example app are set up in `deploy-commands.js`. All of the commands are in the `commands/utility` directory. Each command exports `data` object and an `execute` function. This pattern has been copied from the [discord.js guide here](https://discordjs.guide/creating-your-bot/command-handling.html#loading-command-files)

You can register commands by running the `register` script seen in `package.json`

```
npm run register
```

### Run the app

After your credentials are added, go ahead and run the app:

```
npm run start
```

> ⚙️ A package [like `nodemon`](https://github.com/remy/nodemon), which watches for local changes and restarts your app, may be helpful while locally developing.

### Set up interactivity

None of this relevant when I develop locally.. I can't recall why but it "just werks" with discord.js. This all text from Discord's getting started guide.

~~The project needs a public endpoint where Discord can send requests. To develop and test locally, you can use something like [`ngrok`](https://ngrok.com/) to tunnel HTTP traffic.~~

~~Install ngrok if you haven't already, then start listening on port `3000`:~~

```
ngrok http 3000
```

~~You should see your connection open:~~

```
Tunnel Status                 online
Version                       2.0/2.0
Web Interface                 http://127.0.0.1:4040
Forwarding                    http://1234-someurl.ngrok.io -> localhost:3000
Forwarding                    https://1234-someurl.ngrok.io -> localhost:3000

Connections                  ttl     opn     rt1     rt5     p50     p90
                              0       0       0.00    0.00    0.00    0.00
```

~~Copy the forwarding address that starts with `https`, in this case `https://1234-someurl.ngrok.io`, then go to your [app's settings](https://discord.com/developers/applications).~~

~~On the **General Information** tab, there will be an **Interactions Endpoint URL**. Paste your ngrok address there, and append `/interactions` to it (`https://1234-someurl.ngrok.io/interactions` in the example).~~

~~Click **Save Changes**, and your app should be ready to run 🚀~~

## Other resources

https://discordjs.guide
