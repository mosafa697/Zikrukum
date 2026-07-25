# React Native Migration Docs

This folder contains the implementation documents for rewriting the current web app into a React Native Android app while keeping the existing web project in the same repository.

## Recommended Reading Order

1. [react-native-migration-overview.md](react-native-migration-overview.md)
2. [react-native-architecture.md](react-native-architecture.md)
3. [react-native-execution-checklist.md](react-native-execution-checklist.md)
4. [play-store-release-checklist.md](play-store-release-checklist.md)

## Intended Outcome

The target is a new Expo-based React Native app added in a subdirectory such as `native/`, with feature parity for the current azkar experience on Android and a clear path to publishing on Google Play.

## Scope Guardrails

- Keep the current web app operational.
- Create the native app as a separate project inside this repository.
- Prefer low code sharing in phase one to reduce migration risk.
- Preserve user-facing behavior before optimizing architecture.
- Defer iOS, backend sync, analytics, and notifications until after Android parity.