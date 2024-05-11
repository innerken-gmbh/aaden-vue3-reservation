import {useDragStore} from "./reservationRepo.js";

export const ReservationStatus = {
    Confirmed: 'Confirmed',
    Created: 'Created',
    Cancelled: 'Cancelled',
    CheckIn: 'CheckIn',
    NoShow: 'NoShow'
}

export function reservationCanEdit(reservation) {
    return ![ReservationStatus.Cancelled, ReservationStatus.NoShow, ReservationStatus.CheckIn].includes(reservation?.status ?? ReservationStatus.NoShow)
}


export const ReservationStatusFilter = {
    Normal: [ReservationStatus.Confirmed],
    WaitToBeConfirm: [ReservationStatus.Created],
    Finished: [ReservationStatus.Cancelled, ReservationStatus.CheckIn, ReservationStatus.NoShow]
}


export function getReservationStatusIcon(reservation, canDrag) {
    const overTime = reservation.overTime
    const haveOverlap = reservation.haveOverlap
    const status = reservation.status
    if (canDrag) {
        return 'mdi-cursor-move'
    } else if (haveOverlap) {
        return 'mdi-alert'
    } else if (overTime) {
        return 'mdi-timer-alert'
    } else if (status === ReservationStatus.Created) {
        return 'mdi-bell-badge-outline'
    } else if (status === ReservationStatus.Cancelled || status === ReservationStatus.NoShow) {
        return 'mdi-cancel'
    } else if (status === ReservationStatus.CheckIn) {
        return 'mdi-check'
    } else if (reservation.haveShareTable) {
        return 'mdi-link-variant'
    } else {
        return 'mdi-arrow-expand'
    }
}

export function getReservationAdditionalIcons(reservation) {
    const arr = []
    return arr
}


export function getReservationStatusColor(reservation) {
    if (reservation) {
        const haveOverlap = reservation.haveOverlap
        const status = reservation.status
        const canDrag = useDragStore().draggableItemId === reservation.id
        const overTime = reservation.overTime

        if (canDrag) {
            return 'pink'
        }
        if (overTime) {
            return 'red-lighten-2'
        }
        if (haveOverlap) {
            return 'yellow'
        } else {
            switch (status) {
                case ReservationStatus.Cancelled:
                    return 'transparent'
                case ReservationStatus.CheckIn:
                    return 'green-darken-4'
                case ReservationStatus.Confirmed:
                    return 'cardNormalColor'
                case ReservationStatus.Created:
                    return 'yellow-lighten-4'
                case ReservationStatus.NoShow:
                default:
                    break;
            }
        }
    }
    return 'cardNormalColor'
}

export function getReservationBackgroundClass(reservation) {
    if (reservation) {
        const status = reservation.status
        switch (status) {
            case ReservationStatus.Cancelled:
                return 'bg-surface'
            case ReservationStatus.CheckIn:
                return 'bg-green-darken-4'
            case ReservationStatus.Confirmed:
            case ReservationStatus.Created:
            case ReservationStatus.NoShow:
            default:
                break;

        }
    }
    return 'gradient rounded'
}
