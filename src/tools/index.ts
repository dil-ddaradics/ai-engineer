import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

/**
 * Register all tools with the MCP server
 */
export function registerTools(server: McpServer): void {
  // AI model evaluator tool
  server.registerTool(
    "evaluate-model",
    {
      title: "AI Model Evaluator",
      description: "Evaluates AI model metrics based on input parameters",
      inputSchema: {
        modelType: z.enum(["classification", "regression", "generative"]).describe("Type of model to evaluate"),
        accuracy: z.number().min(0).max(1).describe("Model accuracy (0-1)"),
        precision: z.number().min(0).max(1).optional().describe("Model precision (0-1), optional for regression"),
        recall: z.number().min(0).max(1).optional().describe("Model recall (0-1), optional for regression"),
        f1Score: z.number().min(0).max(1).optional().describe("Model F1 score (0-1), optional")
      }
    },
    async ({ modelType, accuracy, precision, recall, f1Score }) => {
      // Calculate overall score based on model type
      let overallScore: number;
      let evaluation: string;
      
      if (modelType === "classification") {
        // For classification, weigh precision and recall
        if (!precision || !recall) {
          return {
            content: [{ 
              type: "text", 
              text: "Error: Classification models require precision and recall metrics."
            }]
          };
        }
        
        overallScore = (accuracy * 0.4) + (precision * 0.3) + (recall * 0.3);
        
        if (overallScore >= 0.9) {
          evaluation = "Excellent";
        } else if (overallScore >= 0.8) {
          evaluation = "Good";
        } else if (overallScore >= 0.7) {
          evaluation = "Acceptable";
        } else if (overallScore >= 0.6) {
          evaluation = "Needs improvement";
        } else {
          evaluation = "Poor";
        }
      } else if (modelType === "regression") {
        // For regression, focus on accuracy
        overallScore = accuracy;
        
        if (overallScore >= 0.9) {
          evaluation = "Excellent";
        } else if (overallScore >= 0.8) {
          evaluation = "Good";
        } else if (overallScore >= 0.7) {
          evaluation = "Acceptable";
        } else if (overallScore >= 0.6) {
          evaluation = "Needs improvement";
        } else {
          evaluation = "Poor";
        }
      } else { // generative
        // For generative models, use custom formula
        if (!precision) {
          return {
            content: [{ 
              type: "text", 
              text: "Error: Generative models require precision metric."
            }]
          };
        }
        
        overallScore = (accuracy * 0.5) + (precision * 0.5);
        
        if (overallScore >= 0.85) {
          evaluation = "Excellent";
        } else if (overallScore >= 0.75) {
          evaluation = "Good";
        } else if (overallScore >= 0.65) {
          evaluation = "Acceptable";
        } else if (overallScore >= 0.55) {
          evaluation = "Needs improvement";
        } else {
          evaluation = "Poor";
        }
      }
      
      // Format output with additional recommendations
      let recommendations = "";
      
      if (evaluation === "Poor" || evaluation === "Needs improvement") {
        if (modelType === "classification") {
          recommendations = "Recommendations:\n" +
            "- Review class imbalance in your dataset\n" +
            "- Consider more sophisticated algorithms\n" +
            "- Increase training data volume\n" +
            "- Try feature engineering";
        } else if (modelType === "regression") {
          recommendations = "Recommendations:\n" +
            "- Check for outliers in your data\n" +
            "- Try regularization techniques\n" +
            "- Consider polynomial features\n" +
            "- Normalize input features";
        } else { // generative
          recommendations = "Recommendations:\n" +
            "- Increase diversity in training data\n" +
            "- Fine-tune model parameters\n" +
            "- Implement better sampling techniques\n" +
            "- Consider model architecture changes";
        }
      }
      
      return {
        content: [{ 
          type: "text", 
          text: `Model Evaluation Results:\n\n` +
            `Model Type: ${modelType}\n` +
            `Overall Score: ${overallScore.toFixed(2)}\n` +
            `Rating: ${evaluation}\n\n` +
            `Metrics:\n` +
            `- Accuracy: ${accuracy.toFixed(2)}\n` +
            `${precision ? `- Precision: ${precision.toFixed(2)}\n` : ''}` +
            `${recall ? `- Recall: ${recall.toFixed(2)}\n` : ''}` +
            `${f1Score ? `- F1 Score: ${f1Score.toFixed(2)}\n` : ''}` +
            `\n${recommendations}`
        }]
      };
    }
  );
  
  // AI prompt generator tool
  server.registerTool(
    "generate-prompt",
    {
      title: "AI Prompt Generator",
      description: "Generates structured prompts for different AI tasks",
      inputSchema: {
        taskType: z.enum(["text-classification", "image-generation", "code-completion", "question-answering"]).describe("Type of AI task"),
        context: z.string().describe("Specific context or domain for the prompt"),
        complexity: z.enum(["simple", "moderate", "complex"]).describe("Desired complexity level")
      }
    },
    async ({ taskType, context, complexity }) => {
      // Generate prompt structure based on task type
      let promptTemplate = "";
      
      if (taskType === "text-classification") {
        if (complexity === "simple") {
          promptTemplate = `Classify the following text into appropriate categories related to ${context}:
          
[Text to classify]

Categories: [List relevant categories]`;
        } else if (complexity === "moderate") {
          promptTemplate = `Analyze and classify the following text into the most appropriate categories related to ${context}. Provide confidence scores for your top 3 classifications.
          
[Text to classify]

Expected output format:
1. [Category] - [Confidence score]
2. [Category] - [Confidence score]
3. [Category] - [Confidence score]

Explanation: [Brief explanation of classification rationale]`;
        } else { // complex
          promptTemplate = `Perform a detailed classification of the following text related to ${context}. Consider multiple classification dimensions including topic, sentiment, style, and audience. Provide reasoning for each classification and confidence scores.
          
[Text to classify]

Output format:
Topic: [Classifications with confidence scores]
Sentiment: [Classifications with confidence scores]
Style: [Classifications with confidence scores]
Audience: [Classifications with confidence scores]

Detailed Analysis:
[In-depth explanation of classification decisions, noting key textual evidence for each dimension]`;
        }
      } else if (taskType === "image-generation") {
        if (complexity === "simple") {
          promptTemplate = `Generate an image of ${context}.

Style: [Specify style]
Colors: [Color palette]`;
        } else if (complexity === "moderate") {
          promptTemplate = `Generate an image depicting ${context}.

Style: [Specify art style]
Lighting: [Describe lighting conditions]
Perspective: [Specify viewpoint]
Mood: [Describe emotional tone]
Details: [Important elements to include]`;
        } else { // complex
          promptTemplate = `Generate a highly detailed image portraying ${context}.

Style: [Specific art style with reference artists if applicable]
Composition: [Detailed composition instructions]
Lighting: [Specific lighting setup and effects]
Color scheme: [Detailed color palette and relationships]
Foreground elements: [Detailed description of main subjects]
Background elements: [Detailed description of setting]
Mood/atmosphere: [Emotional qualities of the image]
Technical specifications: [Resolution, aspect ratio, rendering technique]
Reference imagery: [Description of similar imagery to draw inspiration from]`;
        }
      } else if (taskType === "code-completion") {
        if (complexity === "simple") {
          promptTemplate = `Complete the following ${context} code snippet:
          
\`\`\`
[Partial code here]
\`\`\``;
        } else if (complexity === "moderate") {
          promptTemplate = `Complete and optimize the following ${context} code snippet. Ensure it follows best practices for readability and performance.
          
\`\`\`
[Partial code here]
\`\`\`

Requirements:
- [Specific requirement 1]
- [Specific requirement 2]`;
        } else { // complex
          promptTemplate = `Complete, optimize, and document the following ${context} code snippet. Implement robust error handling, follow all language-specific best practices, and ensure high performance.
          
\`\`\`
[Partial code here]
\`\`\`

Requirements:
- [Specific requirement 1]
- [Specific requirement 2]
- [Specific requirement 3]

Expected inputs/outputs:
- [Input/output specification]

Edge cases to handle:
- [Edge case 1]
- [Edge case 2]

Please provide:
1. Completed code with comments
2. Brief explanation of your implementation approach
3. Any performance considerations or optimizations applied`;
        }
      } else { // question-answering
        if (complexity === "simple") {
          promptTemplate = `Answer the following question about ${context}:
          
[Question here]`;
        } else if (complexity === "moderate") {
          promptTemplate = `Provide a detailed answer to the following question about ${context}. Include relevant facts, examples, and references where appropriate.
          
[Question here]`;
        } else { // complex
          promptTemplate = `Provide a comprehensive, nuanced answer to the following question about ${context}. Consider multiple perspectives, address potential counterarguments, cite relevant research or data, and organize your response logically.
          
[Question here]

Your response should include:
- Initial direct answer to the question
- Detailed explanation with supporting evidence
- Alternative viewpoints or interpretations
- Limitations of current knowledge on this topic
- Practical implications or applications
- References to authoritative sources`;
        }
      }
      
      return {
        content: [{ 
          type: "text", 
          text: `Prompt Template for ${taskType} (${complexity} complexity):\n\n${promptTemplate}\n\nUsage Instructions:\nReplace placeholders in [brackets] with your specific content. Adjust the prompt as needed to better match your specific use case within the ${context} domain.`
        }]
      };
    }
  );
}