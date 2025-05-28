import { NextResponse } from "next/server"
import { checkAndUpdateSchema } from "@/lib/setup/check-schema"

export async function GET() {
  try {
    const result = await checkAndUpdateSchema()

    return NextResponse.json({ success: result })
  } catch (error) {
    console.error("Error in check-schema API:", error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}
