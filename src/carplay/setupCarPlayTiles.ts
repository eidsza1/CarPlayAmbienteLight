/**
 * CarPlay na szablonach (driving-task). TabBar: Panel / Siatka / Lista / Sterowanie.
 * - Lista: żywy „checkbox" (✓ accessoryImage) aktualizowany przez updateSections.
 * - Siatka: duże kafle (6 kolorów), ✓ wpalony w zaznaczony (bez live-update — limit CarPlay).
 * Akcje sterują wspólnym store (BLE).
 */
import {
  CarPlay,
  GridTemplate,
  ListTemplate,
  TabBarTemplate,
} from 'react-native-carplay';
import { useAmbiente } from '../store/useAmbiente';
import { presetColors, RGB } from '../theme/theme';

const sameRGB = (a: RGB, b: RGB) => a[0] === b[0] && a[1] === b[1] && a[2] === b[2];

const TILE: Record<string, any> = {
  red: require('../../assets/carplay/tile_red.png'),
  orange: require('../../assets/carplay/tile_orange.png'),
  yellow: require('../../assets/carplay/tile_yellow.png'),
  green: require('../../assets/carplay/tile_green.png'),
  blue: require('../../assets/carplay/tile_blue.png'),
  pink: require('../../assets/carplay/tile_pink.png'),
};
// Kafle Siatki — checkbox wyśrodkowany na tle wnętrza (off/on).
const GRID_OFF: Record<string, any> = {
  red: require('../../assets/carplay/grid_red.png'),
  orange: require('../../assets/carplay/grid_orange.png'),
  yellow: require('../../assets/carplay/grid_yellow.png'),
  green: require('../../assets/carplay/grid_green.png'),
  blue: require('../../assets/carplay/grid_blue.png'),
  pink: require('../../assets/carplay/grid_pink.png'),
};
const GRID_ON: Record<string, any> = {
  red: require('../../assets/carplay/grid_red_on.png'),
  orange: require('../../assets/carplay/grid_orange_on.png'),
  yellow: require('../../assets/carplay/grid_yellow_on.png'),
  green: require('../../assets/carplay/grid_green_on.png'),
  blue: require('../../assets/carplay/grid_blue_on.png'),
  pink: require('../../assets/carplay/grid_pink_on.png'),
};
// Tryby — zdjęcie wnętrza zamiast tęczy.
const MODE_IMG: Record<string, any> = {
  seven: require('../../assets/carplay/tile_seven.png'),
  breathe: require('../../assets/carplay/tile_breathe.png'),
};

// Checkboxy jak w aplikacji telefonu: obrys w kolorze (off), wypełniony + ✓ (on).
const CB_OFF: Record<string, any> = {
  red: require('../../assets/carplay/cb_red_off.png'),
  orange: require('../../assets/carplay/cb_orange_off.png'),
  yellow: require('../../assets/carplay/cb_yellow_off.png'),
  green: require('../../assets/carplay/cb_green_off.png'),
  blue: require('../../assets/carplay/cb_blue_off.png'),
  pink: require('../../assets/carplay/cb_pink_off.png'),
};
const CB_ON: Record<string, any> = {
  red: require('../../assets/carplay/cb_red_on.png'),
  orange: require('../../assets/carplay/cb_orange_on.png'),
  yellow: require('../../assets/carplay/cb_yellow_on.png'),
  green: require('../../assets/carplay/cb_green_on.png'),
  blue: require('../../assets/carplay/cb_blue_on.png'),
  pink: require('../../assets/carplay/cb_pink_on.png'),
};
const CB_MODE_OFF = require('../../assets/carplay/cb_mode_off.png');
const CB_MODE_ON = require('../../assets/carplay/cb_mode_on.png');
const POWER_GREEN = require('../../assets/carplay/tile_power_green.png');
const POWER_GRAY = require('../../assets/carplay/tile_power_gray.png');
// Power w kolorze wybranego presetu (gdy włączone).
const POWER_COLOR: Record<string, any> = {
  red: require('../../assets/carplay/power_red.png'),
  orange: require('../../assets/carplay/power_orange.png'),
  yellow: require('../../assets/carplay/power_yellow.png'),
  green: require('../../assets/carplay/power_green.png'),
  blue: require('../../assets/carplay/power_blue.png'),
  pink: require('../../assets/carplay/power_pink.png'),
};
const BRIGHT_UP = require('../../assets/carplay/tile_bright_up.png');
const BRIGHT_DOWN = require('../../assets/carplay/tile_bright_down.png');
const SPEED_UP = require('../../assets/carplay/tile_speed_up.png');
const SPEED_DOWN = require('../../assets/carplay/tile_speed_down.png');
const clamp = (v: number) => Math.max(10, Math.min(100, v));

const MODES = [
  { id: 'seven', label: '7 kolorów', detail: 'Płynna zmiana 7 barw w pętli' },
  { id: 'breathe', label: 'Oddech', detail: 'Pulsujące rozjaśnianie i ściemnianie' },
];

function colorSelected(id: string): boolean {
  const s = useAmbiente.getState();
  const p = presetColors.find(x => x.id === id);
  return !!p && s.mode === 'color' && sameRGB(s.color, p.rgb as RGB);
}

function applyItem(id: string) {
  const s = useAmbiente.getState();
  if (id === 'seven') return void s.setSevenGradient();
  if (id === 'breathe') return void s.setBreathe();
  const p = presetColors.find(x => x.id === id);
  if (p) s.setColor(p.rgb as RGB, p.display as RGB);
}

// ---- Siatka (Grid) — duże kafle, tylko 6 kolorów ----
function gridTab(): GridTemplate {
  return new GridTemplate({
    title: 'Kolory',
    tabTitle: 'Siatka',
    tabSystemImageName: 'square.grid.2x2.fill',
    buttons: presetColors.map(p => ({
      id: p.id,
      titleVariants: [p.label],
      image: colorSelected(p.id) ? GRID_ON[p.id] : GRID_OFF[p.id],
    })),
    onButtonPressed: ({ id }) => applyItem(id),
  });
}

// ---- Lista — wiersze z żywym ✓ (accessoryImage tylko gdy zaznaczone) ----
let listTpl: ListTemplate | null = null;
const LIST_ORDER = [...presetColors.map(p => p.id), ...MODES.map(m => m.id)];
function listSections() {
  const s = useAmbiente.getState();
  const colorItems = presetColors.map(p => ({
    id: p.id,
    text: p.label,
    detailText: `Zmienia kolor taśmy na ${p.label.toLowerCase()}`,
    image: TILE[p.id],
    accessoryImage: colorSelected(p.id) ? CB_ON[p.id] : CB_OFF[p.id],
  }));
  const modeItems = MODES.map(m => ({
    id: m.id,
    text: m.label,
    detailText: m.detail,
    image: MODE_IMG[m.id],
    accessoryImage: s.mode === m.id ? CB_MODE_ON : CB_MODE_OFF,
  }));
  return [{ header: 'Kolor', items: [...colorItems, ...modeItems] }];
}
function listTab(): ListTemplate {
  listTpl = new ListTemplate({
    title: 'Kolory',
    tabTitle: 'Lista',
    tabSystemImageName: 'list.bullet',
    sections: listSections(),
    onItemSelect: async ({ index }) => applyItem(LIST_ORDER[index]),
  });
  return listTpl;
}

// ---- Jasność (power on/off + jasność) ----
function brightTab(): GridTemplate {
  const s = useAmbiente.getState();
  const on = s.power;
  const preset = presetColors.find(p => sameRGB(s.color, p.rgb as RGB));
  const onImage = preset ? POWER_COLOR[preset.id] : POWER_GREEN;
  return new GridTemplate({
    title: 'Jasność',
    tabTitle: 'Jasność',
    tabSystemImageName: 'sun.max.fill',
    buttons: [
      {
        id: 'power',
        titleVariants: [on ? 'Włączone' : 'Wyłączone'],
        image: on ? onImage : POWER_GRAY,
      },
      { id: 'bright_down', titleVariants: [`Jasność ${s.brightness}%`], image: BRIGHT_DOWN },
      { id: 'bright_up', titleVariants: [`Jasność ${s.brightness}%`], image: BRIGHT_UP },
    ],
    onButtonPressed: ({ id }) => {
      const st = useAmbiente.getState();
      if (id === 'power') st.togglePower();
      else if (id === 'bright_down') st.setBrightness(clamp(st.brightness - 10));
      else if (id === 'bright_up') st.setBrightness(clamp(st.brightness + 10));
    },
  });
}

// ---- Prędkość (tylko prędkość) ----
function speedTab(): GridTemplate {
  const s = useAmbiente.getState();
  return new GridTemplate({
    title: 'Prędkość',
    tabTitle: 'Prędkość',
    tabSystemImageName: 'speedometer',
    buttons: [
      { id: 'speed_down', titleVariants: [`Prędkość ${s.speed}%`], image: SPEED_DOWN },
      { id: 'speed_up', titleVariants: [`Prędkość ${s.speed}%`], image: SPEED_UP },
    ],
    onButtonPressed: ({ id }) => {
      const st = useAmbiente.getState();
      if (id === 'speed_down') st.setSpeed(clamp(st.speed - 10));
      else if (id === 'speed_up') st.setSpeed(clamp(st.speed + 10));
    },
  });
}

let tabBarTpl: TabBarTemplate | null = null;
const buildTabs = () => [listTab(), gridTab(), brightTab(), speedTab()];

export function setupCarPlayTiles() {
  try {
    CarPlay.registerOnConnect(() => {
      const s = useAmbiente.getState();
      if (s.status === 'idle' || s.status === 'error') s.connect();
      tabBarTpl = new TabBarTemplate({
        templates: buildTabs(),
        onTemplateSelect: () => {},
      });
      CarPlay.setRootTemplate(tabBarTpl);
    });
    CarPlay.registerOnDisconnect(() => {
      listTpl = null;
      tabBarTpl = null;
    });

    // Żywa aktualizacja po każdej zmianie stanu:
    // - Lista: w miejscu (bez resetu zakładki),
    // - Siatka: przez przebudowę zakładek (GridTemplate nie ma update w miejscu).
    useAmbiente.subscribe(() => {
      listTpl?.updateSections(listSections());
      tabBarTpl?.updateTemplates({ templates: buildTabs(), onTemplateSelect: () => {} });
    });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('[CarPlay] tiles setup error', e);
  }
}

setupCarPlayTiles();
