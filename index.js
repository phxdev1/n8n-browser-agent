// This file is the entry point for the package
// It simply exports the node and credential classes

module.exports = {
  // Nodes
  nodeTypes: [
    require('./dist/nodes/BrowserAgent/BrowserAgent.node.js'),
  ],
  // Credentials
  credentialTypes: [
    require('./dist/credentials/BrowserAgentApi.credentials.js'),
  ],
};