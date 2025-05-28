import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "lib", "setup", "create-all-tables.sql")
    const sql = fs.readFileSync(filePath, "utf8")

    return new NextResponse(sql, {
      headers: {
        "Content-Type": "text/plain",
      },
    })
  } catch (error) {
    console.error("Error reading SQL file:", error)
    return new NextResponse("Failed to read SQL file", { status: 500 })
  }
}
