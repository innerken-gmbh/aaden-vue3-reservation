import hillo from "hillo";
import {userId} from "../../main.js";

// const host = import.meta.env.DEV ? "http://192.168.178.41:8080" : "https://cloud-v2.aaden.io"
const host ="https://cloud-v2.aaden.io"
// const host = 'http://localhost/'

hillo.initial(host)

export async function loadAllEvent() {
    return (await hillo.get('reservation/event/' + userId)).data
}

export async function readEvent(id) {
    return (await hillo.jsonPost('reservation/event/' + id + '/read',
        {}))
}

export async function notifyEvent(id) {
    return (await hillo.jsonPost('reservation/event/' + id + '/notified',
        {}))
}


export async function loadAllReservable() {
    return (await hillo.get('reservableTable/getList/' + userId)).data
}

export async function loadAllReservation(fromDateTime, toDateTime) {
    return (await hillo.get('reservation/getList/' + userId, {
        fromDateTime, toDateTime, ignoreCancelled: 0
    })).data
}

export async function getReservation(date) {
    return (await loadAllReservation(date + ' 00:00:00', date + ' 23:59:59'))
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
    useStroller: '0',
    createdBy: 'Merchant',
    internal: true,
}

export async function addReservation(reservationInfo) {
    return (await hillo.jsonPost('reservation/add', Object.assign({}, defaultReservationInfo, reservationInfo)))
}

export async function checkIn(id) {
    return (await hillo.jsonPost('reservation/checkIn/' + id,
        {}))
}

export async function confirm(id) {
    return (await hillo.jsonPost('reservation/confirmByMerchant/' + id,
        {}))
}

export async function getOneReservation(id) {
    return (await hillo.get('reservation/getOne/' + id)).data
}


export async function changeSeatPlan(id, seatPlan) {
    return await hillo.jsonPost('reservation/changeSeatPlan/' + id, seatPlan)
}

export async function changeStartTime(id, startTime) {
    return await hillo.jsonPost('reservation/changeStartTime/' + id, {startTime})
}

export async function changeEatTime(id, eatTime) {
    return await hillo.jsonPost('reservation/changeEatTime/' + id, eatTime)
}

export async function cancelReservation(id) {
    return (await hillo.jsonPost('reservation/cancelInternal/' + id,
        {}))
}


export async function checkTableTimeAvailable(date,
                                              personCount, id) {
    const getTableTime = (await hillo.jsonPost('reservableTable/getTableTime', {
        reserveDate: date, peopleCount: personCount,
        userId: id, internal: true
    }))
    if (getTableTime.code === 200) {
        return getTableTime.data
    } else {
        return '请设置该人数的规则'
    }
}

export async function checkActiveStatus(deviceId) {
    return (await hillo.jsonPost("/cloudUser/reservationUser/check", {deviceId})).data
}


export async function getUserList() {
    return (await hillo.post('user/getList')).data
}


