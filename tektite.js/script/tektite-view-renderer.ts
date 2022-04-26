import { minamo } from "../../nephila/minamo.js/index.js";
import { Tektite } from "./tektite-index";
import { ViewModel } from "./tektite-view-model";
export module ViewRenderer
{
    export type DomType = Element | Element[];
    export const getPrimaryElement = (dom: DomType): Element => Array.isArray(dom) ? dom[0]: dom;
    export const getElementList = (dom: DomType): Element[] => Array.isArray(dom) ? dom: [dom];
    export interface ContainerEntry
    {
        make: "container",
    };
    export const containerEntry: ContainerEntry =
    {
        make: "container",
    };
    export interface DomEntryBase
    {
        updateChildren?:
            //  simple list
            "append" |
            //  regular list
            string[] |
            //  custom
            ((dom: DomType, children: { [Key: string]: DomType }, forceAppend: boolean) => Promise<unknown>),
        getChildModelContainer?: (dom: DomType) => Element,
        eventHandlers?: EventHandlers,
    };
    export interface VolatileDomEntry<T extends Tektite.ParamTypes, ViewModelEntry extends ViewModel.Entry> extends DomEntryBase // ViewModelEntry extends ViewModel.Entry
    {
        make: "volatile",
        update: (tektite: Tektite.Tektite<T>, path: ViewModel.PathType, model: ViewModelEntry) => Promise<DomType>,
    };
    export interface DomEntry<T extends Tektite.ParamTypes, ViewModelEntry extends ViewModel.Entry> extends DomEntryBase // ViewModelEntry extends ViewModel.Entry
    {
        make: (() => Promise<DomType | minamo.dom.Source>) | minamo.dom.Source,
        update?: (tektite: Tektite.Tektite<T>, path: ViewModel.PathType, dom: DomType, model: ViewModelEntry) => Promise<DomType>,
    };
    export type Entry<T extends Tektite.ParamTypes, ViewModelEntry extends ViewModel.Entry> = VolatileDomEntry<T, ViewModelEntry> | DomEntry<T, ViewModelEntry> | ContainerEntry;
    export const isContainerEntry = <T extends Tektite.ParamTypes, ViewModelEntry extends ViewModel.Entry>(entry: Entry<T, ViewModelEntry>): entry is ContainerEntry => "container" === entry.make;
    export const isVolatileDomEntry = <T extends Tektite.ParamTypes, ViewModelEntry extends ViewModel.Entry>(entry: Entry<T, ViewModelEntry>): entry is VolatileDomEntry<T, ViewModelEntry> => "volatile" === entry.make;
    export type EventHandler<EventType = Tektite.UpdateScreenEventEype> = (event: EventType, path: ViewModel.PathType) => unknown;
    export type EventHandlers = { [Key in Tektite.UpdateScreenEventEype]?: EventHandler<Key>; }
    interface DomCache
    {
        dom: DomType;
        json: string;
        childrenKeys: string[];
    }
    // export class ViewRenderer<PageParams, IconKeyType, LocaleEntryType extends Tektite.LocaleEntry, LocaleMapType extends { [language: string]: LocaleEntryType }>
    export class ViewRenderer<T extends Tektite.ParamTypes>
    {
        private previousData: string = "";
        private eventHandlers:
        {
            [Key in Tektite.UpdateScreenEventEype]?: ViewModel.PathType[];
        } = { };
        private unknownRenderer: Entry<T, any> | null = null;
        // constructor(public tektite: Tektite.Tektite<PageParams, IconKeyType, LocaleEntryType, LocaleMapType>)
        constructor(public tektite: Tektite.Tektite<T>)
        {
        }
        update = (event: Tektite.UpdateScreenEventEype) =>
        {
            this.renderRoot(); // this.eventHandlers を最新の状態にする為( だけど、ほぼ大半のケースで、何もせずに返ってくる。 )
            this.eventHandlers[event]?.forEach
            (
                path =>
                {
                    const type = this.tektite.viewModel.get(path)?.type;
                    if (type)
                    {
                        ((<DomEntry<T, any>>this.renderer[type])?.eventHandlers?.[event] as EventHandler<unknown>)
                            ?.(event, path)
                    }
                }
            );
            this.renderRoot(); // this.eventHandlers によって更新された model を rendering する為
        };
        pushEventHandler = (event: Tektite.UpdateScreenEventEype, path: ViewModel.PathType) =>
        {
            if ( ! this.eventHandlers[event])
            {
                this.eventHandlers[event] = [];
            }
            this.eventHandlers[event]?.push(path);
        };
        public onLoad = () =>
        {
        };
        public renderRoot = async (data: ViewModel.Entry | null = this.tektite.viewModel.get()) =>
        {
            let result: DomType | null = null;
            const json = JSON.stringify(data);
            if (this.previousData !== json)
            {
                const data = JSON.parse(json) as ViewModel.Entry;
                if ( ! ViewModel.hasError(ViewModel.makeRootPath(), data))
                {
                    //  pre-process
                    this.activePathList = [ ];
                    this.eventHandlers = { };
                    const oldCache: { [path: string]:DomCache } = { };
                    minamo.core.objectKeys(this.domCache).forEach
                    (
                        path =>
                        {
                            const cache = this.domCache[path];
                            oldCache[path] =
                            {
                                dom: cache.dom,
                                json: cache.json,
                                childrenKeys: minamo.core.simpleDeepCopy(cache.childrenKeys),
                            };
                        }
                    );
                    //  present-process
                    result = (await this.renderOrCache(ViewModel.makeRootPath(), data))?.dom ?? null;
                    //  post-process
                    minamo.core.objectKeys(this.domCache)
                        .filter(path => this.activePathList.indexOf(path) <= 0)
                        .forEach(path => delete this.domCache[path]);
                    minamo.core.objectKeys(oldCache)
                        .filter(path => oldCache[path].dom !== this.domCache[path]?.dom)
                        .map(path => oldCache[path].dom)
                        .forEach(dom => getElementList(dom).forEach(element => element.parentElement?.removeChild(element)));
                    this.previousData = json;
                }
            }
            else
            {
                result = this.getCache(ViewModel.makeRootPath()).dom;
            }
            return result;
        };
        private activePathList: string[] = [];
        private domCache: { [path: string]:DomCache } = { };
        public getCache = (path: ViewModel.PathType) => this.domCache[path.path];
        public setCache = (path: ViewModel.PathType, dom: DomType, data: string, childrenKeys: string[]) =>
            this.domCache[path.path] =
            {
                dom,
                json: data,
                childrenKeys
            };
        public makeOrNull = async (maker: (() => Promise<DomType | minamo.dom.Source>) | minamo.dom.Source): Promise<DomType | null> =>
        {
            const source = "function" === typeof maker ? await maker(): maker;
            return null === source ? source as null:
                source instanceof Element ? source:
                (minamo.dom.make(source) as Element);
        };
        public renderOrCache = async (path: ViewModel.PathType, data: ViewModel.Entry | null): Promise<DomCache | undefined> =>
        {
            this.activePathList.push(path?.path);
            let cache = this.getCache(path);
            const outputError = (message: string) => console.error(`tektite-view-renderer: ${message} - path:${path.path}, data:${JSON.stringify(data)}`);
            // if ( ! data?.key || "" === data.key)
            // {
            //     outputError("It has not 'key'");
            // }
            // else
            if ( ! data)
            {
                outputError("No data");
            }
            else
            {
                const renderer = this.renderer[data?.type] ?? this.unknownRenderer;
                if ( ! data?.type)
                {
                    outputError("It has not 'type'");
                }
                else
                if ( ! renderer)
                {
                    outputError(`Unknown type ${JSON.stringify(data?.type)}`);
                }
                else
                {
                    const oldChildrenKeys = cache?.childrenKeys ?? [];
                    const childrenKeys = ViewModel.getChildrenModelKeys(data);
                    const childrenCache = await Promise.all
                    (
                        childrenKeys.map
                        (
                            async key => await this.renderOrCache(ViewModel.makePath(path, key), ViewModel.getChildFromModelKey(data, key))
                        )
                    );
                    if ( ! isContainerEntry(renderer))
                    {
                        const json = JSON.stringify
                        ({
                            type: data?.type,
                            data: data?.data
                        });
                        if (cache?.json !== json)
                        {
                            let dom: DomType;
                            if (isVolatileDomEntry(renderer))
                            {
                                dom = await renderer.update(this.tektite, path, data);
                            }
                            else
                            {
                                dom = cache.dom ?? await this.makeOrNull(renderer.make);
                                dom = await renderer?.update?.(this.tektite, path, dom, data) ?? dom;
                            }
                            cache = this.setCache(path, dom, json, childrenKeys);
                        }
                        minamo.core.objectKeys(renderer.eventHandlers ?? { })
                            .forEach(event => this.pushEventHandler(event as Tektite.UpdateScreenEventEype, path));
                        if (0 < childrenKeys.length)
                        {
                            if (renderer.updateChildren)
                            {
                                const forceAppend = Array.isArray(data.children ?? []) && this.isSameOrder(oldChildrenKeys, childrenKeys);
                                const childrenKeyDomMap: { [key:string]: DomType } = { };
                                childrenKeys.forEach
                                (
                                    (key, ix) => childrenKeyDomMap[key] =
                                        childrenCache[ix]?.dom ??
                                        this.aggregateChildren(ViewModel.makePath(path, key), ViewModel.getChildFromModelKey(data, key))
                                );
                                const container = renderer.getChildModelContainer?.(cache.dom) ?? getPrimaryElement(cache.dom);
                                if ("append" === renderer.updateChildren)
                                {
                                    this.appendChildren(container, childrenKeyDomMap, forceAppend);
                                }
                                else
                                if (Array.isArray(renderer.updateChildren))
                                {
                                    this.replaceChildren(container, childrenKeyDomMap, renderer.updateChildren);
                                }
                                else
                                {
                                    await renderer.updateChildren(container, childrenKeyDomMap, forceAppend);
                                }
                                childrenKeys.forEach
                                (
                                    (key, ix) =>
                                    {
                                        const dom = childrenCache[ix]?.dom;
                                        if (minamo.core.exists(dom) && this.hasLeakChildren(dom))
                                        {
                                            outputError(`Not allocate dom ${key}`);
                                        }
                                    }
                                );
                            }
                        }
                    }
                }
            }
            return cache;
        };
        public isSameOrder = (old: string[], now: string[]) =>
        {
            const filteredOld = old.filter(i => 0 <= now.indexOf(i));
            return filteredOld.filter((i,ix) => i !== now[ix]).length <= 0;
        }
        public hasLeakChildren = (children: DomType) =>
            0 < getElementList(children).filter(element => null === element.parentElement).length;
        public isAlreadySet = (container: Element, children: DomType) =>
            0 < getElementList(children).filter(element => container !== element.parentElement).length;
        public appendChildren = (container: Element, children: { [Key: string]: DomType }, forceAppend: boolean) => minamo.core.objectKeys(children).forEach
        (
            key =>
            {
                const child = children[key];
                if (child && (forceAppend || ! this.isAlreadySet(container, child)))
                {
                    minamo.dom.appendChildren
                    (
                        container,
                        child
                    );
                }
            }
        );
        public replaceChildren = (container: Element, children: { [Key: string]: DomType }, keys: string[]) =>
        {
            const regulars = keys.map(key => children[key]).filter(i => i);
            if (0 < regulars.filter(dom => ! this.isAlreadySet(container, dom)).length)
            {
                minamo.dom.replaceChildren
                (
                    container,
                    regulars
                );
            }
        };
        public aggregateChildren = (path: ViewModel.PathType, data: ViewModel.Entry | null): DomType =>
            ViewModel.getChildrenModelKeys(data)
                .map(key => this.getCache(ViewModel.makePath(path, key)) ?? { dom: this.aggregateChildren(ViewModel.makePath(path, key), ViewModel.getChildFromModelKey(data, key))})
                .map(i => getElementList(i.dom))
                .reduce((a, b) => a.concat(b), []);
        public readonly renderer: { [type: string ]: Entry<T, any>} =
        {
            "tektite-screen-root":
            {
                make:
                {
                    parent: document.body,
                    tag: "div",
                    className: "tektite-foundation",
                    children:
                    {
                        tag: "div",
                        className: "tektite-screen",
                    }
                },
                update: async (_tektite: Tektite.Tektite<T>, _path: ViewModel.PathType, dom: DomType, model: ViewModel.Entry) =>
                {
                    const rootEntry = model as ViewModel.RootEntry;
                    if ("string" === typeof rootEntry.data?.title)
                    {
                        if (document.title !== rootEntry.data.title)
                        {
                            document.title = rootEntry.data.title;
                        }
                    }
                    if ("string" === typeof rootEntry.data?.windowColor)
                    {
                        minamo.dom.setStyleProperty(document.body, "backgroundColor", `${rootEntry.data.windowColor}E8`);
                        minamo.dom.setProperty("#tektite-theme-color", "content", rootEntry.data.windowColor);
                    }
                    return dom;
                },
                updateChildren: [ "screen-header", "screen-body", "screen-bar", "screen-toast" ],
                getChildModelContainer: (dom: DomType) => getPrimaryElement(dom).getElementsByClassName("tektite-screen")[0],
            },
            "tektite-screen-header":
            {
                make:
                {
                    tag: "header",
                    id: "tektite-screen-header",
                    className: "tektite-segmented",
                },
                update: async (_tektite: Tektite.Tektite<T>, _path: ViewModel.PathType, dom: DomType, _model: ViewModel.Entry) =>
                {
                    return dom;
                },
                updateChildren: [ "screen-header-progress-bar", "screen-header-segment", "screen-header-operator", ],
            },
            "tektite-screen-header-progress-bar":
            {
                make: { tag: "div", className: "tektite-progress-bar", },
                update: async (_tektite: Tektite.Tektite<T>, _path: ViewModel.PathType, dom: DomType, model: ViewModel.ScreenHeaderProgressBarEntry) =>
                {
                    const element = getPrimaryElement(dom) as HTMLDivElement;
                    if (model.data?.percent && 0 < model.data.percent)
                    {
                        if (model.data?.color)
                        {
                            minamo.dom.setStyleProperty(element, "backgroundColor", model.data.color);
                        }
                        const percentString = Tektite.makePercentString(model.data.percent);
                        minamo.dom.setStyleProperty(element, "width", percentString);
                        minamo.dom.setStyleProperty(element, "borderRightWidth", "1px");
                    }
                    else
                    {
                        minamo.dom.setStyleProperty(element, "width", "0%");
                        minamo.dom.setStyleProperty(element, "borderRightWidth", "0px");
                    }
                    return dom;
                },
            },
            "tektite-screen-header-segment-list": containerEntry,
            "tektite-screen-header-segment-core":
            {
                make:
                [
                    Tektite.$div("tektite-icon-frame")([]),
                    Tektite.$div("tektite-segment-title")([]),
                ],
                update: async (tektite: Tektite.Tektite<T>, _path: ViewModel.PathType, dom: DomType, model: ViewModel.ScreenHeaderSegmentCoreEntry) =>
                {
                    const list = getElementList(dom);
                    minamo.dom.replaceChildren(list[0], await tektite.params.loadIconOrCache(model.data.icon));
                    minamo.dom.replaceChildren(list[1], model.data.title);
                    return dom;
                },
            },
            "tektite-screen-header-label-segment":
            {
                make: Tektite.$div(`tektite-segment label-tektite-segment`)([]),
                update: async (_tektite: Tektite.Tektite<T>, _path: ViewModel.PathType, dom: DomType, model: ViewModel.ScreenHeaderLabelSegmentEntry) =>
                {
                    getPrimaryElement(dom).className = `tektite-segment label-tektite-segment ${model.data?.className ?? ""}`;
                    return dom;
                },
                updateChildren: "append",
            },
            "tektite-screen-header-link-segment":
            {
                make:
                {
                    tag: "header",
                    id: "tektite-screen-header",
                    className: "tektite-segmented",
                },
                update: async (_tektite: Tektite.Tektite<T>, _path: ViewModel.PathType, dom: DomType, _modelEntry: ViewModel.Entry) =>
                {
                    return dom;
                },
                updateChildren: "append",
                eventHandlers:
                {
        
                }
            },
            "tektite-screen-header-popup-segment":
            {
                make:
                {
                    tag: "header",
                    id: "tektite-screen-header",
                    className: "tektite-segmented",
                },
                update: async (_tektite: Tektite.Tektite<T>, _path: ViewModel.PathType, dom: DomType, _modelEntry: ViewModel.Entry) =>
                {
                    return dom;
                },
                updateChildren: "append",
                eventHandlers:
                {
        
                }
            },
            "tektite-screen-operator":
            {
                make:
                {
                    tag: "header",
                    id: "tektite-screen-header",
                    className: "tektite-segmented",
                },
                update: async (_tektite: Tektite.Tektite<T>, _path: ViewModel.PathType, dom: DomType, _modelEntry: ViewModel.Entry) =>
                {
                    return dom;
                },
                // getChildModelContainer: (dom: Element, key: string) =>
                // {
    
                // },
                eventHandlers:
                {
        
                }
            },
            "tektite-screen-body":
            {
                make:
                {
                    tag: "div",
                    id: "tektite-screen-body",
                    className: "tektite-screen-body",
                },
                update: async (_tektite: Tektite.Tektite<T>, _path: ViewModel.PathType, dom: DomType, _modelEntry: ViewModel.Entry) =>
                {
                    return dom;
                },
                // getChildModelContainer: (dom: Element, key: string) =>
                // {
    
                // },
                eventHandlers:
                {
        
                }
            },
            "tektite-screen-bar":
            {
                make:
                {
                    tag: "div",
                    className: "tektite-screen-bar",
                    childNodes:
                    {
                        tag: "div",
                        className: "tektite-screen-bar-flash-layer",
                    },
                },
                update: async (_tektite: Tektite.Tektite<T>, _path: ViewModel.PathType, dom: DomType, _modelEntry: ViewModel.Entry) =>
                {
                    return dom;
                },
                // getChildModelContainer: (dom: Element, key: string) =>
                // {
                    
                // },
                eventHandlers:
                {
        
                }
            },
            "tektite-screen-toast":
            {
                make:
                {
                    tag: "div",
                    className: "tektite-screen-toast",
                },
                update: async (_tektite: Tektite.Tektite<T>, _path: ViewModel.PathType, dom: DomType, _modelEntry: ViewModel.Entry) =>
                {
                    return dom;
                },
                // getChildModelContainer: (dom: Element, key: string) => Element;
                eventHandlers:
                {
        
                }
            },
            "tektite-toast-item":
            {
                make:
                {
                    tag: "div",
                    className: "tektite-item tektite-slide-up-in",
                },
                update: async (tektite: Tektite.Tektite<T>, path: ViewModel.PathType, dom: DomType, modelEntry: ViewModel.Entry) =>
                {
                    const element = getPrimaryElement(dom);
                    const data = (modelEntry as ViewModel.ToastItemEntry).data;
                    minamo.dom.replaceChildren
                    (
                        element,
                        data.isWideContent ?
                        [
                            data.backwardOperator,
                            data.content,
                            data.forwardOperator,
                        ].filter(i => undefined !== i):
                        [
                            data.backwardOperator ?? Tektite.$span("tektite-dummy")([]),
                            data.content,
                            data.forwardOperator ?? Tektite.$span("tektite-dummy")([]),
                        ]
                    );
                    const hideRaw = async (className: string, wait: number) =>
                    {
                        if (null !== result.timer)
                        {
                            clearTimeout(result.timer);
                            result.timer = null;
                        }
                        if (element.parentElement)
                        {
                            element.classList.remove("tektite-slide-up-in");
                            element.classList.add(className);
                            await minamo.core.timeout(wait);
                            tektite.viewModel.remove(path);
                            // // 以下は Safari での CSS バグをクリアする為の細工。本質的には必要の無い呼び出し。
                            // if (this.element.getElementsByClassName("item").length <= 0)
                            // {
                            //     await minamo.core.timeout(10);
                            //     tektite.screen.update("operate");
                            // }
                        }
                    };
                    const wait = data.wait ?? 5000;
                    const result =
                    {
                        // dom,
                        timer: 0 < wait ? setTimeout(() => hideRaw("tektite-slow-slide-down-out", 500), wait): null,
                        // hide: async () => await hideRaw("tektite-slide-down-out", 250),
                    };
                    setTimeout(() => element.classList.remove("tektite-slide-up-in"), 250);
                    return dom;
                },
                eventHandlers:
                {
        
                }
            },
        };
    }
    // export const make = <PageParams, IconKeyType, LocaleEntryType extends Tektite.LocaleEntry, LocaleMapType extends { [language: string]: LocaleEntryType }>(tektite: Tektite.Tektite<PageParams, IconKeyType, LocaleEntryType, LocaleMapType>) =>
    //     new ViewRenderer(tektite);
    export const make = <T extends Tektite.ParamTypes>(tektite: Tektite.Tektite<T>) =>
        new ViewRenderer(tektite);
}
