import {useDragStore} from "./reservationRepo.js";

export const ReservationStatus = {
    Confirmed: 'Confirmed',
    Created: 'Created',
    Cancelled: 'Cancelled',
    CheckIn: 'CheckIn',
    NoShow: 'NoShow'
}
export const ReservationIcon = {
    Confirmed: 'mdi-view-list',
    Created: 'Created',
    Cancelled: 'mdi-cancel',
    CheckIn: 'mdi-check',
    NoShow: 'NoShow'
}


export function getReservationStatusIcon(reservation) {
    const overTime = reservation.overTime
    const haveOverlap = reservation.haveOverlap
    const status = reservation.status
    const canDrag = useDragStore().draggableItemId === reservation.id
    if (canDrag) {
        return 'mdi-cursor-move'
    } else if (haveOverlap) {
        return 'mdi-alert'
    } else if (overTime) {
        return 'mdi-timer-alert'
    } else if (reservation.haveShareTable) {
        return 'mdi-link-variant'
    } else if(status===ReservationStatus.Created){
        return 'mdi-bell-badge-outline'
    } else {
        return 'mdi-arrow-expand'
    }
}


export function getReservationColor(reservation) {
    if (reservation) {
        const haveOverlap = reservation.haveOverlap
        const status = reservation.status
        const canDrag = useDragStore().draggableItemId === reservation.id
        if(canDrag){
            return 'pink'
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
                    return 'indigo'
                case ReservationStatus.NoShow:
                default:
                    break;
            }
        }
    }
    return 'cardNormalColor'
}
