import {defineStore} from "pinia";
import {toBeautiful, today} from "./dateRepo.js";
import {addReservation, addRoomReservation, checkActiveStatus, loadAllEvent, readEvent} from "../api/reservationApi.js";
import {useReservationStore, useRoomPickerStore, useTimePickerStore} from "./reservationRepo.js";
import dayjs from "dayjs";
import {userId} from "../../main.js";
import {i18n} from "../../plugins/i18n.js";

export const useHomePageControllerStore
    = defineStore('homePageController', {
    state: () => ({
        adminMode: false,
        offlinePaid: false,
        // POS-751: 线下支付时收的是现金还是 EC 卡，取值 'CASH' | 'EC'，云端字段 offlinePayMethod
        offlinePayMethod: null,
        showNewReservationModal: false,
        personCount: 4,
        reservationStep: 0,
        showMorePerson: false,
        date: today(),
        startTime: null,
        originStartTime: null,
        userInfo: null,
        loading: false,
        timeGap: [],
        otherTime: [],
        error: false,
        errorMessage: '',
        tableType: 'Table',
        reservationHost: '',
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
                    deviceId: userId,
                    personCount: this.personCount,
                },
                this.reservationExtraInfo,
                {useStroller: this.reservationExtraInfo.useStroller ? 1 : 0})
        },
        depositAmount() {
            return this.adminMode ? 0 : useRoomPickerStore().totalPrice
        },
        // 只有包间预订、勾了「线下支付」且定金大于 0 时，才必须选现金 / EC 卡并传给云端
        offlinePayMethodRequired() {
            return this.tableType === 'Room' && this.offlinePaid && this.depositAmount > 0
        },
        readyToSubmit() {
            return this.reservationExtraInfo.firstName && this.reservationExtraInfo.lastName
        }
    },
    actions: {
        clearOfflinePayMethodError() {
            if (this.error && this.errorMessage === i18n.global.t('OfflinePayMethodRequired')) {
                this.error = false
                this.errorMessage = ''
            }
        },
        toggleOfflinePaid() {
            this.offlinePaid = !this.offlinePaid
            if (!this.offlinePaid) {
                this.offlinePayMethod = null
            }
            this.clearOfflinePayMethodError()
        },
        toggleAdminMode() {
            this.adminMode = !this.adminMode
            this.clearOfflinePayMethodError()
        },
        selectOfflinePayMethod(method) {
            this.offlinePayMethod = method
            this.clearOfflinePayMethodError()
        },
        async addReservation() {
            if (this.offlinePayMethodRequired && !['CASH', 'EC'].includes(this.offlinePayMethod)) {
                this.error = true
                this.errorMessage = i18n.global.t('OfflinePayMethodRequired')
                return
            }
            this.loading = true
            // 复制一份：getter 结果有缓存，直接改会把上一次请求的字段（如 offlinePayMethod）带到下一次
            const obj = {...this.reservationAddModel}
            let res = null
            if (this.tableType === 'Room') {
                const roomPicker = useRoomPickerStore()
                obj.fromDateTime = dayjs(this.date + ' ' + this.originStartTime).format('YYYY-MM-DD HH:mm')
                obj.totalPrice = this.depositAmount
                obj.paid = this.offlinePaid
                if (this.offlinePayMethodRequired) {
                    obj.offlinePayMethod = this.offlinePayMethod
                }
                obj.tableId = roomPicker.selectedRoom?.room?.tableId ?? null
                obj.duration = useTimePickerStore().availableTimes.find(it => it.startTime === useHomePageControllerStore().startTime).maxTimeGap
                obj.requestFrom = this.reservationHost
                obj.internal = false
                obj.stripeConnectKey = this.userInfo.setting.stripeConnectKey
                res = await addRoomReservation(obj)
            } else {
                res = await addReservation(obj)
            }
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
            this.offlinePayMethod = null
            this.reservationExtraInfo = {
                firstName: '',
                lastName: '',
                phone: '',
                email: '',
                note: '',
                useStroller: false
            }
            this.tableType = 'Table'
            useRoomPickerStore().selectedRoom = null
            this.showNewReservationModal = true
        },
        async getUserInfo() {
            this.userInfo = await checkActiveStatus(userId)
            this.reservationHost = 'https://' + this.userInfo.setting.subDomainName + '.reservation.beta.aaden.io'
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
