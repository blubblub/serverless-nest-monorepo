'use strict';

const { spawn, spawnSync, exec, execSync } = require('child_process');

async function passthru(exe, args, options = {}) {
  return new Promise((resolve, reject) => {
      const env = Object.create(process?.env || {});
      const child = spawn(exe, args, {
        ...options,
        shell: true,
      });
      child.stdout.setEncoding('utf8');
      child.stderr.setEncoding('utf8');
      child.stdout.on('data', data => console.log(data));
      child.stderr.on('data', data => console.log(data));
      child.on('error', error => reject(error));
      child.on('close', exitCode => {
          console.log('Exit code:', exitCode);
          resolve(exitCode);
      });
  });
}
 
class ServerlessMonorepo {
  constructor(serverless, options) {
    // Set it up.
    this.serverless = serverless;
    this.options = options;
    this.pluginName = 'serverless-nest-monorepo';

    // Set commands
    this.commands = {
      mono: {
        usage: 'Build & Run Serverless on NestJS app from monorepo',
        lifecycleEvents: ['run'],
        options: {
          // Define the '--function' option with the '-f' shortcut
          nestApp: {
            usage: 'Nest App to run',
            shortcut: 'na',
            required: true,
            type: 'string', // Possible values: 'string', 'boolean', 'multiple'
          },
          command: {
            usage: 'Serverless command to be passed',
            shortcut: 'cmd',
            required: true,
            type: 'string', // Possible values: 'string', 'boolean', 'multiple'
          },
          dev: {
            usage: 'Run nestjs in watch mode',
            shortcut: '',
            required: false,
            type: 'boolean', // Possible values: 'boolean'
          },
          extra: {
            usage: 'Serverless options',
            shortcut: '',
            required: false,
            type: 'string', // Possible values: 'string', 'boolean', 'multiple'
          },
        },
      }
    }

    // Set hooks.
    this.hooks = {
      'initialize': () => this.init(options),
      'before:mono:run': async () => {
        // Before my command runs
        //console.log('okb');

        await this.buildNest(options);
        await this.bootstrapServerless(options);

        try {
          await this.runServerless(options);
        }
        catch (error) {
          // TODO: Display error
          this.log(error);
        }
      },
      'after:mono:run': async () => {
        await this.clean(options);
      },
      'mono:run': () => async () => {
      }
    };
  }
 
  init(options) {
    this.log(`Serverless NestJS Monorepo Plugin Initialized for: ${options.nestApp}`);
  }

  log(msg) {
    this.serverless.cli.log(msg, this.pluginName);
  }

  async buildNest(options) {
    this.log(`Building Nest app: ${options.nestApp}...`);
    if (options.dev) {
      await exec(`nest start ${options.nestApp} --watch`);
      this.log(`Nest app ${options.nestApp} build finished in watch mode.`);
    } else {
      await exec(`nest build ${options.nestApp}`);
      this.log(`Nest app ${options.nestApp} build finished.`);
    }
  }

  async bootstrapServerless(options) {
    if (this.serverless.configurationInput.useDotenv) {
      this.log(`Using dotEnv environment from apps/${options.nestApp}/.env`);
      await exec(`ln -s apps/${options.nestApp}/.env .env`);
    }
    
    this.log(`Using serverless configuration from apps/${options.nestApp}/serverless.yml`);
    await exec(`ln -s apps/${options.nestApp}/serverless.yml serverless-${options.nestApp}.tmp.yml`);
  }

  async runServerless(options) {
    const command = `serverless ${options.command} --config serverless-${options.nestApp}.tmp.yml ${options.extra? options.extra : ''}`;

    this.log(`Running: ${command}`);
    await passthru(command);
  }

  async clean(options) {
    // TODO: Add check if .env is a sym link, which was created in bootstrap
    if (this.serverless.configurationInput.useDotenv) {
      this.log(`Using dotEnv environment from apps/${options.nestApp}/.env, cleaning up .env`);
      await exec(`rm .env`);
    }

    this.log(`Cleaning up: serverless-${options.nestApp}.tmp.yml`);
    await exec(`rm serverless-${options.nestApp}.tmp.yml`);
  }
}
 
module.exports = ServerlessMonorepo;
