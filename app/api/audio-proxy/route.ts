import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url")

  if (!url) {
    return NextResponse.json({ error: "URL parameter is required" }, { status: 400 })
  }

  try {
    // Fetch the audio file
    const response = await fetch(url)

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch audio: ${response.status} ${response.statusText}` },
        { status: response.status },
      )
    }

    // Get the audio data and content type
    const audioData = await response.arrayBuffer()
    const contentType = response.headers.get("content-type") || "audio/mpeg"

    // Return the audio data with appropriate headers
    return new NextResponse(audioData, {
      headers: {
        "Content-Type": contentType,
        "Content-Length": audioData.byteLength.toString(),
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=3600",
      },
    })
  } catch (error) {
    console.error("Error proxying audio:", error)
    return NextResponse.json({ error: `Error proxying audio: ${(error as Error).message}` }, { status: 500 })
  }
}
