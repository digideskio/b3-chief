import { oneLine } from 'common-tags'
import { BEHAVIOR_TYPE } from '../const'

const behavior = {
	name: 'Selector',
	type: BEHAVIOR_TYPE.COMPOSITE,
	description: oneLine`
		Selector ticks its children sequentially until one of them returns
		SUCCESS, RUNNING or ERROR. If all children return the failure state,
		the selector also returns FAILURE.
	`,
}

const compilation = {
	tick({ status }, { children }) {
		for (let i = 0, len = children.length; i < len; i += 1) {
			const childStatus = children[i]()
			if (childStatus !== status.FAILURE) {
				return childStatus
			}
		}

		return status.FAILURE
	},
}

export default { behavior, compilation }
