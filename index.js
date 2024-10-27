const fs = require("fs")

const getDate = (game) => {
  const date = new Date(game.end_time * 1000)

  const day = date.getDate()
  const month = date.getMonth() + 1 // Months are zero-based
  const year = date.getFullYear()

  return `${day}/${month}/${year}`
}

async function fetchAllGames(username) {
  try {
    // Fetch the archives (all available months with games)
    const archiveResponse = await fetch(
      `https://api.chess.com/pub/player/${username}/games/archives`
    )
    if (!archiveResponse.ok) {
      throw new Error(
        `Failed to fetch archives for user ${username}: ${archiveResponse.statusText}`
      )
    }

    const { archives } = await archiveResponse.json()

    // Fetch games from each archive (each URL corresponds to a month's games)
    const gameFetches = archives.map((url) =>
      fetch(url).then((res) => res.json())
    )

    // Wait for all game fetches to complete
    const gameResults = await Promise.all(gameFetches)

    // Extract the games from each month's data
    const allGames = gameResults.flatMap((result) => result.games)

    return allGames
  } catch (error) {
    console.error("Error fetching games:", error)
    return []
  }
}

// Usage example
fetchAllGames("sleeprerun").then((games) => {
  const filePath = `sleeprerun_games.csv`
  console.log(games[0])
  const asd = games
    .map((g) => ({
      url: g.url,
      rating:
        g.white.username === "SleepReRun" ? g.white.rating : g.black.rating,
      date: getDate(g),
    }))
    .map((g) => `${g.url},${g.date},${g.rating}`)
    .join("\n")

  fs.writeFileSync(filePath, JSON.stringify(asd))
})
