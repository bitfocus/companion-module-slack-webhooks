import { type SomeCompanionConfigField } from '@companion-module/base'

type configOptions = {
	[key: string]: string | undefined
}

export interface ModuleConfig extends configOptions {
	info: string
	slackURL: string
	predefined1?: string
	predefined2?: string
	predefined3?: string
	predefined4?: string
	predefined5?: string
}

export function GetConfigFields(): SomeCompanionConfigField[] {
	return [
		{
			type: 'static-text',
			id: 'info',
			width: 12,
			label: 'Information',
			value: 'See the help menu for information about setting up a Slack webhooks url',
		},
		{
			type: 'textinput',
			id: 'slackURL',
			label: 'Slack Incoming Webhook URL',
			width: 12,
			required: true,
		},
		{
			type: 'static-text',
			id: 'info',
			width: 12,
			label: 'Predefined Messages (Optional)',
			value: 'You can add messages you use frequently here, and access from a dropdown in the action menu',
		},
		{
			type: 'textinput',
			id: 'predefined1',
			label: 'Predefined Message #1',
			width: 12,
		},
		{
			type: 'textinput',
			id: 'predefined2',
			label: 'Predefined Message #2',
			width: 12,
		},
		{
			type: 'textinput',
			id: 'predefined3',
			label: 'Predefined Message #3',
			width: 12,
		},
		{
			type: 'textinput',
			id: 'predefined4',
			label: 'Predefined Message #4',
			width: 12,
		},
		{
			type: 'textinput',
			id: 'predefined5',
			label: 'Predefined Message #5',
			width: 12,
		},
	]
}
