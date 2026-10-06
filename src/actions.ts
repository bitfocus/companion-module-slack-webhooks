import type { IncomingWebhookSendArguments } from '@slack/webhook'
import { SLACK_TRIGGER_URL_REGEX } from './config.js'
import type ModuleInstance from './main.js'

export type ActionSchemas = {
	custom: { options: { message: string; disableLinkPreviews: boolean; disableMediaPreviews: boolean } }
	blockkit: { options: { body: string } }
	workflow: { options: { url: string; variables: string } }
}

export function UpdateActions(self: ModuleInstance): void {
	self.setActionDefinitions({
		custom: {
			name: 'Send Custom Message',
			options: [
				{
					type: 'textinput',
					useVariables: true,
					label: 'Message',
					id: 'message',
					default: '',
				},
				{
					type: 'checkbox',
					label: 'Disable Link Previews',
					id: 'disableLinkPreviews',
					default: false,
				},
				{
					type: 'checkbox',
					label: 'Disable Media Previews',
					id: 'disableMediaPreviews',
					default: false,
				},
			],
			callback: async (event) => {
				const { message, disableLinkPreviews, disableMediaPreviews } = event.options
				await self.sendSlack({
					text: message,
					// Only sent when ticked, so Slack's own defaults apply otherwise
					unfurl_links: disableLinkPreviews ? false : undefined,
					unfurl_media: disableMediaPreviews ? false : undefined,
				})
			},
		},
		blockkit: {
			name: 'Send Block Kit Message',
			options: [
				{
					type: 'textinput',
					useVariables: true,
					multiline: true,
					label: 'Block Kit Body (JSON)',
					id: 'body',
					default: '{"blocks": []}',
				},
			],
			callback: async (event) => {
				let body: unknown
				try {
					body = JSON.parse(event.options.body)
				} catch (error) {
					self.log('error', `Slack Webhook Send Aborted: Malformed JSON Body (${(error as Error).message})`)
					return
				}
				if (
					typeof body !== 'object' ||
					body === null ||
					!('text' in body || 'blocks' in body || 'attachments' in body)
				) {
					self.log('error', 'Slack Webhook Send Aborted: JSON Body must contain text, blocks or attachments')
					return
				}
				await self.sendSlack(body as IncomingWebhookSendArguments)
			},
		},
		workflow: {
			name: 'Trigger Workflow',
			options: [
				{
					type: 'textinput',
					label: 'Workflow Webhook URL',
					id: 'url',
					default: '',
					regex: SLACK_TRIGGER_URL_REGEX.toString(),
					tooltip: 'From a Workflow Builder workflow that starts from a webhook: https://hooks.slack.com/triggers/...',
				},
				{
					type: 'textinput',
					useVariables: true,
					multiline: true,
					label: 'Variables (JSON)',
					id: 'variables',
					default: '{}',
					tooltip: 'An object of the variables the workflow expects, all values as strings, e.g. {"status": "Live"}',
				},
			],
			callback: async (event) => {
				const { url } = event.options
				if (!SLACK_TRIGGER_URL_REGEX.test(url)) {
					self.log('error', 'Slack Workflow Trigger Aborted: Invalid Workflow Webhook URL')
					return
				}
				let variables: unknown
				try {
					variables = JSON.parse(event.options.variables || '{}')
				} catch (error) {
					self.log('error', `Slack Workflow Trigger Aborted: Malformed Variables JSON (${(error as Error).message})`)
					return
				}
				if (
					typeof variables !== 'object' ||
					variables === null ||
					Array.isArray(variables) ||
					!Object.values(variables).every((value) => typeof value === 'string')
				) {
					self.log('error', 'Slack Workflow Trigger Aborted: Variables must be a JSON object of string values')
					return
				}
				await self.triggerWorkflow(url, variables as Record<string, string>)
			},
		},
	})
}
