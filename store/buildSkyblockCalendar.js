/* eslint-disable no-plusplus */
const { nth } = require('../util/utility');

const months = [
  'Early Spring',
  'Spring',
  'Late Spring',
  'Early Summer',
  'Summer',
  'Late Summer',
  'Early Autumn',
  'Autumn',
  'Late Autumn',
  'Early Winter',
  'Winter',
  'Late Winter',
];

const hourMs = 50000;
const dayMs = 24 * hourMs;
const monthLength = 31;
const yearLength = months.length;

const monthMs = monthLength * dayMs;
const yearMs = yearLength * monthMs;

const yearZero = 1560275700000;

const zooStart = yearZero + yearMs * 66;
const zooTimeLength = yearMs / 2;

const pets = [
  'ELEPHANT',
  'GIRAFFE',
  'BLUE_WHALE',
  'TIGER',
  'LION',
  'MONKEY',
];

function getOffset(month, day) {
  return months.indexOf(month) * monthLength * dayMs + (day - 1) * dayMs;
}

function getZooPet(time) {
  const iterations = Math.floor((time - zooStart) / zooTimeLength);

  return pets[iterations % pets.length];
}

function getJacobEventTimes() {
  const times = [];

  for (let month = 0; month < 12; month++) {
    let day = 2;
    while (day <= 31) {
      times.push({
        start: getOffset(months[month], day),
        end: getOffset(months[month], day),
      });

      if (day === 30) break;
      day += 3;
      if (day > 31) {
        day %= 31;
        month++;
      }
    }
  }
  return times;
}

const events = [
  {
    name: 'Bank Interest',
    times: [
      {
        start: getOffset('Early Spring', 1),
        end: getOffset('Early Spring', 1),
      },
      {
        start: getOffset('Early Summer', 1),
        end: getOffset('Early Summer', 1),
      },
      {
        start: getOffset('Early Autumn', 1),
        end: getOffset('Early Autumn', 1),
      },
      {
        start: getOffset('Early Winter', 1),
        end: getOffset('Early Winter', 1),
      },
    ],
  },
  {
    name: 'Election Over',
    times: [
      {
        start: getOffset('Late Spring', 27),
        end: getOffset('Late Spring', 27),
      },
    ],
  },
  {
    name: 'Traveling Zoo',
    times: [
      {
        start: getOffset('Early Summer', 1),
        end: getOffset('Early Summer', 3),
      },
      {
        start: getOffset('Early Winter', 1),
        end: getOffset('Early Winter', 3),
      },
    ],
  },
  {
    name: 'Election Booth Opens',
    times: [
      {
        start: getOffset('Late Summer', 27),
        end: getOffset('Late Summer', 27),
      },
    ],
  },
  {
    name: 'Fear Mongerer',
    times: [
      {
        start: getOffset('Autumn', 26),
        end: getOffset('Late Autumn', 3),
      },
    ],
  },
  {
    name: 'Spooky Festival',
    times: [
      {
        start: getOffset('Autumn', 29),
        end: getOffset('Autumn', 31),
      },
    ],
  },
  {
    name: 'Jerry\'s Workshop',
    times: [
      {
        start: getOffset('Late Winter', 1),
        end: getOffset('Late Winter', 31),
      },
    ],
  },
  {
    name: 'Season of Jerry',
    times: [
      {
        start: getOffset('Late Winter', 24),
        end: getOffset('Late Winter', 26),
      },
    ],
  },
  {
    name: 'New Year Celebration',
    times: [
      {
        start: getOffset('Late Winter', 29),
        end: getOffset('Late Winter', 31),
      },
    ],
  },
  {
    name: 'Jacob\'s Farming Contest',
    times: getJacobEventTimes(),
  },
];

function buildSkyblockCalendar(event, years) {
  const currentYear = Math.floor((Date.now() - yearZero) / yearMs);
  const currentOffset = (Date.now() - yearZero) % yearMs;

  const currentMonth = Math.floor(currentOffset / monthMs);
  const currentMonthOffset = (currentOffset - currentMonth * monthMs) % monthMs;

  const currentDay = Math.floor(currentMonthOffset / dayMs);
  const currentDayOffset = (currentMonthOffset - currentDay * dayMs) % dayMs;

  let currentHour = Math.floor(currentDayOffset / hourMs);
  const currentMinute = Math.floor(((currentDayOffset - currentHour * hourMs) / hourMs) * 60);

  const suffix = currentHour >= 12 ? 'pm' : 'am';

  if (currentHour > 12) currentHour -= 12;
  if (currentHour === 0) currentHour = 12;

  const formattedTime = `${currentHour}:${(Math.floor(currentMinute / 10) * 10).toString().padStart(2, '0')}${suffix}`;

  const eventList = [];

  for (let i = 0; i < years; i++) {
    for (const { name, times: times_ } of events) {
      for (const { start: start_, end: end_ } of times_) {
        const times = {
          start: start_ + yearMs * i,
          end: end_ + yearMs * i,
        };

        const msTill = times.end < currentOffset
          ? yearMs - currentOffset + times.start
          : times.start - currentOffset;

        const duration = times.end - times.start + dayMs;

        const o = {
          name,
          start_timestamp: (Math.round(Date.now() / 1000) + Math.round(msTill / 1000)) * 1000,
          end_timestamp: (Math.round(Date.now() / 1000) + Math.round((msTill + duration) / 1000)) * 1000,
          starting_in: msTill,
          ending_in: msTill + duration,
          duration,
        };

        if (name === 'Traveling Zoo') {
          o.pet = getZooPet(Date.now() + msTill);
        }

        eventList.push(o);
      }
    }
  }

  const filteredEvents = event !== ''
    ? eventList.filter(({ name }) => name.toLowerCase() === event.replace(/%20/g, ' ').toLowerCase())
    : eventList;

  return {
    date: `${months[currentMonth]} ${nth(currentDay + 1)}`,
    day: currentDay + 1,
    month: months[currentMonth],
    month_index: currentMonth,
    year: currentYear + 1,

    time: formattedTime,
    hour: currentHour,
    minute: Math.floor(currentMinute / 10) * 10,

    next_day_countdown: dayMs - currentDayOffset,
    next_month_countdown: monthMs - currentMonthOffset,

    events: filteredEvents.sort((a, b) => a.starting_in - b.starting_in),
  };
}

module.exports = {
  buildSkyblockCalendar,
  buildSkyblockEvents: () => events.map(({ name }) => name),
};
