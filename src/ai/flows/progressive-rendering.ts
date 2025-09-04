'use server';

/**
 * @fileOverview An AI agent that decides when to generate a low-resolution preview and progressively refine details.
 *
 * - shouldRefine - A function that determines whether to refine the image based on user interaction.
 * - ProgressiveRenderingInput - The input type for the shouldRefine function.
 * - ProgressiveRenderingOutput - The return type for the shouldRefine function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ProgressiveRenderingInputSchema = z.object({
  isInteracting: z
    .boolean()
    .describe(
      'A boolean indicating whether the user is currently interacting with the Mandelbrot set (e.g., zooming, panning).' /* HTML-escape: < and > are allowed in .tsx files */
    ),
});
export type ProgressiveRenderingInput = z.infer<
  typeof ProgressiveRenderingInputSchema
>;

const ProgressiveRenderingOutputSchema = z.object({
  shouldRefine: z
    .boolean()
    .describe(
      'A boolean indicating whether the Mandelbrot set should be rendered with more detail. Should be true if the user is not interacting.' /* HTML-escape: < and > are allowed in .tsx files */
    ),
});
export type ProgressiveRenderingOutput = z.infer<
  typeof ProgressiveRenderingOutputSchema
>;

export async function shouldRefine(
  input: ProgressiveRenderingInput
): Promise<ProgressiveRenderingOutput> {
  return progressiveRenderingFlow(input);
}

const prompt = ai.definePrompt({
  name: 'progressiveRenderingPrompt',
  input: {schema: ProgressiveRenderingInputSchema},
  output: {schema: ProgressiveRenderingOutputSchema},
  prompt: `You are an expert system that determines whether a Mandelbrot set image should be rendered with more detail based on user interaction.

  The user is interacting with the Mandelbrot set: {{isInteracting}}

  Based on this information, determine whether the Mandelbrot set should be rendered with more detail.
  If the user is not interacting (isInteracting is false), then the Mandelbrot set should be rendered with more detail, so return true.
  If the user is interacting (isInteracting is true), then the Mandelbrot set should not be rendered with more detail, so return false.`, /* HTML-escape: < and > are allowed in .tsx files */
});

const progressiveRenderingFlow = ai.defineFlow(
  {
    name: 'progressiveRenderingFlow',
    inputSchema: ProgressiveRenderingInputSchema,
    outputSchema: ProgressiveRenderingOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
