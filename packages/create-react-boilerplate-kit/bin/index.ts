#!/usr/bin/env node

import { createWorkspace } from 'create-nx-workspace';
import { prompt } from 'enquirer';

async function main() {
  try {
    let name = process.argv[2]; // TODO: use libraries like yargs or enquirer to set your workspace name
    if (!name) {
      const response = await prompt<{ name: string }>({
        required: true,
        type: 'input',
        name: 'name',
        message: 'What is the name of the project?',
      });
      name = response.name;
    }

    let uiLibrary = process.argv[3];
    if (!uiLibrary) {
      uiLibrary = (
        await prompt<{ uiLibrary: 'mui' | 'antd' | 'none' }>({
          name: 'uiLibrary',
          message: 'Which UI Library do you want to use?',
          initial: 'none' as any,
          type: 'autocomplete',
          choices: [
            { name: 'mui', message: 'Material UI' },
            { name: 'antd', message: 'Ant Design' },
            { name: 'none', message: 'None' },
          ],
        })
      ).uiLibrary;
    }

    const router = process.argv[4];
    let useReactRouter = true;
    if (!router) {
      useReactRouter = (
        await prompt<{ useReactRouter: boolean }>({
          type: 'confirm',
          name: 'useReactRouter',
          message:
            'Would you like to include React Router for handling navigation in your project? (Y/n)',
          initial: true,
        })
      ).useReactRouter;
    }

    const redux = process.argv[5];
    let useRedux = true;
    if (!redux) {
      useRedux = (
        await prompt<{ useRedux: boolean }>({
          type: 'confirm',
          name: 'useRedux',
          message: 'Do you want to add Redux to your project? (Y/n)',
          initial: true,
        })
      ).useRedux;
    }

    const storybook = process.argv[6];
    let useStorybook = true;
    if (!storybook) {
      useStorybook = (
        await prompt<{ useStorybook: boolean }>({
          type: 'confirm',
          name: 'useStorybook',
          message: 'Do you want to add Storybook to your project? (Y/n)',
          initial: true,
        })
      ).useStorybook;
    }

    console.log(`Creating the workspace: ${name}`);

    // This assumes "react-boilerplate-kit" and "create-react-boilerplate-kit" are at the same version
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const presetVersion = require('../package.json').version;

    // TODO: update below to customize the workspace
    const { directory } = await createWorkspace(
      `react-boilerplate-kit@${presetVersion}`,
      {
        name,
        nxCloud: false,
        packageManager: 'npm',
        uiLibrary,
        useReactRouter,
        useRedux,
        useStorybook,
      }
    );

    console.log(`Successfully created the workspace: ${directory}.`);
  } catch (error) {
    process.exit(1);
  }
}

main();
