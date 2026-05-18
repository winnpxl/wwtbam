import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

/**
 * Generates a vague, Millionaire-style AI hint for a question.
 * Never reveals the answer directly — just nudges the player.
 */
export async function getAiHint(
  questionText: string,
  options: string[]
): Promise<string> {
  const optionList = options
    .map((o, i) => `${String.fromCharCode(65 + i)}. ${o}`)
    .join("\n");

  const message = await anthropic.messages.create({
    model: "claude-haiku-4-5",
    max_tokens: 150,
    messages: [
      {
        role: "user",
        content: `You are the AI lifeline on Who Wants to Be a Millionaire?. A contestant needs a hint.

Question: ${questionText}

Options:
${optionList}

Give a SHORT, dramatic hint (1-2 sentences max). Be like a cryptic friend on the phone — helpful but vague. DO NOT reveal the answer directly. Use wordplay, associations, or context clues. Start with "Well, I'll say this..." or similar Millionaire-style phrasing.`,
      },
    ],
  });

  const content = message.content[0];
  if (content.type === "text") return content.text;
  return "The answer lies somewhere between certainty and doubt...";
}
