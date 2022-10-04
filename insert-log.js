import axiod from 'https://deno.land/x/axiod/mod.ts'
const headers = {
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:102.0) Gecko/20100101 Firefox/102.0',
  Accept: 'application/json, text/plain, */*',
  'Accept-Language': 'en-US,en;q=0.5',
  'Accept-Encoding': 'gzip, deflate, br',
  'x-qore-engine-admin-secret': 'Uwy5dcYOfWmsfkbPnMa6Ts2YyZOVQY5H',
  Connection: 'keep-alive',
  Referer: 'https://staging-qore-data-pilot-908531.qore.dev/tables/insights',
  Cookie: 'ADMIN-SECRET=Uwy5dcYOfWmsfkbPnMa6Ts2YyZOVQY5H',
  'Sec-Fetch-Dest': 'empty',
  'Sec-Fetch-Mode': 'cors',
  'Sec-Fetch-Site': 'same-origin',
  TE: 'trailers',
}

const getUserHistory = async (user_id, type, insight_id) => {
  try {
    const { data } = await axiod({
      method: 'post',
      url: 'https://staging-qore-data-pilot-908531.qore.dev/v1/execute',
      headers: headers,
      data: {
        operations: [
          {
            operation: 'Select',
            instruction: {
              view: 'user_history_by_insight',
              name: 'history_log',
              limit: 1,
              offset: 0,
              orderBy: {
                id: 'ASC',
              },
              params: {
                type: type,
                user_id: user_id,
                insight_id: insight_id,
              },
            },
          },
        ],
      },
    })
    return data.results?.history_log
  } catch (error) {
    return error
  }
}

const insertHistoryLog = async (user_id, item_id, type) => {
  try {
    const response = await axiod({
      method: 'post',
      url:
        'https://staging-qore-data-pilot-908531.qore.dev/v1/table/user_history',
      headers: headers,
      data: {
        data: {
          type: type,
          user_history: user_id,
          insight_history: item_id,
        },
      },
    })
    return response?.data
  } catch (error) {
    return error
  }
}

const main = async (user, row, args, global) => {
  if (!args.user_id) throw new Error('user id cannot be empty')
  if (!args.type) throw new Error('type cannot be empty')

  const type = args.type 
  const user_id = args.user_id 
  const user_history = await getUserHistory(user_id, type, row.id)
  const isExist = user_history.length > 0


  if (isExist) {
    return { message: "data already in log history" }
  } else {
    const insert = await insertHistoryLog(user_id, row.id, type)
    return insert
  }
}
