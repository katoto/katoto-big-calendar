import React from 'react'
import moment from 'moment'
import 'moment/locale/zh-cn'
import { Calendar, momentLocalizer } from '../../src'
import Basic from './exampleCode/basic'

export default {
  title: 'Examples',
  component: Calendar,
  parameters: {
    docs: {
      page: null,
    },
  },
}

moment.locale('zh-cn')
const localizer = momentLocalizer(moment)

export function Example1() {
  return <Basic localizer={localizer} />
}
Example1.storyName = 'Basic Demo'
