#!/usr/bin/env node

import { createWorkspace } from 'create-nx-workspace';
import { prompt } from 'enquirer';

async function main() {
  let name = process.argv[2]; // TODO: use libraries like yargs or enquirer to set your workspace name
  if (!name) {
    // throw new Error('Please provide a name for the workspace');
    const response = await prompt<{ name: string }>({
      type: 'input',
      name: 'name',
      message: 'What is the name of the app?',
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
    }
  );

  console.log(`Successfully created the workspace: ${directory}.`);
}

main();
