import { defineStore } from 'pinia'

import { xxl } from '@/composables/useBreakpoints'
import { DBSettings, contextChildrenShowMode } from '@/enums'
import { pluginSetActive, updatePluginSettings } from '@/requests/plugins'

import { updateConfig } from '@/requests/settings'
import { usePlayer } from '@/stores/player'
import { content_width } from '../content-width'

export default defineStore('settings', {
    state: () => ({
        version: '',
        use_np_img: true,
        use_sidebar: false,
        extend_width: false,
        contextChildrenShowMode: contextChildrenShowMode.hover,
        artist_top_tracks_count: 5,
        repeat_all: true,
        repeat_one: false,
        root_dir_set: false,
        root_dirs: <string[]>[],

        enablePeriodicScans: false,
        periodicInterval: 0,
        enableWatchDog: false,

        folder_list_mode: false,
        volume: 1.0,
        mute: false,

        feat: true,
        prodby: true,
        clean_titles: true,
        hide_remaster: true,
        merge_albums: false,
        show_albums_as_singles: false,
        separators: <string[]>[],

        // client
        useCircularArtistImg: true,
        nowPlayingTrackOnTabTitle: false,
        streaming_quality: 'original',
        streaming_container: 'mp3',

        // plugins
        use_lyrics_plugin: <boolean | undefined>false,
        lyrics_plugin_settings: {
            auto_download: false,
            overide_unsynced: false,
        },

        // audio
        use_silence_skip: true,
        use_crossfade: false,
        crossfade_duration: 2000, // milliseconds
        use_legacy_streaming_endpoint: false,

        // layout
        layout: '',

        // stats
        statsgroup: "artists",
        statsperiod: "week",

        auto_shuffle: true,
    }),
    actions: {
        mapDbSettings(settings: DBSettings) {
            this.version = settings.version
            this.root_dirs = settings.rootDirs
            this.feat = settings.extractFeaturedArtists
            this.prodby = settings.removeProdBy
            this.clean_titles = settings.cleanAlbumTitle
            this.hide_remaster = settings.removeRemasterInfo
            this.merge_albums = settings.mergeAlbums
            this.separators = settings.artistSeparators
            this.show_albums_as_singles = settings.showAlbumsAsSingles

            this.enablePeriodicScans = settings.enablePeriodicScans
            this.periodicInterval = settings.scanInterval
            this.enableWatchDog = settings.enableWatchDog

            this.auto_shuffle = settings.autoShuffle

            this.use_lyrics_plugin = settings.plugins.find(p => p.name === 'lyrics_finder')?.active

            if (this.use_lyrics_plugin) {
                this.lyrics_plugin_settings = settings.plugins.find(p => p.name === 'lyrics_finder')?.settings
            }
        },
        setArtistSeparators(separators: string[]) {
            this.separators = separators
        },
        // now playing 👇
        toggleUseNPImg() {
            this.use_np_img = !this.use_np_img
        },
        // sidebar 👇
        toggleDisableSidebar() {
            if (this.is_alt_layout) {
                this.use_sidebar = false
                return
            }

            this.use_sidebar = !this.use_sidebar
        },
        toggleExtendWidth() {
            this.extend_width = !this.extend_width
        },
        // context menu 👇
        setContextChildrenShowMode(mode: contextChildrenShowMode) {
            this.contextChildrenShowMode = mode
        },
        toggleContextChildrenShowMode() {
            this.contextChildrenShowMode =
                this.contextChildrenShowMode === contextChildrenShowMode.click
                    ? contextChildrenShowMode.hover
                    : contextChildrenShowMode.click
        },
        // repeat 👇
        toggleRepeatMode() {
            if (this.repeat_all) {
                this.repeat_all = false
                this.repeat_one = true
                return
            }

            if (this.repeat_one) {
                this.repeat_one = false
                this.repeat_all = false
                return
            }

            if (!this.repeat_all && !this.repeat_one) {
                this.repeat_all = true
            }
        },
        setRootDirs(dirs: string[]) {
            this.root_dirs = dirs
        },
        // folders 👇
        toggleFolderListMode() {
            this.folder_list_mode = !this.folder_list_mode
        },
        toggleCleanTrackTitles() {
            this.clean_titles = !this.clean_titles
        },
        toggleShowAlbumAsSingle() {
            this.show_albums_as_singles = !this.show_albums_as_singles
        },
        // volume 👇
        setVolume(new_value: number) {
            const { setVolume } = usePlayer()

            setVolume(new_value)
            this.volume = new_value
        },
        toggleMute() {
            this.mute = !this.mute
            const { setMute } = usePlayer()
            setMute(this.mute)
        },
        initializeVolume() {
            const { setVolume, setMute } = usePlayer()
            setVolume(this.volume)
            setMute(this.mute)
        },
        toggleUseCircularArtistImg() {
            this.useCircularArtistImg = !this.useCircularArtistImg
        },
        toggleLyricsPlugin() {
            pluginSetActive('lyrics_finder', !this.use_lyrics_plugin).then(() => {
                this.use_lyrics_plugin = !this.use_lyrics_plugin
            })
        },
        toggleLyricsAutoDownload() {
            const state = this.lyrics_plugin_settings.auto_download ? false : true

            updatePluginSettings('lyrics_finder', {
                ...this.lyrics_plugin_settings,
                auto_download: state,
            }).then(() => {
                this.lyrics_plugin_settings.auto_download = state
            })
        },
        toggleLyricsOverideUnsynced() {
            const state = this.lyrics_plugin_settings.overide_unsynced ? false : true

            updatePluginSettings('lyrics_finder', {
                ...this.lyrics_plugin_settings,
                overide_unsynced: state,
            }).then(() => {
                this.lyrics_plugin_settings.overide_unsynced = state
            })
        },
        // audio 👇
        toggleUseSilenceSkip() {
            this.use_silence_skip = !this.use_silence_skip
        },
        toggleCrossfade() {
            this.use_crossfade = !this.use_crossfade
        },
        setCrossfadeDuration(duration: number) {
            this.crossfade_duration = duration * 1000
        },

        toggleUseLegacyStreamingEndpoint() {
            this.use_legacy_streaming_endpoint = !this.use_legacy_streaming_endpoint
        },

        // layout 👇
        toggleLayout() {
            if (this.layout == '') {
                this.layout = 'alternate'
                this.use_sidebar = false
                this.use_np_img = false
                return
            }

            this.layout = ''
            this.use_np_img = true
        },

        toggleNowPlayingTrackOnTabTitle() {
            this.nowPlayingTrackOnTabTitle = !this.nowPlayingTrackOnTabTitle
        },

        async genericToggleSetting(key: string, value: any, prop: string) {
            const oldValue = this[prop]
            this[prop] = value

            console.log(this[prop])

            const res = await updateConfig(key, value)

            if (res.status !== 200) {
                prop = oldValue
                return false
            }

            return true
        },

        async updatePeriodicInterval(interval: number) {
            return await this.genericToggleSetting('scanInterval', interval, 'periodicInterval')
        },

        async toggleWatchdog() {
            return await this.genericToggleSetting('enableWatchDog', !this.enableWatchDog, 'enableWatchDog')
        },

        async togglePeriodicScans() {
            return await this.genericToggleSetting(
                'enablePeriodicScans',
                !this.enablePeriodicScans,
                'enablePeriodicScans'
            )
        },

        async toggleExtractFeaturedArtists() {
            return await this.genericToggleSetting('extractFeaturedArtists', !this.feat, 'feat')
        },

        async toggleRemoveProdBy() {
            return await this.genericToggleSetting('removeProdBy', !this.prodby, 'prodby')
        },

        async toggleRemoveRemasterInfo() {
            return await this.genericToggleSetting('removeRemasterInfo', !this.hide_remaster, 'hide_remaster')
        },

        async toggleCleanAlbumTitle() {
            return await this.genericToggleSetting('cleanAlbumTitle', !this.clean_titles, 'clean_titles')
        },

        async toggleMergeAlbums() {
            return await this.genericToggleSetting('mergeAlbums', !this.merge_albums, 'merge_albums')
        },

        async toggleShowAlbumsAsSingles() {
            return await this.genericToggleSetting(
                'showAlbumsAsSingles',
                !this.show_albums_as_singles,
                'show_albums_as_singles'
            )
        },
        setStreamingQuality(quality: string) {
            this.streaming_quality = quality
        },
        setStatsGroup(group: string) {
            this.statsgroup = group
        },
        setStatsPeriod(period: string) {
            this.statsperiod = period
        },
        // playlists
        toggleAutoShuffle() {
            this.auto_shuffle = !this.auto_shuffle
        },
    },
    getters: {
        can_extend_width(): boolean {
            return this.is_default_layout && xxl.value
        },
        no_repeat(): boolean {
            return !this.repeat_all && !this.repeat_one
        },
        crossfade_duration_seconds(): number {
            return this.crossfade_duration / 1000
        },
        crossfade_on(): boolean {
            return this.use_crossfade && this.crossfade_duration > 0
        },
        is_default_layout: state => state.layout === '',
        is_alt_layout: state => state.layout === 'alternate' && content_width.value > 900,
    },
    persist: {
        afterRestore: context => {
            let store = context.store
            store.root_dirs = []
            store.root_dir_set = false

            // reset plugin settings
            store.use_lyrics_plugin = false
            store.lyrics_plugin_settings = {}
        },
    },
})
