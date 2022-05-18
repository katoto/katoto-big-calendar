import React, { useMemo } from 'react'
import moment from 'moment'
import { Calendar, momentLocalizer } from 'react-big-calendar'

const mLocalizer = momentLocalizer(moment)

export default function Basic({ localizer = mLocalizer, ...props }) {

  const { defaultDate } = useMemo(() => ({
    defaultDate: new Date(2022, 2, 23)
  }), [])

  return (
    <>
      <div
        style={{
          border: '1px solid red',
        }}
        className="height600"
        {...props}
      >
        <Calendar
          onView={() => {
            console.log('props onView change')
          }}
          onShowMore={() => {
            console.log('props onShowMore change')
          }}
          onNavigate={(data, e) => {
            console.log('props navig111ate change')
          }}
          onSelectEvent={(evtObj, e) => {
            console.log('props onSelectEvent change')
          }}
          onMouseMoveEvent={(val) => {
            console.log(JSON.stringify(val))
            console.log('===========')
          }}
          popup
          messages={
            {
              // eventRowsSort: (rows) => {
              //   // 是否对row(1，2，3) 进行优先级排序，默认最初、最长条在最上面。
              //   return rows.sort((itemA, itemB) => {
              //     if (itemA[0] && itemB[0]) {
              //       const aLevel = parseInt(itemA[0].event.level)
              //       const bLevel = parseInt(itemB[0].event.level)
              //       return aLevel - bLevel
              //     }
              //     return 0
              //   })
              // }
            }
          }
          events={[
            {
              id: 2,
              title: '优先级2的广告',
              start: "2022-04-06",
              end: "2022-04-18 23:59:59",
              level: '1',
              self: '1',
            },
            {
              id: 3,
              title: '优先级3的广告',
              start: "2022-04-06",
              end: "2022-04-27 23:59:59",
              level: '2',
              self: '1',
            },
          ]}
          localizer={localizer}
          components={
            {
              event: ({ title }) => {
                return <div className="event-line event-nopopup-target">{title}</div>
              },
            }
          }
        />
      </div>
    </>
  )
}
