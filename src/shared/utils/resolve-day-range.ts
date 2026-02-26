export function resolveDayRange(date?: string | Date) {
	let parsedDate: Date

	if (!date) {
		parsedDate = new Date()
	} else if (typeof date === 'string') {
		parsedDate = new Date(date)
	} else {
		parsedDate = date
	}

	const start = new Date(parsedDate)
	start.setHours(0, 0, 0, 0)

	const end = new Date(start)
	end.setDate(end.getDate() + 1)

	return { start, end }
}
