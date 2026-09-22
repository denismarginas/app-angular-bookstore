# BookStore

A minimalist Angular + Express bookstore demo.

## Requirements

- Node.js v24.20.0
- npm 9.6.2
- Angular 17 (CLI version 17.0.3)

## Install

First, install dependencies:

```
npm install
```

## Data source

By default, with no `.env` file, the app stores everything in the local JSON files under `src/assets/demo-db` — no setup required, works right after `npm install`.

To use the local demo database explicitly (for example if you also have a real database configured and want to make sure the app ignores it), create a `.env` file in the project root with:

```
DB_PROVIDER=local
```

To use a real Postgres database (Supabase) and Vercel Blob for images instead, copy `.env.template` to `.env` and fill in:

```
DB_PROVIDER=postgres
POSTGRES_URL=...
BLOB_READ_WRITE_TOKEN=...
```

`.env` is never committed (see `.gitignore`) and is only read locally by `npm run api` / `npm start`. It has no effect on Vercel, which reads its own environment variables from the project dashboard instead.

## Running the app

### Windows quick start

Double-click `start.bat` (or run it from a terminal). It runs `npm start`, which starts the Express API and the Angular dev server together.

### Manual start

```
npm start
```

This runs the API server and `ng serve` together. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

You can also run them separately:

```
ng serve
```

```
npm run api
```

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 17.0.3.

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.
