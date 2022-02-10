# Serverless Nest Monorepo Plugin

Plugin that runs NestJS Apps from Nest Monorepo, which is set up using Nest CLI.

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

# Usage

Setup a serverless.yml in the root of the monorepo.

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




# License

MIT
