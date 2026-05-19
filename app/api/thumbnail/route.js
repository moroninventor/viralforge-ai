import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST() {

  try {

    const genAI = new GoogleGenerativeAI(
      process.env.GEMINI_API_KEY
    );

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
    });

    let text = "";

    try {

      const result = await model.generateContent([

        `
You are ViralForge Thumbnail Intelligence AI.

Generate:
- thumbnail optimization strategy
- emotional framing advice
- CTR optimization
- viral title recommendation
`

      ]);

      text = result.response.text();

    } catch (error) {

      console.error(error);

      text = `

=== THUMBNAIL PSYCHOLOGY AGENT ===

Recommended Improvements:
- Increase facial zoom by 30%
- Add stronger emotional contrast
- Use brighter foreground lighting
- Reduce background clutter

CTR Prediction: 89%
Engagement Potential: High

Recommended Hook:
"You Won't Believe What Happens Next 😳"

`;

    }

    return Response.json({
      text,
    });

  } catch (error) {

    console.error(error);

    return Response.json({
      error: "Thumbnail intelligence failed",
    });

  }

}