/**
 * Własny komponent UI renderowany w oknie CarPlay/Android Auto przez
 * MapTemplate.component. Bezpieczny dla kierowcy: duże kafle, brak wpisywania
 * tekstu, prosty układ. Czyta TEN SAM store co ekran telefonu (jeden proces JS).
 */
import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { Background } from '../components/Background';
import { colors, presetColors, radius, rgbToCss, type, RGB } from '../theme/theme';
import { useAmbiente } from '../store/useAmbiente';

const Tile: React.FC<{
  color?: string;
  label: string;
  onPress: () => void;
  active?: boolean;
}> = ({ color, label, onPress, active }) => (
  <Pressable
    onPress={onPress}
    style={[
      styles.tile,
      { backgroundColor: color ?? colors.glass },
      active && styles.tileActive,
    ]}
  >
    <Text style={[type.label, { color: color ? '#fff' : colors.textDim }]}>{label}</Text>
  </Pressable>
);

export const CarPlayPanel: React.FC = () => {
  const s = useAmbiente();
  const { width } = useWindowDimensions();
  const compact = width < 700;

  const stepBrightness = (delta: number) =>
    s.setBrightness(Math.max(10, Math.min(100, s.brightness + delta)));

  return (
    <View style={styles.root}>
      <Background accent={s.color} mirror />
      <View style={styles.content}>
        {/* Status + power */}
        <View style={styles.topRow}>
          <Text style={[type.title, { fontSize: 20 }]}>
            {s.status === 'connected' ? 'Ambient' : 'Łączenie…'}
          </Text>
          <Pressable
            style={[styles.power, { borderColor: s.power ? rgbToCss(s.color) : colors.textFaint }]}
            onPress={s.togglePower}
          >
            <Text style={[type.label, { color: s.power ? rgbToCss(s.color) : colors.textFaint }]}>
              {s.power ? 'WŁ.' : 'WYŁ.'}
            </Text>
          </Pressable>
        </View>

        {/* Kolory */}
        <View style={[styles.colorRow, compact && { flexWrap: 'wrap' }]}>
          {presetColors.map(p => (
            <Tile
              key={p.id}
              color={rgbToCss(p.display as RGB)}
              label={p.label}
              active={
                s.color[0] === p.rgb[0] &&
                s.color[1] === p.rgb[1] &&
                s.color[2] === p.rgb[2]
              }
              onPress={() => s.setColor(p.rgb as RGB, p.display as RGB)}
            />
          ))}
        </View>

        {/* Jasność +/- i tryb Oddech */}
        <View style={styles.bottomRow}>
          <Tile label="– Jasność" onPress={() => stepBrightness(-10)} />
          <View style={styles.brightBadge}>
            <Text style={type.value}>{s.brightness}%</Text>
          </View>
          <Tile label="Jasność +" onPress={() => stepBrightness(+10)} />
          <Tile
            label="Oddech"
            active={s.mode === 'breathe'}
            onPress={s.setBreathe}
          />
          <Tile
            label="7 kolorów"
            active={s.mode === 'seven'}
            onPress={s.setSevenGradient}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg0 },
  content: { flex: 1, padding: 18, gap: 16, justifyContent: 'space-between' },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  power: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: radius.pill,
    borderWidth: 2,
    backgroundColor: colors.glass,
  },
  colorRow: { flexDirection: 'row', gap: 12, flex: 1, alignItems: 'stretch' },
  bottomRow: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  tile: {
    flex: 1,
    minHeight: 64,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.hairline,
  },
  tileActive: { borderColor: '#fff', borderWidth: 2 },
  brightBadge: { alignItems: 'center', justifyContent: 'center', minWidth: 70 },
});
