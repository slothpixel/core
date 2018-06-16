core
===

[![Greenkeeper badge](https://badges.greenkeeper.io/slothpixel/core.svg)](https://greenkeeper.io/)

<p>
    <a href="https://discord.gg/ND9bJKK">
      <img src="https://discordapp.com/api/guilds/323555112553414667/embed.png" alt="Discord" />
    </a>
</p>

The Slothpixel Project is currently in early development. At the moment no code is in production.

Overview
---
* This project provides the Slothpixel API for consumption.
* This API powers the Slothpixel UI, which is also an open source project.
* Raw data comes from the Hypixel API.
* A public deployment of this code is maintained by The Slothpixel Project.

Tech Stack
---
* Microservices: Node.js
* Database: MongoDB/Redis

Getting Started
---
* Create .env file with required config values in KEY=VALUE format (see config.js for full listing of options)
  * `HYPIXEL_API_KEY` You need this in order to access the Hypixel API. You can get the API key by typing `/api` on Hypixel.
* `npm install`

Notes
---
* The process manager `pm2` is used to manage the individual services. Each is run as a separate Node.js process.
  * `pm2 list` See the currently running services.
  * `pm2 start manifest.json` Start all the services according to the manifest file
  * `pm2 start web --watch` Starts a specific service and enable watch mode on it, so it'll restart automatically when files change
  * `pm2 stop web` Stop a specific service
  * `pm2 stop all` Stop all the services
  * `pm2 logs web` Inspect the output of a service

Resources
---
* Join us on Discord (https://discord.gg/ND9bJKK)! If you are looking to contribute we'll give you the Developer role, which gives you access to channels related to development.

History
---
* Development started in July 2017
* Project based on [The OpenDota Project](https://github.com/odota/)