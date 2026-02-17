import { BrandBrain } from "@prisma/client";

export function buildCopyPrompt(userInput: string, brain: BrandBrain, angle: string, format: string) {
    // Already handled in generator.ts, but we could migrate it here for consistency.
    // For now, let's focus on Visuals.
}

export function buildVisualPrompt(userInput: string, brain: BrandBrain) {
    const {
        primaryColors,
        secondaryColors,
        imageStyle,
        visualSummary,
        brandSummary,
        winningPatterns
    } = brain as any;

    const colorContext = primaryColors.length > 0
        ? `Adhere to the brand's primary color palette: ${primaryColors.join(", ")}.`
        : "";

    const styleContext = imageStyle || visualSummary || "";

    const performanceContext = winningPatterns?.visualSuccessFactors?.length > 0
        ? `\n[PERFORMANCE MEMORY - SUCCESS FACTORS: ${winningPatterns.visualSuccessFactors.join(", ")}]`
        : "";

    // Construct a rich prompt that guides the AI
    return `
${performanceContext}
[STYLE: ${styleContext}]
[COLORS: ${colorContext}]
[BRAND VIBE: ${brandSummary}]

USER REQUEST: ${userInput}

INSTRUCTIONS:
1. Create a high-end commercial visual that embodies the style and colors above.
2. Ensure the composition is professional and aligned with the brand's aesthetic.
3. (CRITICAL) Analyze the "Winning Patterns" section if provided. These are historical insights on what has performed well for this brand. Prioritize these hooks, angles, and visual elements.
`.trim();
}
