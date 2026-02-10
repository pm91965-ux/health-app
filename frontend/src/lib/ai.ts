export const getRecommendation = async (_history?: any, _profile?: any, _nutrition?: any, _labs?: any, _focus?: any) => {
  // Stub: return empty plan
  return {
    reasoning: "AI integration is temporarily disabled.",
    plan: [],
  };
};

export const analyzeSession = async (_session?: any, _history?: any, _profile?: any) => {
  // Stub: return empty analysis
  return {
    new_takeaways: [],
    updated_context: [],
    feedback: "AI analysis is temporarily disabled.",
  };
};
