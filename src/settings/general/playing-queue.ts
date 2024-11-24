import { Setting } from '@/interfaces/settings'
import { SettingType } from '../enums'

import useSettingsStore from '@/stores/settings'

const settings = useSettingsStore

const auto_shuffle: Setting = {
    title: 'Auto shuffle tracklist',
    desc: 'Shuffle tracklist before start playing Playlist / Artist / Album',
    type: SettingType.binary,
    state: () => settings().auto_shuffle,
    action: () => settings().toggleAutoShuffle(),
}

export default [auto_shuffle]
