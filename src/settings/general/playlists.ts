import { Setting } from '@/interfaces/settings'
import { SettingType } from '../enums'

import useSettingsStore from '@/stores/settings'

const settings = useSettingsStore

const clean_album_titles: Setting = {
    title: 'Auto shuffle queue',
    desc: 'Shuffle playlist songs queue before start playing',
    type: SettingType.binary,
    state: () => settings().auto_shuffle,
    action: () => settings().toggleCleanAlbumTitle(),
}

export default [clean_album_titles]
