import { FromOptions, NotifType, playSources } from '@/enums'

import { useToast } from '@/stores/notification'
import useAlbum from '@/stores/pages/album'
import useArtist from '@/stores/pages/artist'
import usePlaylist from '@/stores/pages/playlist'
import useQueue from '@/stores/queue'
import useTracklist from '@/stores/queue/tracklist'
import useSettingsStore from '@/stores/settings'

import { Track } from '@/interfaces'
import { getAlbumTracks } from '@/requests/album'
import { getArtistTracks } from '@/requests/artists'
import { getFavTracks } from '@/requests/favorite'
import { getFiles } from '@/requests/folders'
import { getPlaylist } from '@/requests/playlists'

export async function utilPlayFromArtist(index: number = 0) {
    const queue = useQueue()
    const artist = useArtist()
    const tracklist = useTracklist()

    const settings = useSettingsStore()

    if (artist.tracks.length === 0) return

    if (artist.info.trackcount <= settings.artist_top_tracks_count) {
        tracklist.setFromArtist(artist.info.artisthash, artist.info.name, artist.tracks)
        queue.play()
        return
    }

    const tracks = await getArtistTracks(artist.info.artisthash)

    tracklist.setFromArtist(artist.info.artisthash, artist.info.name, tracks)
    if (settings.auto_shuffle) tracklist.shuffleList()
    queue.play(index)
}

export async function playFromAlbumCard(albumhash: string, albumname: string) {
    const queue = useQueue()
    const tracklist = useTracklist()
    const settings = useSettingsStore()

    const tracks = await getAlbumTracks(albumhash)

    if (tracks.length === 0) {
        useToast().showNotification('Album tracks not found', NotifType.Error)
        return
    }

    tracklist.setFromAlbum(albumname, albumhash, tracks)
    if (settings.auto_shuffle) tracklist.shuffleList()
    queue.play()
}

export async function playFromArtistCard(artisthash: string, artistname: string) {
    const queue = useQueue()
    const tracklist = useTracklist()
    const tracks = await getArtistTracks(artisthash)
    const settings = useSettingsStore()

    if (tracks.length === 0) {
        useToast().showNotification('Artist tracks not found', NotifType.Error)
        return
    }

    tracklist.setFromArtist(artisthash, artistname, tracks)
    if (settings.auto_shuffle) tracklist.shuffleList()
    queue.play()
}

export async function playFromFolderCard(folderpath: string) {
    const queue = useQueue()
    const tracklist = useTracklist()

    const data = await getFiles(folderpath, 0, -1, true)
    const tracks = data.tracks
    const settings = useSettingsStore()

    if (tracks.length === 0) {
        useToast().showNotification('Folder tracks not found', NotifType.Error)
        return
    }

    tracklist.setFromFolder(folderpath, tracks)
    if (settings.auto_shuffle) tracklist.shuffleList()
    queue.play()
}

export async function playFromFavorites(track: Track | undefined) {
    const queue = useQueue()
    const tracklist = useTracklist()
    console.log(track)

    // if our tracklist is not from favorites, we need to fetch the favorites
    if (tracklist.from.type !== FromOptions.favorite) {
        const res = await getFavTracks(0, -1)
        console.log(res)
        tracklist.setFromFav(res.tracks)
    }

    let index = 0

    if (track) {
        index = tracklist.tracklist.findIndex(t => t.trackhash === track?.trackhash)
    }
    else {
        const settings = useSettingsStore()
        if (settings.auto_shuffle) tracklist.shuffleList()
    }

    console.log(tracklist.tracklist)
    queue.play(index)
}

export async function playFromPlaylist(id: string, track?: Track) {
    const queue = useQueue()
    const tracklist = useTracklist()
    const data = await getPlaylist(id)

    if (!data) return

    const { tracks, info } = data

    tracklist.setFromPlaylist(info.name, info.id, tracks)

    if (track) {
        const index = tracks.findIndex(t => t.trackhash === track.trackhash)
        queue.play(index)
    } else {
        const settings = useSettingsStore()
        if (settings.auto_shuffle) tracklist.shuffleList()
        queue.play()
    }
}

export const playFrom = async (source: playSources) => {
    const queue = useQueue()
    const tracklist = useTracklist()
    const settings = useSettingsStore()

    switch (source) {
        case playSources.album: {
            const album = useAlbum()

            tracklist.setFromAlbum(album.info.title, album.info.albumhash, album.srcTracks)
            if (settings.auto_shuffle) tracklist.shuffleList()
            queue.play()
            break
        }

        case playSources.playlist: {
            const playlist = usePlaylist()

            if (playlist.tracks.length === 0) return
            if (playlist.tracks.length !== playlist.info.count) {
                // Fetch all tracks if not already fetched
                await playlist.fetchAll(playlist.info.id, false, true)
            }
            tracklist.setFromPlaylist(playlist.info.name, playlist.info.id, playlist.tracks)
            if (settings.auto_shuffle) tracklist.shuffleList()
            queue.play()

            break
        }

        case playSources.artist:
            utilPlayFromArtist(0)
    }
}
