### Atlassian MCP availability check

> To verify if the Atlassian Model Context Protocol (MCP) integration is available and functioning correctly, please:
>
> 1. First, check if you have access to any Atlassian MCP functions by attempting to call the basic user information function `mcp__atlassian__atlassianUserInfo` with no parameters.
> 2. If successful, the function will return the current user's Atlassian account details including account ID, email, name, and other profile information.
> 3. If unsuccessful or if you receive an error about the function not being available, then the Atlassian MCP is not properly installed or configured.

### GitHub MCP availability check

> To verify if the GitHub Model Context Protocol (MCP) integration is available and functioning correctly, please:
>
> 1. **Discover tools**: Check your available tools/functions for GitHub-related capabilities (look for functions containing terms like "github", "gh", or "git" in their names or descriptions).
> 2. **Test a basic operation**: Try a minimal call such as a simple repository search using a generic term like "test" **or** list the repositories the authenticated user can access.
> 3. **Analyze the response**:
     >
     >    * If you receive GitHub data (repositories, issues, etc.), the GitHub integration is working and authenticated.
>    * If you receive an authentication error, the GitHub integration exists but requires authentication.
>    * If no GitHub tools/functions are available, the integration is not installed.

