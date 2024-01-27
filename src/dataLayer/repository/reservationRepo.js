import {defineStore} from "pinia";
import {dateFormat, sliceTime, today} from "./dateRepo.js";
import dayjs from "dayjs";
import {getReservation} from "../api/reservationApi.js";
import {loadReservationTableInfo} from "../api/tableApi.js";


export const useReservationStore = defineStore('reservation', {
    state: () => ({
        reservationList: [],
        date: today(),
        tableList: [],
        xSize: 40,
        ySize: 36,
        activeReservationId: null,
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
        }
    },
    actions: {
        async loadReservations() {
            this.tableList = await loadReservationTableInfo()
            this.reservationList = (await getReservation(this.date)).map(it => {
                const xIndex = this.timeSlots.findIndex(t => dayjs(it.fromDateTime)
                    .format('HH:mm') === t)
                const xStopIndex = this.timeSlots.findIndex(t => dayjs(it.toDateTime)
                    .format('HH:mm') === t)
                const yIndex = this.tableList.findIndex(t => parseInt(t.tableId) === parseInt(it.tableId))
                it.timeMap = sliceTime(it.fromDateTime, it.toDateTime)
                it.grid = {
                    x: xIndex * this.xSize,
                    w: (xStopIndex - xIndex) * this.xSize,
                    y: yIndex * this.ySize
                }
                return it
            })
            console.log(this.reservationList)
        },
        async reload() {
            await this.loadReservations()
        }
    }
})

export const useHomePageControllerStore = defineStore('homePageController', {
    state: () => ({
        showNewReservationModal: false,
        personCount: 4,
        reservationStep: 0,
        date: dayjs().format(dateFormat),
        startTime: dayjs().format('HH:mm'),
        timeGap: [],
        otherTime: [],
        adultCount: 1,
        childCount: 0,
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
        note: '',
        useStroller: false
    }),
    actions: {
        showNewModal() {
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
