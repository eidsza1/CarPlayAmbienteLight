/**
 * Predefiniowane kolory jako lista wierszy z checkboxem (styl Porsche/Bose).
 * Bez dużych kafli — kolor niesie kolorowa nazwa i wypełnienie zaznaczonego
 * checkboxa. Do taśmy wysyłany jest skalibrowany `rgb`. Haptyka impactMedium.
 */
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import { presetColors, colors, rgbToCss, RGB, type } from '../theme/theme';

type Props = {
  selected: RGB; // aktualnie wysłany kolor
  onSelect: (send: RGB, display: RGB) => void;
};

const isSame = (a: RGB, b: RGB) => a[0] === b[0] && a[1] === b[1] && a[2] === b[2];

export const ColorSwatches: React.FC<Props> = ({ selected, onSelect }) => (
  <View>
    {presetColors.map((p, i) => {
      const active = isSame(selected, p.rgb as RGB);
      const css = rgbToCss(p.display as RGB);
      return (
        <Pressable
          key={p.id}
          style={[styles.row, i > 0 && styles.divider]}
          onPress={() => {
            ReactNativeHapticFeedback.trigger('impactMedium', {
              enableVibrateFallback: true,
              ignoreAndroidSystemSettings: false,
            });
            onSelect(p.rgb as RGB, p.display as RGB);
          }}
        >
          <Text style={[styles.name, { color: active ? css : colors.textDim }]}>
            {p.label}
          </Text>
          <View
            style={[
              styles.checkbox,
              { borderColor: css },
              active && { backgroundColor: css },
            ]}
          >
            {active && <Text style={styles.check}>✓</Text>}
          </View>
        </Pressable>
      );
    })}
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
  },
  divider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.hairlineSoft,
  },
  name: { ...type.title, fontSize: 18 },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 7,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  check: { color: '#04060B', fontSize: 17, fontWeight: '800', lineHeight: 19 },
});
