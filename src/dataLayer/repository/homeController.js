import {defineStore} from "pinia";
import {toBeautiful, today} from "./dateRepo.js";
import {addReservation, checkActiveStatus, getUserList, loadAllEvent, readEvent} from "../api/reservationApi.js";
import {useReservationStore} from "./reservationRepo.js";
import dayjs from "dayjs";
import {userId} from "../../main.js";

export const useHomePageControllerStore
    = defineStore('homePageController', {
    state: () => ({
        showNewReservationModal: false,
        personCount: 4,
        reservationStep: 0,
        showMorePerson: false,
        date: today(),
        startTime: null,
        userInfo: null,
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
                    userId: userId,
                    personCount: this.personCount,
                },
                this.reservationExtraInfo,
                {useStroller: this.reservationExtraInfo.useStroller ? 1 : 0})
        },
        readyToSubmit() {
            return this.reservationExtraInfo.firstName && this.reservationExtraInfo.lastName
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
        async getUserInfo() {
            this.userInfo = await checkActiveStatus(userId)
        }

    }
})
export const useNotificationStore = defineStore('notification', {
    state: () => ({
        show: null,
        eventList: [],
        loading: true,
        lastUpdateTime: ""
    }),
    getters: {
        haveNotReadInfo() {
            return this.eventList.find(it => !it.checked)
        }
    },
    actions: {
        async showList() {
            await this.reload()
            this.show = true
        },
        async actionAnd(action) {
            this.loading = true
            await action()
            await this.reload()

        },
        async reload() {
            this.loading = true
            this.eventList = await loadAllEvent()
            this.lastUpdateTime = toBeautiful(dayjs())
            this.loading = false
        },
        async readAllNotification() {
            await this.actionAnd(async () => {
                for (const eventListElement of this.eventList.filter(it => !it.checked)) {
                    await readEvent(eventListElement.id)
                }
            })
        },
        async readNotification(info) {
            info.checked = true
            await this.actionAnd(async () => {
                await readEvent(info.id)
            })
        }
    }
})
