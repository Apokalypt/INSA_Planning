# INSA Planning

This project was the initiative of a student on a sandwich course. The idea is to provide a simple and effective bot for consulting your INSA Lyon Informatique timetable at any time and quickly.

INSA Planning is a Discord bot that provides access to the INSA Lyon Computer Science department's timetable services, displaying them on demand or automatically, giving members a point of reference.

## How to install / contribute ?

Read all the information in [CONTRIBUTING.md](./CONTRIBUTING.md) file.

## Features

### Automatic timetable
- Each saturday, at 20:00 (Europe/Paris), the bot will send a screenshot of the weekly timetable
- Each day before a working day (Sunday, Monday, ...), the bot sends a message containing all the information about the upcoming day's courses.

ℹ️ • The message contains a button to refresh the information in case of changes

### Discord commands
- `/week-planning année-étude:<value>` : Send the screenshot of the current week plannning for the indicated promotion
- `/planning année-étude:<value> [date:<value>]` : Send the message containing all the information about the day's courses (current day or the one provided)

## Project architecture

The root directory contains all the configuration and documentations files used for the project.

You can find the source code in the directory named `src`:
- models : All interface and class used by the project to work properly
- services : Services to manipulate puppeteer, DOM elements, ...
- enums
- events : 1 Discord (or custom) event per file with the source code associated (e.g. [Ready.ts](./src/events/Ready.ts) contains the source code to be executed when the Discord bot emit the ready event)
- errors : Custom error class used to differentiate handled one AND unexpected one
- commands : Directory architecture recommended by Discord.js for managing commands

## How is it working ?
1. We log the Discord bot
2. Once the "ready" event is fired, we initialize the Chrome browser in headless mode inside the planning service
3. Once the browser is ready, we try to open and handle authentication for all planning page (cache them to respond faster)
4. Once the initialization is ready we set up cron job to send automatic message

ℹ️ • Each 15 minutes, the planning pages are reloaded to keep an up to date version of the timetable in cache since this is the one that we will use to answer all requests
