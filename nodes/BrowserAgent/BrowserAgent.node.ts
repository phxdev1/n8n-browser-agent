import { IExecuteFunctions } from 'n8n-core';
import {
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  NodeOperationError,
} from 'n8n-workflow';
import puppeteer from 'puppeteer';

export class BrowserAgent implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Browser Agent',
    name: 'browserAgent',
    icon: 'file:browserAgent.svg',
    group: ['transform'],
    version: 1,
    subtitle: '={{$parameter["operation"] + ": " + $parameter["url"]}}',
    description: 'Automate browser interactions with AI assistance',
    defaults: {
      name: 'Browser Agent',
    },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [
      {
        name: 'browserAgentApi',
        required: true,
      },
    ],
    properties: [
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        options: [
          {
            name: 'Navigate to URL',
            value: 'navigate',
            description: 'Navigate to a specific URL',
            action: 'Navigate to a URL',
          },
          {
            name: 'Take Screenshot',
            value: 'screenshot',
            description: 'Take a screenshot of the current page',
            action: 'Take a screenshot of the current page',
          },
          {
            name: 'Click Element',
            value: 'click',
            description: 'Click on an element on the page',
            action: 'Click on an element on the page',
          },
          {
            name: 'Type Text',
            value: 'type',
            description: 'Type text into an input field',
            action: 'Type text into an input field',
          },
          {
            name: 'Extract Data',
            value: 'extract',
            description: 'Extract data from the page',
            action: 'Extract data from the page',
          },
          {
            name: 'Execute Script',
            value: 'script',
            description: 'Execute a custom JavaScript on the page',
            action: 'Execute a custom JavaScript on the page',
          },
        ],
        default: 'navigate',
      },
      // URL parameter (for navigate operation)
      {
        displayName: 'URL',
        name: 'url',
        type: 'string',
        default: '',
        required: true,
        displayOptions: {
          show: {
            operation: ['navigate'],
          },
        },
        description: 'The URL to navigate to',
      },
      // Selector parameter (for click, type, extract operations)
      {
        displayName: 'Selector',
        name: 'selector',
        type: 'string',
        default: '',
        required: true,
        displayOptions: {
          show: {
            operation: ['click', 'type', 'extract'],
          },
        },
        description: 'CSS selector for the element to interact with',
      },
      // Text parameter (for type operation)
      {
        displayName: 'Text',
        name: 'text',
        type: 'string',
        default: '',
        required: true,
        displayOptions: {
          show: {
            operation: ['type'],
          },
        },
        description: 'The text to type into the selected element',
      },
      // Script parameter (for script operation)
      {
        displayName: 'Script',
        name: 'script',
        type: 'string',
        typeOptions: {
          rows: 4,
        },
        default: '',
        required: true,
        displayOptions: {
          show: {
            operation: ['script'],
          },
        },
        description: 'JavaScript code to execute on the page',
      },
      // AI Response parameter (for all operations)
      {
        displayName: 'AI Response',
        name: 'aiResponse',
        type: 'string',
        default: '',
        required: true,
        description: 'The AI response from an AI Model node to guide the browser operation',
      },
      // Wait for navigation
      {
        displayName: 'Wait for Navigation',
        name: 'waitForNavigation',
        type: 'boolean',
        default: true,
        displayOptions: {
          show: {
            operation: ['navigate', 'click'],
          },
        },
        description: 'Whether to wait for navigation to complete after the action',
      },
      // Timeout
      {
        displayName: 'Timeout (ms)',
        name: 'timeout',
        type: 'number',
        default: 30000,
        description: 'Maximum time to wait for the operation to complete (in milliseconds)',
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];

    // Get credentials
    const credentials = await this.getCredentials('browserAgentApi');
    const headless = credentials.headless as boolean;
    const defaultTimeout = credentials.timeout as number;

    // Process each item
    for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
      try {
        // Get parameters
        const operation = this.getNodeParameter('operation', itemIndex) as string;
        const aiResponse = this.getNodeParameter('aiResponse', itemIndex) as string;
        const timeout = this.getNodeParameter('timeout', itemIndex, defaultTimeout) as number;

        // Launch browser
        const browser = await puppeteer.launch({
          headless: headless ? 'new' : false,
          args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });

        let result;

        // Execute operation
        switch (operation) {
          case 'navigate': {
            const url = this.getNodeParameter('url', itemIndex) as string;
            const waitForNavigation = this.getNodeParameter('waitForNavigation', itemIndex, true) as boolean;
            
            try {
              // Execute the browser operation
              const page = await browser.newPage();
              await page.goto(url, {
                waitUntil: waitForNavigation ? 'networkidle2' : 'domcontentloaded',
                timeout
              });
              const title = await page.title();
              const currentUrl = page.url();
              
              result = {
                title,
                url: currentUrl,
                aiResponse
              };
            } catch (error) {
              await browser.close();
              throw error;
            }
            break;
          }
          
          case 'screenshot': {
            try {
              // Execute the browser operation
              const page = (await browser.pages())[0] || await browser.newPage();
              const screenshot = await page.screenshot({ encoding: 'base64' });
              
              result = {
                screenshot: `data:image/png;base64,${screenshot}`,
                aiResponse
              };
            } catch (error) {
              await browser.close();
              throw error;
            }
            break;
          }
          
          case 'click': {
            const selector = this.getNodeParameter('selector', itemIndex) as string;
            const waitForNavigation = this.getNodeParameter('waitForNavigation', itemIndex, true) as boolean;
            
            try {
              // Execute the browser operation
              const page = (await browser.pages())[0] || await browser.newPage();
              await page.waitForSelector(selector, { timeout });
              
              if (waitForNavigation) {
                await Promise.all([
                  page.waitForNavigation({ timeout }),
                  page.click(selector),
                ]);
              } else {
                await page.click(selector);
              }
              
              result = {
                success: true,
                selector,
                aiResponse
              };
            } catch (error) {
              await browser.close();
              throw error;
            }
            break;
          }
          
          case 'type': {
            const selector = this.getNodeParameter('selector', itemIndex) as string;
            const text = this.getNodeParameter('text', itemIndex) as string;
            
            try {
              // Execute the browser operation
              const page = (await browser.pages())[0] || await browser.newPage();
              await page.waitForSelector(selector, { timeout });
              await page.type(selector, text);
              
              result = {
                success: true,
                selector,
                text,
                aiResponse
              };
            } catch (error) {
              await browser.close();
              throw error;
            }
            break;
          }
          
          case 'extract': {
            const selector = this.getNodeParameter('selector', itemIndex) as string;
            
            try {
              // Execute the browser operation
              const page = (await browser.pages())[0] || await browser.newPage();
              await page.waitForSelector(selector, { timeout });
              
              const data = await page.evaluate((sel: string) => {
                const elements = Array.from(document.querySelectorAll(sel));
                return elements.map(el => ({
                  text: el.textContent?.trim() || '',
                  html: el.innerHTML,
                  outerHTML: el.outerHTML,
                  attributes: Object.fromEntries(
                    Array.from(el.attributes).map((attr: any) => [attr.name, attr.value])
                  ),
                }));
              }, selector);
              
              result = {
                data,
                aiResponse
              };
            } catch (error) {
              await browser.close();
              throw error;
            }
            break;
          }
          
          case 'script': {
            const script = this.getNodeParameter('script', itemIndex) as string;
            
            try {
              // Execute the browser operation
              const page = (await browser.pages())[0] || await browser.newPage();
              const scriptResult = await page.evaluate(script);
              
              result = {
                result: scriptResult,
                aiResponse
              };
            } catch (error) {
              await browser.close();
              throw error;
            }
            break;
          }
          
          default:
            throw new NodeOperationError(this.getNode(), `The operation "${operation}" is not supported!`);
        }

        // Add the result to the returned items
        returnData.push({
          json: {
            ...result,
            operation,
          },
        });
      } catch (error) {
        if (this.continueOnFail()) {
          returnData.push({
            json: {
              error: error.message,
            },
          });
          continue;
        }
        throw error;
      }
    }

    return [returnData];
  }
}