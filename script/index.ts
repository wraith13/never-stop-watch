import { minamo } from "./minamo.js";
import config from "../resource/config.json";
import localeEn from "../resource/lang.en.json";
import localeJa from "../resource/lang.ja.json";
import resource from "../resource/images.json";
export const simpleComparer = minamo.core.comparer.basic;
export const simpleReverseComparer = <T>(a: T, b: T) => -simpleComparer(a, b);
export module locale
{
    export const master =
    {
        en: localeEn,
        ja: localeJa,
    };
    export type LocaleKeyType =
        keyof typeof localeEn &
        keyof typeof localeJa;
    export type LocaleType = keyof typeof master;
    export const locales = Object.keys(master) as LocaleType[];
    let masterKey: LocaleType = 0 <= locales.indexOf(navigator.language as LocaleType) ?
        navigator.language as LocaleType:
        locales[0];
    export const getLocaleName = (locale: LocaleType) => master[locale].$name;
    export const setLocale = (locale: LocaleType | null) =>
    {
        const key = locale ?? navigator.language as LocaleType;
        if (0 <= locales.indexOf(key))
        {
            masterKey = key;
        }
    };
    export const get = () => masterKey;
    export const getPrimary = (key : LocaleKeyType) => master[masterKey][key];
    export const getSecondary = (key : LocaleKeyType) => master[locales.filter(locale => masterKey !== locale)[0]][key];
    export const string = (key : string) : string => getPrimary(key as LocaleKeyType) || key;
    export const map = (key : LocaleKeyType) : string => string(key);
    export const parallel = (key : LocaleKeyType) : string => `${getPrimary(key)} / ${getSecondary(key)}`;
}
export module Clockworks
{
    export const applicationTitle = config.applicationTitle;
    export interface ApplicationEntry
    {
        icon: Render.Resource.KeyType;
        title: string;
    }
    export const application =
    {
        "RainbowClock": <ApplicationEntry>
        {
            icon: "tick-icon",
            title: "Rainbow Clock",
        },
        "CountdownTimer": <ApplicationEntry>
        {
            icon: "history-icon",
            title: "Countdown Timer",
        },
        "NeverStopwatch": <ApplicationEntry>
        {
            icon: "never-stopwatch-icon",
            title: "Never Stopwatch",
        },
    };
    export type ApplicationType = keyof typeof application;
    export const ApplicationList = Object.keys(application);
    export const themeObject =
    {
        "auto": null,
        "light": null,
        "dark": null,
    };
    export type ThemeType = keyof typeof themeObject;
    export const ThemeList = Object.keys(themeObject);

    export const progressBarStyleObject =
    {
        "header": null,
        "auto": null,
        "horizontal": null,
        "vertical": null,
    };
    export type ProgressBarStyleType = keyof typeof progressBarStyleObject;
    export const ProgressBarStyleList = Object.keys(progressBarStyleObject);

    export interface Settings
    {
        theme?: ThemeType;
        progressBarStyle?: ProgressBarStyleType;
        locale?: locale.LocaleType;
    }
    export interface AlermTimerEntry
    {
        type: "timer";
        start: number;
        end: number;
    }
    export interface AlermScheduleEntry
    {
        type: "schedule";
        title: string;
        start: number;
        end: number;
    }
    export type AlermEntry = AlermTimerEntry | AlermScheduleEntry;
    const setTitle = (title: string) =>
    {
        if (document.title !== title)
        {
            document.title = title;
        }
    };
    const getRainbowColor = (index: number, baseIndex = config.rainbowColorSetDefaultIndex) =>
        config.rainbowColorSet[(index +baseIndex) % config.rainbowColorSet.length];
    const getSolidRainbowColor = (index: number, baseIndex = config.rainbowColorSetDefaultIndex) =>
        getRainbowColor(index *config.rainbowColorSetSolidIndexRate, baseIndex);
    const setHeaderColor = (color: string | null) =>
    {
        const screenHeader = document.getElementById("screen-header");
        if (color)
        {
            if (screenHeader.style.backgroundColor !== color)
            {
                screenHeader.style.backgroundColor = color;
            }
        }
        else
        {
            if (screenHeader.style.backgroundColor)
            {
                screenHeader.style.removeProperty("background-color");
            }
        }
    };
    const setBodyColor = (color: string) =>
    {
        const bodyColor = `${color}E8`;
        if (document.body.style.backgroundColor !== bodyColor)
        {
            document.body.style.backgroundColor = bodyColor;
        }
        const meta = document.getElementById("theme-color") as HTMLMetaElement;
        if (meta.content !== color)
        {
            meta.content = color;
        }
    };
    const setFoundationColor = (color: string) =>
    {
        const foundation = document.getElementById("foundation");
        if (foundation.style.backgroundColor !== color)
        {
            foundation.style.backgroundColor = color;
        }
        if ("header" === Storage.Settings.get().progressBarStyle ?? "auto")
        {
            setHeaderColor(color);
        }
        else
        {
            setHeaderColor(null);
        }
    };
    const toHex = (i : number) : string =>
    {
        let result = Math.round(i).toString(16).toUpperCase();
        if (1 === result.length) {
            result = "0" +result;
        }
        return result;
    };
    const mixColors = (colorA: string, colorB: string, rate: number) =>
    {
        if (rate <= 0.0)
        {
            return colorA;
        }
        if (1.0 <= rate)
        {
            return colorB;
        }
        const rateA = 1.0 -rate;
        const rateB = rate;
        let r = 0;
        let g = 0;
        let b = 0;
        if (4 === colorA.length)
        {
            r += parseInt(colorA.substr(1,1), 16) *0x11 *rateA;
            g += parseInt(colorA.substr(2,1), 16) *0x11 *rateA;
            b += parseInt(colorA.substr(3,1), 16) *0x11 *rateA;
        }
        if (7 === colorA.length)
        {
            r += parseInt(colorA.substr(1,2), 16) *rateA;
            g += parseInt(colorA.substr(3,2), 16) *rateA;
            b += parseInt(colorA.substr(5,2), 16) *rateA;
        }
        if (4 === colorB.length)
        {
            r += parseInt(colorB.substr(1,1), 16) *0x11 *rateB;
            g += parseInt(colorB.substr(2,1), 16) *0x11 *rateB;
            b += parseInt(colorB.substr(3,1), 16) *0x11 *rateB;
        }
        if (7 === colorB.length)
        {
            r += parseInt(colorB.substr(1,2), 16) *rateB;
            g += parseInt(colorB.substr(3,2), 16) *rateB;
            b += parseInt(colorB.substr(5,2), 16) *rateB;
        }
        const result = "#"
            +toHex(r)
            +toHex(g)
            +toHex(b);
        return result;
    };
    export const rainbowClockColorPatternMap =
    {
        "gradation": (index: number) => getRainbowColor(index, 0),
        "solid": (index: number) => getSolidRainbowColor(index, 0),
    };
    export type rainbowClockColorPatternType = keyof typeof rainbowClockColorPatternMap;
    export module Storage
    {
        export let lastUpdate = 0;
        export module NeverStopwatch
        {
            const applicationName = "NeverStopwatch";
            export module Stamps
            {
                export const makeKey = () => `${config.localDbPrefix}:${applicationName}:stamps`;
                export const get = (): number[] => minamo.localStorage.getOrNull<number[]>(makeKey()) ?? [];
                export const set = (list: number[]) => minamo.localStorage.set(makeKey(), list);
                export const removeKey = () => minamo.localStorage.remove(makeKey());
                export const add = (tick: number | number[]) =>
                    set(get().concat(tick).sort(simpleReverseComparer));
                export const remove = (tick: number) =>
                    set(get().filter(i => tick !== i).sort(simpleReverseComparer));
            }
            export module flashInterval
            {
                export const makeKey = () => `${config.localDbPrefix}:${applicationName}:flashInterval`;
                export const get = () => minamo.localStorage.getOrNull<number>(makeKey()) ?? 0;
                export const set = (value: number) => minamo.localStorage.set(makeKey(), value);
            }
        }
        export module CountdownTimer
        {
            const applicationName = "CountdownTimer";
            export module Alerms
            {
                export const makeKey = () => `${config.localDbPrefix}:${applicationName}:alerms`;
                export const get = (): AlermEntry[] => minamo.localStorage.getOrNull<AlermEntry[]>(makeKey()) ?? [];
                export const set = (list: AlermEntry[]) => minamo.localStorage.set(makeKey(), list.sort(minamo.core.comparer.make(i => i.end)));
                export const removeKey = () => minamo.localStorage.remove(makeKey());
                export const add = (tick: AlermEntry | AlermEntry[]) =>
                    set(get().concat(tick).sort(simpleReverseComparer));
                export const remove = (tick: AlermEntry) =>
                    set(get().filter(i => JSON.stringify(tick) !== JSON.stringify(i)).sort(simpleReverseComparer));
            }
            export module flashInterval
            {
                export const makeKey = () => `${config.localDbPrefix}:${applicationName}:flashInterval`;
                export const get = () => minamo.localStorage.getOrNull<number>(makeKey()) ?? 0;
                export const set = (value: number) => minamo.localStorage.set(makeKey(), value);
            }
            export module ColorIndex
            {
                export const makeKey = () => `${config.localDbPrefix}:${applicationName}:colorIndex`;
                export const get = () => minamo.localStorage.getOrNull<number>(makeKey()) ?? 0;
                export const set = (value: number) => minamo.localStorage.set(makeKey(), value);
            }
        }
        export module RainbowClock
        {
            const applicationName = "RainbowClock";
            export module colorPattern
            {
                export const makeKey = () => `${config.localDbPrefix}:${applicationName}:colorPattern`;
                export const get = () =>
                    minamo.localStorage.getOrNull<rainbowClockColorPatternType>(makeKey()) ?? "gradation";
                export const set = (settings: rainbowClockColorPatternType) =>
                    minamo.localStorage.set(makeKey(), settings);
            }
            export module flashInterval
            {
                export const makeKey = () => `${config.localDbPrefix}:${applicationName}:flashInterval`;
                export const get = () => minamo.localStorage.getOrNull<number>(makeKey()) ?? 60;
                export const set = (value: number) => minamo.localStorage.set(makeKey(), value);
            }
        }
        export module Settings
        {
            export const makeKey = () => `${config.localDbPrefix}:settings`;
            export const get = () =>
                minamo.localStorage.getOrNull<Clockworks.Settings>(makeKey()) ?? { };
            export const set = (settings: Clockworks.Settings) =>
                minamo.localStorage.set(makeKey(), settings);
        }
    }
    export module Domain
    {
        export const makeTimerLabel = (minutes: number) => `${minutes} ${locale.map("m(minutes)")}`;
        export const getTicks = (date: Date = new Date()) => date.getTime();
        export const getAppropriateTicks = (date: Date = new Date()) =>
        {
            const TenMinutesLater = date.getTime() +(10 *60 *1000);
            const FloorHour = new Date(TenMinutesLater);
            FloorHour.setMinutes(0);
            FloorHour.setSeconds(0);
            FloorHour.setMilliseconds(0);
            return FloorHour.getTime() +(60 *60 *1000);
        };
        export const weekday = (tick: number) =>
            new Intl.DateTimeFormat(locale.get(), { weekday: 'long'}).format(tick);
        export const dateCoreStringFromTick = (tick: null | number): string =>
        {
            if (null === tick)
            {
                return "N/A";
            }
            else
            {
                const date = new Date(tick);
                return `${date.getFullYear()}-${("0" +(date.getMonth() +1)).substr(-2)}-${("0" +date.getDate()).substr(-2)}`;
            }
        };
        export const getTime = (tick: null | number): null | number =>
        {
            if (null === tick)
            {
                return null;
            }
            else
            if (tick < 0)
            {
                return -getTime(tick);
            }
            else
            if (tick < 24 *60 *60 *1000)
            {
                return tick;
            }
            else
            {
                const date = new Date(tick);
                date.setHours(0);
                date.setMinutes(0);
                date.setSeconds(0);
                date.setMilliseconds(0);
                return tick -getTicks(date);
            }
        };
        export const dateStringFromTick = (tick: null | number): string =>
        {
            if (null === tick)
            {
                return "N/A";
            }
            else
            {
                return `${dateCoreStringFromTick(tick)} ${timeLongCoreStringFromTick(getTime(tick))}`;
            }
        };
        export const dateFullStringFromTick = (tick: null | number): string =>
        {
            if (null === tick)
            {
                return "N/A";
            }
            else
            {
                return `${dateCoreStringFromTick(tick)} ${timeFullCoreStringFromTick(getTime(tick))}`;
            }
        };
        export const timeShortCoreStringFromTick = (tick: null | number): string =>
        {
            if (null === tick)
            {
                return "N/A";
            }
            else
            if (tick < 0)
            {
                return `-${timeShortCoreStringFromTick(-tick)}`;
            }
            else
            {
                const hour = Math.floor(tick /(60 *60 *1000)) %24;
                const minute = Math.floor(tick /(60 *1000)) %60;
                return `${("00" +hour).slice(-2)}:${("00" +minute).slice(-2)}`;
            }
        };
        export const timeLongCoreStringFromTick = (tick: null | number): string =>
        {
            if (null === tick)
            {
                return "N/A";
            }
            else
            if (tick < 0)
            {
                return `-${timeLongCoreStringFromTick(-tick)}`;
            }
            else
            {
                const hour = Math.floor(tick /(60 *60 *1000)) %24;
                const minute = Math.floor(tick /(60 *1000)) %60;
                const second = Math.floor(tick /(1000)) %60;
                return `${("00" +hour).slice(-2)}:${("00" +minute).slice(-2)}:${("00" +second).slice(-2)}`;
            }
        };
        export const timeFullCoreStringFromTick = (tick: null | number): string =>
        {
            if (null === tick)
            {
                return "N/A";
            }
            else
            if (tick < 0)
            {
                return `-${timeFullCoreStringFromTick(-tick)}`;
            }
            else
            {
                const hour = Math.floor(tick /(60 *60 *1000)) %24;
                const minute = Math.floor(tick /(60 *1000)) %60;
                const second = Math.floor(tick /(1000)) %60;
                const milliseconds = tick %1000;
                return `${("00" +hour).slice(-2)}:${("00" +minute).slice(-2)}:${("00" +second).slice(-2)}.${("000" +milliseconds).slice(-3)}`;
            }
        };
        export const timeShortStringFromTick = (tick: null | number): string =>
        {
            if (null === tick)
            {
                return "N/A";
            }
            else
            if (tick < 0)
            {
                return `-${timeShortStringFromTick(-tick)}`;
            }
            else
            {
                // if (tick < 60 *1000)
                // {
                //     return timeFullCoreStringFromTick(tick);
                // }
                if (tick < 60 *60 *1000)
                {
                    return timeLongCoreStringFromTick(tick);
                }
                const days = Math.floor(tick / (24 *60 *60 *1000));
                if (days < 1)
                {
                    return timeLongCoreStringFromTick(tick);
                }
                return `${days.toLocaleString()} ${locale.map("days")} ${timeLongCoreStringFromTick(tick)}`;
            }
        };
        export const timeLongStringFromTick = (tick: null | number): string =>
        {
            if (null === tick)
            {
                return "N/A";
            }
            else
            if (tick < 0)
            {
                return `-${timeLongStringFromTick(-tick)}`;
            }
            else
            {
                const days = Math.floor(tick / (24 *60 *60 *1000));
                return 0 < days ?
                    `${days.toLocaleString()} ${locale.map("days")} ${timeFullCoreStringFromTick(tick)}`:
                    timeFullCoreStringFromTick(tick);
            }
        };
        export const parseDate = (date: string | null): Date | null =>
        {
            if (null !== date)
            {
                try
                {
                    return new Date(Date.parse(date));
                }
                catch
                {
                    return null;
                }
            }
            return null;
        };
    }
    export module Render
    {
        export const fullscreenEnabled = () => document.fullscreenEnabled ?? (document as any).webkitFullscreenEnabled;
        export const fullscreenElement = () => (document.fullscreenElement ?? ((document as any).webkitFullscreenElement) ?? null);
        export const requestFullscreen = async (element: Element = document.documentElement) =>
        {
            if (element.requestFullscreen)
            {
                await element.requestFullscreen();
            }
            else
            if ((element as any).webkitRequestFullscreen)
            {
                await ((element as any).webkitRequestFullscreen)();
            }
            if ( ! document.body.classList.contains("sleep-mouse"))
            {
                document.body.classList.add("sleep-mouse");
            }
        };
        export const exitFullscreen = async () =>
        {
            if (document.exitFullscreen)
            {
                await document.exitFullscreen();
            }
            else
            if ((document as any).webkitCancelFullScreen)
            {
                await ((document as any).webkitCancelFullScreen)();
            }
            if (document.body.classList.contains("sleep-mouse"))
            {
                document.body.classList.remove("sleep-mouse");
            }
        };
        export module Operate
        {
            export module NeverStopwatch
            {
                export const stamp = async (tick: number, onCanceled?: () => unknown) =>
                {
                    const backup = Storage.NeverStopwatch.Stamps.get();
                    Storage.NeverStopwatch.Stamps.add(tick);
                    updateWindow("operate");
                    const toast = makePrimaryToast
                    ({
                        content: $span("")(`${locale.map("Stamped!")}`),
                        backwardOperator: cancelTextButton
                        (
                            async () =>
                            {
                                Storage.NeverStopwatch.Stamps.set(backup);
                                updateWindow("operate");
                                await toast.hide();
                                onCanceled?.();
                            }
                        ),
                    });
                };
                export const edit = async (oldTick: number, newTick: number, onCanceled?: () => unknown) =>
                {
                    const backup = Storage.NeverStopwatch.Stamps.get();
                    Storage.NeverStopwatch.Stamps.remove(oldTick);
                    Storage.NeverStopwatch.Stamps.add(newTick);
                    updateWindow("operate");
                    const toast = makePrimaryToast
                    ({
                        content: $span("")(`${locale.map("Updated.")}`),
                        backwardOperator: cancelTextButton
                        (
                            async () =>
                            {
                                Storage.NeverStopwatch.Stamps.set(backup);
                                updateWindow("operate");
                                await toast.hide();
                                onCanceled?.();
                            }
                        ),
                    });
                };
                export const removeStamp = async (tick: number, onCanceled?: () => unknown) =>
                {
                    const backup = Storage.NeverStopwatch.Stamps.get();
                    Storage.NeverStopwatch.Stamps.remove(tick);
                    updateWindow("operate");
                    const toast = makePrimaryToast
                    ({
                        content: $span("")(`${locale.map("Removed.")}`),
                        backwardOperator: cancelTextButton
                        (
                            async () =>
                            {
                                Storage.NeverStopwatch.Stamps.set(backup);
                                updateWindow("operate");
                                await toast.hide();
                                onCanceled?.();
                            }
                        ),
                    });
                };
                export const reset = async (onCanceled?: () => unknown) =>
                {
                    const backup = Storage.NeverStopwatch.Stamps.get();
                    Storage.NeverStopwatch.Stamps.removeKey();
                    updateWindow("operate");
                    const toast = makePrimaryToast
                    ({
                        content: $span("")(`リセットしました。`),
                        backwardOperator: cancelTextButton
                        (
                            async () =>
                            {
                                Storage.NeverStopwatch.Stamps.set(backup);
                                updateWindow("operate");
                                await toast.hide();
                                onCanceled?.();
                            }
                        ),
                    });
                };
            }
            export module CountdownTimer
            {
                export const newTimer = async (i: number, onCanceled?: () => unknown) =>
                {
                    const tick = Domain.getTicks();
                    const alerm: AlermTimerEntry =
                    {
                        type: "timer",
                        start: tick,
                        end: tick +(i *60 *1000),
                    };
                    Storage.CountdownTimer.Alerms.add(alerm);
                    updateWindow("operate");
                    const toast = makePrimaryToast
                    ({
                        content: $span("")(`${locale.map("Done!")}`),
                        backwardOperator: cancelTextButton
                        (
                            async () =>
                            {
                                Storage.CountdownTimer.Alerms.remove(alerm);
                                updateWindow("operate");
                                await toast.hide();
                                onCanceled?.();
                            }
                        ),
                    });
                };
                export const newSchedule = async (title: string, end: number, onCanceled?: () => unknown) =>
                {
                    const alerm: AlermScheduleEntry =
                    {
                        type: "schedule",
                        title,
                        start: Domain.getTicks(),
                        end,
                    };
                    Storage.CountdownTimer.Alerms.add(alerm);
                    updateWindow("operate");
                    const toast = makePrimaryToast
                    ({
                        content: $span("")(`${locale.map("Done!")}`),
                        backwardOperator: cancelTextButton
                        (
                            async () =>
                            {
                                Storage.CountdownTimer.Alerms.remove(alerm);
                                updateWindow("operate");
                                await toast.hide();
                                onCanceled?.();
                            }
                        ),
                    });
                };
                export const edit = async (item: AlermScheduleEntry, title: string, end: number, onCanceled?: () => unknown) =>
                {
                    const oldSchedule = item;
                    const newSchedule: AlermScheduleEntry =
                    {
                        type: item.type,
                        title,
                        start: oldSchedule.start,
                        end,
                    };
                    Storage.CountdownTimer.Alerms.remove(oldSchedule);
                    Storage.CountdownTimer.Alerms.add(newSchedule);
                    updateWindow("operate");
                    const toast = makePrimaryToast
                    ({
                        content: $span("")(`${locale.map("Saved!")}`),
                        backwardOperator: cancelTextButton
                        (
                            async () =>
                            {
                                Storage.CountdownTimer.Alerms.remove(newSchedule);
                                Storage.CountdownTimer.Alerms.add(oldSchedule);
                                updateWindow("operate");
                                await toast.hide();
                                onCanceled?.();
                            }
                        ),
                    });
                };
                export const done = async (item: AlermEntry, onCanceled?: () => unknown) =>
                {
                    Storage.CountdownTimer.Alerms.remove(item);
                    updateWindow("operate");
                    const toast = makePrimaryToast
                    ({
                        content: $span("")(`${locale.map("Done!")}`),
                        backwardOperator: cancelTextButton
                        (
                            async () =>
                            {
                                Storage.CountdownTimer.Alerms.add(item);
                                updateWindow("operate");
                                await toast.hide();
                                onCanceled?.();
                            }
                        ),
                    });
                };
                export const removeAlarm = async (item: AlermEntry, onCanceled?: () => unknown) =>
                {
                    Storage.CountdownTimer.Alerms.remove(item);
                    updateWindow("operate");
                    const toast = makePrimaryToast
                    ({
                        content: $span("")(`${locale.map("Removed.")}`),
                        backwardOperator: cancelTextButton
                        (
                            async () =>
                            {
                                Storage.CountdownTimer.Alerms.add(item);
                                updateWindow("operate");
                                await toast.hide();
                                onCanceled?.();
                            }
                        ),
                    });
                };
            }
        }
        export const cancelTextButton = (onCanceled: () => unknown) =>
        ({
            tag: "button",
            className: "text-button",
            children: label("roll-back"),
            onclick: async () =>
            {
                onCanceled();
                makeToast
                ({
                    content: $span("")(label("roll-backed")),
                    wait: 3000,
                });
            },
        });
        export interface PageParams
        {
            application?: ApplicationType;
        }
        export const internalLink = (data: { className?: string, href: PageParams, children: minamo.dom.Source}) =>
        ({
            tag: "a",
            className: data.className,
            href: makeUrl(data.href),
            children: data.children,
            onclick: (_event: MouseEvent) =>
            {
                // event.stopPropagation();
                showUrl(data.href);
                return false;
            }
        });
        export const externalLink = (data: { className?: string, href: string, children: minamo.dom.Source}) =>
        ({
            tag: "a",
            className: data.className,
            href: data.href,
            children: data.children,
        });
        export const $make = minamo.dom.make;
        export const $tag = (tag: string) => (className: string | minamo.dom.AlphaObjectSource) => (children: minamo.dom.Source) =>
            "string" === typeof className ?
            {
                tag,
                children,
                className,
            }:
            Object.assign
            (
                {
                    tag,
                    children,
                },
                className,
            );
        export const $div = $tag("div");
        export const $span = $tag("span");
        export const labelSpan = $span("label");
        export const label = (label: locale.LocaleKeyType) => labelSpan
        ([
            $span("locale-parallel")(locale.parallel(label)),
            $span("locale-map")(locale.map(label)),
        ]);
        export const dateTimePrompt = async (message: string, _default: number): Promise<string | null> =>
        {
            const inputDate = $make(HTMLInputElement)
            ({
                tag: "input",
                type: "date",
                value: Domain.dateCoreStringFromTick(_default),
                required: "",
            });
            const inputTime = $make(HTMLInputElement)
            ({
                tag: "input",
                type: "time",
                value: Domain.timeFullCoreStringFromTick(Domain.getTime(_default)),
                required: "",
            });
            return await new Promise
            (
                resolve =>
                {
                    let result: string | null = null;
                    const ui = popup
                    ({
                        children:
                        [
                            $tag("h2")("")(message),
                            inputDate,
                            inputTime,
                            $div("popup-operator")
                            ([
                                {
                                    tag: "button",
                                    className: "cancel-button",
                                    children: locale.map("Cancel"),
                                    onclick: () =>
                                    {
                                        result = null;
                                        ui.close();
                                    },
                                },
                                {
                                    tag: "button",
                                    className: "default-button",
                                    children: locale.map("OK"),
                                    onclick: () =>
                                    {
                                        result = `${inputDate.value}T${inputTime.value}`;
                                        ui.close();
                                    },
                                },
                            ])
                        ],
                        onClose: async () => resolve(result),
                    });
                }
            );
        };
        export const themeSettingsPopup = async (settings: Settings = Storage.Settings.get()): Promise<boolean> =>
        {
            const init = settings.theme ?? "auto";
            return await new Promise
            (
                async resolve =>
                {
                    let result = false;
                    const checkButtonList = $make(HTMLDivElement)({ className: "check-button-list" });
                    const checkButtonListUpdate = async () => minamo.dom.replaceChildren
                    (
                        checkButtonList,
                        [
                            await Promise.all
                            (
                                ThemeList.map
                                (
                                    async (key: ThemeType) =>
                                    ({
                                        tag: "button",
                                        className: `check-button ${key === (settings.theme ?? "auto") ? "checked": ""}`,
                                        children:
                                        [
                                            await Resource.loadSvgOrCache("check-icon"),
                                            $span("")(label(`theme.${key}` as locale.LocaleKeyType)),
                                        ],
                                        onclick: async () =>
                                        {
                                            if (key !== (settings.theme ?? "auto"))
                                            {
                                                settings.theme = key;
                                                Storage.Settings.set(settings);
                                                await checkButtonListUpdate();
                                                result = init !== key;
                                            }
                                        }
                                    })
                                )
                            )
                        ]
                    );
                    await checkButtonListUpdate();
                    const ui = popup
                    ({
                        // className: "add-remove-tags-popup",
                        children:
                        [
                            $tag("h2")("")(label("Theme setting")),
                            checkButtonList,
                            $div("popup-operator")
                            ([{
                                tag: "button",
                                className: "default-button",
                                children: label("Close"),
                                onclick: () =>
                                {
                                    ui.close();
                                },
                            }])
                        ],
                        onClose: async () => resolve(result),
                    });
                }
            );
        };
        export const progressBarStyleSettingsPopup = async (settings: Settings = Storage.Settings.get()): Promise<boolean> =>
        {
            const init = settings.progressBarStyle ?? "auto";
            let selected = init;
            return await new Promise
            (
                async resolve =>
                {
                    const checkButtonList = $make(HTMLDivElement)({ className: "check-button-list" });
                    const checkButtonListUpdate = async () => minamo.dom.replaceChildren
                    (
                        checkButtonList,
                        [
                            await Promise.all
                            (
                                ProgressBarStyleList.map
                                (
                                    async (key: ProgressBarStyleType) =>
                                    ({
                                        tag: "button",
                                        className: `check-button ${key === selected ? "checked": ""}`,
                                        children:
                                        [
                                            await Resource.loadSvgOrCache("check-icon"),
                                            $span("")(label(`progressBarStyle.${key}` as locale.LocaleKeyType)),
                                        ],
                                        onclick: async () =>
                                        {
                                            if (key !== selected)
                                            {
                                                selected = key;
                                                await checkButtonListUpdate();
                                            }
                                        }
                                    })
                                )
                            )
                        ]
                    );
                    await checkButtonListUpdate();
                    const ui = popup
                    ({
                        // className: "add-remove-tags-popup",
                        children:
                        [
                            $tag("h2")("")(label("Progress Bar Style setting")),
                            checkButtonList,
                            $div("popup-operator")
                            ([{
                                tag: "button",
                                className: "default-button",
                                children: label("Close"),
                                onclick: () =>
                                {
                                    ui.close();
                                },
                            }])
                        ],
                        onClose: async () =>
                        {
                            settings.progressBarStyle = selected;
                            Storage.Settings.set(settings);
                            resolve(init !== selected);
                        },
                    });
                }
            );
        };
        export const localeSettingsPopup = async (settings: Settings = Storage.Settings.get()): Promise<boolean> =>
        {
            return await new Promise
            (
                async resolve =>
                {
                    let result = false;
                    const checkButtonList = $make(HTMLDivElement)({ className: "check-button-list" });
                    const checkButtonListUpdate = async () => minamo.dom.replaceChildren
                    (
                        checkButtonList,
                        [
                            {
                                tag: "button",
                                className: `check-button ${"@auto" === (settings.locale ?? "@auto") ? "checked": ""}`,
                                children:
                                [
                                    await Resource.loadSvgOrCache("check-icon"),
                                    $span("")(label("language.auto")),
                                ],
                                onclick: async () =>
                                {
                                    if (null !== (settings.locale ?? null))
                                    {
                                        settings.locale = null;
                                        Storage.Settings.set(settings);
                                        result = true;
                                        await checkButtonListUpdate();
                                    }
                                }
                            },
                            await Promise.all
                            (
                                locale.locales.map
                                (
                                    async key =>
                                    ({
                                        tag: "button",
                                        className: `check-button ${key === (settings.locale ?? "@auto") ? "checked": ""}`,
                                        children:
                                        [
                                            await Resource.loadSvgOrCache("check-icon"),
                                            $span("")(labelSpan(locale.getLocaleName(key))),
                                        ],
                                        onclick: async () =>
                                        {
                                            if (key !== settings.locale ?? null)
                                            {
                                                settings.locale = key;
                                                Storage.Settings.set(settings);
                                                result = true;
                                                await checkButtonListUpdate();
                                            }
                                        }
                                    })
                                )
                            )
                        ]
                    );
                    await checkButtonListUpdate();
                    const ui = popup
                    ({
                        // className: "add-remove-tags-popup",
                        children:
                        [
                            $tag("h2")("")(label("Language setting")),
                            checkButtonList,
                            $div("popup-operator")
                            ([{
                                tag: "button",
                                className: "default-button",
                                children: label("Close"),
                                onclick: () =>
                                {
                                    ui.close();
                                },
                            }])
                        ],
                        onClose: async () => resolve(result),
                    });
                }
            );
        };
        export const colorSettingsPopup = async (settings = Storage.RainbowClock.colorPattern.get()): Promise<boolean> =>
        {
            return await new Promise
            (
                async resolve =>
                {
                    let result = false;
                    const checkButtonList = $make(HTMLDivElement)({ className: "check-button-list" });
                    const checkButtonListUpdate = async () => minamo.dom.replaceChildren
                    (
                        checkButtonList,
                        [
                            await Promise.all
                            (
                                Object.keys(rainbowClockColorPatternMap).map
                                (
                                    async (key: rainbowClockColorPatternType) =>
                                    ({
                                        tag: "button",
                                        className: `check-button ${key === settings ? "checked": ""}`,
                                        children:
                                        [
                                            await Resource.loadSvgOrCache("check-icon"),
                                            $span("")(label(key)),
                                        ],
                                        onclick: async () =>
                                        {
                                            if (key !== settings ?? null)
                                            {
                                                settings = key;
                                                Storage.RainbowClock.colorPattern.set(settings);
                                                result = true;
                                                await checkButtonListUpdate();
                                            }
                                        }
                                    })
                                )
                            )
                        ]
                    );
                    await checkButtonListUpdate();
                    const ui = popup
                    ({
                        // className: "add-remove-tags-popup",
                        children:
                        [
                            $tag("h2")("")(label("Color setting")),
                            checkButtonList,
                            $div("popup-operator")
                            ([{
                                tag: "button",
                                className: "default-button",
                                children: label("Close"),
                                onclick: () =>
                                {
                                    ui.close();
                                },
                            }])
                        ],
                        onClose: async () => resolve(result),
                    });
                }
            );
        };
        export const newTimerPopup = async (): Promise<boolean> =>
        {
            return await new Promise
            (
                async resolve =>
                {
                    let result = false;
                    const checkButtonList = $make(HTMLDivElement)({ className: "check-button-list" });
                    const checkButtonListUpdate = async () => minamo.dom.replaceChildren
                    (
                        checkButtonList,
                        [
                            await Promise.all
                            (
                                config.timerPreset.map
                                (
                                    async (i: number) =>
                                    ({
                                        tag: "button",
                                        className: `check-button`,
                                        children:
                                        [
                                            await Resource.loadSvgOrCache("check-icon"),
                                            $span("")(labelSpan(Domain.makeTimerLabel(i))),
                                        ],
                                        onclick: async () =>
                                        {
                                            await Operate.CountdownTimer.newTimer(i);
                                            result = true;
                                            ui.close();
                                        }
                                    })
                                )
                            )
                        ]
                    );
                    await checkButtonListUpdate();
                    const ui = popup
                    ({
                        // className: "add-remove-tags-popup",
                        children:
                        [
                            $tag("h2")("")(label("New Timer")),
                            checkButtonList,
                            $div("popup-operator")
                            ([{
                                tag: "button",
                                className: "default-button",
                                children: label("Close"),
                                onclick: () =>
                                {
                                    ui.close();
                                },
                            }])
                        ],
                        onClose: async () => resolve(result),
                    });
                }
            );
        };
        export const schedulePrompt = async (message: string, title: string, tick: number): Promise<{ title: string, tick: number } | null> =>
        {
            const inputTitle = $make(HTMLInputElement)
            ({
                tag: "input",
                value: title,
                required: "",
            });
            const inputDate = $make(HTMLInputElement)
            ({
                tag: "input",
                type: "date",
                value: Domain.dateCoreStringFromTick(tick),
                required: "",
            });
            const inputTime = $make(HTMLInputElement)
            ({
                tag: "input",
                type: "time",
                value: Domain.timeShortCoreStringFromTick(Domain.getTime(tick)),
                required: "",
            });
            return await new Promise
            (
                resolve =>
                {
                    let result: { title: string, tick: number } | null = null;
                    const ui = popup
                    ({
                        children:
                        [
                            $tag("h2")("")(message),
                            inputTitle,
                            inputDate,
                            inputTime,
                            $div("popup-operator")
                            ([
                                {
                                    tag: "button",
                                    className: "cancel-button",
                                    children: locale.map("Cancel"),
                                    onclick: () =>
                                    {
                                        result = null;
                                        ui.close();
                                    },
                                },
                                {
                                    tag: "button",
                                    className: "default-button",
                                    children: locale.map("OK"),
                                    onclick: () =>
                                    {
                                        result =
                                        {
                                            title: inputTitle.value,
                                            tick: Domain.parseDate(`${inputDate.value}T${inputTime.value}`)?.getTime() ?? tick,
                                        };
                                        ui.close();
                                    },
                                },
                            ])
                        ],
                        onClose: async () => resolve(result),
                    });
                }
            );
        };
        export const screenCover = (data: { children?: minamo.dom.Source, onclick: () => unknown, }) =>
        {
            const dom = $make(HTMLDivElement)
            ({
                tag: "div",
                className: "screen-cover fade-in",
                children: data.children,
                onclick: async () =>
                {
                    console.log("screen-cover.click!");
                    dom.onclick = undefined;
                    data.onclick();
                    close();
                }
            });
            const close = async () =>
            {
                dom.classList.remove("fade-in");
                dom.classList.add("fade-out");
                await minamo.core.timeout(500);
                minamo.dom.remove(dom);
            };
            minamo.dom.appendChildren(document.getElementById("screen"), dom);
            const result =
            {
                dom,
                close,
            };
            return result;
        };
        export const getScreenCoverList = () => Array.from(document.getElementsByClassName("screen-cover")) as HTMLDivElement[];
        export const getScreenCover = () => getScreenCoverList().filter((_i, ix, list) => (ix +1) === list.length)[0];
        export const hasScreenCover = () => 0 < getScreenCoverList().length;
        export const popup =
        (
            data:
            {
                className?: string,
                children: minamo.dom.Source,
                onClose?: () => Promise<unknown>
            }
        ) =>
        {
            const dom = $make(HTMLDivElement)
            ({
                tag: "div",
                className: `popup locale-parallel-off ${data.className ?? ""}`,
                children: data.children,
                onclick: async (event: MouseEvent) =>
                {
                    console.log("popup.click!");
                    event.stopPropagation();
                    //(Array.from(document.getElementsByClassName("screen-cover")) as HTMLDivElement[]).forEach(i => i.click());
                },
            });
            const close = async () =>
            {
                await data?.onClose();
                cover.close();
            };
            // minamo.dom.appendChildren(document.body, dom);
            const cover = screenCover
            ({
                children:
                [
                    dom,
                    { tag: "div", }, // レイアウト調整用のダミー要素 ( この調整がないとポップアップが小さく且つ入力要素がある場合に iPad でキーボードの下に dom が隠れてしまう。 )
                ],
                onclick: async () =>
                {
                    await data?.onClose();
                    //minamo.dom.remove(dom);
                },
            });
            const result =
            {
                dom,
                close,
            };
            return result;
        };
        export const menuButton = async (menu: minamo.dom.Source | (() => Promise<minamo.dom.Source>)) =>
        {
            let cover: { dom: HTMLDivElement, close: () => Promise<unknown> };
            const close = () =>
            {
                popup.classList.remove("show");
                cover = null;
            };
            const popup = $make(HTMLDivElement)
            ({
                tag: "div",
                className: "menu-popup",
                children: "function" !== typeof menu ? menu: [ ],
                onclick: async (event: MouseEvent) =>
                {
                    event.stopPropagation();
                    console.log("menu-popup.click!");
                    cover?.close();
                    close();
                },
            });
            const button = $make(HTMLButtonElement)
            ({
                tag: "button",
                className: "menu-button",
                children:
                [
                    await Resource.loadSvgOrCache("ellipsis-icon"),
                ],
                onclick: async (event: MouseEvent) =>
                {
                    event.stopPropagation();
                    console.log("menu-button.click!");
                    if ("function" === typeof menu)
                    {
                        minamo.dom.replaceChildren(popup, await menu());
                    }
                    popup.classList.add("show");
                    cover = screenCover
                    ({
                        onclick: close,
                    });
                },
            });
            return [ button, popup, ];
        };
        export const menuItem = (children: minamo.dom.Source, onclick?: (event: MouseEvent | TouchEvent) => unknown, className?: string) =>
        ({
            tag: "button",
            className,
            children,
            onclick,
        });
        export const menuLinkItem = (children: minamo.dom.Source, href: PageParams, className?: string) => menuItem
        (
            children,
            () => showUrl(href),
            className,
        );
        export const tickItem = async (tick: number, interval: number | null) => $div("tick-item flex-item")
        ([
            $div("item-header")
            ([
                $div("item-title")
                ([
                    await Resource.loadSvgOrCache("tick-icon"),
                    $div("tick-elapsed-time")
                    ([
                        $span("value monospace")(label("elapsed time")),
                    ]),
                ]),
                $div("item-operator")
                ([
                    await menuButton
                    ([
                        menuItem
                        (
                            label("Edit"),
                            async () =>
                            {
                                const result = Domain.parseDate(await dateTimePrompt(locale.map("Edit"), tick));
                                if (null !== result)
                                {
                                    const newTick = Domain.getTicks(result);
                                    if (tick !== Domain.getTicks(result))
                                    {
                                        if (0 <= newTick && newTick <= Domain.getTicks())
                                        {
                                            await Operate.NeverStopwatch.edit(tick, newTick);
                                        }
                                        else
                                        {
                                            makeToast
                                            ({
                                                content: label("A date and time outside the valid range was specified."),
                                                isWideContent: true,
                                            });
                                        }
                                    }
                                }
                            }
                        ),
                        menuItem
                        (
                            label("Remove"),
                            async () => await Operate.NeverStopwatch.removeStamp(tick),
                            "delete-button"
                        )
                    ]),
                ]),
            ]),
            $div("item-information")
            ([
                $div("tick-timestamp")
                ([
                    label("Timestamp"),
                    $span("value monospace")(Domain.dateFullStringFromTick(tick)),
                ]),
                $div("tick-interval")
                ([
                    label("Interval"),
                    $span("value monospace")(Domain.timeLongStringFromTick(interval)),
                ]),
            ]),
        ]);
        export const alermTitle = (item: AlermEntry) => "timer" === item.type ?
            `${Domain.makeTimerLabel((item.end -item.start) /(60 *1000))} ${locale.map("Timer")}`:
            item.title;
        export const alermItem = async (item: AlermEntry) => $div("alerm-item flex-item")
        ([
            $div("item-header")
            ([
                $div("item-title")
                ([
                    await Resource.loadSvgOrCache("tick-icon"),
                    $div("tick-elapsed-time")([$span("value monospace")(alermTitle(item)),]),
                ]),
                $div("item-operator")
                ([
                    await menuButton
                    ([
                        "schedule" === item.type ?
                            menuItem
                            (
                                label("Edit"),
                                async () =>
                                {
                                    const result = await schedulePrompt(locale.map("Edit"), item.title, item.end);
                                    if (null !== result)
                                    {
                                        if (item.title !== result.title || item.end !== result.tick)
                                        {
                                            if (Domain.getTicks() < result.tick)
                                            {
                                                await Operate.CountdownTimer.edit(item, result.title, result.tick);
                                            }
                                            else
                                            {
                                                makeToast
                                                ({
                                                    content: label("A date and time outside the valid range was specified."),
                                                    isWideContent: true,
                                                });
                                            }
                                        }
                                    }
                                }
                            ):
                            [],
                        menuItem
                        (
                            label("Remove"),
                            async () => await Operate.CountdownTimer.removeAlarm(item),
                            "delete-button"
                        )
                    ]),
                ]),
            ]),
            $div("item-information")
            ([
                $div("alarm-due-timestamp")
                ([
                    label("Due timestamp"),
                    $span("value monospace")(Domain.dateFullStringFromTick(item.end)),
                ]),
                $div("alarm-due-rest")
                ([
                    label("Rest"),
                    $span("value monospace")(Domain.timeLongStringFromTick(item.end -Domain.getTicks())),
                ]),
            ]),
        ]);
        export interface HeaderSegmentSource
        {
            icon: Resource.KeyType;
            title: string;
            href?: PageParams;
            menu?: minamo.dom.Source | (() => Promise<minamo.dom.Source>);
        }
        export interface HeaderSource
        {
            items: HeaderSegmentSource[];
            menu?: minamo.dom.Source | (() => Promise<minamo.dom.Source>);
            operator?: minamo.dom.Source;
        }
        export interface ScreenSource
        {
            className: string;
            header: HeaderSource;
            body: minamo.dom.Source;
        }
        const getLastSegmentClass = (data:HeaderSource, ix: number) =>
            [
                ix === 0 ? "first-segment": undefined,
                ix === data.items.length -1 ? "last-segment": undefined,
            ]
            .filter(i => undefined !== i)
            .join(" ");
        export const screenSegmentedHeader = async (data:HeaderSource) =>
        [
            $div("progress-bar")([]),
            (
                await Promise.all
                (
                    data.items
                    .map
                    (
                        async (item, ix) =>
                            (item.href && screenHeaderLinkSegment(item, getLastSegmentClass(data,ix))) ||
                            (item.menu && screenHeaderPopupSegment(item, getLastSegmentClass(data,ix))) ||
                            (true && screenHeaderLabelSegment(item, getLastSegmentClass(data,ix)))
                    )
                )
            ).reduce((a, b) => (a as any[]).concat(b), []),
            data.menu ? await menuButton(data.menu): [],
            data.operator ? $div("header-operator")(data.operator): [],
        ];
        export const getCloseButton = () => getHeaderElement().getElementsByClassName("close-button")[0] as HTMLButtonElement;
        export const screenHeaderSegmentCore = async (item: HeaderSegmentSource) =>
        [
            $div("icon")(await Resource.loadSvgOrCache(item.icon)),
            $div("segment-title")(item.title),
        ];
        export const screenHeaderLabelSegment = async (item: HeaderSegmentSource, className: string = "") =>
            $div(`segment label-segment ${className}`)(await screenHeaderSegmentCore(item));
        export const screenHeaderLinkSegment = async (item: HeaderSegmentSource, className: string = "") => internalLink
        ({
            className: `segment ${className}`,
            href: item.href,
            children: await screenHeaderSegmentCore(item),
        });
        export const screenHeaderPopupSegment = async (item: HeaderSegmentSource, className: string = "") =>
        {
            let cover: { dom: HTMLDivElement, close: () => Promise<unknown> };
            const close = () =>
            {
                popup.classList.remove("show");
                cover = null;
            };
            const popup = $make(HTMLDivElement)
            ({
                tag: "div",
                className: "menu-popup segment-popup",
                children: "function" !== typeof item.menu ? item.menu: [ ],
                onclick: async (event: MouseEvent) =>
                {
                    event.stopPropagation();
                    console.log("menu-popup.click!");
                    cover?.close();
                    close();
                },
            });
            const segment = $make(HTMLDivElement)
            ({
                tag: "div",
                className: `segment ${className}`,
                children: await screenHeaderSegmentCore(item),
                onclick: async (event: MouseEvent) =>
                {
                    event.stopPropagation();
                    console.log("menu-button.click!");
                    if ("function" === typeof item.menu)
                    {
                        minamo.dom.replaceChildren(popup, await item.menu());
                    }
                    popup.classList.add("show");
                    //popup.style.height = `${popup.offsetHeight -2}px`;
                    popup.style.width = `${popup.offsetWidth -2}px`;
                    popup.style.top = `${segment.offsetTop +segment.offsetHeight}px`;
                    popup.style.left = `${Math.max(segment.offsetLeft, 4)}px`;
                    cover = screenCover
                    ({
                        onclick: close,
                    });
                },
            });
            return [ segment, popup, ];
        };
        export const screenHeaderHomeSegment = async (): Promise<HeaderSegmentSource> =>
        ({
            icon: "application-icon",
            href: { },
            title: applicationTitle,
        });
        export const screenHeaderApplicationSegment = async (applicationType: ApplicationType): Promise<HeaderSegmentSource> =>
        ({
            icon: application[applicationType].icon,
            title: application[applicationType].title,
            menu: await Promise.all
            (
                ApplicationList.map
                (
                    async (i: ApplicationType) => menuLinkItem
                    (
                        [ await Resource.loadSvgOrCache(application[i].icon), application[i].title, ],
                        { application: i },
                        applicationType === i ? "current-item": undefined,
                    )
                )
            )
        });
        export const screenHeaderFlashSegmentMenu = async (flashInterval: number, setter: (i: number) => unknown, zeroIcon: Resource.KeyType, zeroLabel: locale.LocaleKeyType): Promise<minamo.dom.Source> => await Promise.all
        (
            config.flashIntervalPreset.map
            (
                async i =>
                menuItem
                (
                    [
                        await Resource.loadSvgOrCache(0 === i ? zeroIcon: "flash-icon"),
                        labelSpan(0 === i ? locale.map(zeroLabel): `${locale.map("Interval")}: ${Domain.makeTimerLabel(i)}`),
                    ],
                    async () =>
                    {
                        setter(i);
                        await reload();
                    },
                    flashInterval === i ? "current-item": undefined
                )
            )
        );
        export const screenHeaderFlashSegment = async (flashInterval: number, setter: (i: number) => unknown, zeroIcon: Resource.KeyType = "sleep-icon", zeroLabel: locale.LocaleKeyType = "No Flash"): Promise<HeaderSegmentSource> =>
        ({
            icon: 0 === flashInterval ? zeroIcon: "flash-icon",
            title: 0 === flashInterval ? locale.map(zeroLabel): `${locale.map("Interval")}: ${Domain.makeTimerLabel(flashInterval)}`,
            menu: await screenHeaderFlashSegmentMenu(flashInterval, setter, zeroIcon, zeroLabel),
        });
        export const replaceScreenBody = (body: minamo.dom.Source) => minamo.dom.replaceChildren
        (
            document.getElementsByClassName("screen-body")[0],
            body
        );

        export module Resource
        {
            export type KeyType = keyof typeof resource;
            export const loadSvgOrCache = async (key: KeyType): Promise<SVGElement> =>
            {
                try
                {
                    return new DOMParser().parseFromString(document.getElementById(key).innerHTML, "image/svg+xml").documentElement as any;
                }
                catch(error)
                {
                    console.log({key});
                    throw error;
                }
            };
        }
        export const screenFlash = () =>
        {
            document.body.classList.add("flash");
            setTimeout(() => document.body.classList.remove("flash"), 1500);
        };
        export const fullscreenMenuItem = async () => fullscreenEnabled() ?
            (
                null === fullscreenElement() ?
                    menuItem
                    (
                        label("Full screen"),
                        async () => await requestFullscreen()
                    ):
                    menuItem
                    (
                        label("Cancel full screen"),
                        async () => await exitFullscreen()
                    )
            ):
            [];
        export const themeMenuItem = async () =>
            menuItem
            (
                label("Theme setting"),
                async () =>
                {
                    if (await themeSettingsPopup())
                    {
                        updateStyle();
                    }
                }
            );
        export const progressBarStyleMenuItem = async () =>
            menuItem
            (
                label("Progress Bar Style setting"),
                async () =>
                {
                    if (await progressBarStyleSettingsPopup())
                    {
                        updateProgressBarStyle();
                    }
                }
            );
        export const languageMenuItem = async () =>
            menuItem
            (
                label("Language setting"),
                async () =>
                {
                    if (await localeSettingsPopup())
                    {
                        locale.setLocale(Storage.Settings.get().locale);
                        await reload();
                    }
                }
            );
        export const resetNeverStopwatchMenuItem = async () =>
            menuItem
            (
                label("Reset"),
                async () => await Operate.NeverStopwatch.reset(),
                "delete-button"
            );
        export const githubMenuItem = async () =>
            externalLink
            ({
                href: config.repositoryUrl,
                children: menuItem(labelSpan("GitHub")),
            });
        export const welcomeScreenMenu = async () =>
        [
            await fullscreenMenuItem(),
            await themeMenuItem(),
            await progressBarStyleMenuItem(),
            await languageMenuItem(),
            await githubMenuItem(),
        ];
        export const isStrictShowPrimaryPage = () =>
        {
            const body = document.getElementById("screen-body");
            const primaryPage = document.getElementsByClassName("primary-page")[0] as HTMLDivElement;
            const primaryPageOffsetTop = Math.min(primaryPage.offsetTop -body.offsetTop, body.scrollHeight -body.clientHeight);
            return primaryPageOffsetTop === body.scrollTop;
        };
        export const downPageLink = async () =>
        ({
            tag: "div",
            className: "down-page-link icon",
            children: await Resource.loadSvgOrCache("down-triangle-icon"),
            onclick: async () =>
            {
                if (isStrictShowPrimaryPage())
                {
                    await scrollToElement(document.getElementsByClassName("trail-page")[0] as HTMLDivElement);
                }
                else
                {
                    await scrollToElement(document.getElementsByClassName("primary-page")[0] as HTMLDivElement);
                }
            },
        });
        export const scrollToOffset = async (target: HTMLElement, offset: number) =>
        {
            let scrollTop = target.scrollTop;
            let diff = offset -scrollTop;
            for(let i = 0; i < 25; ++i)
            {
                diff *= 0.8;
                target.scrollTo(0, offset -diff);
                await minamo.core.timeout(10);
            }
            target.scrollTo(0, offset);
        };
        export const scrollToElement = async (target: HTMLElement) =>
        {
            const parent = target.parentElement;
            const targetOffsetTop = Math.min(target.offsetTop -parent.offsetTop, parent.scrollHeight -parent.clientHeight);
            await scrollToOffset(parent, targetOffsetTop);
        };
        export const welcomeScreen = async (): Promise<ScreenSource> =>
        ({
            className: "welcome-screen",
            header:
            {
                items:
                [
                    await screenHeaderHomeSegment(),
                ],
                menu: welcomeScreenMenu
            },
            body:
            [
                $div("primary-page")
                ([
                    $div("main-panel")
                    ([
                        $div("logo")
                        ([
                            $div("application-icon icon")(await Resource.loadSvgOrCache("application-icon")),
                            $span("logo-text")(applicationTitle)
                        ]),
                        $div("button-list")
                        (
                            ApplicationList.map
                            (
                                (i: ApplicationType) =>
                                internalLink
                                ({
                                    href: { application: i },
                                    children:
                                    {
                                        tag: "button",
                                        className: "default-button main-button long-button",
                                        children: labelSpan(application[i].title),
                                        // onclick: async () => await showNeverStopwatchScreen(),
                                    }
                                }),
                            )
                        ),
                    ]),
                    await downPageLink(),
                ]),
                $div("trail-page")
                ([
                    $div("description")
                    (
                        $tag("ul")("locale-parallel-off")
                        ([
                            $tag("li")("")(label("You can use this web app like an app by registering it on the home screen of your smartphone.")),
                        ])
                    ),
                ]),
                screenBar(),
            ]
        });
        export const showWelcomeScreen = async () =>
        {
            document.body.classList.remove("hide-scroll-bar");
            const updateWindow = async (event: UpdateWindowEventEype) =>
            {
                switch(event)
                {
                case "high-resolution-timer":
                    break;
                case "timer":
                    break;
                case "storage":
                    break;
                case "operate":
                    break;
                }
            };
            await showWindow(await welcomeScreen(), updateWindow);
            await updateWindow("timer");
        };

        export const neverStopwatchScreenMenu = async () =>
        [
            await fullscreenMenuItem(),
            await themeMenuItem(),
            await progressBarStyleMenuItem(),
            await languageMenuItem(),
            await resetNeverStopwatchMenuItem(),
            await githubMenuItem(),
        ];
        export const flashIntervalLabel = async (entry: HeaderSegmentSource) =>
        ({
            tag: "div",
            className: "flash-interval",
            children:
            [
                await Resource.loadSvgOrCache(entry.icon),
                entry.title,
            ],
            onclick: async () => popup
            ({
                className: "bare-popup",
                children: "function" === typeof entry.menu ? await entry.menu(): entry.menu,
            }),
        });
        export const screenBar = () => $div("screen-bar")($div("screen-bar-flash-layer")([]));
        export const neverStopwatchScreenBody = async (ticks: number[]) =>
        ([
            $div("primary-page")
            ([
                $div("main-panel")
                ([
                    $div("current-item")
                    ([
                        $div("previous-timestamp")
                        ([
                            $span("value monospace")
                            (
                                0 < ticks.length ?
                                    Domain.dateFullStringFromTick(ticks[0]):
                                    ""
                            ),
                        ]),
                        $div("capital-interval")
                        ([
                            $span("value monospace")(Domain.timeLongStringFromTick(0)),
                        ]),
                        $div("current-timestamp")
                        ([
                            $span("value monospace")(Domain.dateFullStringFromTick(Domain.getTicks())),
                        ]),
                    ]),
                    await flashIntervalLabel
                    (
                        await screenHeaderFlashSegment
                        (
                            Storage.NeverStopwatch.flashInterval.get(),
                            Storage.NeverStopwatch.flashInterval.set
                        )
                    ),
                    $div("button-list")
                    ({
                        tag: "button",
                        className: "default-button main-button long-button",
                        children: label("Stamp"),
                        onclick: async () => await Operate.NeverStopwatch.stamp(Domain.getTicks())
                    }),
                ]),
                await downPageLink(),
            ]),
            $div("trail-page")
            ([
                $div("row-flex-list tick-list")
                (
                    await Promise.all
                    (
                        ticks.map
                        (
                            (tick, index) => tickItem
                            (
                                tick,
                                "number" === typeof ticks[index +1] ? tick -ticks[index +1]: null
                            )
                        )
                    )
                ),
                $div("description")
                (
                    $tag("ul")("locale-parallel-off")
                    ([
                        $tag("li")("")(label("Up to 100 time stamps are retained, and if it exceeds 100, the oldest time stamps are discarded first.")),
                        $tag("li")("")(label("You can use this web app like an app by registering it on the home screen of your smartphone.")),
                    ])
                ),
            ]),
            screenBar(),
        ]);
        export const neverStopwatchScreen = async (ticks: number[]): Promise<ScreenSource> =>
        ({
            className: "never-stopwatch-screen",
            header:
            {
                items:
                [
                    await screenHeaderHomeSegment(),
                    await screenHeaderApplicationSegment("NeverStopwatch"),
                    // await screenHeaderFlashSegment(Storage.NeverStopwatch.flashInterval.get()),
                ],
                menu: neverStopwatchScreenMenu
            },
            body: await neverStopwatchScreenBody(ticks)
        });
        let previousPrimaryStep = 0;
        export const showNeverStopwatchScreen = async () =>
        {
            const applicationTitle = application["NeverStopwatch"].title;
            document.body.classList.add("hide-scroll-bar");
            let ticks = Storage.NeverStopwatch.Stamps.get();
            const updateWindow = async (event: UpdateWindowEventEype) =>
            {
                const screen = document.getElementById("screen") as HTMLDivElement;
                const now = new Date();
                const tick = Domain.getTicks(now);
                const flashInterval = Storage.NeverStopwatch.flashInterval.get();
                switch(event)
                {
                    case "high-resolution-timer":
                        (screen.getElementsByClassName("capital-interval")[0].getElementsByClassName("value")[0] as HTMLSpanElement).innerText = Domain.timeLongStringFromTick(0 < ticks.length ? tick -ticks[0]: 0);
                        const capitalTime = Domain.dateStringFromTick(tick);
                        const capitalTimeSpan = screen.getElementsByClassName("current-timestamp")[0].getElementsByClassName("value")[0] as HTMLSpanElement;
                        if(capitalTimeSpan.innerText !== capitalTime)
                        {
                            capitalTimeSpan.innerText = capitalTime;
                        }
                        if (0 < flashInterval && 0 < ticks.length)
                        {
                            const elapsed = Domain.getTicks() -ticks[0];
                            const unit = flashInterval *60 *1000;
                            const primaryStep = Math.floor(elapsed / unit);
                            if (primaryStep === previousPrimaryStep +1 && (elapsed % unit) < 5 *1000)
                            {
                                screenFlash();
                            }
                            const currentColor = getSolidRainbowColor(primaryStep);
                            setFoundationColor(currentColor);
                            previousPrimaryStep = primaryStep;
                            const rate = ((Domain.getTicks() -ticks[0]) %unit) /unit;
                            const nextColor = getSolidRainbowColor(primaryStep +1);
                            setScreenBarProgress(rate, nextColor);
                            // setBodyColor(nextColor);
                            getHeaderElement().classList.add("with-screen-prgress");
                        }
                        else
                        {
                            previousPrimaryStep = 0;
                            setScreenBarProgress(null);
                            getHeaderElement().classList.remove("with-screen-prgress");
                            const currentColor = getSolidRainbowColor(0);
                            setFoundationColor(currentColor);
                            // setBodyColor(currentColor);
                        }
                        break;
                    case "timer":
                        setTitle(0 < ticks.length ? Domain.timeShortStringFromTick(Domain.getTicks() -ticks[0]) +" - " +applicationTitle: applicationTitle);
                        (
                            Array.from
                            (
                                (screen.getElementsByClassName("tick-list")[0] as HTMLDivElement).childNodes
                            ) as HTMLDivElement[]
                        ).forEach
                        (
                            (dom, index) =>
                            {
                                (dom.getElementsByClassName("tick-elapsed-time")[0].getElementsByClassName("value")[0] as HTMLSpanElement).innerText = Domain.timeShortStringFromTick(Domain.getTicks() -ticks[index]);
                            }
                        );
                        if (0 < flashInterval && 0 < ticks.length)
                        {
                            const elapsed = Domain.getTicks() -ticks[0];
                            const unit = flashInterval *60 *1000;
                            const primaryStep = Math.floor(elapsed / unit);
                            const currentColor = getSolidRainbowColor(primaryStep);
                            const nextColor = getSolidRainbowColor(primaryStep +1);
                            const rate = ((Domain.getTicks() -ticks[0]) %unit) /unit;
                            setBodyColor(mixColors(currentColor, nextColor, rate));
                        }
                        else
                        {
                            const currentColor = getSolidRainbowColor(0);
                            setBodyColor(currentColor);
                        }
                        break;
                    case "storage":
                        await reload();
                        break;
                    case "operate":
                        previousPrimaryStep = 0;
                        ticks = Storage.NeverStopwatch.Stamps.get();
                        replaceScreenBody(await neverStopwatchScreenBody(ticks));
                        resizeFlexList();
                        adjustDownPageLinkPosition();
                        await updateWindow("timer");
                        break;
                }
            };
            await showWindow(await neverStopwatchScreen(ticks), updateWindow);
            await updateWindow("timer");
        };
        export const countdownTimerScreenBody = async (alarms: AlermEntry[]) =>
        ([
            $div("primary-page")
            ([
                $div("main-panel")
                ([
                    0 < alarms.length ?
                        $div
                        (
                            "timer" === alarms[0].type ?
                                "current-item timer-item":
                                "current-item schedule-item"
                        )
                        ([
                            0 < alarms.length ?
                            [
                                $div("current-title")
                                ([
                                    $span("value monospace")(alermTitle(alarms[0])),
                                ]),
                                $div
                                (
                                    "timer" === alarms[0].type ?
                                        "current-due-timestamp":
                                        "current-due-timestamp"
                                )
                                ([
                                    $span("value monospace")
                                    (
                                        "timer" === alarms[0].type ?
                                            Domain.dateFullStringFromTick(alarms[0].end):
                                            Domain.dateStringFromTick(alarms[0].end)
                                    ),
                                ]),
                            ]: [],
                            $div("capital-interval")
                            ([
                                $span("value monospace")(Domain.timeLongStringFromTick(0)),
                            ]),
                            $div("current-timestamp")
                            ([
                                $span("value monospace")(Domain.dateStringFromTick(Domain.getTicks())),
                            ]),
                        ]):
                        $div("current-item")
                        ([
                            $div("capital-interval")
                            ([
                                $span("value monospace")(Domain.timeLongStringFromTick(0)),
                            ]),
                            $div("current-timestamp")
                            ([
                                $span("value monospace")(Domain.dateStringFromTick(Domain.getTicks())),
                            ]),
                        ]),
                    await flashIntervalLabel
                    (
                        await screenHeaderFlashSegment
                        (
                            Storage.CountdownTimer.flashInterval.get(),
                            Storage.CountdownTimer.flashInterval.set,
                            "flash-icon",
                            "00:00:00 only"
                        )
                    ),
                    $div("button-list")
                    ({
                        tag: "button",
                        id: "done-button",
                        className: "default-button main-button long-button",
                        children: label("Done"),
                        onclick: async () =>
                        {
                            if (0 < alarms.length)
                            {
                                await Operate.CountdownTimer.done(alarms[0]);
                                Storage.CountdownTimer.ColorIndex.set((Storage.CountdownTimer.ColorIndex.get() +1) % config.rainbowColorSet.length);
                            }
                        }
                    }),
                ]),
                await downPageLink(),
            ]),
            $div("trail-page")
            ([
                $div("button-list")
                ([
                    {
                        tag: "button",
                        className: "main-button long-button",
                        children: label("New Timer"),
                        onclick: async () => await newTimerPopup(),
                    },
                    {
                        tag: "button",
                        className: "main-button long-button",
                        children: label("New Schedule"),
                        onclick: async () =>
                        {
                            const result = await schedulePrompt(locale.map("New Schedule"), locale.map("New Schedule"), Domain.getAppropriateTicks());
                            if (result)
                            {
                                if (Domain.getTicks() < result.tick)
                                {
                                    await Operate.CountdownTimer.newSchedule(result.title, result.tick);
                                }
                                else
                                {
                                    makeToast
                                    ({
                                        content: label("A date and time outside the valid range was specified."),
                                        isWideContent: true,
                                    });
                                }
                            }
                        }
                    },
                ]),
                $div("row-flex-list tick-list")
                (
                    await Promise.all(alarms.map(item => alermItem(item)))
                ),
                $div("description")
                (
                    $tag("ul")("locale-parallel-off")
                    ([
                        $tag("li")("")(label("Up to 100 time stamps are retained, and if it exceeds 100, the oldest time stamps are discarded first.")),
                        $tag("li")("")(label("You can use this web app like an app by registering it on the home screen of your smartphone.")),
                    ])
                ),
            ]),
            screenBar(),
        ]);
        export const countdownTimerScreen = async (alerts: AlermEntry[]): Promise<ScreenSource> =>
        ({
            className: "countdown-timer-screen",
            header:
            {
                items:
                [
                    await screenHeaderHomeSegment(),
                    await screenHeaderApplicationSegment("CountdownTimer"),
                    // await screenHeaderFlashSegment(Storage.CountdownTimer.flashInterval.get()),
                ],
                menu: neverStopwatchScreenMenu
            },
            body: await countdownTimerScreenBody(alerts)
        });
        export const showCountdownTimerScreen = async () =>
        {
            const applicationTitle = application["CountdownTimer"].title;
            document.body.classList.add("hide-scroll-bar");
            let alerts = Storage.CountdownTimer.Alerms.get();
            let lashFlashAt = 0;
            const updateWindow = async (event: UpdateWindowEventEype) =>
            {
                const screen = document.getElementById("screen") as HTMLDivElement;
                const now = new Date();
                const tick = Domain.getTicks(now);
                switch(event)
                {
                    case "high-resolution-timer":
                        (screen.getElementsByClassName("capital-interval")[0].getElementsByClassName("value")[0] as HTMLSpanElement).innerText = Domain.timeLongStringFromTick(0 < alerts.length ? Math.max(alerts[0].end -tick, 0): 0);
                        const capitalTime = Domain.dateStringFromTick(tick);
                        const capitalTimeSpan = screen.getElementsByClassName("current-timestamp")[0].getElementsByClassName("value")[0] as HTMLSpanElement;
                        if(capitalTimeSpan.innerText !== capitalTime)
                        {
                            capitalTimeSpan.innerText = capitalTime;
                        }
                        const flashInterval = Storage.CountdownTimer.flashInterval.get();
                        if (0 < alerts.length)
                        {
                            const rest = alerts[0].end - tick;
                            if (0 < flashInterval)
                            {
                                const unit = flashInterval *60 *1000;
                                const primaryStep = 0 < unit ? Math.floor(rest / unit): 0;
                                if ((primaryStep +1 === previousPrimaryStep && -5 *1000 < (rest % unit) && 500 < tick -alerts[0].start))
                                {
                                    screenFlash();
                                    lashFlashAt = tick;
                                }
                                previousPrimaryStep = primaryStep;
                            }
                            const cycle = "timer" === alerts[0].type ? 3000: 10000;
                            if (rest <= 0 && lashFlashAt +cycle <= tick)
                            {
                                screenFlash();
                                lashFlashAt = tick;
                            }
                            const currentColor = getSolidRainbowColor(Storage.CountdownTimer.ColorIndex.get());
                            setFoundationColor(currentColor);
                            const span = alerts[0].end - alerts[0].start;
                            const rate = Math.min(tick - alerts[0].start, span) /span;
                            const nextColor = getSolidRainbowColor(Storage.CountdownTimer.ColorIndex.get() +1);
                            setScreenBarProgress(rate, nextColor);
                            // setBodyColor(nextColor);
                            getHeaderElement().classList.add("with-screen-prgress");
                        }
                        else
                        {
                            previousPrimaryStep = 0;
                            setScreenBarProgress(null);
                            getHeaderElement().classList.remove("with-screen-prgress");
                            const currentColor = getSolidRainbowColor(Storage.CountdownTimer.ColorIndex.get());
                            setFoundationColor(currentColor);
                            // setBodyColor(currentColor);
                        }
                        break;
                    case "timer":
                        setTitle(0 < alerts.length ? Domain.timeShortStringFromTick(Math.max(alerts[0].end -tick, 0)) +" - " +applicationTitle: applicationTitle);
                        (
                            Array.from
                            (
                                (screen.getElementsByClassName("tick-list")[0] as HTMLDivElement).childNodes
                            ) as HTMLDivElement[]
                        ).forEach
                        (
                            (dom, index) =>
                            {
                                (dom.getElementsByClassName("alarm-due-rest")[0].getElementsByClassName("value")[0] as HTMLSpanElement).innerText = Domain.timeShortStringFromTick(Math.max(alerts[index].end -tick, 0));
                            }
                        );
                        if (0 < flashInterval && 0 < alerts.length)
                        {
                            const rest = alerts[0].end - tick;
                            const unit = flashInterval *60 *1000;
                            const primaryStep = Math.floor(rest / unit);
                            const currentColor = getSolidRainbowColor(primaryStep);
                            const nextColor = getSolidRainbowColor(primaryStep +1);
                            const rate = (Math.min(tick - alerts[0].start), unit) /unit;
                            setBodyColor(mixColors(currentColor, nextColor, rate));
                        }
                        else
                        {
                            const currentColor = getSolidRainbowColor(0);
                            setBodyColor(currentColor);
                        }
                        break;
                    case "storage":
                        await reload();
                        break;
                    case "operate":
                        previousPrimaryStep = 0;
                        alerts = Storage.CountdownTimer.Alerms.get();
                        replaceScreenBody(await countdownTimerScreenBody(alerts));
                        resizeFlexList();
                        await updateWindow("timer");
                        await Render.scrollToOffset(document.getElementById("screen-body"), 0);
                        adjustDownPageLinkPosition();
                        break;
                }
            };
            await showWindow(await countdownTimerScreen(alerts), updateWindow);
            await updateWindow("timer");
        };
        export const colorMenuItem = async () =>
            menuItem
            (
                label("Color setting"),
                async () => await colorSettingsPopup(),
            );
        export const rainbowClockScreenMenu = async () =>
        [
            await fullscreenMenuItem(),
            await themeMenuItem(),
            await progressBarStyleMenuItem(),
            await colorMenuItem(),
            await languageMenuItem(),
            await githubMenuItem(),
        ];
        export const rainbowClockScreenBody = async () =>
        ([
            $div("primary-page")
            ([
                $div("main-panel")
                ([
                    $div("current-date")
                    ([
                        $span("value monospace")(Domain.dateCoreStringFromTick(Domain.getTicks())),
                    ]),
                    $div("capital-time")
                    ([
                        $span("value monospace")(Domain.timeFullCoreStringFromTick(Domain.getTime(Domain.getTicks()))),
                    ]),
                    await flashIntervalLabel
                    (
                        await screenHeaderFlashSegment
                        (
                            Storage.RainbowClock.flashInterval.get(),
                            Storage.RainbowClock.flashInterval.set
                        )
                    ),
                ]),
            ]),
            screenBar(),
        ]);
        export const rainbowClockScreen = async (): Promise<ScreenSource> =>
        ({
            className: "rainbow-clock-screen",
            header:
            {
                items:
                [
                    await screenHeaderHomeSegment(),
                    await screenHeaderApplicationSegment("RainbowClock"),
                ],
                menu: rainbowClockScreenMenu
            },
            body: await rainbowClockScreenBody()
        });
        export const showRainbowClockScreen = async () =>
        {
            const applicationTitle = application["RainbowClock"].title;
            document.body.classList.add("hide-scroll-bar");
            const updateWindow = async (event: UpdateWindowEventEype) =>
            {
                const screen = document.getElementById("screen") as HTMLDivElement;
                const now = new Date();
                const tick = Domain.getTicks(now);
                switch(event)
                {
                    case "high-resolution-timer":
                        const capitalTime = Domain.timeLongCoreStringFromTick(Domain.getTime(tick));
                        const capitalTimeSpan = screen.getElementsByClassName("capital-time")[0].getElementsByClassName("value")[0] as HTMLSpanElement;
                        if(capitalTimeSpan.innerText !== capitalTime)
                        {
                            capitalTimeSpan.innerText = capitalTime;
                            setTitle(capitalTime +" - " +applicationTitle);
                            if (capitalTime.endsWith(":00"))
                            {
                                const flashInterval = Storage.RainbowClock.flashInterval.get();
                                if (0 < flashInterval)
                                {
                                    if (0 === (now.getMinutes() % flashInterval))
                                    {
                                        screenFlash();
                                    }
                                }
                            }
                        }
                    break;
                    case "timer":
                        const dateString = Domain.dateCoreStringFromTick(tick) +" " +Domain.weekday(tick);
                        const currentDateSpan = screen.getElementsByClassName("current-date")[0].getElementsByClassName("value")[0] as HTMLSpanElement;
                        if(currentDateSpan.innerText !== dateString)
                        {
                            currentDateSpan.innerText = dateString;
                        }
                        const getRainbowColor = rainbowClockColorPatternMap[Storage.RainbowClock.colorPattern.get()];
                        const currentColor = getRainbowColor(now.getHours());
                        setFoundationColor(currentColor);
                        const hourUnit = 60 *60 *1000;
                        const minutes = (tick % hourUnit) / hourUnit;
                        const nextColor = getRainbowColor(now.getHours() +1);
                        setScreenBarProgress(minutes, nextColor);
                        setBodyColor(mixColors(currentColor, nextColor, minutes));
                        break;
                    case "storage":
                        await reload();
                        break;
                    case "operate":
                        await updateWindow("timer");
                        break;
                }
            };
            await showWindow(await rainbowClockScreen(), updateWindow);
            await updateWindow("timer");
        };
        export const updateTitle = () =>
        {
            document.title = Array.from(getHeaderElement().getElementsByClassName("segment-title"))
                ?.map((div: HTMLDivElement) => div.innerText)
                // ?.reverse()
                ?.join(" / ")
                ?? applicationTitle;
        };
        export type UpdateWindowEventEype = "high-resolution-timer" | "timer" | "scroll" | "storage" | "focus" | "blur" | "operate";
        export let updateWindow: (event: UpdateWindowEventEype) => unknown;
        let updateWindowTimer = undefined;
        export const getHeaderElement = () => document.getElementById("screen-header") as HTMLDivElement;
        export const showWindow = async (screen: ScreenSource, updateWindow?: (event: UpdateWindowEventEype) => unknown) =>
        {
            if (undefined !== updateWindow)
            {
                Render.updateWindow = updateWindow;
            }
            else
            {
                Render.updateWindow = async (event: UpdateWindowEventEype) =>
                {
                    if ("storage" === event || "operate" === event)
                    {
                        await reload();
                    }
                };
            }
            if (undefined === updateWindowTimer)
            {
                updateWindowTimer = setInterval
                (
                    () => Render.updateWindow?.("high-resolution-timer"),
                    36
                );
                updateWindowTimer = setInterval
                (
                    () => Render.updateWindow?.("timer"),
                    360
                );
                document.getElementById("screen-body").addEventListener
                (
                    "scroll",
                    () =>
                    {
                        adjustDownPageLinkDirection();
                        if (document.getElementById("screen-body").scrollTop <= 0)
                        {
                            Render.updateWindow?.("scroll");
                        }
                    }
                );
            }
            setFoundationColor(getSolidRainbowColor(0));
            document.body.style.removeProperty("background-color");
            document.getElementById("foundation").style.removeProperty("background-color");
            document.getElementById("screen").style.removeProperty("background-color");
            document.getElementById("screen").className = `${screen.className} screen`;
            minamo.dom.replaceChildren
            (
                getHeaderElement(),
                await screenSegmentedHeader(screen.header)
            );
            minamo.dom.replaceChildren
            (
                document.getElementById("screen-body"),
                screen.body
            );
            updateTitle();
            //minamo.core.timeout(100);
            resizeFlexList();
            adjustDownPageLinkPosition();
        };
        export interface Toast
        {
            dom: HTMLDivElement;
            timer: number | null;
            hide: ()  => Promise<unknown>;
        }
        export const makeToast =
        (
            data:
            {
                content: minamo.dom.Source,
                backwardOperator?: minamo.dom.Source,
                forwardOperator?: minamo.dom.Source,
                isWideContent?: boolean,
                wait?: number,
            }
        ): Toast =>
        {
            const dom = $make(HTMLDivElement)
            ({
                tag: "div",
                className: "item slide-up-in",
                children: data.isWideContent ?
                [
                    data.backwardOperator,
                    data.content,
                    data.forwardOperator,
                ].filter(i => undefined !== i):
                [
                    data.backwardOperator ?? $span("dummy")([]),
                    data.content,
                    data.forwardOperator ?? $span("dummy")([]),
                ],
            });
            const hideRaw = async (className: string, wait: number) =>
            {
                if (null !== result.timer)
                {
                    clearTimeout(result.timer);
                    result.timer = null;
                }
                if (dom.parentElement)
                {
                    dom.classList.remove("slide-up-in");
                    dom.classList.add(className);
                    await minamo.core.timeout(wait);
                    minamo.dom.remove(dom);
                    // 以下は Safari での CSS バグをクリアする為の細工。本質的には必要の無い呼び出し。
                    if (document.getElementById("screen-toast").getElementsByClassName("item").length <= 0)
                    {
                        await minamo.core.timeout(10);
                        updateWindow("operate");
                    }
                }
            };
            const wait = data.wait ?? 5000;
            const result =
            {
                dom,
                timer: 0 < wait ? setTimeout(() => hideRaw("slow-slide-down-out", 500), wait): null,
                hide: async () => await hideRaw("slide-down-out", 250),
            };
            document.getElementById("screen-toast").appendChild(dom);
            setTimeout(() => dom.classList.remove("slide-up-in"), 250);
            return result;
        };
        let latestPrimaryToast: Toast;
        export const makePrimaryToast =
        (
            data:
            {
                content: minamo.dom.Source,
                backwardOperator?: minamo.dom.Source,
                forwardOperator?: minamo.dom.Source,
                wait?: number,
            }
        ): Toast =>
        {
            if (latestPrimaryToast)
            {
                latestPrimaryToast.hide();
            }
            return latestPrimaryToast = makeToast(data);
        };
        export const getProgressElement = () => document.getElementById("screen-header").getElementsByClassName("progress-bar")[0] as HTMLDivElement;
        export const setScreenBarProgress = (percent: null | number, color?: string) =>
        {
            const setting = Storage.Settings.get().progressBarStyle ?? "auto";
            const screenBar = document.getElementsByClassName("screen-bar")[0] as HTMLDivElement;
            if (null !== percent && "header" !== setting)
            {
                if (color)
                {
                    if (screenBar.style.backgroundColor !== color)
                    {
                        screenBar.style.backgroundColor = color;
                    }
                }
                const percentString = percent.toLocaleString("en", { style: "percent", minimumFractionDigits: 2, maximumFractionDigits: 2, });
                if ((window.innerHeight < window.innerWidth && "vertical" !== setting) || "horizontal" === setting)
                {
                    if ( ! screenBar.classList.contains("horizontal"))
                    {
                        screenBar.classList.add("horizontal");
                    }
                    if (screenBar.classList.contains("vertical"))
                    {
                        screenBar.classList.remove("vertical");
                    }
                    if (screenBar.style.height !== "initial")
                    {
                        screenBar.style.height = "initial";
                    }
                    if (screenBar.style.maxHeight !== "initial")
                    {
                        screenBar.style.maxHeight = "initial";
                    }
                    if (screenBar.style.width !== percentString)
                    {
                        screenBar.style.width = percentString;
                    }
                    if (screenBar.style.maxWidth !== percentString)
                    {
                        screenBar.style.maxWidth = percentString;
                    }
                }
                else
                {
                    if ( ! screenBar.classList.contains("vertical"))
                    {
                        screenBar.classList.add("vertical");
                    }
                    if (screenBar.classList.contains("horizontal"))
                    {
                        screenBar.classList.remove("horizontal");
                    }
                    if (screenBar.style.width !== "initial")
                    {
                        screenBar.style.width = "initial";
                    }
                    if (screenBar.style.maxWidth !== "initial")
                    {
                        screenBar.style.maxWidth = "initial";
                    }
                    if (screenBar.style.height !== percentString)
                    {
                        screenBar.style.height = percentString;
                    }
                    if (screenBar.style.maxHeight !== percentString)
                    {
                        screenBar.style.maxHeight = percentString;
                    }
                }
                if (screenBar.style.display !== "block")
                {
                    screenBar.style.display = "block";
                }
            }
            else
            {
                if (screenBar.style.display !== "none")
                {
                    screenBar.style.display = "none";
                }
            }
            const progressBar = getProgressElement();
            if (null !== percent && "header" === setting)
            {
                if (color)
                {
                    if (progressBar.style.backgroundColor !== color)
                    {
                        progressBar.style.backgroundColor = color;
                    }
                }
                const percentString = percent.toLocaleString("en", { style: "percent", minimumFractionDigits: 2, maximumFractionDigits: 2, });
                if (progressBar.style.width !== percentString)
                {
                    progressBar.style.width = percentString;
                }
                if (progressBar.style.borderRightWidth !== "1px")
                {
                    progressBar.style.borderRightWidth = "1px";
                }
            }
            else
            {
                if (progressBar.style.width !== "0%")
                {
                    progressBar.style.width = "0%";
                }
                if (progressBar.style.borderRightWidth !== "0px")
                {
                    progressBar.style.borderRightWidth = "0px";
                }
            }
        };
        export const resizeFlexList = () =>
        {
            const minColumns = 1 +Math.floor(window.innerWidth / 780);
            const maxColumns = Math.min(12, Math.max(minColumns, Math.floor(window.innerWidth / 450)));
            const FontRemUnit = parseFloat(getComputedStyle(document.documentElement).fontSize);
            const border = FontRemUnit *26 +10;
            (Array.from(document.getElementsByClassName("menu-popup")) as HTMLDivElement[]).forEach
            (
                header =>
                {
                    header.classList.toggle("locale-parallel-on", 2 <= minColumns);
                    header.classList.toggle("locale-parallel-off", minColumns < 2);
                }
            );
            [document.getElementById("screen-toast") as HTMLDivElement].forEach
            (
                header =>
                {
                    header.classList.toggle("locale-parallel-on", 2 <= minColumns);
                    header.classList.toggle("locale-parallel-off", minColumns < 2);
                }
            );
            (Array.from(document.getElementsByClassName("button-list")) as HTMLDivElement[]).forEach
            (
                header =>
                {
                    header.classList.toggle("locale-parallel-on", true);
                    header.classList.toggle("locale-parallel-off", false);
                }
            );
            (Array.from(document.getElementsByClassName("column-flex-list")) as HTMLDivElement[]).forEach
            (
                list =>
                {
                    const length = list.childNodes.length;
                    list.classList.forEach
                    (
                        i =>
                        {
                            if (/^max-column-\d+$/.test(i))
                            {
                                list.classList.remove(i);
                            }
                        }
                    );
                    if (length <= 1 || maxColumns <= 1)
                    {
                        list.style.height = undefined;
                    }
                    else
                    {
                        const height = window.innerHeight -list.offsetTop;
                        const itemHeight = (list.childNodes[0] as HTMLElement).offsetHeight +1;
                        const columns = Math.min(maxColumns, Math.ceil(length / Math.max(1.0, Math.floor(height / itemHeight))));
                        const row = Math.max(Math.ceil(length /columns), Math.min(length, Math.floor(height / itemHeight)));
                        list.style.height = `${row *itemHeight}px`;
                        list.classList.add(`max-column-${columns}`);
                    }
                    if (0 < length)
                    {
                        const itemWidth = Math.min(window.innerWidth, (list.childNodes[0] as HTMLElement).offsetWidth);
                        list.classList.toggle("locale-parallel-on", border < itemWidth);
                        list.classList.toggle("locale-parallel-off", itemWidth <= border);
                    }
                    list.classList.toggle("empty-list", length <= 0);
                }
            );
            (Array.from(document.getElementsByClassName("row-flex-list")) as HTMLDivElement[]).forEach
            (
                list =>
                {
                    const length = list.childNodes.length;
                    list.classList.forEach
                    (
                        i =>
                        {
                            if (/^max-column-\d+$/.test(i))
                            {
                                list.classList.remove(i);
                            }
                        }
                    );
                    if (0 < length)
                    {
                        // const columns = Math.min(maxColumns, Math.max(1, length));
                        // list.classList.add(`max-column-${columns}`);
                        const height = window.innerHeight -list.offsetTop;
                        const itemHeight = (list.childNodes[0] as HTMLElement).offsetHeight;
                        const columns = list.classList.contains("compact-flex-list") ?
                            Math.min(maxColumns, length):
                            Math.min(maxColumns, Math.ceil(length / Math.max(1.0, Math.floor(height / itemHeight))));
                        list.classList.add(`max-column-${columns}`);
                        const itemWidth = Math.min(window.innerWidth, (list.childNodes[0] as HTMLElement).offsetWidth);
                        list.classList.toggle("locale-parallel-on", border < itemWidth);
                        list.classList.toggle("locale-parallel-off", itemWidth <= border);
                    }
                    list.classList.toggle("empty-list", length <= 0);
                }
            );
        };
        export const adjustDownPageLinkPosition = () =>
        {
            const primaryPage = document.getElementsByClassName("primary-page")[0];
            if (primaryPage)
            {
                const delta = primaryPage.clientHeight - document.getElementById("screen-body").clientHeight;
                Array.from(document.getElementsByClassName("down-page-link")).forEach(i => (i as HTMLElement).style.bottom = `calc(1rem + ${delta}px)`);
            }
        };
        export const adjustDownPageLinkDirection = () =>
            Array.from(document.getElementsByClassName("down-page-link"))
                .forEach
                (
                    i =>
                    {
                        if (isStrictShowPrimaryPage())
                        {
                            if (i.classList.contains("reverse-down-page-link"))
                            {
                                i.classList.remove("reverse-down-page-link");
                            }
                        }
                        else
                        {
                            if ( ! i.classList.contains("reverse-down-page-link"))
                            {
                                i.classList.add("reverse-down-page-link");
                            }
                        }
                    }
                );
        let onWindowResizeTimestamp = 0;
        export const onWindowResize = () =>
        {
            const timestamp = onWindowResizeTimestamp = new Date().getTime();
            setTimeout
            (
                () =>
                {
                    if (timestamp === onWindowResizeTimestamp)
                    {
                        resizeFlexList();
                        adjustDownPageLinkPosition();
                    }
                },
                100,
            );
        };
        export const onWindowFocus = () =>
        {
            updateWindow?.("focus");
        };
        export const onWindowBlur = () =>
        {
            updateWindow?.("blur");
        };
        let onUpdateStorageCount = 0;
        export const onUpdateStorage = () =>
        {
            const lastUpdate = Storage.lastUpdate = new Date().getTime();
            const onUpdateStorageCountCopy = onUpdateStorageCount = onUpdateStorageCount +1;
            setTimeout
            (
                () =>
                {
                    if (lastUpdate === Storage.lastUpdate && onUpdateStorageCountCopy === onUpdateStorageCount)
                    {
                        updateWindow?.("storage");
                    }
                },
                50,
            );
        };
        let isInComposeSession: boolean = false;
        let lastestCompositionEndAt = 0;
        export const onCompositionStart = (_event: CompositionEvent) =>
        {
            isInComposeSession = true;
        };
        export const onCompositionEnd = (_event: CompositionEvent) =>
        {
            isInComposeSession = false;
            lastestCompositionEndAt = new Date().getTime();
        };
        export const isComposing = (event: KeyboardEvent) =>
        {
            return event.isComposing || isInComposeSession || new Date().getTime() < lastestCompositionEndAt +100;
        };
        export const onKeydown = (event: KeyboardEvent) =>
        {
            if ( ! isComposing(event))
            {
                switch(event.key)
                {
                    case "Enter":
                        (Array.from(document.getElementsByClassName("popup")) as HTMLDivElement[])
                            .filter((_i, ix, list) => (ix +1) === list.length)
                            .forEach(popup => (Array.from(popup.getElementsByClassName("default-button")) as HTMLButtonElement[])?.[0]?.click());
                        break;
                    case "Escape":
                        (getScreenCover() ?? getCloseButton())?.click();
                        break;
                }
                const focusedElementTagName = document.activeElement?.tagName?.toLowerCase() ?? "";
                if (["input", "textarea"].indexOf(focusedElementTagName) < 0)
                {
                    switch(event.key.toLowerCase())
                    {
                        case "f":
                            if (fullscreenEnabled())
                            {
                                if(null === fullscreenElement())
                                {
                                    requestFullscreen();
                                }
                                else
                                {
                                    exitFullscreen();
                                }
                            }
                            break;
                    }
                }
            }
        };
        let lastMouseMouseAt = 0;
        export const onMouseMove = (_evnet: MouseEvent) =>
        {
            if (fullscreenEnabled())
            {
                const now = lastMouseMouseAt = new Date().getTime();
                if (document.body.classList.contains("sleep-mouse"))
                {
                    document.body.classList.remove("sleep-mouse");
                }
                if (fullscreenElement())
                {
                    setTimeout
                    (
                        () =>
                        {
                            if (fullscreenElement() && now === lastMouseMouseAt)
                            {
                                if ( ! document.body.classList.contains("sleep-mouse"))
                                {
                                    document.body.classList.add("sleep-mouse");
                                }
                            }
                        },
                        3000
                    );
                }
            }
        };
        export const onFullscreenChange = (_event: Event) =>
        {
            onWindowResize();
        };
        export const onWebkitFullscreenChange = (_event: Event) =>
        {
            onWindowResize();
            if (0 <= navigator.userAgent.indexOf("iPad") || (0 <= navigator.userAgent.indexOf("Macintosh") && "ontouchend" in document))
            {
                document.body.classList.toggle("fxxking-ipad-fullscreen", fullscreenElement());
            }
        };
    }
    export const getUrlParams = (url: string = location.href) =>
    {
        const result: { [key: string]: string } = { };
        url
            .replace(/.*\?/, "")
            .replace(/#.*/, "")
            .split("&")
            .map(kvp => kvp.split("="))
            .filter(kvp => 2 <= kvp.length)
            .forEach(kvp => result[kvp[0]] = decodeURIComponent(kvp[1]));
        return result as Render.PageParams;
    };
    export const getUrlHash = (url: string = location.href) => url.replace(/[^#]*#?/, "");
    export const regulateUrl = (url: string) => url.replace(/#$/, "").replace(/\?$/, "");
    export const makeUrl =
    (
        args: {[key: string]: string} | Render.PageParams,
        href: string = location.href
    ) => regulateUrl
    (
        href
            .replace(/\?.*/, "")
            .replace(/#.*/, "")
            +"?"
            +Object.keys(args)
                .filter(i => undefined !== i)
                .filter(i => "hash" !== i)
                .map(i => `${i}=${encodeURIComponent(args[i])}`)
                .join("&")
            +`#${args["hash"] ?? ""}`
    );
    const originalStyle = document.getElementById("style").innerText;
    const makeRegExpPart = (text: string) => text.replace(/([\\\/\.\+\?\*\[\]\(\)\{\}\|])/gmu, "\\$1");
    export const updateStyle = () =>
    {
        const setting = Storage.Settings.get().theme ?? "auto";
        const system = window.matchMedia('(prefers-color-scheme: dark)').matches ? "dark": "light";
        const theme = "auto" === setting ? system: setting;
        let style = originalStyle;
        Object.keys(config.theme.original).forEach
        (
            key => style = style.replace
            (
                new RegExp
                (
                    makeRegExpPart(config.theme.original[key]),
                    "gmu"
                ),
                key
            )
        );
        Object.keys(config.theme.original).forEach
        (
            key => style = style.replace
            (
                new RegExp
                (
                    makeRegExpPart(key),
                    "gmu"
                ),
                config.theme[theme][key] ?? config.theme.original[key]
            )
        );
        if (document.getElementById("style").innerText !== style)
        {
            document.getElementById("style").innerText = style;
        }
    };
    export const updateProgressBarStyle = () =>
    {
        const setting = Storage.Settings.get().progressBarStyle ?? "auto";
        document.body.classList.toggle("tektite", "header" !== setting);
        if ("header" !== setting)
        {
            setHeaderColor(null);
        }
    };
    export const start = async () =>
    {
        console.log("start!!!");
        locale.setLocale(Storage.Settings.get().locale);
        window.onpopstate = () => showPage();
        window.addEventListener("resize", Render.onWindowResize);
        window.addEventListener("focus", Render.onWindowFocus);
        window.addEventListener("blur", Render.onWindowBlur);
        window.addEventListener("storage", Render.onUpdateStorage);
        window.addEventListener("compositionstart", Render.onCompositionStart);
        window.addEventListener("compositionend", Render.onCompositionEnd);
        window.addEventListener("keydown", Render.onKeydown);
        document.getElementById("screen-header").addEventListener
        (
            'click',
            async () => await Render.scrollToOffset(document.getElementById("screen-body"), 0)
        );
        window.addEventListener("mousemove", Render.onMouseMove);
        document.addEventListener("fullscreenchange", Render.onFullscreenChange);
        document.addEventListener("webkitfullscreenchange", Render.onWebkitFullscreenChange);
        window.matchMedia("(prefers-color-scheme: dark)").addListener(updateStyle);
        updateStyle();
        updateProgressBarStyle();
        await showPage();
    };
    export const showPage = async (url: string = location.href) =>
    {
        Render.getScreenCover()?.click();
        window.scrollTo(0,0);
        document.getElementById("screen-body").scrollTo(0,0);
        const urlParams = getUrlParams(url);
        // const hash = getUrlHash(url);
        const applicationType = urlParams["application"] as ApplicationType;
        switch(applicationType)
        {
        case "NeverStopwatch":
            await Render.showNeverStopwatchScreen();
            break;
        case "CountdownTimer":
            await Render.showCountdownTimerScreen();
            break;
        case "RainbowClock":
            await Render.showRainbowClockScreen();
            break;
        default:
            await Render.showWelcomeScreen();
            break;
        }
    };
    export const showUrl = async (data: Render.PageParams) =>
    {
        const url = makeUrl(data);
        await showPage(url);
        history.pushState(null, application[data.application]?.title ?? applicationTitle, url);
    };
    export const reload = async () => await showPage();
}
