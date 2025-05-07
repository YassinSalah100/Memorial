import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

// Function to get SQL client - will attempt to create a new connection on each request
function getSqlClient() {
  try {
    // Create a new connection for each request to avoid connection pooling issues
    return neon(process.env.DATABASE_URL!)
  } catch (error) {
    console.error("Failed to initialize database connection:", error)
    throw new Error("Database connection failed")
  }
}

// Helper function to format timestamps
function formatTimestamp(timestamp: Date): string {
  const now = new Date()
  const diff = now.getTime() - timestamp.getTime()

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
    const days = Math.floor(seconds / 86400)
    return `${days} ${days === 1 ? "day" : "days"} ago`
  }
}

export async function GET() {
  try {
    console.log("GET /api/prayers: Attempting to fetch prayers from database")

    // Get SQL client for this request
    const sql = getSqlClient()

    // Fetch prayers from the database with a higher limit to ensure all prayers are returned
    // Adding a LIMIT clause to prevent potential issues with very large datasets
    const prayers = await sql`
      SELECT id, text, name, timestamp 
      FROM prayers 
      ORDER BY timestamp DESC
      LIMIT 1000
    `

    console.log(`GET /api/prayers: Found ${prayers.length} prayers`)

    // Format the timestamps for display
    const formattedPrayers = prayers.map((prayer: any) => ({
      id: prayer.id.toString(),
      text: prayer.text,
      name: prayer.name || undefined,
      timestamp: formatTimestamp(new Date(prayer.timestamp)),
    }))

    return NextResponse.json(formattedPrayers)
  } catch (error: any) {
    console.error("Error fetching prayers:", error)
    // Return more detailed error information
    return NextResponse.json(
      {
        error: "Failed to fetch prayers",
        details: error.message,
      },
      { status: 500 },
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
