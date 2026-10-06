# Changelog

All notable changes to this module will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [4.0.0] - 2026-10-05

### Added

- Trigger Workflow action, to start a Slack Workflow Builder workflow from its webhook URL with a JSON object of variables
- Disable Link Previews and Disable Media Previews options on the Send Custom Message action
- Variable support and a multi-line editor for the Send Block Kit Message body
- Failed sends are retried once when Slack can't be reached or returns a server error
- Validation of the Slack webhook URL format in the module configuration

### Changed

- **Breaking:** Requires Companion 4.3 or later (module API 2.0)
- The Slack webhook URL is now stored as a secret; existing URLs are moved automatically
- Sends now time out so actions finish within Companion's 5 second action timeout
- Error logs now include Slack's reason (for example `no_service` or `invalid_payload`), and the connection status distinguishes an unreachable Slack from a rejected or revoked webhook URL
- A message Slack rejects no longer marks the connection as failed
- Send Block Kit Message checks that the body contains `text`, `blocks` or `attachments` before sending

### Removed

- **Breaking:** Predefined Messages, along with the Send Predefined Message action. Existing Send Predefined Message actions are converted to Send Custom Message with the same text

### Fixed

- Actions didn't wait for the message to finish sending

## [3.0.2] - 2025-12-24

### Changed

- Updated dependencies

## [3.0.1] - 2025-07-22

### Changed

- Updated the help documentation link to Slack's new developer docs
- Updated to Node 22
- Updated dependencies

## [3.0.0] - 2024-11-10

### Changed

- Converted the module to TypeScript
- Messages are now sent with Slack's official `@slack/webhook` package
- Updated dependencies

## [2.0.6] - 2024-08-27

### Changed

- Updated dependencies

## [2.0.5] - 2024-04-14

### Changed

- Updated dependencies

## [2.0.4] - 2023-05-23

### Changed

- Updated `@companion-module/base` and dependencies

## [2.0.3] - 2023-01-08

### Changed

- Updated `@companion-module/base`

## [2.0.2] - 2022-11-27

### Added

- Variable support in Send Custom Message

## [2.0.1] - 2022-11-26

### Fixed

- Predefined messages weren't read from the module configuration correctly
- Node 18 compatibility

## [2.0.0] - 2022-11-26

### Changed

- **Breaking:** Rewritten for Companion 3.0

## [1.0.1] - 2021-03-10

### Added

- Initial release, with Send Predefined Message, Send Custom Message and Send Block Kit Message actions

[4.0.0]: https://github.com/bitfocus/companion-module-slack-webhooks/compare/v3.0.2...v4.0.0
[3.0.2]: https://github.com/bitfocus/companion-module-slack-webhooks/compare/v3.0.1...v3.0.2
[3.0.1]: https://github.com/bitfocus/companion-module-slack-webhooks/compare/v3.0.0...v3.0.1
[3.0.0]: https://github.com/bitfocus/companion-module-slack-webhooks/compare/v2.0.6...v3.0.0
[2.0.6]: https://github.com/bitfocus/companion-module-slack-webhooks/compare/v2.0.5...v2.0.6
[2.0.5]: https://github.com/bitfocus/companion-module-slack-webhooks/compare/v2.0.4...v2.0.5
[2.0.4]: https://github.com/bitfocus/companion-module-slack-webhooks/compare/v2.0.3...v2.0.4
[2.0.3]: https://github.com/bitfocus/companion-module-slack-webhooks/compare/v2.0.2...v2.0.3
[2.0.2]: https://github.com/bitfocus/companion-module-slack-webhooks/compare/v2.0.1...v2.0.2
[2.0.1]: https://github.com/bitfocus/companion-module-slack-webhooks/compare/v2.0.0...v2.0.1
[2.0.0]: https://github.com/bitfocus/companion-module-slack-webhooks/compare/v1.0.1...v2.0.0
[1.0.1]: https://github.com/bitfocus/companion-module-slack-webhooks/releases/tag/v1.0.1
