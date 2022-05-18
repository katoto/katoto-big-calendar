import PropTypes from 'prop-types'
import React from 'react'

const DateHeader = ({ label }) => {

  return (
    <button
      type="button"
      className="rbc-button-link"
      role="cell"
    >
      {label}
    </button>
  )
}

DateHeader.propTypes = {
  label: PropTypes.node,
  date: PropTypes.instanceOf(Date)
}

export default DateHeader
