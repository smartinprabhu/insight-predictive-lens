
// Mock implementation for genkit
export const ai = {
  prompt: async (prompt: string, options?: any) => {
    console.log('AI prompt:', prompt);
    return {
      text: () => "This is a mock response from the AI model.",
    };
  }
};
