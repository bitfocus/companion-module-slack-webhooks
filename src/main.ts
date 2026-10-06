import { InstanceBase, InstanceStatus, type InstanceTypes, type SomeCompanionConfigField } from '@companion-module/base'
import { GetConfigFields, SLACK_URL_REGEX, type ModuleConfig, type ModuleSecrets } from './config.js'
import { UpdateActions, type ActionSchemas } from './actions.js'
import {
	IncomingWebhook,
	IncomingWebhookHTTPError,
	IncomingWebhookRequestError,
	WebhookTrigger,
	WebhookTriggerHTTPError,
	WebhookTriggerRequestError,
	type IncomingWebhookSendArguments,
	type RetryOptions,
	type WebhookTriggerSendArguments,
} from '@slack/webhook'

export { UpgradeScripts } from './upgrades.js'

// Companion times out actions after 5s: 2 attempts of 2.3s plus 0.25s backoff stays just under that
const SEND_TIMEOUT_MS = 2300
const RETRY_POLICY: RetryOptions = { retries: 1, minTimeout: 250, maxTimeout: 250 }

export interface ModuleTypes extends InstanceTypes {
	config: ModuleConfig
	secrets: ModuleSecrets
	actions: ActionSchemas
}

export default class ModuleInstance extends InstanceBase<ModuleTypes> {
	config!: ModuleConfig // Setup in init()
	secrets: ModuleSecrets = {}
	webhook: IncomingWebhook | null = null

	constructor(internal: unknown) {
		super(internal)
	}

	async init(config: ModuleConfig, _isFirstInit: boolean, secrets: ModuleSecrets): Promise<void> {
		this.config = config
		this.secrets = secrets
		this.webhook = null
		this.updateStatus(InstanceStatus.Connecting)

		this.createWebhook()
		this.updateActions()
	}
	// When module gets deleted
	async destroy(): Promise<void> {
		this.log('debug', 'destroy')
	}

	async configUpdated(config: ModuleConfig, secrets: ModuleSecrets): Promise<void> {
		this.config = config
		this.secrets = secrets

		this.createWebhook()
		this.updateActions()
	}

	// Return config fields for web config
	getConfigFields(): SomeCompanionConfigField[] {
		return GetConfigFields()
	}

	updateActions(): void {
		UpdateActions(this)
	}

	webhookOptions(): { timeout: number; retryConfig: RetryOptions } {
		return {
			timeout: SEND_TIMEOUT_MS,
			retryConfig: RETRY_POLICY,
		}
	}

	createWebhook(): void {
		const { slackURL } = this.secrets
		if (!slackURL) {
			this.webhook = null
			this.updateStatus(InstanceStatus.BadConfig, 'Missing Slack Incoming Webhook URL')
		} else if (!SLACK_URL_REGEX.test(slackURL)) {
			this.webhook = null
			this.updateStatus(InstanceStatus.BadConfig, 'Invalid Slack Incoming Webhook URL')
		} else {
			this.webhook = new IncomingWebhook(slackURL, this.webhookOptions())
			this.updateStatus(InstanceStatus.Ok)
		}
	}

	async sendSlack(body: IncomingWebhookSendArguments): Promise<void> {
		if (!this.webhook) {
			this.log('warn', 'Missing Slack Incoming Webhook URL, unable to send message')
			return
		}
		try {
			await this.webhook.send(body)
			this.updateStatus(InstanceStatus.Ok)
		} catch (error) {
			const failure = describeSendError(error)
			this.log('error', `Error sending Slack message: ${failure.description}`)
			if (failure.kind === 'request') {
				this.updateStatus(InstanceStatus.ConnectionFailure, 'Unable to reach Slack')
			} else if (failure.kind === 'url') {
				this.updateStatus(InstanceStatus.BadConfig, `Slack rejected the webhook URL (${failure.reason})`)
			}
		}
	}

	async triggerWorkflow(url: string, variables: WebhookTriggerSendArguments): Promise<void> {
		try {
			const result = await new WebhookTrigger(url, this.webhookOptions()).send(variables)
			if (!result.ok) {
				this.log('error', `Error triggering Slack workflow: ${result.error ?? 'unknown error'}`)
			}
		} catch (error) {
			this.log('error', `Error triggering Slack workflow: ${describeSendError(error).description}`)
		}
	}
}

// Slack replies with these when the URL itself is wrong or revoked, rather than the message being bad
const URL_ERROR_REASONS = ['no_service', 'invalid_token', 'no_team', 'team_disabled', 'invalid_trigger']

type SendFailure = { kind: 'request' | 'url' | 'message' | 'unknown'; reason: string; description: string }

function describeSendError(error: unknown): SendFailure {
	if (error instanceof IncomingWebhookRequestError || error instanceof WebhookTriggerRequestError) {
		return { kind: 'request', reason: 'unreachable', description: error.message }
	}
	if (error instanceof IncomingWebhookHTTPError || error instanceof WebhookTriggerHTTPError) {
		const reason = parseErrorBody(error.body) || `HTTP ${error.statusCode}`
		const kind = error.statusCode === 404 || URL_ERROR_REASONS.includes(reason) ? 'url' : 'message'
		return { kind, reason, description: `HTTP ${error.statusCode}: ${reason}` }
	}
	return { kind: 'unknown', reason: 'unknown', description: error instanceof Error ? error.message : String(error) }
}

// Incoming webhooks reply with a plain-text reason, workflow triggers with JSON like {"ok":false,"error":"..."}
function parseErrorBody(body: string): string {
	try {
		const parsed: unknown = JSON.parse(body)
		if (typeof parsed === 'object' && parsed !== null && 'error' in parsed) return String(parsed.error)
	} catch {
		// Not JSON, so it's already the plain-text reason
	}
	return body.trim()
}
