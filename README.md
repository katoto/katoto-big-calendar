# katoto-big-calendar

大日历展示，支持各种组件自定义，基本能涵盖日历资源管理类需求(类飞书日历)

### 基本形态

```tsx
import React, { useEffect } from 'react'
import moment from 'moment'
import 'katoto-big-calendar/lib/css/big-calendar-custom.css'
import { Calendar, momentLocalizer } from 'katoto-big-calendar'
moment.locale('zh-cn')
const mLocalizer = momentLocalizer(moment)

export default function ({ localizer = mLocalizer, ...props }) {
  return (
    <Calendar
      style={{ minHeight: '450px' }}
      onShowMore={() => {
        console.log('props onShowMore change')
      }}
      onNavigate={() => {
        console.log('props navigate change')
      }}
      popup
      events={[
        {
          id: 15,
          title: '这是事件任务条',
          start: Date.now(),
          end: Date.now() + 72000000,
          allDay: true,
        },
      ]}
      localizer={localizer}
    />
  )
}
```

### 哪些区域支持自定义？

如图上标识的均可定制
![标注图](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/cf5b0bd0e5d04dc9baca86d2c1019d30~tplv-k3u1fbpfcp-watermark.image)

#### API

| 参数               | 说明                                                                                        | 类型                                                                                 | 默认值              |
| :----------------- | :------------------------------------------------------------------------------------------ | :----------------------------------------------------------------------------------- | :------------------ |
| localizer          | 必需参数，用于一切日期的格式化                                                              | momentLocalizer(moment)                                                              | -                   |
| popup              | 是否点击出弹窗；popWrapper 用于弹窗内容自定义                                               | boolean                                                                              | false               |
| onNavigate         | date 改变触发事件                                                                           | function(Date, 'month')                                                              | -                   |
| onSelectEvent      | 选中事件条事件                                                                              | function(eventDataObj, e)                                                            | -                   |
| onShowMore         | 点击更多事件                                                                                | function(eventDataObj[], e)                                                          | -                   |
| onDoubleClickEvent | 双击事件条事件                                                                              | function(eventDataObj, e)                                                            | -                   |
| onMouseMoveEvent   | 鼠标在日历上的移动坐标, 返回二维数组位置[x, y]。[-1,-1]表示移出区域(写了事件开启 mousemove) | function(pointArr: number[])                                                         | -                   |
| defaultDate        | 展示默认月份                                                                                | Date                                                                                 | () => { new Date()} |
| getNow             | 默认标记当前日期                                                                            | Date                                                                                 | () => {new Date()}  |
| toolbar            | 是否展示日历表头                                                                            | boolean ｜ elementType                                                               | true                |
| event              | 事件条数组                                                                                  | { title: string, start: Date, end: Date, allDay?: boolean resource?: any, ... }[] ｜ | []                  |
| formats            | 部分日期格式化配置。见下表                                                                  | Object                                                                               |
| messages           | 修改部分默认文案。showMore 用于更多自定义，见下表                                           | Object                                                                               | -                   |
| components         | 自定义组件，见下表                                                                          | Object                                                                               | -                   |

### formats 字段解释

```
const formats = {
  dateFormat: 'DD',
  dayFormat: 'DD ddd',
  weekdayFormat: 'ddd',

  selectRangeFormat: timeRangeFormat,
  eventTimeRangeFormat: timeRangeFormat,
  eventTimeRangeStartFormat: timeRangeStartFormat,
  eventTimeRangeEndFormat: timeRangeEndFormat,

  timeGutterFormat: 'LT',

  monthHeaderFormat: 'MMMM YYYY', // toolbar标题
  dayHeaderFormat: 'dddd MMM DD',
  dayRangeHeaderFormat: weekRangeFormat,
  agendaHeaderFormat: dateRangeFormat,

  agendaDateFormat: 'ddd MMM DD',
  agendaTimeFormat: 'LT',
  agendaTimeRangeFormat: timeRangeFormat,
}

<Calendar formats={formats} />
```

### messages 字段解释

```
  const messages = {
    date: 'Date',
    time: 'Time',
    event: 'Event',
    allDay: 'All Day',
    day: 'Day',
    month: 'Month',
    previous: 'Back',
    next: 'Next',
    yesterday: 'Yesterday',
    tomorrow: 'Tomorrow',
    today: 'Today',
    showMore: total => `+${total} more`, // 用于超3个事件后的自定义
  }

  <Calendar messages={messages} />
```

### components 字段解释

```
// 可自定义components
const components = useMemo(() => ({
  toolbar: MyToolbar,
  event: MyEvent,
  eventWrapper: MyEventWrapper,
  dateCellWrapper: MyDateCellWrapper,
  month: {
    header: MyMonthHeader,
    dateHeader: MyMonthDateHeader,
    event: MyMonthEvent,
  }
}), [])

<Calendar components={components} />
```

| 参数            | 说明                                                                            | 类型                  | 默认值 |
| :-------------- | :------------------------------------------------------------------------------ | :-------------------- | :----- |
| toolbar         | 日历表头 props = { label, onNavigate }                                          | PropTypes.elementType | -      |
| event           | 事件条内容自定义 props = {event, title ...}                                     | PropTypes.elementType | -      |
| eventWrapper    | 事件条容器自定义，dom 事件需自己维护 props = {event,onSelect,onDoubleClick ...} | PropTypes.elementType | -      |
| dateCellWrapper | cell 单元格背景 props = {value: Date, range, ...}                               | PropTypes.elementType | -      |
| popWrapper      | popup 为 true 弹窗内容 props = {events, ...}                                    | PropTypes.elementType | -      |
| month           | 日历中间部分，见下表                                                            | Object                | -      |

### month 字段解释

| 参数       | 说明                                     | 类型                  | 默认值 |
| :--------- | :--------------------------------------- | :-------------------- | :----- |
| header     | 星期 header 区域 props = { label, Date } | PropTypes.elementType |
| dateHeader | cellHeader 区域 props = { label, Date }  | PropTypes.elementType | -      |
| event      | 同上 event                               | -                     | -      |

### 参考

```tsx
import React, { useEffect } from 'react'
import moment from 'moment'
import 'katoto-big-calendar/lib/css/big-calendar-custom.css'
import { Calendar, momentLocalizer } from 'katoto-big-calendar'
moment.locale('zh-cn')
const mLocalizer = momentLocalizer(moment)

export default function ({ localizer = mLocalizer, ...props }) {
  return (
    <Calendar
      style={{ height: '500px' }}
      onShowMore={(event) => {
        console.log(event)
        console.log('props onShowMore change')
      }}
      onNavigate={() => {
        console.log('props navigate change')
      }}
      onSelectEvent={(evtObj, e) => {
        // 事件点击回调 返回evtobj
        console.log('props onSelectEvent change')
      }}
      onDoubleClickEvent={() => {
        console.log('props onDoubleClickEvent change')
      }}
      onMouseMoveEvent={(point) => {
        const [pointX, pointY] = point // 鼠标位置
      }}
      messages={{
        showMore: (count) => {
          return <span style={{ color: 'red' }}>+${count}</span>
        },
      }}
      defaultDate={new Date()}
      events={[
        {
          id: 0,
          title: 'long title',
          allDay: true,
          start: new Date(),
          end: new Date().getTime() + 172000000,
        },
        {
          id: 1,
          title: 'Long Event',
          start: new Date(),
          end: new Date() + 720000000,
        },
      ]}
      localizer={localizer}
      popup
      components={{
        toolbar: ({ label, onNavigate }) => {
          return (
            <div style={{ display: 'flex', border: '1px solid red' }}>
              <button
                onClick={() => {
                  onNavigate('PREV')
                }}
              >
                上
              </button>
              <div>月份：{label}</div>
              <button
                onClick={() => {
                  onNavigate('NEXT')
                }}
              >
                下
              </button>
              <button
                onClick={() => {
                  onNavigate('TODAY')
                }}
              >
                回到当前日期页
              </button>
            </div>
          )
        },
        month: {
          dateHeader: ({ label, date }) => {
            return (
              <div>
                {moment(date).format('YYYY-MM-DD')}
                {label}
              </div>
            )
          },
          header: ({ label, date }) => {
            return (
              <div>
                {moment(date).format('YYYY-MM-DD')}
                {label}
              </div>
            )
          },
        },
        eventWrapper: (props) => {
          return (
            <div
              onClick={(e) => {
                e.stopPropagation() // 阻止冒泡
                props.onSelect && props.onSelect(props.event, e)
              }}
              style={{ border: '1px solid red' }}
            >
              {props.event.title}
            </div>
          )
        },
        dateCellWrapper: (val) => {
          return <div style={{ borderLeft: '1px solid #ddd', flex: 1 }}></div>
        },
        dateCellWrapper: ({ value, range }) => {
          return (
            <div
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                borderRight: '1px solid #ccc',
              }}
            >
              cell背景 {moment(value).format('YYYY-MM-DD')}
            </div>
          )
        },
      }}
    />
  )
}
```

### 上线效果

![最新业务效果](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/cce516d4bb3241ac90e6cbcfe9dbc159~tplv-k3u1fbpfcp-watermark.image)

### tips

commit 的时候，记得加 `--no-verify` 。babel 处理.js 组件有问题。不影响包功能

### 开始业务调试

```
yarn
yarn dev
// 本地调试： http://localhost:9002/?path=/story/examples--example-1

yarn build 发本地link包
yarn link
// 使用业务处：
yarn link "katoto-big-calendar"
```
