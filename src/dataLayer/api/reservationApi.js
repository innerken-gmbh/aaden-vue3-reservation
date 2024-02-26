import hillo from "hillo";
// const host = 'https://reservation-api.aaden.io/'
const host = 'http://localhost/'
export const userId = 1
hillo.initial(host)

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
    useStroller: '0'
}

export async function addReservation(reservationInfo) {
    return (await hillo.jsonPost('reservation/add', Object.assign({}, defaultReservationInfo, reservationInfo)))
}

export async function confirmReservation(id) {
    return (await hillo.jsonPost('reservation/checkIn/' + id,
        {}))
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
        userId: id
    }))
    if (getTableTime.code === 200) {
        return getTableTime.data
    } else {
        return '请设置该人数的规则'
    }
}

