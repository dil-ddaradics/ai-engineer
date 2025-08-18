import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";

/**
 * Register all resources with the MCP server
 */
export function registerResources(server: McpServer): void {
  // AI Engineer Frameworks resource
  server.registerResource(
    "frameworks",
    new ResourceTemplate("frameworks://{category}", { list: undefined }),
    { 
      title: "AI Engineering Frameworks",
      description: "Provides information about popular AI engineering frameworks and tools"
    },
    async (uri, { category }) => {
      const frameworks: Record<string, string[]> = {
        "ml": ["TensorFlow", "PyTorch", "Scikit-learn", "JAX", "MXNet"],
        "nlp": ["HuggingFace Transformers", "spaCy", "NLTK", "AllenNLP", "StanfordNLP"],
        "cv": ["OpenCV", "TorchVision", "TensorFlow Vision", "Detectron2", "SimpleCV"],
        "rl": ["OpenAI Gym", "Stable Baselines", "RLlib", "Dopamine", "TensorFlow Agents"],
        "data": ["Pandas", "NumPy", "Polars", "Dask", "Vaex"]
      };
      
      const selectedCategory = typeof category === 'string' ? category.toLowerCase() : '';
      
      if (selectedCategory === "all") {
        return {
          contents: [{
            uri: uri.href,
            text: `Available AI Engineering Framework Categories:\n\n${Object.keys(frameworks).join("\n")}`
          }]
        };
      }
      
      if (selectedCategory in frameworks) {
        return {
          contents: [{
            uri: uri.href,
            text: `${selectedCategory.toUpperCase()} Frameworks:\n\n${frameworks[selectedCategory].join("\n")}`
          }]
        };
      }
      
      return {
        contents: [{
          uri: uri.href,
          text: `Category '${category}' not found. Available categories: ${Object.keys(frameworks).join(", ")}`
        }]
      };
    }
  );
  
  // AI Best Practices resource
  server.registerResource(
    "best-practices",
    new ResourceTemplate("best-practices://{topic}", { list: undefined }),
    { 
      title: "AI Engineering Best Practices",
      description: "Provides best practices for AI engineering topics"
    },
    async (uri, { topic }) => {
      const practices: Record<string, string> = {
        "testing": "AI Model Testing Best Practices:\n\n" + 
          "1. Test with diverse datasets\n" +
          "2. Use holdout validation sets\n" +
          "3. Check for bias and fairness\n" +
          "4. Evaluate model robustness\n" +
          "5. Implement A/B testing",
        
        "deployment": "AI Model Deployment Best Practices:\n\n" +
          "1. Containerize models for consistency\n" +
          "2. Implement CI/CD pipelines\n" +
          "3. Set up model monitoring\n" +
          "4. Use versioning for models\n" +
          "5. Implement progressive rollout",
        
        "monitoring": "AI Model Monitoring Best Practices:\n\n" +
          "1. Track prediction drift\n" +
          "2. Monitor data quality\n" +
          "3. Set performance thresholds\n" +
          "4. Implement alerting systems\n" +
          "5. Log model decisions",
          
        "ethics": "AI Ethics Best Practices:\n\n" +
          "1. Test for bias across demographics\n" +
          "2. Document model limitations\n" +
          "3. Implement explainable AI techniques\n" +
          "4. Conduct regular ethical reviews\n" +
          "5. Establish feedback mechanisms"
      };
      
      const selectedTopic = typeof topic === 'string' ? topic.toLowerCase() : '';
      
      if (selectedTopic === "all") {
        return {
          contents: [{
            uri: uri.href,
            text: `Available AI Best Practice Topics:\n\n${Object.keys(practices).join("\n")}`
          }]
        };
      }
      
      if (selectedTopic in practices) {
        return {
          contents: [{
            uri: uri.href,
            text: practices[selectedTopic]
          }]
        };
      }
      
      return {
        contents: [{
          uri: uri.href,
          text: `Topic '${topic}' not found. Available topics: ${Object.keys(practices).join(", ")}`
        }]
      };
    }
  );
}