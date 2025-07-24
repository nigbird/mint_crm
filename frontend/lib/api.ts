const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api"

export async function fetchCases() {
  const res = await fetch(`${API_BASE_URL}/cases/`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
  })

  if (!res.ok) {
    throw new Error("Failed to fetch cases")
  }

  return res.json()
}
