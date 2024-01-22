import {defineStore} from "pinia";
import {sliceTime, today} from "./dateRepo.js";
import dayjs from "dayjs";
import {getReservation} from "../api/reservationApi.js";
import {loadReservationTableInfo} from "../api/tableApi.js";


export const useReservationStore = defineStore('reservation', {
    state: () => ({
        reservationList: [],
        date: today(),
        tableList: [],
        xSize: 40,
        ySize: 24,
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
            this.reservations = (await getReservation(this.date)).map(it => {
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
        },
        async reload() {
            await this.loadReservations()
        }
    }
})
