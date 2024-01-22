import hillo from "hillo";
import {loadAllReservable} from "./reservationApi.js";

export async function getTableListWithCells() {
    return (await hillo.get('Tables.php?op=showAllTableWithCells')).content.map(t => {
        t.cells = t.cells.map(p => {
            p.x = parseInt(p.x)
            p.y = parseInt(p.y)
            return p
        }) ?? []
        return t
    })
}

export const TableFixedSectionId = {
    Togo: 6,
    togoFilter(t) {
        return parseInt(t.sectionId) === TableFixedSectionId.Togo
    },
    notTogoFilter(t) {
        return parseInt(t.sectionId) !== TableFixedSectionId.Togo
    }
}

export async function loadReservationTableInfo() {
    const reservableTableSet = new Set((await loadAllReservable()).map(it => it.id))
    return (await getTableListWithCells())
        .filter(TableFixedSectionId.notTogoFilter).map(it => {
            it.reservable = reservableTableSet.has(it.tableId)
            return it
        })
}
