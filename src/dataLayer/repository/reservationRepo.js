import {defineStore} from "pinia";
import {dateFormat, sliceTime, today} from "./dateRepo.js";
import dayjs from "dayjs";
import {
    cancelReservation,
    changeEatTime,
    checkIn,
    getOneReservation,
    getReservation,
    loadAllReservable
} from "../api/reservationApi.js";

import {groupBy, intersection, join, keyBy, maxBy, sample, sortBy, sumBy} from "lodash-es";
import IKUtils from "innerken-js-utils";
import {linkColors} from "../../plugins/plugins.js";
import {reservationCanEdit, ReservationStatus, ReservationStatusFilter} from "./reservationDisplay.js";

export const useReservationStore = defineStore('reservation', {
    state: () => ({
        showSearch: false,
        reservationList: [],
        listView: false,
        date: today(),
        search: '',
        showAll: true,
        tableList: [],
        xSize: 32,
        loading: false,
        ySize: 28,
        activeReservationId: 32165,
        showDetailDialog: false,
        showLogs: false,
        activeReservation: null,
        timeSlots: Array.from(Array(24 - 7 + 3).keys())
            .map(it => (it + 7) % 24).map(it => Array
                .from(Array(4).keys())
                .map(minute => it.toString().padStart(2, '0') +
                    ':' + (minute * 15).toString().padStart(2, '0'))).flat(),
        listViewTab: 0,
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
                    if (target.isBefore(end) && target.add(30, 'm')
                        .isAfter(start)) {
                        seatCount += parseInt(r.personCount)
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
        reservationTotalPersonCount() {
            return sumBy(this.filteredReservationList,
                (r) => parseInt(r.personCount))
        },
        listSorted() {
            return Object.values(ReservationStatusFilter).map(it => this.reservationList.filter(r => it.includes(r.status)))
        },
        filteredReservationList() {
            return this.reservationList.filter(it => {
                const isValid = it.seatPlan.length > 0
                if (this.displayList) {
                    if (this.search) {
                        const searchContains = [it.firstName, it.lastName]
                            .some(s => s?.toString()?.toLowerCase()
                                .includes(this.search.toLowerCase()) ?? false)
                        return isValid && searchContains
                    } else {
                        const filter = Object.values(ReservationStatus)[this.listViewTab]
                        return isValid && filter.includes(it.status)
                    }

                } else {
                    const showAllOrCanEdit = this.showAll || reservationCanEdit(it)

                    return isValid && showAllOrCanEdit
                }
            })
        },
        groupedReservations() {
            return groupBy(this.filteredReservationList, 'fromDateTime')
        },
        displayList() {
            return this.listView || this.showSearch
        }
    },
    actions: {
        async loadReservations() {
            this.tableList = await loadAllReservable()
            const tableMap = keyBy(this.tableList, 'tableId')
            const list = (await getReservation(this.date)).map(it => {
                const xIndex = this.timeSlots.findIndex(t => dayjs(it.fromDateTime)
                    .format('HH:mm') === t)
                const xStopIndex = this.timeSlots.findIndex(t => dayjs(it.toDateTime)
                    .format('HH:mm') === t)
                it.blocks = it.seatPlan.map(sp => {
                    return {
                        y: this.tableList.findIndex(t => parseInt(t.tableId) === sp.tableId) * this.ySize,
                        personCount: sp.seatCount,
                        id: sp.id
                    }
                })
                it.seatPlan = it.seatPlan.map(it => {
                    it.tableName = tableMap[it.tableId]?.tableName ?? ''
                    return it
                })
                it.tableName = join(it.seatPlan.map(it => it.tableName), ',')
                it.timeMap = sliceTime(it.fromDateTime, it.toDateTime)
                it.grid = {
                    x: xIndex * this.xSize,
                    w: (xStopIndex - xIndex) * this.xSize,
                }
                it.overTime = it.status === ReservationStatus.Confirmed
                    && dayjs(it.fromDateTime).add(15, 'minute')
                        .isBefore(dayjs())
                return it
            })
            const overlaps = Object.entries(
                groupBy(list.filter(it => it.status !== ReservationStatus.Cancelled &&
                    it.status !== ReservationStatus.NoShow).map(it => {
                    return it.seatPlan.map(sp => ({tableId: sp.tableId, timeMap: it.timeMap, id: it.id})).flat()
                }).flat(2), 'tableId'))
                .map(([, value]) => {
                    return value.map(it => {
                        it.haveOverlap = value.some(that => that.id !== it.id &&
                            intersection(it.timeMap, that.timeMap).length > 1)
                        return it
                    }).filter(it => it.haveOverlap).map(it => it.id)
                }).flat()

            const batchColorCache = {}
            this.reservationList = []
            await IKUtils.wait(50)
            this.reservationList = sortBy(list.map(it => {
                it.haveOverlap = overlaps.includes(it.id)
                it.haveShareTable = it.seatPlan.length > 1
                if (it.haveShareTable) {
                    if (!batchColorCache[it.id]) {
                        batchColorCache[it.id] = sample(linkColors)
                    }
                    it.shareColor = batchColorCache[it.id]
                }
                return it
            }), (r) => {
                if (r.status === ReservationStatus.Cancelled) {
                    return 1
                } else if (r.status === ReservationStatus.CheckIn) {
                    return 2
                }
                return 3
            })
        },
        async reload() {
            await this.loadReservations()
        },
        async checkIn(id) {
            await this.actionAnd(
                async () => {
                    await checkIn(id)
                }
            )

        },
        async actionAnd(action) {
            this.loading = true
            await action()
            await this.reload()
            this.loading = false
        },
        async changeEatingTime(id, newEatingTime) {
            await this.actionAnd(
                async () => {
                    await changeEatTime(id, newEatingTime)
                }
            )

        },
        async cancel(id) {
            await this.actionAnd(
                async () => {
                    await cancelReservation(id)
                }
            )
        },
        async showReservationWithId(id) {
            this.activeReservationId = id
            this.activeReservation = await getOneReservation(id)
            if(this.activeReservation){
                this.showDetailDialog = true
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
                if (qrInfo.id) {
                    const infoStore = useReservationStore()
                    await infoStore.showReservationWithId(qrInfo.id)
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
            try {
                navigator.vibrate(50);
            } catch (e) {
                console.log(e)
            }
        },
        stopDrag() {
            this.globalDragEnable = true
            this.draggableItemId = null
        }
    }
})

