const now = new Date()

export default [
  {
    id: 5,
    title: 'Conference',
    level: 5,
    allDay: true,
    start: new Date(2022, 3, 11),
    end: new Date(2022, 3, 28),
    desc: 'Big conference for important people',
  },
  {
    id: 6,
    title: 'Meeting',
    level: 1,
    allDay: true,
    start: new Date(2022, 3, 12, 10, 30, 0, 0),
    end: new Date(2022, 3, 12, 12, 30, 0, 0),
    desc: 'Pre-meeting meeting, to prepare for the meeting',
  },
  {
    id: 7,
    title: 'Lunch',
    level: 1,
    start: new Date(2022, 3, 12, 12, 0, 0, 0),
    end: new Date(2022, 3, 13, 13, 0, 0, 0),
    desc: 'Power lunch',
  },
  // {
  //   id: 8,
  //   title: 'Meeting',
  //   level: 1,
  //   start: new Date(2022, 3, 12, 14, 0, 0, 0),
  //   end: new Date(2022, 3, 14, 15, 0, 0, 0),
  // },
  {
    id: 9,
    title: 'Happy Hour',
    level: 1,
    start: new Date(2022, 3, 12, 17, 0, 0, 0),
    end: new Date(2022, 3, 12, 17, 30, 0, 0),
    desc: 'Most important meal of the day',
  },
]
