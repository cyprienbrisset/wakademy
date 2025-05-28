import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "lib", "setup", "seed-sample-data.sql")
    const sql = fs.readFileSync(filePath, "utf8")

    return NextResponse.json({ sql })
  } catch (error) {
    console.error("Error reading SQL file:", error)
    return NextResponse.json({ error: "Failed to read SQL file" }, { status: 500 })
  }
}
