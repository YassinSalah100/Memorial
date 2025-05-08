import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

// Function to get SQL client with connection pooling
function getSqlClient() {
  try {
    // Create a new connection with explicit connection closing
    const sql = neon(process.env.DATABASE_URL!)

    // Add a debug log to track connection creation
    console.log("Database connection established successfully")

    return sql
  } catch (error) {
    console.error("Failed to initialize database connection:", error)
    throw new Error("Database connection failed")
  }
}

// Helper function to format timestamps for Egypt timezone
function formatTimestamp(timestamp: Date): string {
  try {
    // Format the timestamp in Egypt timezone (EET/EEST)
    const egyptTime = new Intl.DateTimeFormat("en-US", {
      timeZone: "Africa/Cairo",
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "short",
      hour12: true,
    }).format(timestamp)

    const now = new Date()

    // Convert both dates to Egypt timezone for comparison
    const egyptNow = new Date(new Date().toLocaleString("en-US", { timeZone: "Africa/Cairo" }))
    const egyptTimestamp = new Date(timestamp.toLocaleString("en-US", { timeZone: "Africa/Cairo" }))

    const diff = egyptNow.getTime() - egyptTimestamp.getTime()

    // Convert to seconds
    const seconds = Math.floor(diff / 1000)

    if (seconds < 60) {
      return "Just now"
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60)
      return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`
    } else if (seconds < 86400) {
      const hours = Math.floor(seconds / 3600)
      return `${hours} ${hours === 1 ? "hour" : "hours"} ago`
    } else {
      // Return the formatted Egypt time
      return egyptTime
    }
  } catch (error) {
    console.error("Error formatting timestamp:", error)
    return "Unknown time"
  }
}

export async function GET() {
  try {
    console.log("GET /api/prayers: Attempting to fetch prayers from database")

    // Get SQL client for this request
    const sql = getSqlClient()

    // Fetch ALL prayers from the database - no limit to ensure consistency
    console.log("Executing SQL query to fetch prayers")
    const prayers = await sql`
      SELECT id, text, name, timestamp 
      FROM prayers 
      ORDER BY timestamp DESC
    `

    console.log(
      `GET /api/prayers: Found ${prayers.length} prayers. First prayer ID: ${prayers.length > 0 ? prayers[0].id : "none"}, Last prayer ID: ${prayers.length > 0 ? prayers[prayers.length - 1].id : "none"}`,
    )

    // Format the timestamps for display
    const formattedPrayers = prayers.map((prayer: any) => ({
      id: prayer.id.toString(),
      text: prayer.text,
      name: prayer.name || undefined,
      timestamp: formatTimestamp(new Date(prayer.timestamp)),
    }))

    // Set cache control headers to prevent caching
    return new NextResponse(JSON.stringify(formattedPrayers), {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
        "Surrogate-Control": "no-store",
      },
    })
  } catch (error: any) {
    console.error("Error fetching prayers:", error)
    // Return more detailed error information
    return NextResponse.json(
      {
        error: "Failed to fetch prayers",
        details: error.message,
      },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
        },
      },
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log("POST /api/prayers: Received prayer", body)

    // Get SQL client for this request
    const sql = getSqlClient()

    // Validate the request
    if (!body.text || body.text.trim() === "") {
      return NextResponse.json({ error: "Prayer text is required" }, { status: 400 })
    }

    // Insert the new prayer into the database
    const result = await sql`
      INSERT INTO prayers (text, name, timestamp)
      VALUES (${body.text}, ${body.name || null}, NOW())
      RETURNING id, text, name, timestamp
    `

    console.log("POST /api/prayers: Prayer saved successfully", result[0])

    // Get the inserted prayer
    const newPrayer = result[0]

    // Format the response
    const formattedPrayer = {
      id: newPrayer.id.toString(),
      text: newPrayer.text,
      name: newPrayer.name || undefined,
      timestamp: "Just now",
    }

    return NextResponse.json(formattedPrayer, { status: 201 })
  } catch (error: any) {
    console.error("Error creating prayer:", error)
    // Return more detailed error information
    return NextResponse.json(
      {
        error: "Failed to create prayer",
        details: error.message,
      },
      { status: 500 },
    )
  }
}

// Add a DELETE endpoint to remove prayers
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    // Get SQL client for this request
    const sql = getSqlClient()

    if (!id) {
      return NextResponse.json({ error: "Prayer ID is required" }, { status: 400 })
    }

    console.log(`DELETE /api/prayers: Deleting prayer with ID ${id}`)

    // Delete the prayer from the database
    const result = await sql`
      DELETE FROM prayers
      WHERE id = ${id}
      RETURNING id
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Prayer not found" }, { status: 404 })
    }

    console.log(`DELETE /api/prayers: Prayer with ID ${id} deleted successfully`)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error deleting prayer:", error)
    // Return more detailed error information
    return NextResponse.json(
      {
        error: "Failed to delete prayer",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
