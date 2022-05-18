import PropTypes from 'prop-types'
import React from 'react'
import { findDOMNode } from 'react-dom'
import classNames from 'classnames'
import chunk from 'lodash/chunk'
import throttle from 'lodash/throttle'
import debounce from 'lodash/debounce'

import { navigate, views } from './utils/constants'
import { notify } from './utils/helpers'
import getPosition from 'dom-helpers/position'
import * as animationFrame from 'dom-helpers/animationFrame'

import Popup from './Popup.jsx'
import Overlay from 'react-overlays/Overlay'
import DateContentRow from './DateContentRow.jsx'
import Header from './Header.jsx'
import DateHeader from './DateHeader.jsx'
import { inRange } from './utils/eventLevels'
import getOffset from 'dom-helpers/offset'
import getScrollTop from 'dom-helpers/scrollTop'

let eventsForWeek = (evts, start, end, accessors, localizer) =>
  evts.filter((e) => inRange(e, start, end, accessors, localizer))

class MonthView extends React.Component {
  constructor(...args) {
    super(...args)
    this.monthRef = React.createRef();
    this.isMouseEnter = false; // 控制进入
    this._bgRows = []
    this._pendingSelection = []
    this.slotRowRef = React.createRef()
    this.state = {
      rowLimit: 5,
      needLimitMeasure: true,
      popLocal: 'bottom'
    }
    this._mousemove = null;
    this._mouseleave = null;
    this._mouseenter = null;
  }

  UNSAFE_componentWillReceiveProps({ date }) {
    const { date: propsDate, localizer } = this.props
    this.setState({
      needLimitMeasure: localizer.neq(date, propsDate, 'month'),
    })
  }

  componentDidMount() {
    let running;
    if (this.state.needLimitMeasure) {
      this.measureRowLimit(this.props)
    }
    window.addEventListener(
      'resize',
      debounce(this._resizeListener = () => {
        this.addMouseMove();
        if (!running) {
          animationFrame.request(() => {
            running = false
            this.setState({ needLimitMeasure: true }) //eslint-disable-line
          })
        }
      }),
      false
    )
    this.addMouseMove();
  }

  addMouseMove() {
    // =====mousemove区域=========
    const { onMouseMoveEvent } = this.props;
    const adaptStoneScroll = () => {
      // 适配在老stone上监听不到滚动
      if (window.location.href.includes('.xxx.cn') && document.querySelector('.main .content-wrapper')) {
        return getScrollTop(document.querySelector('.main .content-wrapper'))
      }
      return getScrollTop(window)
    }

    if (onMouseMoveEvent) {
      setTimeout(() => {
        if (!this.monthRef.current) {
          return false;
        }
        this.monthRef.current && this.monthRef.current.removeEventListener('mousemove', this._mousemove, false);
        this.monthRef.current && this.monthRef.current.removeEventListener('mouseleave', this._mouseleave, false);
        this.monthRef.current && this.monthRef.current.removeEventListener('mouseenter', this._mouseenter, false);
        const { top, left, width, height } = getOffset(this.monthRef.current)
        const cellWidth = parseInt(width / 7);
        const rowLen = this._weekCount || document.querySelectorAll('.rbc-month-view .rbc-month-row').length;
        const cellHeight = parseInt(height / rowLen);
        this.monthRef.current.addEventListener('mousemove', this._mousemove = throttle((target) => {
          if (this.isMouseEnter) {
            const { x, y } = target;
            const calPointX = Math.max(parseInt((x - left) / cellWidth), 0)
            const calPointY = Math.max(parseInt((y - top - 21 + adaptStoneScroll()) / cellHeight), 0)  // y - top - head + scrolltop
            onMouseMoveEvent && onMouseMoveEvent([calPointX, calPointY])
          }
        }, 50), false)
        this.monthRef.current.addEventListener('mouseenter', this._mouseenter = throttle(() => {
          this.isMouseEnter = true;
        }), false)
        this.monthRef.current.addEventListener('mouseleave', this._mouseleave = throttle(() => {
          this.isMouseEnter = false;
          onMouseMoveEvent && onMouseMoveEvent([-1, -1])
        }, false))
      }, 0)
    }
  }

  componentDidUpdate() {
    if (this.state.needLimitMeasure) this.measureRowLimit(this.props)
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this._resizeListener, false);
    this.isMouseEnter = null;
    this.monthRef.current && this.monthRef.current.removeEventListener('mousemove', this._mousemove, false);
  }

  getContainer = () => {
    return findDOMNode(this)
  }

  render() {
    let { date, localizer, className } = this.props,
      month = localizer.visibleDays(date, localizer),
      weeks = chunk(month, 7)

    this._weekCount = weeks.length

    return (
      <div
        className={classNames('rbc-month-view', className)}
        role="table"
        aria-label="Month View"
        ref={this.monthRef}
        style={{ position: 'relative' }}
        onClick={(e) => {
          if (e?.target?.className && typeof e.target.className === 'string' && e.target.className.includes('event-nopopup-target')) {
            e.stopPropagation();
          }
        }}
      >
        <div className="rbc-row rbc-month-header" role="row">
          {this.renderHeaders(weeks[0])}
        </div>
        {weeks.map(this.renderWeek)}
        {this.props.popup && this.renderOverlay()}
      </div>
    )
  }

  renderWeek = (week, weekIdx) => {
    let {
      events,
      components,
      selectable,
      getNow,
      selected,
      date,
      localizer,
      longPressThreshold,
      accessors,
      getters,
      showAllEvents,
    } = this.props

    const { needLimitMeasure, rowLimit } = this.state

    // let's not mutate props
    const weeksEvents = eventsForWeek(
      [...events],
      week[0],
      week[week.length - 1],
      accessors,
      localizer
    )

    // sort 会把长的放最上面 del
    // weeksEvents.sort((a, b) => sortEvents(a, b, accessors, localizer))
    return (
      <DateContentRow
        key={weekIdx}
        rowInx={weekIdx}
        rowLineClick={this.handleRowLineClick}
        ref={weekIdx === 0 ? this.slotRowRef : undefined}
        container={this.getContainer}
        className="rbc-month-row"
        getNow={getNow}
        date={date}
        range={week}
        events={weeksEvents}
        maxRows={showAllEvents ? Infinity : rowLimit}
        selected={selected}
        selectable={selectable}
        components={components}
        accessors={accessors}
        getters={getters}
        localizer={localizer}
        renderHeader={this.readerDateHeading} // 方格日期
        renderForMeasure={needLimitMeasure}
        onShowMore={this.handleShowMore}
        onSelect={this.handleSelectEvent}
        onDoubleClick={this.handleDoubleClickEvent}
        onSelectSlot={this.handleSelectSlot}
        longPressThreshold={longPressThreshold}
        resizable={this.props.resizable}
        showAllEvents={showAllEvents}
      />
    )
  }

  handleRowLineClick = (rowInx, e) => {
    let popLocal = 'bottom'
    if (rowInx === this._weekCount - 1 || rowInx === this._weekCount - 2) {
      popLocal = 'top'
    }

    // 改变位置有个提示行错误 modifier "applyStyles" provided an invalid "phase" property
    this.setState({
      popLocal
    })
  }

  readerDateHeading = ({ date, className, ...props }) => {
    let { date: currentDate, localizer } = this.props
    let isOffRange = localizer.neq(date, currentDate, 'month')
    let isCurrent = localizer.isSameDate(date, currentDate)
    let label = localizer.format(date, 'dateFormat')
    let DateHeaderComponent = this.props.components.dateHeader || DateHeader

    return (
      <div
        {...props}
        className={classNames(
          className,
          {
            'rbc-off-range': isOffRange,
            'rbc-current': isCurrent
          }
        )}
        role="cell"
      >
        <DateHeaderComponent
          label={label}
          date={date}
        />
      </div>
    )
  }

  renderHeaders(row) {
    let { localizer, components } = this.props
    let first = row[0]
    let last = row[row.length - 1]
    let HeaderComponent = components.header || Header

    return localizer.range(first, last, 'day').map((day, idx) => (
      <div key={'header_' + idx} className="rbc-header">
        <HeaderComponent
          date={day}
          localizer={localizer}
          label={localizer.format(day, 'weekdayFormat')}
        />
      </div>
    ))
  }

  renderOverlay() {
    let overlay = (this.state && this.state.overlay) || {}
    let { accessors, localizer, components, getters, selected, popupOffset } =
      this.props

    return (
      <Overlay
        rootClose
        placement={this.state.popLocal || 'bottom'}
        show={!!overlay.position}
        onHide={() => {
          this.overlayDisplay();
        }}
        target={() => overlay.target}
      >
        {({ props }) => {
          return (
            <Popup
              {...props}
              popupOffset={popupOffset}
              accessors={accessors}
              getters={getters}
              selected={selected}
              components={components}
              localizer={localizer}
              position={overlay.position}
              show={this.overlayDisplay}
              events={overlay.events}
              slotStart={overlay.date}
              slotEnd={overlay.end}
              onSelect={this.handleSelectEvent}
              onDoubleClick={this.handleDoubleClickEvent}
              onKeyPress={this.handleKeyPressEvent}
              handleDragStart={this.props.handleDragStart}
            />
          )
        }}
      </Overlay>
    )
  }

  measureRowLimit() {
    this.setState({
      needLimitMeasure: false,
      rowLimit: this.props.rowLimit || this.slotRowRef.current.getRowLimit(),
    })
  }

  handleSelectSlot = (range, slotInfo) => {
    this._pendingSelection = this._pendingSelection.concat(range)

    clearTimeout(this._selectTimer)
    this._selectTimer = setTimeout(() => this.selectDates(slotInfo))
  }

  handleSelectEvent = (...args) => {
    const {
      popup,
    } = this.props
    const [events, baseEvent] = args;
    this.clearSelection()

    // 新增弹窗 & 处理弹窗里的事件点击
    if (popup && baseEvent) {
      let position = getPosition(baseEvent.target, findDOMNode(this))

      this.setState({
        overlay: { date: new Date(), events: [events], position, target: baseEvent.target }
      })
    }
    notify(this.props.onSelectEvent, args)
  }

  handleDoubleClickEvent = (...args) => {
    this.clearSelection()
    notify(this.props.onDoubleClickEvent, args)
  }

  handleShowMore = (events, date, cell, slot, target) => {
    const {
      popup,
      onShowMore,
    } = this.props
    //cancel any pending selections so only the event click goes through.
    this.clearSelection()

    if (popup) {
      let position = getPosition(cell, findDOMNode(this))

      this.setState({
        overlay: { date, events, position, target },
      })
    }
    notify(onShowMore, [events, date, slot])
  }

  overlayDisplay = () => {
    this.handleSelectEvent()
    this.setState({
      overlay: null,
    })
  }

  selectDates(slotInfo) {
    let slots = this._pendingSelection.slice()

    this._pendingSelection = []

    slots.sort((a, b) => +a - +b)

    const start = new Date(slots[0])
    const end = new Date(slots[slots.length - 1])
    end.setDate(slots[slots.length - 1].getDate() + 1)

    notify(this.props.onSelectSlot, {
      slots,
      start,
      end,
      action: slotInfo.action,
      bounds: slotInfo.bounds,
      box: slotInfo.box,
    })
  }

  clearSelection() {
    clearTimeout(this._selectTimer)
    this._pendingSelection = []
  }
}

MonthView.propTypes = {
  events: PropTypes.array.isRequired,
  date: PropTypes.instanceOf(Date),

  min: PropTypes.instanceOf(Date),
  max: PropTypes.instanceOf(Date),

  step: PropTypes.number,
  getNow: PropTypes.func.isRequired,

  scrollToTime: PropTypes.instanceOf(Date),
  enableAutoScroll: PropTypes.bool,
  resizable: PropTypes.bool,
  width: PropTypes.number,

  accessors: PropTypes.object.isRequired,
  components: PropTypes.object.isRequired,
  getters: PropTypes.object.isRequired,
  localizer: PropTypes.object.isRequired,

  selected: PropTypes.object,
  selectable: PropTypes.oneOf([true, false, 'ignoreEvents']),
  longPressThreshold: PropTypes.number,

  onNavigate: PropTypes.func,
  onSelectSlot: PropTypes.func,
  onSelectEvent: PropTypes.func,
  onDoubleClickEvent: PropTypes.func,
  onMouseMoveEvent: PropTypes.func,
  onKeyPressEvent: PropTypes.func,
  onShowMore: PropTypes.func,
  showAllEvents: PropTypes.bool,
  doShowMoreDrillDown: PropTypes.bool,
  onDrillDown: PropTypes.func,
  popup: PropTypes.bool,
  handleDragStart: PropTypes.func,
  popupOffset: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.shape({
      x: PropTypes.number,
      y: PropTypes.number,
    }),
  ]),
}

MonthView.range = (date, { localizer }) => {
  let start = localizer.firstVisibleDay(date, localizer)
  let end = localizer.lastVisibleDay(date, localizer)
  return { start, end }
}

MonthView.navigate = (date, action, { localizer }) => {
  switch (action) {
    case navigate.PREVIOUS:
      return localizer.add(date, -1, 'month')

    case navigate.NEXT:
      return localizer.add(date, 1, 'month')

    default:
      return date
  }
}

MonthView.title = (date, { localizer }) => {
  return localizer.format(date, 'monthHeaderFormat')
}


export default MonthView
