# AI Workflow: [Workflow Name]

## Overview
*Describe the purpose of this AI workflow or agent design. What LLM is called (e.g., Gemini Flash), what problem it solves, and how it is integrated.*

## System Prompt Design
*The core instruction structure used to prime the model.*

```markdown
You are an expert assistant specialized in [Domain]. Your task is to:
1. Analyze the inputs carefully.
2. Formulate the response strictly adhering to the JSON schema.
...
```

---

## Input Variables
*Variables injected dynamically into the prompt template.*
| Variable | Type | Description | Example |
|----------|------|-------------|---------|
| `inputVar` | String | Description of the input data | `"John Doe"` |

---

## Output Schema
*Define the structured format expected from the LLM, and how we enforce/validate it.*

### Expected JSON Format
```json
{
  "result": "analyzed output",
  "confidence": 0.95
}
```

### Parsing & Validation Strategy
- Use Gemini SDK Structured Outputs (`responseSchema` configuration) to force JSON compliance.
- Validate the parsed output using Zod parsing library on the server side.

---

## Fallbacks & Error Handling
*Strategies for handling failures, timeouts, rate limits, or bad formats.*
- **API Failure:** Revert to a rule-based generator or return a user-friendly error message.
- **Parsing Error:** Implement a retry mechanism or use a regex-based fallback parser.

---

## Future Improvements
*Optimizations, fine-tuning candidates, prompt chaining, or migration to newer models.*
- [ ] Implement local prompt caching to reduce API costs.

## References
- [AI System Architecture](../05-ai-system.md)
- [Prompt Library](../09-prompts.md)

## Developer Notes
- Monitor token usage closely. Keep input context size small.
- Do not expose raw prompt instructions to the client side. Always route LLM requests through secure server-side Next.js route handlers.
