// 默认弹窗内容
import PropTypes from 'prop-types'
import React from 'react'
import EventCell from './EventCell'
import { isSelected } from './utils/selection'
class PopupDefaultWrapper extends React.Component {
  render() {
    let {
      events = [],
      selected,
      getters,
      accessors,
      components,
      onDoubleClick,
      onKeyPress,
      slotStart,
      slotEnd,
      localizer,
      // onSelect,
    } = this.props

    return (
      <div>
        <div className="rbc-overlay-header">
          {localizer.format(slotStart, 'dayHeaderFormat')}
        </div>

        {events.map((event, idx) => (
          <EventCell
            key={idx}
            type="popup"
            localizer={localizer}
            event={event}
            getters={getters}
            accessors={accessors}
            components={components}
            onDoubleClick={onDoubleClick}
            onKeyPress={onKeyPress}
            continuesPrior={localizer.lt(
              accessors.end(event),
              slotStart,
              'day'
            )}
            continuesAfter={localizer.gte(
              accessors.start(event),
              slotEnd,
              'day'
            )}
            slotStart={slotStart}
            slotEnd={slotEnd}
            selected={isSelected(event, selected)}
            draggable={true}
            onDragStart={() => this.props.handleDragStart(event)}
            onDragEnd={() => this.props.show()}
          />
        ))}
      </div>
    )
  }
}

PopupDefaultWrapper.propTypes = {
  position: PropTypes.object,
  popupOffset: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.shape({
      x: PropTypes.number,
      y: PropTypes.number,
    }),
  ]),
  events: PropTypes.array,
  selected: PropTypes.object,

  accessors: PropTypes.object.isRequired,
  components: PropTypes.object.isRequired,
  getters: PropTypes.object.isRequired,
  localizer: PropTypes.object.isRequired,
  onSelect: PropTypes.func,
  onDoubleClick: PropTypes.func,
  onKeyPress: PropTypes.func,
  handleDragStart: PropTypes.func,
  show: PropTypes.func,
  slotStart: PropTypes.instanceOf(Date),
  slotEnd: PropTypes.number,
}

export default PopupDefaultWrapper
