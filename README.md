# Serverless Nest Monorepo Plugin

Plugin that adds support to run NestJS Apps from Nest Monorepo, which is set up using Nest CLI with several microservices.

Nest monorepo looks like this:

- apps/
  - service1
  - service2
  - service3
- lib/
  - library1
  - library2
- node_modules/
- dist/
  - apps/
    - service1
    - service2
    - service3

It is build using `nest build <service>` command and generates webpacked JavaScript file from TypeScript in `dist/apps/service` directories. Node modules are in root directory as are `nest-cli.json` or other configuration files.

This structure is fairly incompatible with Serverless framework `serverless`.

# Installation

Install with npm in monorepo:

`npm install --save-dev serverless-import-config-plugin`

Create a new serverless.yml file in root then add the plugin to your root serverless.yml file:

```
service: '<your-monorepo-name-same-as-in-package.json>'

useDotenv: true
plugins:
  - serverless-nest-monorepo

provider:
  name: aws
  runtime: nodejs14.x

frameworkVersion: '3'

plugins:
  - serverless-nest-monorepo
```

# Usage

Once root `serverless.yml` is set up, run serverless.

```
service: 'titan'

useDotenv: true
plugins:
  - serverless-nest-monorepo

provider:
  name: aws
  runtime: nodejs14.x

frameworkVersion: '3'
```


# Caveats

- If you are using `useDotenv: true`, ensure you set it to true in root `serverless.yml` and a symlink will be created for correct NestJS app.
