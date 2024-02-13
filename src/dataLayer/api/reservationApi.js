import hillo from "hillo";
import dayjs from "dayjs";
import {dateFormat, sliceTime} from "../repository/dateRepo.js";
import {useReservationStore} from "../repository/reservationRepo.js";

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
        fromDateTime, toDateTime, ignoreCancelled: 0
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
    const confirm = async (reservation) => {
        (await hillo.post('Tables.php?op=completeReservation',
            {reservationId: reservation.id}))
    }
    await confirm({id})
    await alsoDoWithOthers(id, confirm)

}

async function alsoDoWithOthers(id, action) {
    const list = useReservationStore().reservationList
    const batch = list.find(x => x.id === id).batch
    const others = list.filter(it => it.batch === batch && it.id !== id)
    for (const reservation of others) {
        await action(reservation)
    }
}

export async function moveReservation(reservationId, newTableId, fromDateTime, toDateTime) {
    const realMoveReservation = async (r) => {
        await hillo.post('Tables.php?op=moveReservation&debug=true',
            {
                reservationId: r.id,
                newTableId: r.tableId,
                fromDateTime,
                toDateTime
            })
    }
    await realMoveReservation({id: reservationId, tableId: newTableId})
    await alsoDoWithOthers(reservationId, realMoveReservation)
}

export async function cancelReservation(reservationId) {
    return (await hillo.post('Tables.php?op=cancelReservation', {
        reservationId
    }))
}

export async function getTimeSlotForDate(date, setting) {
    const targetDayOfWeek = dayjs(date, dateFormat).isoWeekday()
    const duration = setting.gap
    return (setting.weeklySettings
        .find(it => parseInt(it.dayOfWeek) === targetDayOfWeek)?.openingTimespan ?? [])
        .map(it => sliceTime(date + ' ' + it.from, date + ' ' + it.to, duration))
        .flat()
}

export async function checkTableTimeAvailable(date, time,
                                              personCount, id) {
    const getTableTime = (await hillo.jsonPost(host + 'reservableTable/getTableTime', {
        reserveTime: time, reserveDate: date, peopleCount: personCount,
        userId: id
    }))
    const res = getTableTime.data

    if (getTableTime.code === 200) {
        return res.data
    } else {
        return '请设置该人数的规则'
    }
}

export async function getReservationUserList() {
    return (await hillo.post(host + 'user/getList', {})).data
}
