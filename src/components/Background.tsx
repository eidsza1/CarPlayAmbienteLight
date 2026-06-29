/**
 * Tło ekranu — głęboki kosmiczny gradient + delikatne gwiazdy + opcjonalna
 * poświata w kolorze ambientu. Obsługuje też zdjęcie wnętrza z lustrzanym
 * odbiciem (steruje propem `mirror` → transform scaleX(-1), żeby kierownica
 * znalazła się po lewej stronie).
 */
import React, { useMemo } from 'react';
import { StyleSheet, View, Image, ImageSourcePropType } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { colors, glow, RGB } from '../theme/theme';

type Props = {
  accent?: RGB; // kolor poświaty (aktualny kolor taśmy)
  photo?: ImageSourcePropType; // opcjonalne zdjęcie wnętrza
  mirror?: boolean; // odbicie lustrzane zdjęcia (kierownica po lewej)
};

const STAR_COUNT = 60;

export const Background: React.FC<Props> = ({ accent, photo, mirror = true }) => {
  // Deterministyczne pozycje gwiazd liczone raz na montaż.
  const stars = useMemo(
    () =>
      Array.from({ length: STAR_COUNT }, () => ({
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        size: Math.random() < 0.85 ? 1.5 : 2.5,
        opacity: 0.15 + Math.random() * 0.5,
      })),
    [],
  );

  return (
    <View style={StyleSheet.absoluteFill}>
      <LinearGradient
        colors={[colors.bg0, colors.bg1, colors.nebula]}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {photo && (
        <>
          <Image
            source={photo}
            resizeMode="cover"
            style={[
              StyleSheet.absoluteFill,
              styles.photo,
              mirror && { transform: [{ scaleX: -1 }] },
            ]}
          />
          {/* Scrim od dołu — czytelność treści nad zdjęciem */}
          <LinearGradient
            colors={['transparent', 'rgba(4,6,11,0.55)', 'rgba(4,6,11,0.92)']}
            start={{ x: 0.5, y: 0.15 }}
            end={{ x: 0.5, y: 1 }}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          />
        </>
      )}

      {/* Gwiazdy — tylko gdy brak zdjęcia */}
      {!photo && stars.map((s, i) => (
        <View
          key={i}
          style={{
            position: 'absolute',
            top: s.top as any,
            left: s.left as any,
            width: s.size,
            height: s.size,
            borderRadius: s.size,
            backgroundColor: '#ffffff',
            opacity: s.opacity,
          }}
        />
      ))}

      {/* Poświata mgławicy w kolorze ambientu (góra) */}
      {accent && (
        <LinearGradient
          colors={[glow(accent, 0.22), 'transparent']}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 0.6 }}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
      )}

      {/* Przyciemnienie dla czytelności treści */}
      <View style={styles.scrim} pointerEvents="none" />
    </View>
  );
};

const styles = StyleSheet.create({
  photo: { opacity: 0.55 },
  scrim: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(4,6,11,0.35)',
  },
});
