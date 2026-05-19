import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

export async function GET() {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ ok: false, error: 'No API key found in .env.local' })
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })
    const result = await model.generateContent('Reply with only the word: READY')
    const text = result.response.text().trim()

    return NextResponse.json({ ok: true, reply: text, model: 'gemini-2.0-flash' })

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Test failed'
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}
