## Slack Webhooks

This module allows you to send custom messages via Slack Webhooks.

**Getting Started**

- Follow steps 1 through 3 on [Slack's guide for using Incoming Webhooks](https://docs.slack.dev/messaging/sending-messages-using-incoming-webhooks)
- At the end, you should have a webhooks URL that looks like `https://hooks.slack.com/services/...`
- Enter your Slack webhooks URL into the module configuration in Companion

**Actions**

- Send Custom Message, optionally with link and media previews disabled
- Send [Block Kit](https://docs.slack.dev/block-kit) Message
- Trigger Workflow: starts a [Workflow Builder workflow that begins with a webhook](https://slack.com/help/articles/360041352714-Build-a-workflow--Create-a-workflow-that-starts-outside-of-Slack). Enter the workflow's `https://hooks.slack.com/triggers/...` URL and its variables as a JSON object of strings, e.g. `{"status": "Live"}`. This action doesn't need the Incoming Webhook URL above.
