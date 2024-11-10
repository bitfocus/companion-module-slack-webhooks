import { InstanceBase, runEntrypoint, InstanceStatus, SomeCompanionConfigField } from '@companion-module/base'
import { GetConfigFields, type ModuleConfig } from './config.js'
import { UpdateActions } from './actions.js'
import { UpgradeScripts } from './upgrades.js'
import { IncomingWebhook } from '@slack/webhook'

export class ModuleInstance extends InstanceBase<ModuleConfig> {
	config!: ModuleConfig // Setup in init()
	CHOICES_predefined: { id: string; label: string }[] = []
	webhook: IncomingWebhook | null = null

	constructor(internal: unknown) {
		super(internal)
	}

	async init(config: ModuleConfig): Promise<void> {
		this.config = config
		this.webhook = null
		this.updateStatus(InstanceStatus.Connecting)

		this.CHOICES_predefined = [
			{ id: 'predefined1', label: 'Predefined Message #1' },
			{ id: 'predefined2', label: 'Predefined Message #2' },
			{ id: 'predefined3', label: 'Predefined Message #3' },
			{ id: 'predefined4', label: 'Predefined Message #4' },
			{ id: 'predefined5', label: 'Predefined Message #5' },
		]

		this.createWebhook()
		this.buildPredefinedArray()
		this.updateActions()
	}
	// When module gets deleted
	async destroy(): Promise<void> {
		this.log('debug', 'destroy')
	}

	async configUpdated(config: ModuleConfig): Promise<void> {
		this.config = config

		this.createWebhook()
		this.buildPredefinedArray()
		this.updateActions()
	}

	// Return config fields for web config
	getConfigFields(): SomeCompanionConfigField[] {
		return GetConfigFields()
	}

	updateActions(): void {
		UpdateActions(this)
	}

	buildPredefinedArray() {
		for (let i = 1; i < 6; i++) {
			this.CHOICES_predefined[i - 1].label = this.config[`predefined${i}`]
				? `${this.config[`predefined${i}`]}`
				: `Predefined Message #${i}`
		}
	}

	createWebhook() {
		if (this.config.slackURL) {
			this.webhook = new IncomingWebhook(this.config.slackURL)
			this.updateStatus(InstanceStatus.Ok)
		} else {
			this.webhook = null
			this.updateStatus(InstanceStatus.BadConfig, 'Missing Slack Incoming Webhook URL')
		}
	}

	async sendSlack(body: object) {
		if (this.webhook) {
			try {
				let message = await this.webhook.send(body)
				if (message.text === 'ok') {
					this.updateStatus(InstanceStatus.Ok)
				}
			} catch (error: any) {
				this.log('error', `Error sending Slack message (Error code: ${error.message})`)
				this.updateStatus(InstanceStatus.ConnectionFailure, `Connection Error`)
			}
		} else {
			this.log('warn', 'Missing Slack Incoming Webhook URL, unable to send message')
		}
	}
}

runEntrypoint(ModuleInstance, UpgradeScripts)
