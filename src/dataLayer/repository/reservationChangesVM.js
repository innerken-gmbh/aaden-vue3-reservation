import {defineStore} from "pinia";
import {changeSeatPlan, changeStartTime} from "../api/reservationApi.js";
import {useReservationStore} from "./reservationRepo.js";
import {groupBy, keyBy} from "lodash-es";

export const useReservationChangeVM = defineStore('reservationChange', {
    state: () => ({
        seatPlanChanges: {},
        timeChanges: {},
        loading: false,
    }),
    actions: {
        addSeatPlanChanges(blockId, tableId, reservationId) {
            if (!tableId) {
                delete this.seatPlanChanges[blockId]
            } else {
                this.seatPlanChanges[blockId] = {tableId, reservationId}
            }
        },
        addToChanges(id, start) {
            if (!start) {
                delete this.timeChanges[id]
            } else {
                this.timeChanges[id] = {start}
            }
        },
        async applyAllChanges() {
            this.loading = true
            const reservationInfo = useReservationStore()
            await reservationInfo.actionAnd(async () => {
                const map = keyBy(reservationInfo.reservationList, 'id')
                const timeChanges = Object.entries(this.timeChanges)
                    .map(([key, value]) => ({...value, id: key}))
                for (const info of timeChanges) {
                    await changeStartTime(info.id, info.start)
                }
                const seatPlanChanges = Object.entries(this.seatPlanChanges).map(([key, value]) => ({
                    ...value,
                    id: parseInt(key)
                }))
                const seatPlan = groupBy(seatPlanChanges, 'reservationId')
                for (const r in seatPlan) {
                    const oldSeatPlan = map[r].seatPlan
                    for (const change of seatPlan[r]) {
                        oldSeatPlan.find(it => it.id === parseInt(change.id)).tableId = change.tableId
                    }
                    await changeSeatPlan(r, oldSeatPlan)
                }
                this.timeChanges = {}
                this.seatPlanChanges = {}
            })
            this.loading = false
        },

        async cancelAllChanges() {
            this.changes = {}
            const reservationInfo = useReservationStore()
            await reservationInfo.reload()
        }
    },
    getters: {
        changesCount() {
            return Object.values(this.seatPlanChanges).length + Object.values(this.timeChanges).length
        }
    }
})
