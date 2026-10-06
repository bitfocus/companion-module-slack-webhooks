import type { CompanionStaticUpgradeScript } from '@companion-module/base'
import type { ModuleConfig, ModuleSecrets } from './config.js'

const PREDEFINED_IDS = ['predefined1', 'predefined2', 'predefined3', 'predefined4', 'predefined5']

// Versions before API 2.0 stored the webhook URL in the plain config
const moveWebhookUrlToSecrets: CompanionStaticUpgradeScript<ModuleConfig, ModuleSecrets> = (_context, props) => {
	const config = props.config as { slackURL?: string } | null
	if (!config || typeof config.slackURL !== 'string') {
		return { updatedConfig: null, updatedSecrets: null, updatedActions: [], updatedFeedbacks: [] }
	}

	const { slackURL, ...updatedConfig } = config
	return {
		updatedConfig,
		updatedSecrets: { ...props.secrets, slackURL: props.secrets?.slackURL || slackURL },
		updatedActions: [],
		updatedFeedbacks: [],
	}
}

// Predefined messages were removed; inline their text into a Send Custom Message action
const convertPredefinedToCustom: CompanionStaticUpgradeScript<ModuleConfig, ModuleSecrets> = (context, props) => {
	// props.config is null when only actions are being upgraded (e.g. an imported page)
	const config = (props.config ?? context.currentConfig) as Record<string, unknown>

	const updatedActions = props.actions.filter((action) => action.actionId === 'predefined')
	for (const action of updatedActions) {
		const slot = action.options.message?.value
		const text = typeof slot === 'string' ? config[slot] : undefined
		action.actionId = 'custom'
		action.options = { message: { isExpression: false, value: typeof text === 'string' ? text : '' } }
	}

	let updatedConfig: ModuleConfig | null = null
	if (props.config && PREDEFINED_IDS.some((id) => id in config)) {
		updatedConfig = Object.fromEntries(Object.entries(props.config).filter(([key]) => !PREDEFINED_IDS.includes(key)))
	}

	return { updatedConfig, updatedSecrets: null, updatedActions, updatedFeedbacks: [] }
}

const addPreviewOptionsToCustom: CompanionStaticUpgradeScript<ModuleConfig, ModuleSecrets> = (_context, props) => {
	const updatedActions = props.actions.filter(
		(action) =>
			action.actionId === 'custom' &&
			(action.options.disableLinkPreviews === undefined || action.options.disableMediaPreviews === undefined),
	)
	for (const action of updatedActions) {
		action.options.disableLinkPreviews ??= { isExpression: false, value: false }
		action.options.disableMediaPreviews ??= { isExpression: false, value: false }
	}

	return { updatedConfig: null, updatedSecrets: null, updatedActions, updatedFeedbacks: [] }
}

export const UpgradeScripts: CompanionStaticUpgradeScript<ModuleConfig, ModuleSecrets>[] = [
	moveWebhookUrlToSecrets,
	convertPredefinedToCustom,
	addPreviewOptionsToCustom,
]
