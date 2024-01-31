import {defineStore} from "pinia";
import {dateFormat, sliceTime, today} from "./dateRepo.js";
import dayjs from "dayjs";
import {addReservation, confirmReservation, getReservation} from "../api/reservationApi.js";
import {loadReservationTableInfo} from "../api/tableApi.js";
import {groupBy, intersection} from "lodash-es";


export const useReservationStore = defineStore('reservation', {
    state: () => ({
        reservationList: [],
        date: today(),
        tableList: [],
        xSize: 40,
        ySize: 28,
        activeReservationId: 32165,
        showDetailDialog: false,
        timeSlots: Array.from(Array(24 - 7 + 3).keys())
            .map(it => (it + 7) % 24).map(it => Array
                .from(Array(4).keys())
                .map(minute => it.toString().padStart(2, '0') +
                    ':' + (minute * 15).toString().padStart(2, '0'))).flat()
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
            const list = this.timeSlots.filter(it => it.endsWith('00') || it.endsWith('30'))
            return list.map(it => {
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
        },
        activeReservation() {
            return this.reservationList.find(it => parseInt(it.remoteId) === parseInt(this.activeReservationId))
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
                it.overTime = it.completed !== '1' && dayjs(it.fromDateTime).isBefore(dayjs())
                it.grid = {
                    x: xIndex * this.xSize,
                    w: (xStopIndex - xIndex) * this.xSize,
                    y: yIndex * this.ySize
                }
                return it
            })
            const overlaps = Object.entries(groupBy(list, 'tableId')).map(([, value]) => {
                return value.map(it => {
                    it.haveOverlap = value.some(that => that.id !== it.id && intersection(it.timeMap, that.timeMap).length > 1)
                    return it
                }).filter(it => it.haveOverlap).map(it => it.id)
            }).flat()

            const shareTable = (Object.values(groupBy(list, 'batch')).filter(it => it.length > 1).flat()
                .map(it => it.id))
            const batchColorCache = {}
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
            console.log(this.reservationList)
        },
        async reload() {
            await this.loadReservations()
        },
        async checkIn(id) {
            await confirmReservation(id)
            await this.reload()
        },
        async showReservationWithId(remoteId) {
            this.activeReservationId = remoteId
            this.showDetailDialog = true
        }
    }
})
export const useHomePageControllerStore = defineStore('homePageController', {
    state: () => ({
        showNewReservationModal: false,
        personCount: 4,
        reservationStep: 0,
        date: dayjs().format(dateFormat),
        startTime: null,
        loading: false,
        timeGap: [],
        otherTime: [],
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
            return Object.assign({fromDateTime: this.date + ' ' + this.startTime, userId: 1},
                this.reservationExtraInfo, {useStroller: this.reservationExtraInfo.useStroller ? 1 : 0})
        }
    },
    actions: {
        async addReservation() {
            this.loading = true
            const res = await addReservation(this.reservationAddModel)
            console.log(res)
            if (res.code === 200) {
                await useReservationStore().reload()
                this.showNewReservationModal = false
            }
            this.loading = false

        },
        showNewModal() {
            this.reservationStep = 0
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



