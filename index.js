import { InstanceBase, runEntrypoint } from '@companion-module/base'
import fetch from 'node-fetch'

class SlackInstance extends InstanceBase {
	constructor(internal) {
		super(internal)
	}

	async init(config) {
		this.config = config

		this.updateStatus('connecting')

		this.CHOICES_predefined = [
			{ id: 'predefined1', label: 'Predefined Message #1' },
			{ id: 'predefined2', label: 'Predefined Message #2' },
			{ id: 'predefined3', label: 'Predefined Message #3' },
			{ id: 'predefined4', label: 'Predefined Message #4' },
			{ id: 'predefined5', label: 'Predefined Message #5' },
		]

		this.buildPredefinedArray()
		this.initActions()

		if (this.config.slackURL) {
			this.updateStatus('ok')
		} else {
			this.updateStatus('bad_config', 'Missing Slack URL')
		}
	}

	getConfigFields() {
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

	async configUpdated(config) {
		this.config = config

		if (this.config.slackURL) {
			this.updateStatus('ok')
		} else {
			this.updateStatus('bad_config', 'Missing Slack URL')
		}
		this.buildPredefinedArray()
		this.initActions()
	}

	async destroy() {}

	buildPredefinedArray() {
		for (let i = 1; i < 6; i++) {
			this.CHOICES_predefined[i - 1].label = this.config[`predefined${i}`]
				? this.config[`predefined${i}`]
				: `Predefined Message #${i}`
		}
	}

	initActions() {
		let actions = {
			predefined: {
				name: 'Send Predefined Message',
				options: [
					{
						type: 'dropdown',
						label: 'Message',
						id: 'message',
						default: 'predefined1',
						choices: this.CHOICES_predefined,
					},
				],
				callback: (action) => {
					let body = {
						text: this.CHOICES_predefined.find((x) => x.id === action.options.message).label,
					}
					this.sendSlack(body)
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
				callback: async (action) => {
					const value = await this.parseVariablesInString(action.options.message)

					let body = {
						text: value,
					}
					this.sendSlack(body)
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
						body = JSON.parse(action.options.body)
						this.sendSlack(body)
					} catch (error) {
						this.log('error', `Slack Webhook Send Aborted: Malformed JSON Body (${error.message})`)
					}
				},
			},
		}

		this.setActionDefinitions(actions)
	}

	async sendSlack(body) {
		try {
			const response = await fetch(this.config.slackURL, {
				method: 'post',
				body: JSON.stringify(body),
				headers: { 'Content-Type': 'application/json' },
			})
			if (response.ok) {
				this.updateStatus('ok')
			} else {
				this.log('warn', `Error sending Slack message (Error code: ${response.status})`)
			}
		} catch (error) {
			this.log('error', `Error sending Slack message (Error code: ${error.message})`)
			this.updateStatus('connection_failure', `Connection Error`)
		}
	}
}
runEntrypoint(SlackInstance, [])
