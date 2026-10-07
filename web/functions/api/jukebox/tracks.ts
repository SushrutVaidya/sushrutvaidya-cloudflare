/**
 * GET /api/jukebox/tracks — verbatim port of JukeboxService.java's track list.
 */

const BASE = '/audio/'

export const onRequestGet = async (): Promise<Response> =>
  Response.json([
    { title: 'Welcome to Los Santos', artist: 'GTA V', audioURL: BASE + 'WelcomeToLosSantos.mp3' },
    { title: 'Soviet Connection', artist: 'GTA IV', audioURL: BASE + 'SovietConnection.mp3' },
    { title: 'Bury the Light', artist: 'Devil May Cry 5', audioURL: BASE + 'BuryTheLight.mp3' },
    { title: 'Oioi, Seisyundesuka?', artist: 'Gintama OST', audioURL: BASE + 'OioiSeisyundesuka.mp3' },
    { title: 'Teme-raaaa!! Soredemo Gintama Tsuitennokaaaa!', artist: 'Gintama OST', audioURL: BASE + 'TemeRaaa.mp3' },
    { title: "Can't Poop in Strange Places", artist: 'Family Guy', audioURL: BASE + 'CantPoopInStrangePlaces.mp3' },
    { title: 'Everybody Wants to Rule the World', artist: 'Josh Gad Cover', audioURL: BASE + 'EverybodyWantsToRuleTheWorldJoshGad.mp3' },
  ])
