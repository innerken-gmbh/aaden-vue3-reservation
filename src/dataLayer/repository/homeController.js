import {defineStore} from "pinia";
import {today} from "./dateRepo.js";
import {addReservation} from "../api/reservationApi.js";
import {useReservationStore} from "./reservationRepo.js";

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
        },
        readyToSubmit() {
            return this.reservationExtraInfo.firstName && this.reservationExtraInfo.lastName && (this.reservationExtraInfo.email || this.reservationExtraInfo.phone)
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

    }
})
