# n8n-nodes-browser-agent

This is an n8n community node that enables browser automation in your n8n workflows. It works with n8n's AI nodes to provide AI-assisted browser interactions, allowing you to automate complex web tasks with natural language instructions.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

[Installation](#installation)  
[Operations](#operations)  
[Credentials](#credentials)  
[Example Usage](#example-usage)  
[Resources](#resources)  

## Installation

Follow these instructions to install this node:

### Community Nodes (Recommended)

For users on n8n v0.187+, you can install this node directly from the n8n Community Nodes panel:

1. Open your n8n instance
2. Go to **Settings > Community Nodes**
3. Search for "browser-agent"
4. Click **Install**
5. Reload the page or restart n8n

### Manual Installation

To install the node manually:

```bash
npm install n8n-nodes-browser-agent
```

For Docker-based n8n installations, you can install by running:

```bash
docker exec -it n8n npm install n8n-nodes-browser-agent
```

## Prerequisites

This node requires:

1. An AI Model node (like n8n's AI Node) to provide AI responses
2. Puppeteer will be installed automatically as a dependency

## Operations

The Browser Agent node supports the following operations:

* **Navigate to URL**: Navigate to a specific URL
* **Take Screenshot**: Capture a screenshot of the current page
* **Click Element**: Click on an element identified by a CSS selector
* **Type Text**: Enter text into an input field
* **Extract Data**: Extract data from elements on the page
* **Execute Script**: Run custom JavaScript on the page

## Credentials

To use this node, you need to create credentials with the following properties:

* **Headless Mode**: Whether to run the browser in headless mode (default: true)
* **Timeout**: Default timeout for browser operations in milliseconds (default: 30000)

## Example Usage

This workflow demonstrates how to use the Browser Agent node with an AI Model node to:

1. Generate an AI response for browser automation
2. Navigate to a website
3. Extract data from the page

You can import this workflow by copying the JSON below and importing it in n8n.

```json
{
  "nodes": [
    {
      "parameters": {},
      "id": "12345",
      "name": "Start",
      "type": "n8n-nodes-base.start",
      "typeVersion": 1,
      "position": [
        250,
        300
      ]
    },
    {
      "parameters": {
        "options": {
          "model": "gpt-4",
          "prompt": "I need to navigate to example.com and extract the main heading.",
          "temperature": 0.7,
          "maxTokens": 500
        }
      },
      "id": "12346",
      "name": "AI",
      "type": "n8n-nodes-base.ai",
      "typeVersion": 1,
      "position": [
        450,
        300
      ]
    },
    {
      "parameters": {
        "operation": "navigate",
        "url": "https://example.com",
        "aiResponse": "={{ $json.text }}",
        "waitForNavigation": true
      },
      "id": "12347",
      "name": "Browser Agent",
      "type": "n8n-nodes-browser-agent.browserAgent",
      "typeVersion": 1,
      "position": [
        650,
        300
      ],
      "credentials": {
        "browserAgentApi": {
          "id": "1",
          "name": "Browser Agent Settings"
        }
      }
    }
  ],
  "connections": {
    "Start": {
      "main": [
        [
          {
            "node": "AI",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "AI": {
      "main": [
        [
          {
            "node": "Browser Agent",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  }
}
```

## Resources

* [n8n community nodes documentation](https://docs.n8n.io/integrations/community-nodes/)
* [n8n AI nodes documentation](https://docs.n8n.io/integrations/builtin/cluster-nodes/root-nodes/n8n-nodes-base.ai/)
* [Puppeteer documentation](https://pptr.dev/)

## License

[MIT](LICENSE.md)