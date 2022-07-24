core
===

[![Discord](https://discordapp.com/api/guilds/323555112553414667/embed.png)](https://discord.gg/ND9bJKK)
[![Code Quality](https://img.shields.io/lgtm/grade/javascript/github/slothpixel/core)](https://lgtm.com/projects/g/slothpixel/core)

**NOTE:** The Slothpixel API is currently in early development - some features are missing and/or incomplete.

Overview
---
* This project provides the [Slothpixel API](https://docs.slothpixel.me) for consumption.
* This API powers the [Slothpixel UI](https://github.com/slothpixel/ui), which is also an open source project.
* Raw data comes from the Hypixel API.
* A public deployment of this code is maintained by The Slothpixel Project.

Tech Stack
---
* Microservices: Node.js
* Database: Redis

Quickstart (Docker)
---
* Install Docker: `curl -sSL https://get.docker.com/ | sh`. If you are on Windows, make sure you shared the working drive with Docker.
* Install Docker Compose: `curl -L "https://github.com/docker/compose/releases/download/1.17.1/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose && chmod +x /usr/local/bin/docker-compose`. If you are on Windows, docker-compose comes with the msi package.
* Create .env file with required config values in KEY=VALUE format (see config.js for full listing of options)
  * `HYPIXEL_API_KEY` You need this in order to access the Hypixel API. You can get the API key by typing `/api` on Hypixel.
* Start containers and initialize databases: `docker-compose up`
* Make some changes and commit them.
* Submit a pull request. Wait for it to be reviewed and merged.
* **OPTIONAL** Add your Minecraft UUID to the `CONTRIBUTORS.js` file.
* Congratulations! You're a contributor.

Notes
---
* The API runs on port 5000 by default.
* File changes made in the host directory get mirrored into the container.
* Get a terminal into the running container: `docker exec -it slothpixel-core bash`
* The process manager `pm2` is used to manage the individual services. Each is run as a separate Node.js process.
  * `pm2 list` See the currently running services.
  * `pm2 start manifest.json` Start all the services according to the manifest file
  * `pm2 start manifest.json --only web` Starts a specific service
  * `pm2 stop web` Stop a specific service
  * `pm2 stop all` Stop all the services
  * `pm2 logs web` Inspect the output of a service
  * `docker system prune` Cleans your system of any stopped containers, images, and volumes
  * Tests are written using the mocha framework.
    * `npm test` runs the full test suite.
    * Use `mocha` CLI for more fine-grained control over the tests you want to run.

Resources
---
* Join us on Discord (https://discord.gg/ND9bJKK)! We're always happy to help and answer questions.

History
---
* Development started in April 2017
* Project based on [The OpenDota Project](https://github.com/odota/)
