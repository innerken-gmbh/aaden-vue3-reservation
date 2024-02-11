import {defineStore} from "pinia";
import {dateFormat, sliceTime, today} from "./dateRepo.js";
import dayjs from "dayjs";
import {
    addReservation,
    cancelReservation,
    confirmReservation,
    getReservation,
    moveReservation
} from "../api/reservationApi.js";
import {loadReservationTableInfo} from "../api/tableApi.js";
import {groupBy, intersection, maxBy, sumBy} from "lodash-es";
import IKUtils from "innerken-js-utils";

export const ReservationStatus = {
    Normal: 'Normal',
    Cancelled: 'Cancelled',
    CheckedIn: 'CheckedIn',
}
export const ReservationIcon = {
    Normal: 'mdi-view-list',
    Cancelled: 'mdi-cancel',
    CheckedIn: 'mdi-check',
}

export const useReservationStore = defineStore('reservation', {
    state: () => ({
        reservationList: [],
        listView: false,
        date: today(),
        search: '',
        showAll: true,
        tableList: [],
        xSize: 40,
        loading: false,
        ySize: 28,
        activeReservationId: 32165,
        showDetailDialog: false,
        timeSlots: Array.from(Array(24 - 7 + 3).keys())
            .map(it => (it + 7) % 24).map(it => Array
                .from(Array(4).keys())
                .map(minute => it.toString().padStart(2, '0') +
                    ':' + (minute * 15).toString().padStart(2, '0'))).flat(),
        listViewTab: ReservationStatus.Normal,
    }),
    getters: {
        bigTime() {
            return this.timeSlots.filter(it => it.endsWith('00'))
        },
        containerWidth() {
            return (this.timeSlots.length * this.xSize)
        },
        containerHeight() {
            return (this.tableList.length * this.ySize)
        },
        seatedInfo() {
            const list = this.timeSlots.filter(it =>
                it.endsWith('00') || it.endsWith('30')).map(it => {
                let seatCount = 0
                const target = dayjs(this.date + ' ' + it)
                this.reservationList.forEach(r => {
                    const [start, end] = [r.fromDateTime, r.toDateTime].map(t => dayjs(t))
                    if (target.isBefore(end) && target.add(30, 'm').isAfter(start)) {
                        seatCount++
                    }
                })
                return {
                    time: it,
                    count: seatCount
                }
            })
            const maxCount = maxBy(list, 'count').count
            return list.map(it => {
                it.ratio = it.count / maxCount * 100
                return it
            })
        },
        activeReservation() {
            return this.reservationList
                .find(it => parseInt(it.remoteId) === parseInt(this.activeReservationId))
        },
        filteredReservationList() {
            return this.reservationList.filter(it => {
                return (!this.search || Object.values(it)
                        .some(s => s?.toString()?.toLowerCase()
                            .includes(this.search.toLowerCase()) ?? false)) &&
                    (this.showAll ||
                        (it.completed !== '1' && it.cancelled !== '1'))
                    && (!this.displayList || (it.status === this.listViewTab))
            })
        },
        displayList() {
            return this.listView || this.search
        }
    },
    actions: {
        async loadReservations() {
            this.tableList = await loadReservationTableInfo()
            const list = (await getReservation(this.date)).map(it => {
                const xIndex = this.timeSlots.findIndex(t => dayjs(it.fromDateTime)
                    .format('HH:mm') === t)
                const xStopIndex = this.timeSlots.findIndex(t => dayjs(it.toDateTime)
                    .format('HH:mm') === t)
                const yIndex = this.tableList.findIndex(t => parseInt(t.tableId) === parseInt(it.tableId))
                it.timeMap = sliceTime(it.fromDateTime, it.toDateTime)
                it.overTime = it.completed !== '1' && dayjs(it.fromDateTime).add(15, 'minute').isBefore(dayjs())
                it.grid = {
                    x: xIndex * this.xSize,
                    w: (xStopIndex - xIndex) * this.xSize,
                    y: yIndex * this.ySize
                }
                it.status = getReservationStatus(it)
                return it
            })
            const overlaps = Object.entries(groupBy(list.filter(it => it.cancelled === '0'), 'tableId'))
                .map(([, value]) => {
                    return value.map(it => {
                        it.haveOverlap = value.some(that => that.id !== it.id && intersection(it.timeMap, that.timeMap).length > 1)
                        return it
                    }).filter(it => it.haveOverlap).map(it => it.id)
                }).flat()

            const shareTable = (Object.values(groupBy(list, 'batch'))
                .filter(it => it.length > 1).map(it => {
                    const totalPerson = sumBy(it, (h)=>parseInt(h.personCount))
                    it.forEach(it => {
                        it.totalPerson = totalPerson
                    })
                    return it
                }).flat()
                .map(it => it.id))
            const batchColorCache = {}
            this.reservationList = []
            await IKUtils.wait(50)
            this.reservationList = list.map(it => {
                it.haveOverlap = overlaps.includes(it.id)
                it.haveShareTable = shareTable.includes(it.id)
                if (it.haveShareTable) {
                    if (!batchColorCache[it.batch]) {
                        const randomColor = Math.floor(Math.random() * 16777215).toString(16);
                        batchColorCache[it.batch] = '#' + randomColor
                    }
                    it.shareColor = batchColorCache[it.batch]
                }
                return it
            })
        },
        async reload() {
            await this.loadReservations()
        },
        async checkIn(id) {
            this.loading = true
            await confirmReservation(id)
            await this.reload()
            this.loading = false
        },
        async cancel(id) {
            this.loading = true
            await cancelReservation(id)
            await this.reload()
            this.loading = false
        },
        async showReservationWithId(remoteId) {
            this.activeReservationId = remoteId
            this.showDetailDialog = true
        }
    }
})
export const useHomePageControllerStore
    = defineStore('homePageController', {
    state: () => ({
        showNewReservationModal: false,
        personCount: 4,
        reservationStep: 0,
        showMorePerson: false,
        date: today(),
        startTime: null,
        loading: false,
        timeGap: [],
        otherTime: [],
        error: false,
        errorMessage: '',
        reservationExtraInfo: {
            firstName: '',
            lastName: '',
            phone: '',
            email: '',
            note: '',
            useStroller: false
        },
    }),
    getters: {
        reservationAddModel() {
            return Object.assign({
                    fromDateTime: this.date + ' ' +
                        this.startTime,
                    userId: 1,
                    personCount: this.personCount,
                },
                this.reservationExtraInfo,
                {useStroller: this.reservationExtraInfo.useStroller ? 1 : 0})
        }
    },
    actions: {
        async addReservation() {
            this.loading = true
            const res = await addReservation(this.reservationAddModel)
            if (res.code === 200) {
                await useReservationStore().reload()
                this.showNewReservationModal = false
            } else {
                this.error = true
                this.errorMessage = res.message
            }
            this.loading = false

        },
        showNewModal() {
            this.reservationStep = 0
            this.startTime = null
            this.showMorePerson = false
            this.personCount = 4
            this.date = useReservationStore().date
            this.errorMessage = ''
            this.error = false
            this.reservationExtraInfo = {
                firstName: '',
                lastName: '',
                phone: '',
                email: '',
                note: '',
                useStroller: false
            }
            this.showNewReservationModal = true
        },
        minusPerson() {
            if (this.personCount > 1) {
                this.personCount--
            }
        }
    }
})
export const useDatePickerStore = defineStore('datePicker', {
    state: () => {
        return {
            lastDate: null,
            currentDate: new Date(),
            showPicker: false,
            resolve: null,
        }
    },
    actions: {
        async selectDate() {
            return new Promise(resolve => {
                this.currentDate = new Date()
                this.showPicker = true
                this.resolve = resolve
            })
        },
        confirm() {
            if (this.resolve) {
                this.resolve(dayjs(this.currentDate).format(dateFormat))
                this.showPicker = false
            }

        }
    },
    getters: {
        date(state) {
            return dayjs(state.currentDate).format(dateFormat)
        }
    }
})
export const useTimePickerStore = defineStore('timePicker', {
    state: () => {
        return {
            currentTime: null,
            availableTimes: [
                '10:00', '20:00', '30:00', '40:00', '50:00', '60:00',
            ],
            showPicker: false,
            resolve: null,
        }
    },
    actions: {
        async selectTime() {
            return new Promise(resolve => {
                this.showPicker = true
                this.resolve = resolve
            })
        },
        confirm() {
            if (this.resolve) {
                this.resolve(this.currentTime)
                this.showPicker = false
            }

        }
    }
})
export const useScanQrStore =
    defineStore('scanQR', {
        state: () => {
            return {

                showPicker: false,
                loading: false,
                error: false,
                resolve: null,
                paused: false,
            }
        },
        actions: {
            rescan() {
                this.paused = false
                this.error = false
            },
            async scanQR() {
                const qrInfo = await new Promise(resolve => {
                    this.paused = false
                    this.error = false
                    this.showPicker = true
                    this.resolve = resolve
                })
                if (qrInfo.batch && qrInfo.remoteId) {
                    const infoStore = useReservationStore()
                    await infoStore.showReservationWithId(qrInfo.remoteId)
                }
            },
            confirm(info) {
                if (this.resolve) {
                    this.resolve(info)
                    this.showPicker = false
                }

            }
        }
    })

export const useDragStore = defineStore('drag', {
    state: () => {
        return {
            globalDragEnable: true,
            draggableItemId: null,
        }
    },
    actions: {
        startDrag(id) {
            this.globalDragEnable = false
            this.draggableItemId = id
        },
        stopDrag() {
            this.globalDragEnable = true
            this.draggableItemId = null
        }
    }
})

export const useReservationChangeVM = defineStore('reservationChange', {
    state: () => ({
        changes: {},
        loading: false,
    }),
    actions: {
        addToChanges(id, tableId, start, end) {
            if (!tableId) {
                delete this.changes[id]
            } else {
                this.changes[id] = {tableId, start, end}
            }

        },

        async applyAllChanges() {
            this.loading = true
            const infos = Object.entries(this.changes)
                .map(([key, value]) => ({...value, id: key}))
            for (const info of infos) {
                await moveReservation(info.id, info.tableId, info.start, info.end)
            }
            const reservationInfo = useReservationStore()
            await reservationInfo.reload()
            this.loading = false
            this.changes = {}
        },

        async cancelAllChanges() {
            this.changes = {}
            const reservationInfo = useReservationStore()
            await reservationInfo.reload()
        }
    },
    getters: {
        changesCount() {
            return Object.values(this.changes).length
        }
    }
})


export function getReservationColor(reservation) {
    if (reservation) {
        const overTime = reservation.overTime
        const haveOverlap = reservation.haveOverlap
        const status = getReservationStatus(reservation)
        if (overTime) {
            return 'red-darken-3'
        } else if (status === ReservationStatus.CheckedIn) {
            return 'green-darken-3'
        } else if (haveOverlap) {
            return 'yellow-darken-3'
        } else if (status === ReservationStatus.Cancelled) {
            return 'transparent'
        }
    }

    return 'primary'

}

export function getReservationStatus(reservation) {
    if (reservation.status) {
        return reservation.status
    }
    if (reservation?.completed === '1') {
        return ReservationStatus.CheckedIn
    } else if (reservation?.cancelled === '1') {
        return ReservationStatus.Cancelled
    } else {
        return ReservationStatus.Normal
    }
}
