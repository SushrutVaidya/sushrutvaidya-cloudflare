/**
 * GET /api/stats — the "Now" hero sentence data.
 *
 * Faithful port of StatsService.java: static location/game/song/book from the
 * backend's application.properties, plus the time-of-day song rotation (6 slots
 * of 4 hours). Hour is computed in IST (UTC+5:30) so the rotation matches "his"
 * local time rather than the Worker's UTC. The UI runs its own clock, so
 * currentTime here is informational only.
 */

const SONGS = [
  'Funkadelic.mp3', // 12am–4am
  'Lawrie.mp3', // 4am–8am
  'Aladeeeeen.mp3', // 8am–12pm
  'ManMazeUmalunGele.mp3', // 12pm–4pm
  'EverybodyWantsToRuleTheWorldJoshGad.mp3', // 4pm–8pm
  'miMorchaNelaNahi.mp3', // 8pm–12am
]

export const onRequestGet = async (): Promise<Response> => {
  const istMs = Date.now() + 5.5 * 60 * 60 * 1000
  const ist = new Date(istMs)
  const hour = ist.getUTCHours()
  const songURL = '/audio/' + SONGS[Math.min(Math.floor(hour / 4), SONGS.length - 1)]

  const h12 = ((hour + 11) % 12) + 1
  const currentTime = `${h12}:${String(ist.getUTCMinutes()).padStart(2, '0')}`

  return Response.json({
    location: 'Hyderabad',
    game: 'Counter Strike 2',
    currentTime,
    timeStamp: Date.now(),
    songName: 'a banger',
    songURL,
    bookName: 'Fundamentals of Microcontrollers and MicroProcessors',
  })
}
