# Meeting Agenda

Date: 12/08/2026 to 12/11/2026
The following will be our agenda for Tuesday and Thursday

## Topics
- Copilot Extensions (have evolved into MCP servers)
- MCP Servers
- Enterprise Policy Management
- Model Selection & Cost Optimization
- GitHub Copilot Certification
- Copilot Spec Kit
- Copilot Metrics


# MCP Servers


## What is MCP?

**Model Context Protocol (MCP)** is an open protocol that enables AI assistants like GitHub Copilot to securely connect to external data sources and tools. Think of MCP servers as specialized plugins that give Copilot superpowers to access specific services, APIs, and data.

## Core Concepts

### MCP Servers
- **Purpose**: Extend Copilot's capabilities beyond code generation
- **Function**: Provide real-time access to external systems, databases, APIs, and services
- **Usage**: Automatically invoked by Copilot when you mention relevant keywords or request specific actions


### How It Works
1. You write a natural language prompt in Copilot Chat
2. Copilot analyzes your request and determines if an MCP server can help
3. The appropriate MCP server is called automatically
4. Results are returned and integrated into Copilot's response

---

## Common MCP Servers for Daily Development

### 1. **GitHub MCP Server**
Access and manage GitHub repositories, issues, PRs, and more.

#### Common Use Cases

**Search for code across repositories:**
```
@workspace Find examples of error handling in the axios library on GitHub
```

**Check PR status:**
```
Show me the open pull requests for microsoft/vscode repository
```

**Create an issue:**
```
Create a GitHub issue in my current repo titled "Fix login bug" with description "Users can't log in after the latest deployment"
```

**Get commit history:**
```
Show me the last 10 commits on the main branch of this repository
```

**View file contents from another repo:**
```
Show me the package.json from facebook/react repository
```

---

### 2. **Azure MCP Server**
Manage Azure resources, deployments, and services.

#### Common Use Cases

**List Azure resources:**
```
Show me all the resource groups in my Azure subscription
```

**Check Azure Function status:**
```
What's the health status of my Azure Function app named "my-api-prod"?
```

**Generate Azure CLI commands:**
```
Generate an Azure CLI command to create a new storage account in East US
```

**Deploy to Azure:**
```
Help me deploy this Node.js app to Azure App Service
```

**Query Application Insights:**
```
Show me the error logs from my Azure App Service in the last 24 hours
```

**Get best practices:**
```
What are the best practices for deploying Azure Functions?
```

---

### 3. **Documentation MCP Servers**

#### Microsoft Learn MCP
Access official Microsoft and Azure documentation.

**Search documentation:**
```
Find Microsoft documentation about Azure Cosmos DB pagination
```

**Get code examples:**
```
Show me code examples for connecting to Azure SQL Database using Python
```

**Fetch complete documentation:**
```
Get the full Azure Functions triggers and bindings documentation
```

#### Library Documentation MCP (Context7)
Access up-to-date documentation for popular libraries and frameworks.

**Get library docs:**
```
#context7 Show me the latest documentation for React hooks
```

**Find API reference:**
```
#context7 How do I use the useEffect hook in React? Show me the official docs
```

**Search specific library versions:**
```
#context7 Get documentation for Next.js 14 app router
```

**Find migration guides:**
```
#context7 Show me the migration guide from Vue 2 to Vue 3
```

**Get framework-specific examples:**
```
#context7 Show me examples of middleware in Express.js
```

> **Pro Tip**: Use `#context7` to explicitly call the Context7 MCP server for library documentation. This ensures you get the most up-to-date docs directly from the source without ambiguity.

---

### 4. **File System MCP Server**
Access and manipulate files in your workspace.

**Search files:**
```
Find all TypeScript files that import 'axios'
```

**Read configuration:**
```
Show me the contents of my .env.example file
```

**Analyze project structure:**
```
What's the overall structure of this project?
```

---

### 5. **Hugging Face MCP Server**
Access AI models, datasets, and model information from Hugging Face.

#### Common Use Cases

**Search for models:**
```
#huggingface Find text-to-image models suitable for production use
```

**Get model details:**
```
#huggingface Show me details about the meta-llama/Llama-2-7b-chat-hf model
```

**Search for datasets:**
```
#huggingface Find datasets for sentiment analysis in multiple languages
```

**Get model card information:**
```
#huggingface Get the model card for bert-base-uncased including usage examples
```

**Find models by task:**
```
#huggingface Show me the top models for image classification
```

**Check model requirements:**
```
#huggingface What are the hardware requirements for running stable-diffusion-v1-5?
```

**Find compatible tokenizers:**
```
#huggingface What tokenizer should I use with the GPT-2 model?
```

---

## Writing Effective MCP Prompts

### Best Practices

1. **Use Hashtags to Explicitly Call MCP Servers**: Prefix your prompt with `#mcpServerName` to directly invoke a specific server
   - `#github` - GitHub operations
   - `#azure` - Azure resources and operations
   - `#context7` - Library and framework documentation
3. **Provide Context**: Include names, IDs, or identifiers
   - ❌ "Show me the database"
   - ✅ "Show me the schema for the 'users' table in my PostgreSQL database"

4. **Use Natural Language**: Write as you would speak
   - ✅ "Find all TypeScript files that use React hooks"
   - ✅ "#github What are the open issues in the microsoft/vscode repo?"

5. **Combine Actions**: Ask for multiple things at once
   - ✅ "#azure Show me all Azure resource groups and their locations"
   - ✅ "List running containers and their memory usage"

6. **Request Examples**: Ask for code samples when needed
   - ✅ "#context7 Show me an example of error boundaries in React"
   - ✅ "Show me an example of connecting to Azure Cosmos DB with JavaScript"
   - ✅ "What are the open issues in the microsoft/vscode repo?"

4. **Combine Actions**: Ask for multiple things at once
   - ✅ "Show me all Azure resource groups and their locations"
   - ✅ "List running containers and their memory usage"

5. **Request Examples**: Ask for code samples when needed
   - ✅ "Show me an example of connecting to Azure Cosmos DB with JavaScript"

---

## Common Workflow Examples

### 1. **Debugging Production Issues**

```
# Check logs
### 2. **Starting a New Feature**

```
# Research
#context7 Find documentation on implementing authentication with OAuth 2.0 in Express.js

# Check existing code
#github Show me how authentication is implemented in our user-service repository

# Get examples
Show me code examples from Microsoft Learn for Azure AD authentication
```

### 6. **AI/ML Model Integration**

```
# Find the right model
#huggingface Find pre-trained models for text summarization

# Get model details
#huggingface Show me the model card for facebook/bart-large-cnn including code examples

# Check compatibility
#huggingface What are the requirements for running this model in production?

# Find datasets for fine-tuning
#huggingface Search for question-answering datasets in English
```
# Research
### 3. **Code Review & Best Practices**

```
# Check best practices
#azure What are the Azure Functions best practices for error handling?

# Find examples
#github Search for examples of unit testing Azure Functions in microsoft/azure-functions-samples


## Quick Reference Commands

### GitHub
```
- "#github Show open PRs in [repo]"
- "#github Create an issue in [repo]"
- "#github Search for [term] in [repo]"
- "#github Show recent commits on [branch]"
- "#github List all branches in [repo]"
```

### Azure
```
- "#azure List my Azure subscriptions"
- "#azure Show resource groups in [subscription]"
- "#azure Check health of [resource name]"
- "#azure Generate Azure CLI command to [action]"
- "#azure Deploy [app] to Azure"
- "#azure Show Application Insights logs for [resource]"
```

### Documentation
```
- "Find Microsoft docs about [topic]"
- "Show code examples for [technology]"
- "#context7 Get documentation for [library]"
- "#context7 What's the latest on [API/feature]?"
- "#context7 Show me examples for [framework feature]"
```

### Hugging Face
```
- "#huggingface Find models for [task/use case]"
- "#huggingface Show details about [model name]"
- "#huggingface Search datasets for [topic]"
- "#huggingface Get model card for [model]"
- "#huggingface What are the requirements for [model]?"
- "#huggingface Find compatible tokenizer for [model]"
```

### Database
```
- "Show schema for [table]"
- "Query [database] for [condition]"
- "List all tables in [database]"
- "Get row count for [table]"
```

### Containers
```
- "Show running containers"
- "Get logs from [container]"
- "Inspect [image/container]"
- "List Docker volumes"
```

## Tips for Maximum Productivity

1. **Use Hashtags for Direct Invocation**: Prefix prompts with `#mcpServerName` to explicitly call specific MCP servers
   ```
   #azure List my resource groups
   #github Show open issues in this repo
   #context7 Get React hooks documentation
   #huggingface Find models for sentiment analysis
   ```

2. **Learn the Keywords**: MCP servers activate on specific keywords (Azure, GitHub, database names, etc.), but hashtags guarantee the right server is used

3. **Chain Requests**: Ask follow-up questions to dive deeper
   ```
   You: "#azure Show me Azure resource groups"
   Copilot: [lists resource groups]
   You: "#azure Show me all resources in the 'production' group"
   ```

4. **Save Common Queries**: Keep frequently used prompts in a file for quick reference

5. **Combine with @workspace**: Use MCP with workspace context
   ```
   @workspace #azure Find all files that connect to Azure Storage and show me the best practices for Azure Storage access
   ```

6. **Use for Learning**: Ask MCP to fetch documentation while you code
   ```
   #context7 Show me examples of error boundaries in React while I implement this component
   ```ave Common Queries**: Keep frequently used prompts in a file for quick reference

4. **Combine with @workspace**: Use MCP with workspace context
   ```
   @workspace Find all files that connect to Azure Storage and show me the best practices for Azure Storage access
   ```

5. **Use for Learning**: Ask MCP to fetch documentation while you code
### Using MCP for Code Generation

```
# Generate with context
#azure Get the Azure best practices for Functions
Generate a new HTTP trigger function following those guidelines

# Generate with examples
#context7 Show me code examples for MongoDB aggregation pipelines
Generate a similar aggregation query for our products collection

# Framework-specific generation
#context7 Get Next.js 14 server actions documentation
Generate a server action for user authentication based on these docs

# AI/ML integration
#huggingface Get details about the sentence-transformers/all-MiniLM-L6-v2 model
Generate Python code to use this model for semantic search in our application
```

### Using MCP for Code Generation

```
# Generate with context
#azure Get the Azure best practices for Functions
Generate a new HTTP trigger function following those guidelines

# Generate with examples
#context7 Show me code examples for MongoDB aggregation pipelines
Generate a similar aggregation query for our products collection

# Framework-specific generation
#context7 Get Next.js 14 server actions documentation
Generate a server action for user authentication based on these docs
```w me the GitHub repo for my Azure Function and check if there are any open issues about deployment errors

# Documentation + Code
Get the React documentation for useEffect and show me how it's used in our components

# Database + Best Practices
Show me the schema for my users table and suggest Azure best practices for securing this data
```

### Using MCP for Code Generation

```
# Generate with context
Get the Azure best practices for Functions and generate a new HTTP trigger function following those guidelines

# Generate with examples
Show me code examples from Microsoft Learn for Cosmos DB queries, then generate a similar query for our products collection
```

---

## Resources

- **MCP Specification**: https://modelcontextprotocol.io/
- **GitHub Copilot Documentation**: https://docs.github.com/copilot
- **Azure MCP Server**: Part of Azure GitHub Copilot extension
- **VS Code Extensions**: Search for "MCP" in the VS Code marketplace

---

## Summary

MCP servers transform GitHub Copilot from a code generator into a comprehensive development assistant that can:
- Access real-time data from external services
- Execute operations on cloud platforms
- Query databases and APIs
- Fetch up-to-date documentation
- Manage deployments and infrastructure

**Remember**: Just ask naturally! Copilot will figure out which MCP servers to use based on your request.

---
---

# Copilot Spec Kit
## What is Spec-Driven Development (SDD)?
Spec-Driven Development (often abbreviated as SDD) is an emerging software engineering practice that emphasizes writing a specification first and using it as the source of truth for building software, often with the help of AI coding agents.

Instead of starting with code and adjusting as requirements evolve, SDD begins by creating a structured specification that captures:

- **What you’re building** (functional requirements)
- **Why you’re building it** (business context)
- **How it should behave** (technical and architectural decisions)

This specification then drives the entire development workflow, including:

- Code generation by AI agents (e.g., GitHub Copilot, Claude, Gemini)
- Automated validation and testing
- Ongoing maintenance and evolution of the system

Think of it as **“version control for your thinking”** — making technical decisions explicit, reviewable, and evolvable rather than buried in scattered documents or locked in someone’s head

## What is Spec Kit
**Spec Kit** is a GitHub Copilot feature that helps you generate technical specifications from existing codebases. It analyzes your project structure, code patterns, and generates comprehensive documentation that can be used for onboarding, planning, or understanding legacy code.

## 1. Getting Started with Spec Kit

### Prerequisites
- GitHub Copilot subscription (Business or Enterprise)
- Visual Studio Code with GitHub Copilot extension
- An existing project/codebase

### Enabling Spec Kit
1. Open VS Code Settings (`Cmd+,` on macOS)
2. Search for "Copilot Spec Kit"
3. Ensure the feature is enabled


---

## 2. Basic Commands

### Generate Initial Spec
```
/spec generate
```
- Creates a comprehensive specification of your entire project
- Analyzes folder structure, dependencies, and code patterns
- Generates markdown documentation

### Generate Spec for Specific Component
```
/spec generate for [folder/file]
```
Example: `/spec generate for src/services/`

### Update Existing Spec
```
/spec update
```
- Refreshes specification based on code changes
- Useful after major refactoring or new features

---

## 3. Use Cases for Existing Projects

### A. Legacy Code Documentation
**Scenario:** You inherited a project with minimal documentation

**Prompt:**
```
/spec generate

After generation:
"Explain the architecture patterns used in this codebase"
"What are the main dependencies and their purposes?"
```

### B. Onboarding New Team Members
**Scenario:** New developer joining the team

**Steps:**
1. Generate project spec: `/spec generate`
2. Ask Copilot: "Create an onboarding guide based on this spec"
3. Ask: "What are the key areas a new developer should understand first?"

### C. Planning Refactoring
**Scenario:** Need to modernize or refactor parts of the codebase

**Prompts:**
```
/spec generate for src/legacy/

"Based on this spec, identify areas that need refactoring"
"Suggest modern patterns to replace the current implementation"
"What are the risks of refactoring this component?"
```

### D. API Documentation
**Scenario:** Document existing APIs

**Prompts:**
```
/spec generate for src/api/

"Generate API documentation with endpoints, parameters, and responses"
"Create OpenAPI/Swagger spec from this code"
```

### E. Dependency Analysis
**Scenario:** Understand project dependencies

**Prompts:**
```
/spec generate

"List all external dependencies and their versions"
"Identify outdated dependencies that need updates"
"Show dependency relationships between modules"
```

---

## 4. Advanced Techniques

### Incremental Specification
For large projects, generate specs incrementally:

```
/spec generate for src/frontend/
/spec generate for src/backend/
/spec generate for src/shared/
```

### Combining with Context Files
Use `.github/copilot-instructions.md` to guide spec generation:

Example content:
```markdown
# Project Context for Spec Generation

## Architecture
- Microservices architecture
- Event-driven communication
- React frontend with TypeScript

## Key Patterns
- Repository pattern for data access
- Factory pattern for service creation
- Observer pattern for event handling
```

### Interactive Spec Refinement
After generating initial spec:

```
"Add more details about the authentication flow"
"Explain the database schema and relationships"
"Document the deployment process"
"What security measures are implemented?"
```

---

## 5. Best Practices

### ✅ Do's
- Generate specs regularly as the project evolves
- Use specs as living documentation
- Include generated specs in code reviews
- Update specs after major changes
- Use specs for architectural decision records (ADRs)

### ❌ Don'ts
- Don't treat specs as 100% accurate without review
- Don't skip manual verification of critical sections
- Don't ignore context-specific knowledge
- Don't generate specs without understanding the project first

---

## 6. Common Workflows

### Workflow 3: Migration Planning
```
1. /spec generate
2. "I want to migrate from [old tech] to [new tech]"
3. "Create a step-by-step migration plan"
4. "What are the risks and mitigation strategies?"
```
### Workflow 2: Code Review Assistance
```
1. /spec generate for [changed-files]
2. "How do these changes affect the overall architecture?"
3. "Are there any potential breaking changes?"
4. "What tests should be added for these changes?"
```
---

## 7. Integration with Other Copilot Features

### With Chat
```
Chat: "Based on the spec, explain the authentication module"
Chat: "@workspace How does [component] fit into the architecture?"
```


## 8. Troubleshooting

### Issue: Spec generation is slow
**Solution:** Generate specs for smaller directories first

### Issue: Spec is too generic
**Solution:** Add project context via `.github/copilot-instructions.md`

### Issue: Missing important details
**Solution:** Use follow-up prompts to refine specific sections


## 9. Pro Tips

### Tip 1: Version Control Your Specs
Store generated specs in `docs/specs/` and track changes

### Tip 2: Combine with Architecture Diagrams
```
"Based on the spec, generate a Mermaid diagram of the architecture"
```

### Tip 3: Use for Bug Investigation
```
/spec generate for [buggy-component]
"Analyze potential issues in this component"
```

### Tip 4: Create Component Maps
```
"Create a dependency map showing how all components interact"
```

### Tip 5: Generate Test Plans
```
"Based on the spec, create a comprehensive test plan"
```

---

## 10. Example Session

```
Developer: /spec generate

Copilot: [Generates project specification]

Developer: "What's the most complex part of this codebase?"

Copilot: [Identifies and explains complex components]

Developer: "Create a refactoring plan for the payment processing module"

Copilot: [Provides detailed refactoring steps]

Developer: "What tests should I add before refactoring?"

Copilot: [Suggests test coverage improvements]
```

---

## Quick Reference Card

| Task | Command |
|------|---------|
| Generate full spec | `/spec generate` |
| Spec for specific path | `/spec generate for [path]` |
| Update existing spec | `/spec update` |
| Explain architecture | "Explain the architecture patterns" |
| Find refactoring opportunities | "Identify areas needing refactoring" |
| Create onboarding guide | "Create onboarding guide from spec" |
| Analyze dependencies | "List and analyze all dependencies" |
| Generate API docs | "Generate API documentation" |

---

## Resources

- **Official Docs:** [GitHub Copilot Documentation](https://docs.github.com/copilot)
- **Best Practices:** Use with `.github/copilot-instructions.md` for better context
- **Community:** GitHub Copilot Community Discussions

---

**Note:** Spec Kit is continuously evolving. Check for updates and new features regularly. Always review generated specifications and validate critical information manually.
