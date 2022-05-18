import PropTypes from 'prop-types'
import React from 'react'

class Toolbar extends React.Component {
  render() {
    let { label } = this.props

    return (
      <div className="rbc-toolbar" style={{border: '1px solid #ccc'}}>
        <span className="rbc-btn-group">
          <button
            type="button"
            onClick={this.navigate.bind(null, 'PREV')}
          >
            上个月
          </button>
          <button
            type="button"
            onClick={this.navigate.bind(null, 'NEXT')}
          >
            下个月
          </button>
        </span>

        <span className="rbc-toolbar-label">{label}</span>
      </div>
    )
  }
  navigate = (action) => {
    this.props.onNavigate(action)
  }

}

Toolbar.propTypes = {
  label: PropTypes.node.isRequired,
  onNavigate: PropTypes.func.isRequired,
}

export default Toolbar
