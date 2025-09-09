export class TimeMeasure {
    private dateStart: number
    private dateEnd: number
    public time: number = 0
    
    constructor() {
        this.dateStart = (new Date()).getTime()
        this.dateEnd = this.dateStart
    }

    restart() {
        this.dateStart = (new Date()).getTime()
        this.dateEnd = this.dateStart
        this.time = 0
    }

    finish() {
        this.dateEnd = (new Date()).getTime()
        this.time = this.dateEnd - this.dateStart
    }

    get fulltime(): string {
        return this.formatTime(this.time)
    }

    private formatTime(ms: number): string {
        if (ms < 1000) {
            return `${ms}ms`
        }

        const seconds = Math.floor(ms / 1000)
        const minutes = Math.floor(seconds / 60)
        const hours = Math.floor(minutes / 60)

        const remainingMilliseconds = ms % 1000
        const remainingSeconds = seconds % 60
        const remainingMinutes = minutes % 60

        if (hours > 0) {
            return `${hours}hr${remainingMinutes}m${remainingSeconds}s`
        } else if (minutes > 0) {
            return `${minutes}m${remainingSeconds}s`
        } else {
            // For seconds-only, show milliseconds if present
            if (remainingMilliseconds > 0) {
                return `${seconds}s${remainingMilliseconds}ms`
            } else {
                return `${seconds}s`
            }
        }
    }
}