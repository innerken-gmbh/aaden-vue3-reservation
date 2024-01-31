import dayjs from "dayjs";
import {onBeforeUnmount, ref} from "vue";

export const dateFormat = 'YYYY-MM-DD'


export function today() {
    return dayjs().format(dateFormat)
}


export const timestampTemplate = 'YYYY-MM-DD HH:mm:ss'
export const timeFormat = 'HH:mm'

export function toOnlyTimeFormat(str) {
    return dayjs(str).format(timeFormat)
}
export function toDateFormat(str) {
    return dayjs(str).format(dateFormat)
}

export function timeDisplay(str) {
    return dayjs(str).format(timestampTemplate)
}

export function sliceTime(startTimeString, endTimeString, duration = 'PT15M') {
    const [startTime, endTime] = dayjs(startTimeString, timestampTemplate)
        .isBefore(dayjs(endTimeString, timestampTemplate)) ? [dayjs(startTimeString, timestampTemplate), dayjs(endTimeString, timestampTemplate)]
        : [dayjs(endTimeString, timestampTemplate), dayjs(startTimeString, timestampTemplate)]

    const durationD = dayjs.duration(duration)
    const res = []
    let temp = startTime

    while (temp.isBefore(endTime)) {
        res.push(temp.format(timeFormat))
        temp = temp.add(durationD)
    }
    res.push(endTime.format(timeFormat))
    return res
}

export function timeFromNowInMinute(hour, minute) {
    return -dayjs().set('h', hour).set('m', minute).diff(dayjs(), 'm')
}


export const useCurrentTime = () => {
    const currentTime = ref(new Date());
    const updateCurrentTime = () => {
        currentTime.value = new Date();
    };
    const updateTimeInterval = setInterval(updateCurrentTime, 60*1000);
    onBeforeUnmount(() => {
        clearInterval(updateTimeInterval);
    });
    return {
        currentTime,
    };
};


