Plan: CarPlay custom UI dla sterowania oświetleniem ambient (React Native + Expo)

Brief dla agenta Claude Code. Wykonuj zadania po kolei. Po każdym zadaniu zatrzymaj się,
pokaż diff i poczekaj na potwierdzenie. NIE publikuj, NIE zmieniaj entitlementów/credentiali
EAS bez pytania. Przy decyzjach architektonicznych — zatrzymaj się i zapytaj.

Kontekst

Apka React Native + Expo ma już działające CarPlay, ale renderuje przez ograniczony szablon
(np. ListTemplate/GridTemplate). Cel: zastąpić to dowolnym własnym UI w oknie CarPlay,
do sterowania oświetleniem ambient (suwak jasności, presety kolorów, strefy).

Mechanizm: react-native-carplay udostępnia MapTemplate z propem component (alias render),
który montuje dowolne drzewo komponentów RN w oknie mapy. To jedyny szablon, w którym
biblioteka pozwala na swobodne, ciągle odświeżane UI (map screens). Czyli rysujemy panel ambientu
jako zwykły komponent React i podajemy go do MapTemplate — zostajemy w JS, nie piszemy UIKit.

Entitlement com.apple.developer.carplay-maps jest już przyznany.

Decyzja architektoniczna (NIE zmieniaj bez pytania)

Zostajemy w React Native/JS. Custom UI = komponent RN przekazany do MapTemplate.component.
NIE piszemy natywnego UIKit VC (osierociłby logikę JS i transport do sprzętu).
Dev build + config plugin obowiązkowo. Expo Go NIE załaduje CarPlay. Build przez EAS
(lub lokalny expo prebuild) z dev clientem.
Fork biblioteki zależy od architektury projektu — patrz zadanie 0. Nie hardcode'uj.

Założenia do WERYFIKACJI w zadaniu 0 (nie zakładaj — sprawdź i raportuj)

Wersja Expo SDK, React Native, i czy New Architecture jest włączona
(app.json → newArchEnabled, lub RCTNewArchEnabled).
Czy projekt jest managed (CNG / prebuild) czy bare (jest katalog ios/)?
Która biblioteka CarPlay jest teraz używana i w jakiej wersji?
(birkir/react-native-carplay, @g4rb4g3/..., @spicysparks/..., @iternio/react-native-auto-play)
Jaki template jest dziś ustawiany jako root i GDZIE w kodzie (setRootTemplate)?
Czy jest config plugin do CarPlay w app.json/app.config.\*? Czy scena CarPlay jest
skonfigurowana (Info.plist CPTemplateApplicationSceneSessionRoleApplication)?
Czy com.apple.developer.carplay-maps jest w ios.entitlements (app config) lub w .entitlements?
Jak budujecie dev buildy (EAS? eas.json profile? lokalny prebuild?).
Gdzie żyje logika/stan sterowania oświetleniem (store: Redux/Zustand/Context?, serwis transportu).

Output: raport z odpowiedziami. Na tej podstawie wybierz fork:

New Arch + Expo SDK 53+ → preferuj fork z deklarowanym wsparciem New Arch (np. @g4rb4g3/react-native-carplay
lub @iternio/react-native-auto-play). NIE używaj gotowego pluginu zakładającego starą architekturę.
Stara architektura → birkir/react-native-carplay + istniejący config plugin jest OK.
Jeśli projekt już używa jakiegoś forka i działa — zostań przy nim, chyba że nie wspiera MapTemplate.component.
Zatrzymaj się i potwierdź wybór forka ze mną przed instalacją.

Zadania

Zadanie 0 — Rozpoznanie (tylko odczyt)

Odpowiedz na 8 pytań powyżej. Zaproponuj fork + uzasadnij. Nie instaluj jeszcze nic.

Zadanie 1 — Plumbing: dev build, config plugin, scena, entitlement

Cel: czysty dev build, w którym CarPlay w ogóle się podłącza (jeszcze ze starym/dowolnym template).

Upewnij się, że istnieje config plugin dla CarPlay, który: dzieli apkę na dwie sceny
(Phone + CarPlay), wstrzykuje wpis sceny do Info.plist, dodaje entitlement
com.apple.developer.carplay-maps, i modyfikuje AppDelegate pod CarPlay scene delegate.
W app.json/app.config.js: dodaj plugin, ustaw ios.entitlements z kluczem carplay-maps
(jeśli plugin tego nie robi).
W eas.json: profil simulator z developmentClient: true i simulator: true
(pozwala testować CarPlay w symulatorze niezależnie od statusu entitlementu).
Zbuduj dev build (EAS lub lokalnie expo prebuild + Xcode).
Acceptance: w CarPlay Simulator (Xcode → I/O → External Displays → CarPlay) apka się
podłącza, registerOnConnect odpala, widać jakikolwiek root template. Brak crasha.

Zadanie 2 — Przełączenie na MapTemplate z custom komponentem (placeholder)

Zamień obecny root template na MapTemplate z propem component wskazującym placeholder:
komponent RN z czarnym tłem + <Text>Ambient</Text>.
Zarejestruj go jako root w registerOnConnect (CarPlay.setRootTemplate(mapTemplate)).
NIE włączaj interfejsu panningu mapy — przechwytuje gesty i zabiera dotyk komponentowi.
Acceptance: w symulatorze okno CarPlay pokazuje placeholder RN zamiast starego szablonu.

Zadanie 3 — Realne UI ambientu jako komponent RN

Zbuduj <AmbientControl /> (zwykły komponent RN renderowany w MapTemplate):

suwak jasności (np. @react-native-community/slider — sprawdź, czy działa w oknie CarPlay;
jeśli nie, zrób własny touch-slider na Pressable/PanResponder),
siatka presetów kolorów (Pressable w gridzie),
opcjonalnie przełącznik stref.

Layout responsywny (flex, Dimensions/useWindowDimensions) — head unity mają różne
rozdzielczości; żadnych sztywnych pikseli na sztywno pod jeden ekran.
Duże cele dotykowe (kontekst jazdy).
Akcje na razie tylko logują wartości.
Acceptance: suwak i przyciski reagują na dotyk w symulatorze, layout nie rozjeżdża się
przy zmianie rozmiaru okna symulatora.

Zadanie 4 — Podpięcie istniejącej logiki/stanu

Połącz <AmbientControl /> z istniejącym store/serwisem (z zadania 0) — NIE duplikuj logiki.
Zmiana suwaka/presetu → akcja w store → istniejący serwis transportu do sprzętu.
WAŻNE: komponent w oknie CarPlay i ekran na telefonie muszą czytać ten sam stan
(sceny dzielą proces, więc współdzielony store JS działa). Zadbaj o synchronizację obu ekranów.
Jeśli serwis transportu nie istnieje — ZATRZYMAJ SIĘ i zapytaj (warstwa sprzętowa poza zakresem).
Acceptance: ruch suwaka w CarPlay wywołuje realną metodę warstwy domenowej (log z wnętrza
serwisu), a zmiana stanu odbija się też na ekranie telefonu.

Zadanie 5 — Twardnienie lifecycle (krytyczne dla realnego auta)

Cold start / bundler: jeśli telefon jest podłączony do auta przed startem apki, scena CarPlay
może wstać pierwsza, zanim bundler/most RN ruszy. Zweryfikuj, że wybrany fork współdzieli
most/root view factory między scenami (singleton mostu lub reactNativeFactory.rootViewFactory
na New Arch). Jeśli nie — to jest źródło czarnego ekranu; zgłoś i ustalmy fix.
Obsłuż registerOnConnect / registerOnDisconnect i czyszczenie przy disconnect.
Przetestuj wielokrotne connect/disconnect w symulatorze.
Acceptance: wielokrotne podłączenie/odłączenie sceny CarPlay nie wywala apki ani nie daje
czarnego ekranu; po reconnectcie stan się zgadza.

Zadanie 6 — Czyszczenie

Usuń martwy kod starego template'u (po potwierdzeniu, że nic go nie używa).
README: jak odpalić CarPlay w symulatorze, jak zrobić dev build, architektura
(MapTemplate.component + współdzielony store), gdzie punkt wejścia (registerOnConnect).

Pułapki (przeczytaj przed kodowaniem)

Expo Go nie zadziała. CarPlay wymaga natywnego kodu → dev build + config plugin. Zawsze.
Architektura forka. New Arch (domyślna od RN 0.76 / Expo SDK 53) wymaga forka z jej
wsparciem. Stary config plugin zakładający old arch wysadzi build. Ustal to w zadaniu 0.
Panning = utrata dotyku. Nie włączaj interfejsu panningu na MapTemplate — przejmie gesty,
a twój komponent przestanie reagować. Najczęstszy powód „przyciski martwe".
Cold start / bundler nie działa. Patrz zadanie 5. Most RN musi być współdzielony między
scenami, inaczej czarny ekran na realnym radiu.
Komponenty zależne od natywnych gestów (slidery, scroll) mogą zachowywać się inaczej
w oknie CarPlay niż na telefonie — testuj w symulatorze, miej fallback na własny touch handler.
Brak klawiatury w oknie CarPlay — nie projektuj UI wymagającego wpisywania tekstu.
Build error template keyword (Obj-C++) bywał w starszych wersjach przy Expo — jeśli wystąpi,
to znak, że fork/wersja są nieaktualne; zgłoś zamiast obchodzić ręcznie.

Czego NIE robić

Nie pisz natywnego UIKit VC — zostajemy w komponencie RN w MapTemplate.
Nie włączaj panningu mapy.
Nie zmieniaj entitlementów, credentiali EAS ani profili podpisu bez pytania.
Nie duplikuj logiki sterowania w warstwie CarPlay — używaj wspólnego store/serwisu.
Nie próbuj na Expo Go.

Definicja ukończenia (cały plan)

Komponent RN ambientu renderuje się w oknie CarPlay przez MapTemplate.component zamiast starego
szablonu, reaguje na dotyk, czyta/zapisuje wspólny store, woła istniejący serwis transportu,
i przeżywa connect/disconnect oraz cold start w symulatorze. Test na fizycznym radiu — osobny krok
po akceptacji symulatora.
