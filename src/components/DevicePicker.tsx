/**
 * Lista wykrytych taśm „LEDCAR-" — wybór urządzenia, gdy nie jesteśmy połączeni.
 * Obsługuje wiele urządzeń (np. auto i dom). Wybrane jest zapamiętywane i przy
 * kolejnym starcie apka łączy się z nim automatycznie.
 */
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { GlassCard } from './GlassCard';
import { colors, radius, type } from '../theme/theme';
import type { ScannedDevice } from '../ble/manager';
import type { ConnStatus } from '../ble/manager';

type Props = {
  devices: ScannedDevice[];
  status: ConnStatus;
  onPick: (id: string) => void;
  onRescan: () => void;
};

const signalBars = (rssi: number) => {
  if (rssi >= -60) return 3;
  if (rssi >= -75) return 2;
  return 1;
};

export const DevicePicker: React.FC<Props> = ({ devices, status, onPick, onRescan }) => {
  const scanning = status === 'scanning' || status === 'connecting';

  return (
    <GlassCard style={styles.card}>
      <View style={styles.header}>
        <Text style={type.label}>Urządzenia</Text>
        <Pressable onPress={onRescan} hitSlop={10}>
          <Text style={[type.label, { color: colors.accent }]}>
            {scanning ? 'Szukam…' : 'Skanuj'}
          </Text>
        </Pressable>
      </View>

      {devices.length === 0 ? (
        <Text style={[type.body, { color: colors.textDim, paddingVertical: 10 }]}>
          {scanning ? 'Szukam taśm LEDCAR w pobliżu…' : 'Brak urządzeń. Dotknij „Skanuj".'}
        </Text>
      ) : (
        devices.map(d => (
          <Pressable key={d.id} style={styles.row} onPress={() => onPick(d.id)}>
            <View style={{ flex: 1 }}>
              <Text style={type.body} numberOfLines={1}>
                {d.name}
              </Text>
              <Text style={[type.label, { marginTop: 2 }]}>{d.id.slice(0, 8)}…</Text>
            </View>
            <View style={styles.bars}>
              {[1, 2, 3].map(i => (
                <View
                  key={i}
                  style={[
                    styles.bar,
                    { height: 6 + i * 4 },
                    i <= signalBars(d.rssi)
                      ? { backgroundColor: colors.good }
                      : { backgroundColor: colors.hairline },
                  ]}
                />
              ))}
            </View>
          </Pressable>
        ))
      )}
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  card: {},
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.hairlineSoft,
    gap: 12,
  },
  bars: { flexDirection: 'row', alignItems: 'flex-end', gap: 3, height: 20 },
  bar: { width: 5, borderRadius: radius.sm },
});
