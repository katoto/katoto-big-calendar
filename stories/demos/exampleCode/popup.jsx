import React, { Fragment, useMemo } from 'react'
import PropTypes from 'prop-types'
import moment from 'moment'
import { Calendar, DateLocalizer } from 'react-big-calendar'
import events from '../../resources/events'

export default function Popup({ localizer }) {
  const defaultDate = useMemo(() => new Date(2022, 2, 23), []);

  return (
    <Fragment>
      <div style={{ height: '800px' }}>
        <Calendar
          onView={() => {
            console.log('props onView change')
          }}
          onShowMore={(event) => {
            console.log(event);
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
            // todo
            console.log('props onDoubleClickEvent change')
          }}
          onMouseMoveEvent={(point) => {
            const [pointX, pointY] = point;
            // 比较之前的value
            // const rowDom = document.querySelectorAll('.rbc-month-view .rbc-month-row')[pointY];
            // const columuDom = rowDom.querySelectorAll('.rbc-row-content .rbc-date-cell')[pointX];
            // const allCells = document.querySelectorAll('.rbc-month-view .rbc-date-cell');
            // allCells.forEach((itemDom) => {
            //   itemDom.className = itemDom.className.replace(' active', '')
            // })
            // if (columuDom && !columuDom.className.includes('active')) {
            //   columuDom.className = columuDom.className + ' active'
            // }
          }}
          // messages={
          //   {
          //     showMore: (count) => {
          //       return (<span style={{ color: 'red' }}>+${count}</span>)
          //     },
          //     // eventRowsSort: (rows) => {
          //     //   // 是否对row(1，2，3) 进行优先级排序，默认最初、最长条在最上面。
          //     //   // return rows.sort((itemA, itemB) => {
          //     //   //   if (itemA[0] && itemB[0]) {
          //     //   //     const aLevel = parseInt(itemA[0].event.level)
          //     //   //     const bLevel = parseInt(itemB[0].event.level)
          //     //   //     return aLevel - bLevel
          //     //   //   }
          //     //   //   return 0
          //     //   // })
          //     // }
          //   }
          // }
          defaultDate={defaultDate}
          events={events}
          localizer={localizer}
          popup
          components={{
            toolbar: ({ label, onNavigate }) => {
              return (
                <div style={{ display: 'flex', border: '1px solid red' }}>
                  <button onClick={() => {
                    onNavigate('PREV')
                  }}>
                    上
                  </button>
                  <div>月份：{label}</div>
                  <button onClick={() => {
                    onNavigate('NEXT')
                  }}>
                    下
                  </button>
                  <button onClick={() => {
                    onNavigate('TODAY')
                  }}>
                    回到当前日期页
                  </button>
                </div>
              )
            },
            month: {
              dateHeader: ({ label, date }) => {
                return (
                  <div>{moment(date).format('YYYY-MM-DD')}{label}</div>
                )
              },
              header: ({ label, date }) => {
                return (
                  <div>{moment(date).format('YYYY-MM-DD')}{label}</div>
                )
              },
            },
            // eventWrapper: (props) => {
            //   return (
            //     <div onClick={(e) => {
            //       e.stopPropagation() // 阻止冒泡
            //       props.onSelect && props.onSelect(props.event, e)
            //     }} style={{ border: '1px solid red', paddingTop: '10px' }}>
            //       {props.event.title}
            //     </div>
            //   )
            // },
            dateCellWrapper: (val) => {
              return (
                <div
                  style={{ borderLeft: '1px solid #ddd', flex: 1 }}
                >
                </div>
              )
            },
            // popWrapper: () => {
            //   return (<div style={{ border: '1px solid red' }}>自定义弹窗内容</div>)
            // },
            dateCellWrapper: ({ value, range }) => {
              return (
                <div style={{ width: '100%', display: 'flex', alignItems: 'center', borderRight: '1px solid #ccc' }}>
                  cell背景 {moment(value).format('YYYY-MM-DD')}
                </div>
              )
            },
          }}
        />
      </div>
    </Fragment>
  )
}
Popup.propTypes = {
  localizer: PropTypes.instanceOf(DateLocalizer),
}
