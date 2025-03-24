import {
  ICredentialType,
  INodeProperties,
} from 'n8n-workflow';

export class BrowserAgentApi implements ICredentialType {
  name = 'browserAgentApi';
  displayName = 'Browser Agent Settings';
  documentationUrl = 'https://docs.n8n.io/integrations/creating-nodes/';
  properties: INodeProperties[] = [
    {
      displayName: 'Headless Mode',
      name: 'headless',
      type: 'boolean',
      default: true,
      description: 'Whether to run the browser in headless mode',
    },
    {
      displayName: 'Timeout (ms)',
      name: 'timeout',
      type: 'number',
      default: 30000,
      description: 'Default timeout for browser operations in milliseconds',
    },
  ];
}