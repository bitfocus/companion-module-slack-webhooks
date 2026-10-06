import { type SomeCompanionConfigField } from '@companion-module/base'

export type ModuleConfig = Record<string, never>

export type ModuleSecrets = {
	slackURL?: string
}

export const SLACK_URL_REGEX = /^https:\/\/hooks\.slack\.com\/services\/\S+$/
export const SLACK_TRIGGER_URL_REGEX = /^https:\/\/hooks\.slack\.com\/triggers\/\S+$/

export function GetConfigFields(): SomeCompanionConfigField[] {
	return [
		{
			type: 'secret-text',
			id: 'slackURL',
			label: 'Slack Incoming Webhook URL',
			width: 12,
			minLength: 1,
			regex: SLACK_URL_REGEX.toString(),
			tooltip: 'See the help documentation for information about setting up a Slack Webhook URL',
		},
	]
}
