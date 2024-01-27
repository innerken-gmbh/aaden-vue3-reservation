import hillo from "hillo";
import dayjs from "dayjs";
import {dateFormat, sliceTime} from "../repository/dateRepo.js";

export async function loadAllReservable() {
    return (await hillo.get('Tables.php?op=getAllReservable')).content
}

export async function setReservable(tableId, newState) {
    console.log(tableId, newState)
    if (newState) {
        await addToReservable(tableId)
    } else {
        await removeFromReservable(tableId)
    }
}


export async function loadAllReservation(fromDateTime, toDateTime) {
    return (await hillo.get('Tables.php?op=getReservationByTimeSpan', {
        fromDateTime, toDateTime
    })).content
}

export async function addToReservable(tableId) {
    return (await hillo.post('Tables.php?op=addToReservable', {tableId}))
}

export async function removeFromReservable(tableId) {
    return (await hillo.post('Tables.php?op=removeFromReservable', {tableId}))
}

export async function getReservation(date) {
    return (await loadAllReservation(date + ' 00:00:00', date + ' 23:59:59'))
}


const host = 'https://reservoir.aaden.io/mutlipleUser/'

export async function loadReserveSettings() {
    return (await hillo.get('Tables.php?op=getReserveSettings')).content
}

const defaultReservationInfo = {
    tableId: '553',
    fromDateTime: '2022-01-18 17:00:00',
    toDateTime: '2022-01-18 19:00:00',
    personCount: '4',
    title: '',
    firstName: 'fn',
    lastName: 'ln',
    email: 'em',
    tel: '0123',
    company: 'com',
    note: '',
    childCount: '0',
    useStroller: '0'
}

export async function addReservation(reservationInfo) {
    return (await hillo.jsonPost(host + 'reservation/add', Object.assign({}, defaultReservationInfo, reservationInfo)))
}

export async function confirmReservation(id) {
    return (await hillo.post('Tables.php?op=completeReservation', Object.assign({}, {reservationId: id})))
}

export async function moveReservation(reservationId, newTableId) {

    return (await hillo.post('Tables.php?op=moveReservation', {
        reservationId, newTableId
    }))
}

export async function cancelReservation(reservationId) {
    const res = await IKUtils.showConfirmAsyn(
        i18n.t('EmailWillBeSentIfReservationIsCancelled'),
        i18n.t('AreYouSureToCancelTheReservation')
    )
    if (res.isConfirmed) {
        return (await hillo.post('Tables.php?op=cancelReservation', {
            reservationId
        }))
    }
}

export async function getTimeSlotForDate(date, setting) {
    const targetDayOfWeek = dayjs(date, dateFormat).isoWeekday()
    const duration = setting.gap
    console.log((setting.weeklySettings
        .find(it => parseInt(it.dayOfWeek) === targetDayOfWeek)))
    return (setting.weeklySettings
        .find(it => parseInt(it.dayOfWeek) === targetDayOfWeek)?.openingTimespan ?? [])
        .map(it => sliceTime(date + ' ' + it.from, date + ' ' + it.to, duration))
        .flat()
}

export async function checkTableTimeAvailable(date, time, personCount, id) {
    const getTableTime = (await hillo.jsonPost(host + 'reservableTable/getTableTime', {
        reserveTime: time, reserveDate: date, peopleCount: personCount, userId: id
    }))
    const res = getTableTime.data
    console.log(getTableTime, 'getTableTime')
    if (getTableTime.message === '请设置该人数的规则') {
        return '请设置该人数的规则'
    } else {
        if (res.check === true) {
            return false
        } else {
            return res.data
        }
    }
}

export async function getReservationUserList() {
    return (await hillo.post(host + 'user/getList', {})).data
}
