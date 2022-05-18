import PropTypes from 'prop-types'
import React from 'react'
import { uncontrollable } from 'uncontrollable'
import classNames from 'classnames'
import {
  accessor,
  dateFormat,
  dateRangeFormat,
  DayLayoutAlgorithmPropType,
  views as componentViews,
} from './utils/propTypes'

import { notify } from './utils/helpers'
import { navigate, views } from './utils/constants'
import { mergeWithDefaults } from './localizer'
import message from './utils/messages'
import moveDate from './utils/move'
import VIEWS from './Views'
import Toolbar from './Toolbar.jsx'
import NoopWrapper from './NoopWrapper.jsx'
import omit from 'lodash/omit'
import defaults from 'lodash/defaults'
import transform from 'lodash/transform'
import mapValues from 'lodash/mapValues'
import { wrapAccessor } from './utils/accessors'

function viewNames(_views) {
  return !Array.isArray(_views) ? Object.keys(_views) : _views
}
class Calendar extends React.Component {
  static propTypes = {
    /**
     */
    localizer: PropTypes.object.isRequired,

    /**
     * Props passed to main calendar `<div>`.
     */
    elementProps: PropTypes.object,

    /**
     */
    date: PropTypes.instanceOf(Date),

    /**
     * The current view of the calendar.
     *
     * @default 'month'
     * @controllable onView
     */
    view: PropTypes.string,

    /**
     * The initial view set for the Calendar.
     * @type Calendar.Views ('month'|'week')
     * @default 'month'
     */
    defaultView: PropTypes.string,

    /**
     * An array of event objects to display on the calendar. Events objects
     * can be any shape, as long as the Calendar knows how to retrieve the
     * following details of the event:
     *
     *  - start time
     *  - end time
     *  - title
     *  - whether its an "all day" event or not
     *  - any resource the event may be related to
     *
     * Each of these properties can be customized or generated dynamically by
     * setting the various "accessor" props. Without any configuration the default
     * event should look like:
     *
     * ```js
     * Event {
     *   title: string,
     *   start: Date,
     *   end: Date,
     *   allDay?: boolean
     *   resource?: any,
     * }
     * ```
     */
    events: PropTypes.arrayOf(PropTypes.object),

    /**
     * Accessor for the event title, used to display event information. Should
     * resolve to a `renderable` value.
     *
     * ```js
     * string | (event: Object) => string
     * ```
     *
     * @type {(func|string)}
     */
    titleAccessor: accessor,

    /**
     * Accessor for the event tooltip. Should
     * resolve to a `renderable` value. Removes the tooltip if null.
     *
     * ```js
     * string | (event: Object) => string
     * ```
     *
     * @type {(func|string)}
     */
    tooltipAccessor: accessor,

    /**
     * Determines whether the event should be considered an "all day" event and ignore time.
     * Must resolve to a `boolean` value.
     *
     * ```js
     * string | (event: Object) => boolean
     * ```
     *
     * @type {(func|string)}
     */
    allDayAccessor: accessor,

    /**
     * The start date/time of the event. Must resolve to a JavaScript `Date` object.
     *
     * ```js
     * string | (event: Object) => Date
     * ```
     *
     * @type {(func|string)}
     */
    startAccessor: accessor,

    /**
     * The end date/time of the event. Must resolve to a JavaScript `Date` object.
     *
     * ```js
     * string | (event: Object) => Date
     * ```
     *
     * @type {(func|string)}
     */
    endAccessor: accessor,

    /**
     * Returns the id of the `resource` that the event is a member of. This
     * id should match at least one resource in the `resources` array.
     *
     * ```js
     * string | (event: Object) => Date
     * ```
     *
     * @type {(func|string)}
     */
    resourceAccessor: accessor,

    /**
     * An array of resource objects that map events to a specific resource.
     * Resource objects, like events, can be any shape or have any properties,
     * but should be uniquly identifiable via the `resourceIdAccessor`, as
     * well as a "title" or name as provided by the `resourceTitleAccessor` prop.
     */
    resources: PropTypes.arrayOf(PropTypes.object),

    /**
     * Provides a unique identifier for each resource in the `resources` array
     *
     * ```js
     * string | (resource: Object) => any
     * ```
     *
     * @type {(func|string)}
     */
    resourceIdAccessor: accessor,

    /**
     * Provides a human readable name for the resource object, used in headers.
     *
     * ```js
     * string | (resource: Object) => any
     * ```
     *
     * @type {(func|string)}
     */
    resourceTitleAccessor: accessor,

    /**
     * Determines the current date/time which is highlighted in the views.
     *
     * The value affects which day is shaded and which time is shown as
     * the current time. It also affects the date used by the Today button in
     * the toolbar.
     *
     * Providing a value here can be useful when you are implementing time zones
     * using the `startAccessor` and `endAccessor` properties.
     *
     * @type {func}
     * @default () => new Date()
     */
    getNow: PropTypes.func,

    /**
     * Callback fired when the `date` value changes.
     *
     * @controllable date
     */
    onNavigate: PropTypes.func,

    /**
     * Callback fired when the `view` value changes.
     *
     * @controllable view
     */
    onView: PropTypes.func,

    /**
     * Callback fired when date header, or the truncated events links are clicked
     *
     */
    // onDrillDown: PropTypes.func,

    /**
     * A callback fired when a date selection is made. Only fires when `selectable` is `true`.
     *
     * ```js
     * (
     *   slotInfo: {
     *     start: Date,
     *     end: Date,
     *     resourceId:  (number|string),
     *     slots: Array<Date>,
     *     action: "select" | "click" | "doubleClick",
     *     bounds: ?{ // For "select" action
     *       x: number,
     *       y: number,
     *       top: number,
     *       right: number,
     *       left: number,
     *       bottom: number,
     *     },
     *     box: ?{ // For "click" or "doubleClick" actions
     *       clientX: number,
     *       clientY: number,
     *       x: number,
     *       y: number,
     *     },
     *   }
     * ) => any
     * ```
     */
    onSelectSlot: PropTypes.func,

    /**
     * Callback fired when a calendar event is selected.
     *
     * ```js
     * (event: Object, e: SyntheticEvent) => any
     * ```
     * 事件点击回调
     * @controllable selected
     */
    onSelectEvent: PropTypes.func,

    /**
     * Callback fired when a calendar event is clicked twice.
     * ```js
     * (event: Object, e: SyntheticEvent) => void
     * ```
     */
    onDoubleClickEvent: PropTypes.func,

    /**
     * 
     * 鼠标移动事件
     * ```
     */
    onMouseMoveEvent: PropTypes.func,

    /**
     * Callback fired when a focused calendar event receives a key press.
     *
     * ```js
     * (event: Object, e: SyntheticEvent) => void
     * ```
     */
    onKeyPressEvent: PropTypes.func,


    /**
     * 点击更多事件回调
     * Callback fired when a +{count} more is clicked
     * ```js
     * (events: Object, date: Date) => any
     * ```
     */
    onShowMore: PropTypes.func,

    /**
     * The selected event, if any.
     */
    selected: PropTypes.object,

    /**
     * An array of built-in view names to allow the calendar to display.
     * accepts either an array of builtin view names,
     *
     * ```jsx
     * views={['month', 'day', 'agenda']}
     * ```
     * or an object hash of the view name and the component (or boolean for builtin).
     *
     * ```jsx
     * views={{
     *   month: true,
     *   week: false,
     *   myweek: WorkWeekViewComponent,
     * }}
     * ```
     *
     * Custom views can be any React component, that implements the following
     * interface:
     *
     * ```js
     * interface View {
     *   static title(date: Date, { formats: DateFormat[], culture: string?, ...props }): string
     *   static navigate(date: Date, action: 'PREV' | 'NEXT' | 'DATE'): Date
     * }
     * ```
     *
     * @type Views ('month'|'week'|'work_week'|'day'|'agenda')
     * @View
     ['month', 'week', 'day', 'agenda']
     */
    views: componentViews,

    /**
     * Determines the end date from date prop in the agenda view
     * date prop + length (in number of days) = end date
     */
    length: PropTypes.number,

    /**
     * Determines whether the toolbar is displayed
     */
    toolbar: PropTypes.bool,

    /**
     * Show truncated events in an overlay when you click the "+_x_ more" link.
     */
    popup: PropTypes.bool,

    /**
     * Distance in pixels, from the edges of the viewport, the "show more" overlay should be positioned.
     *
     * ```jsx
     * <Calendar popupOffset={30}/>
     * <Calendar popupOffset={{x: 30, y: 20}}/>
     * ```
     */
    popupOffset: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.shape({ x: PropTypes.number, y: PropTypes.number }),
    ]),

    /**
     * Allows mouse selection of ranges of dates/times.
     *
     * The 'ignoreEvents' option prevents selection code from running when a
     * drag begins over an event. Useful when you want custom event click or drag
     * logic
     */
    selectable: PropTypes.oneOf([true, false, 'ignoreEvents']),

    /**
     * Specifies the number of milliseconds the user must press and hold on the screen for a touch
     * to be considered a "long press." Long presses are used for time slot selection on touch
     * devices.
     *
     * @type {number}
     * @default 250
     */
    longPressThreshold: PropTypes.number,

    /**
     * Determines the selectable time increments in week and day views, in minutes.
     */
    step: PropTypes.number,

    /**
     * The number of slots per "section" in the time grid views. Adjust with `step`
     * to change the default of 1 hour long groups, with 30 minute slots.
     */
    timeslots: PropTypes.number,

    /**
     * Optionally provide a function that returns an object of className or style props
     * to be applied to the the event node.
     *
     * ```js
     * (
     * 	event: Object,
     * 	start: Date,
     * 	end: Date,
     * 	isSelected: boolean
     * ) => { className?: string, style?: Object }
     * ```
     */
    eventPropGetter: PropTypes.func,

    /**
     * Optionally provide a function that returns an object of className or style props
     * to be applied to the time-slot node. Caution! Styles that change layout or
     * position may break the calendar in unexpected ways.
     *
     * ```js
     * (date: Date, resourceId: (number|string)) => { className?: string, style?: Object }
     * ```
     */
    slotPropGetter: PropTypes.func,

    /**
     * Optionally provide a function that returns an object of props to be applied
     * to the time-slot group node. Useful to dynamically change the sizing of time nodes.
     * ```js
     * () => { style?: Object }
     * ```
     */
    slotGroupPropGetter: PropTypes.func,

    /**
     * Optionally provide a function that returns an object of className or style props
     * to be applied to the the day background. Caution! Styles that change layout or
     * position may break the calendar in unexpected ways.
     *
     * ```js
     * (date: Date) => { className?: string, style?: Object }
     * ```
     */
    dayPropGetter: PropTypes.func,

    /**
     * Constrains the minimum _time_ of the Day and Week views.
     */
    min: PropTypes.instanceOf(Date),

    /**
     * Constrains the maximum _time_ of the Day and Week views.
     */
    max: PropTypes.instanceOf(Date),

    /**
     * Specify a specific culture code for the Calendar.
     *
     * **Note: it's generally better to handle this globally via your i18n library.**
     */
    culture: PropTypes.string,

    /**
     * Localizer specific formats, tell the Calendar how to format and display dates.
     *
     * `format` types are dependent on the configured localizer; Moment, Luxon and Globalize
     * accept strings of tokens according to their own specification, such as: `'DD mm yyyy'`.
     *
     * ```jsx
     * let formats = {
     *   dateFormat: 'dd',
     *
     *   dayFormat: (date, , localizer) =>
     *     localizer.format(date, 'DDD', culture),
     *
     *   dayRangeHeaderFormat: ({ start, end }, culture, localizer) =>
     *     localizer.format(start, { date: 'short' }, culture) + ' – ' +
     *     localizer.format(end, { date: 'short' }, culture)
     * }
     *
     * <Calendar formats={formats} />
     * ```
     *
     * All localizers accept a function of
     * the form `(date: Date, culture: ?string, localizer: Localizer) -> string`
     */
    formats: PropTypes.shape({
      /**
       * Format for the day of the month heading in the Month view.
       * e.g. "01", "02", "03", etc
       */
      dateFormat,

      /**
       * A day of the week format for Week and Day headings,
       * e.g. "Wed 01/04"
       *
       */
      dayFormat: dateFormat,

      /**
       * Week day name format for the Month week day headings,
       * e.g: "Sun", "Mon", "Tue", etc
       *
       */
      weekdayFormat: dateFormat,

      /**
       * The timestamp cell formats in Week and Time views, e.g. "4:00 AM"
       */
      timeGutterFormat: dateFormat,

      /**
       * Toolbar header format for the Month view, e.g "2015 April"
       *
       */
      monthHeaderFormat: dateFormat,

      /**
       * Toolbar header format for the Week views, e.g. "Mar 29 - Apr 04"
       */
      dayRangeHeaderFormat: dateRangeFormat,

      /**
       * Toolbar header format for the Day view, e.g. "Wednesday Apr 01"
       */
      dayHeaderFormat: dateFormat,

      /**
       * Toolbar header format for the Agenda view, e.g. "4/1/2015 – 5/1/2015"
       */
      agendaHeaderFormat: dateRangeFormat,

      /**
       * A time range format for selecting time slots, e.g "8:00am – 2:00pm"
       */
      selectRangeFormat: dateRangeFormat,

      agendaDateFormat: dateFormat,
      agendaTimeFormat: dateFormat,
      agendaTimeRangeFormat: dateRangeFormat,

      /**
       * Time range displayed on events.
       */
      eventTimeRangeFormat: dateRangeFormat,

      /**
       * An optional event time range for events that continue onto another day
       */
      eventTimeRangeStartFormat: dateFormat,

      /**
       * An optional event time range for events that continue from another day
       */
      eventTimeRangeEndFormat: dateFormat,
    }),

    /**
     * Customize how different sections of the calendar render by providing custom Components.
     * In particular the `Event` component can be specified for the entire calendar, or you can
     * provide an individual component for each view type.
     *
     * ```jsx
     * let components = {
     *   eventWrapper: MyEventWrapper, // 资源数据行块
     *   popWrapper: MyPopWrapper, // 弹窗内容自定义
     *   dateCellWrapper: MyDateCellWrapper,
     *   toolbar: MyToolbar,
     *   month: {
     *     header: MyMonthHeader, // 星期的自定义头
     *     dateHeader: MyMonthDateHeader,
     *     event: MyMonthEvent,
     *   }
     * }
     * <Calendar components={components} />
     * ```
     */
    components: PropTypes.shape({
      toolbar: PropTypes.elementType,
      event: PropTypes.elementType,
      eventWrapper: PropTypes.elementType,
      popWrapper: PropTypes.elementType,
      dateCellWrapper: PropTypes.elementType,
      month: PropTypes.shape({
        header: PropTypes.elementType,
        dateHeader: PropTypes.elementType,
        event: PropTypes.elementType,
      }),
    }),

    /**
     * String messages used throughout the component, override to provide localizations
     *
     * ```jsx
     * const messages = {
     *   date: 'Date',
     *   time: 'Time',
     *   event: 'Event',
     *   allDay: 'All Day',
     *   week: 'Week',
     *   work_week: 'Work Week',
     *   day: 'Day',
     *   month: 'Month',
     *   previous: 'Back',
     *   next: 'Next',
     *   yesterday: 'Yesterday',
     *   tomorrow: 'Tomorrow',
     *   today: 'Today',
     *   agenda: 'Agenda',
     *
     *   noEventsInRange: 'There are no events in this range.',
     *
     *   showMore: total => `+${total} more`,
     *   eventRowsSort: list => return nList
     * }
     *
     * <Calendar messages={messages} />
     * ```
     */

    messages: PropTypes.shape({
      allDay: PropTypes.node,
      previous: PropTypes.node,
      next: PropTypes.node,
      today: PropTypes.node,
      month: PropTypes.node,
      week: PropTypes.node,
      day: PropTypes.node,
      agenda: PropTypes.node,
      date: PropTypes.node,
      time: PropTypes.node,
      event: PropTypes.node,
      noEventsInRange: PropTypes.node,
      showMore: PropTypes.func,
      eventRowsSort: PropTypes.func,
    }),

    rowLimit: PropTypes.number,// 限制事件条行数，不传按计算得出

    /**
     * A day event layout(arrangement) algorithm.
     *
     * `overlap` allows events to be overlapped.
     *
     * `no-overlap` resizes events to avoid overlap.
     *
     * or custom `Function(events, minimumStartDifference, slotMetrics, accessors)`
     */
    dayLayoutAlgorithm: DayLayoutAlgorithmPropType,
  }

  static defaultProps = {
    elementProps: {},
    popup: false,
    toolbar: true,
    view: views.MONTH,
    views: [views.MONTH],
    step: 30,
    length: 30,
    events: [],
    titleAccessor: 'title',
    tooltipAccessor: 'title',
    allDayAccessor: 'allDay',
    startAccessor: 'start',
    endAccessor: 'end',
    resourceAccessor: 'resourceId',

    resourceIdAccessor: 'id',
    resourceTitleAccessor: 'title',

    longPressThreshold: 250,
    getNow: () => new Date(),
    dayLayoutAlgorithm: 'overlap',
  }

  constructor(...args) {
    super(...args)
    this.state = {
      context: this.getContext(this.props),
    }
  }
  UNSAFE_componentWillReceiveProps(nextProps) {
    this.setState({ context: this.getContext(nextProps) })
  }

  getContext({
    startAccessor,
    endAccessor,
    allDayAccessor,
    tooltipAccessor,
    titleAccessor,
    resourceAccessor,
    resourceIdAccessor,
    resourceTitleAccessor,
    eventPropGetter,
    backgroundEventPropGetter,
    slotPropGetter,
    slotGroupPropGetter,
    dayPropGetter,
    view,
    views,
    localizer,
    culture,
    messages = {},
    components = {},
    formats = {},
  }) {
    let names = viewNames(views)
    const msgs = message(messages)
    return {
      viewNames: names,
      localizer: mergeWithDefaults(localizer, culture, formats, msgs),
      getters: {
        eventProp: (...args) =>
          (eventPropGetter && eventPropGetter(...args)) || {},
        backgroundEventProp: (...args) =>
          (backgroundEventPropGetter && backgroundEventPropGetter(...args)) ||
          {},
        slotProp: (...args) =>
          (slotPropGetter && slotPropGetter(...args)) || {},
        slotGroupProp: (...args) =>
          (slotGroupPropGetter && slotGroupPropGetter(...args)) || {},
        dayProp: (...args) => (dayPropGetter && dayPropGetter(...args)) || {},
      },
      components: defaults(components[view] || {}, omit(components, names), {
        eventWrapper: NoopWrapper,
        backgroundEventWrapper: NoopWrapper,
        dateCellWrapper: NoopWrapper,
        weekWrapper: NoopWrapper,
      }),
      accessors: {
        start: wrapAccessor(startAccessor),
        end: wrapAccessor(endAccessor),
        allDay: wrapAccessor(allDayAccessor),
        tooltip: wrapAccessor(tooltipAccessor),
        title: wrapAccessor(titleAccessor),
        resource: wrapAccessor(resourceAccessor),
        resourceId: wrapAccessor(resourceIdAccessor),
        resourceTitle: wrapAccessor(resourceTitleAccessor),
      },
    }
  }

  getViews = () => {
    const views = this.props.views

    if (Array.isArray(views)) {
      return transform(views, (obj, name) => (obj[name] = VIEWS[name]), {})
    }

    if (typeof views === 'object') {
      return mapValues(views, (value, key) => {
        if (value === true) {
          return VIEWS[key]
        }

        return value
      })
    }

    return VIEWS
  }

  getView = () => {
    const views = this.getViews()

    return views[this.props.view]
  }


  render() {
    let {
      view,
      toolbar,
      events,
      style,
      className,
      elementProps,
      date: current,
      getNow,
      length,
      onShowMore,
      components: _0,
      formats: _1,
      messages: _2,
      culture: _3,
      ...props
    } = this.props
    current = current || getNow()
    let View = this.getView()
    const { accessors, components, getters, localizer, viewNames } =
      this.state.context

    let CalToolbar = components.toolbar || Toolbar
    const label = View.title(current, { localizer, length })

    return (
      <div
        {...elementProps}
        className={classNames(className, 'rbc-calendar')}
        style={{ minHeight: 200, ...style }}
      >
        {toolbar && (
          <CalToolbar
            label={label}
            onNavigate={this.handleNavigate}
          />
        )}
        <View
          {...props}
          events={events}
          date={current}
          getNow={getNow}
          length={length}
          localizer={localizer}
          getters={getters}
          components={components}
          accessors={accessors}
          onNavigate={this.handleNavigate}
          onSelectEvent={this.handleSelectEvent}
          onDoubleClickEvent={this.handleDoubleClickEvent}
          onKeyPressEvent={this.handleKeyPressEvent}
          onSelectSlot={this.handleSelectSlot}
          onShowMore={onShowMore}
        />
      </div>
    )
  }

  handleNavigate = (action, newDate) => {
    let { view, date, getNow, onNavigate, ...props } = this.props
    let ViewComponent = this.getView()
    let today = getNow()

    date = moveDate(ViewComponent, {
      ...props,
      action,
      date: newDate || date || today,
      today,
    })

    onNavigate(date, view, action)
  }


  handleSelectEvent = (...args) => {
    notify(this.props.onSelectEvent, args)
  }

  handleMouseMoveEvent = (...args) => {
    notify(this.props.onMouseMoveEvent, args)
  }

  handleDoubleClickEvent = (...args) => {
    notify(this.props.onDoubleClickEvent, args)
  }

  handleKeyPressEvent = (...args) => {
    notify(this.props.onKeyPressEvent, args)
  }

  handleSelectSlot = (slotInfo) => {
    notify(this.props.onSelectSlot, slotInfo)
  }

}

// export default Calendar
export default uncontrollable(Calendar, {
  view: 'onView',
  date: 'onNavigate',
  selected: 'onSelectEvent',
})
