import UIKit
import React
import React_RCTAppDelegate
import ReactAppDependencyProvider
import CarPlay

@main
class AppDelegate: UIResponder, UIApplicationDelegate {
  // Współdzielony dostęp do fabryki RN dla delegatów scen (telefon + CarPlay).
  static var shared: AppDelegate!

  // Wymagane przez RNCarPlay/CarPlay (odwołuje się do AppDelegate.window).
  var window: UIWindow?

  var reactNativeDelegate: ReactNativeDelegate?
  var reactNativeFactory: RCTReactNativeFactory?

  func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {
    AppDelegate.shared = self

    let delegate = ReactNativeDelegate()
    let factory = RCTReactNativeFactory(delegate: delegate)
    delegate.dependencyProvider = RCTAppDependencyProvider()

    reactNativeDelegate = delegate
    reactNativeFactory = factory

    // Okno tworzy delegat sceny (lifecycle scenowy jest wymagany przez CarPlay).
    return true
  }
}

class ReactNativeDelegate: RCTDefaultReactNativeFactoryDelegate {
  override func sourceURL(for bridge: RCTBridge) -> URL? {
    self.bundleURL()
  }

  override func bundleURL() -> URL? {
#if DEBUG
    RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index")
#else
    Bundle.main.url(forResource: "main", withExtension: "jsbundle")
#endif
  }
}

// MARK: - Scena telefonu (zwykłe okno aplikacji)

class PhoneSceneDelegate: UIResponder, UIWindowSceneDelegate {
  var window: UIWindow?

  func scene(
    _ scene: UIScene,
    willConnectTo session: UISceneSession,
    options connectionOptions: UIScene.ConnectionOptions
  ) {
    guard let windowScene = scene as? UIWindowScene else { return }
    let window = UIWindow(windowScene: windowScene)
    AppDelegate.shared.reactNativeFactory?.startReactNative(
      withModuleName: "AlfaRomeoAmbiente",
      in: window,
      launchOptions: nil
    )
    // Ciemne tło okna/roota — eliminuje biały błysk między LaunchScreen
    // a pierwszą klatką React Native (kolor bg0 = #04060B).
    let dark = UIColor(red: 4.0 / 255, green: 6.0 / 255, blue: 11.0 / 255, alpha: 1)
    window.backgroundColor = dark
    window.rootViewController?.view.backgroundColor = dark
    self.window = window
  }
}

// MARK: - Scena CarPlay (custom UI: własny komponent RN w oknie auta)
//
// Zamiast szablonów (Grid/List) montujemy własny widok RN jako rootViewController
// okna CarPlay — pełny, dowolny interfejs. Wariant „custom" do symulatora.
// (Wersja produkcyjna na kafle: patrz src/carplay/tilesTemplate.ts.)

class CarPlaySceneDelegate: UIResponder, CPTemplateApplicationSceneDelegate {
  var interfaceController: CPInterfaceController?
  var carWindow: CPWindow?

  // Uwaga: w praktyce odpala się TYLKO ten wariant (bez osobnego parametru okna).
  // Okno bierzemy z carWindow sceny i przekazujemy do react-native-carplay,
  // które renderuje szablony (Grid/TabBar) sterowane z JS.
  func templateApplicationScene(
    _ templateApplicationScene: CPTemplateApplicationScene,
    didConnect interfaceController: CPInterfaceController
  ) {
    self.interfaceController = interfaceController
    self.carWindow = templateApplicationScene.carWindow
    RNCarPlay.connect(with: interfaceController, window: templateApplicationScene.carWindow)
  }

  func templateApplicationScene(
    _ templateApplicationScene: CPTemplateApplicationScene,
    didDisconnectInterfaceController interfaceController: CPInterfaceController
  ) {
    self.interfaceController = nil
    self.carWindow = nil
    RNCarPlay.disconnect()
  }
}
