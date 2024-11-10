import type { ModuleInstance } from './main.js'

export function UpdateActions(self: ModuleInstance): void {
	self.setActionDefinitions({
		predefined: {
			name: 'Send Predefined Message',
			options: [
				{
					type: 'dropdown',
					label: 'Message',
					id: 'message',
					default: 'predefined1',
					choices: self.CHOICES_predefined,
				},
			],
			callback: (action) => {
				let body = {
					text: self.CHOICES_predefined?.find((x) => x.id === action.options.message)?.label,
				}
				self.sendSlack(body)
			},
		},
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
			],
			callback: async (event, context) => {
				const message: string = String(event.options.message ?? '')
				const value = await context.parseVariablesInString(message)

				let body = {
					text: value,
				}
				self.sendSlack(body)
			},
		},
		blockkit: {
			name: 'Send Block Kit Message',
			options: [
				{
					type: 'textinput',
					label: 'Block Kit Body (JSON)',
					id: 'body',
					default: '{"blocks": []}',
				},
			],
			callback: (action) => {
				let body = {}
				try {
					body = JSON.parse(String(action.options.body))
					self.sendSlack(body)
				} catch (error: any) {
					self.log('error', `Slack Webhook Send Aborted: Malformed JSON Body (${error.message})`)
				}
			},
		},
	})
}
