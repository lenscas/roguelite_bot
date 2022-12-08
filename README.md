# Roguelite Bot

Just a fun discord bot I decided to make that plays a simple roguelite through discord

# Dependencies

-   Node (v16.9.1)
-   Yarn (npm install yarn -g)
-   Postgresql

# Setup docker

1. Install docker and docker compose
2. Copy `database.example.json` to `database.json`
3. Copy `postgres.example.json` to `postgres.json`
4. Copy `config.example.json` to `config.json`
5. Put your own key into the `config.json` file (You can get a key for your bot at https://discord.com/developers/applications )
6. Run `docker-compose up` and watch the magic happen as `docker-compose` pulls in everything needed and starts the bot.

To access the DB from the host and run `yarn prepareSql`, read [How to access the DB from the host while using Docker](#how-to-access-the-db-from-the-host-while-using-docker)

# Setup locally

1. Copy `database.example.json` to `database.json`
2. Fill in the details to connect to your locally running database
3. Copy `postgres.example.json` to `postgres.json`
4. Fill here the database connection in again (I know, feels redundant)
5. Copy `config.example.json` to `config.json`
6. Put your own key into the `config.json` file (You can get a key for your bot at https://discord.com/developers/applications )
7. Run `yarn install`
8. Run `yarn migrate up` to run the migrations
9. Run `yarn start` to start the bot. Or use `yarn start:dev` to also have it automatically restart when it detects changes.

# Useful scripts

There are a few commands placed in the package.json file. You can run these commands using `yarn {commandName}`

1. `lintFix` uses eslint to fix most lint errors (PR's with lint errors won't get merged)
2. `unitTest` runs the unit tests
3. `prepareSql` reads the sql files and updates the generated types (use -w to run in watch mode)
4. `start:dev` automatically compiles and restarts on changes
5. `build` does a clean build
6. `start` does a clean build, then starts the bot
7. `migrate` to run [db-migrate](https://db-migrate.readthedocs.io/en/latest/Getting%20Started/usage/)
8. `lint` runs eslint and tells you what the problems are.
9. `test` runs the linter and the unit tests

# How to access the DB from the host while using Docker:

By default, the postgresql container has a port opened at `5433`.
The default username is `roguelite`, so is the database name and password.

The example configuration file `postgres.example.json` is setup to connect to the postgresql container from the host. This way, `yarn prepareSql` works out of the box with docker, provided the container is running. There is **_NO_** need to run this command from withing the container. **_ONLY_** run it from the host!

If you want to connect to the Database with dbeaver from the host then simply configure a new connection, select the `postgresql` driver and fill the details in as followed:

`Host`: `localhost`
`Port`: `5433`
`Database`: `roguelite`
`Authentication`: `Database Native`
`Username` : `roguelite`
`Password` : `roguelite`

`Session role` and `Local client` can remain empty.

## Vendored library

The code inside `/src/dungeon-generator` comes from the project [dungeon-generator](https://github.com/Prozi/dungeon-generator). The code inside that folder has been translated to TS and is planned to be used in the future though right now it is unused and instead the normal npm package is used.
